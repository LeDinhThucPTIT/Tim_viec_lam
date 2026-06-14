const CV = require("../models/CV");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const { renderCreatedCVHtml } = require("../utils/cvTemplate");

const cvController = {
  // Lấy danh sách CV
  getCVList: async (req, res) => {
    try {
      const cvs = await CV.find({ userId: req.user.id }).sort({
        updatedAt: -1,
      });
      res.status(200).json(cvs);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách CV", error });
    }
  },

  // Tạo CV mới từ Builder
  createCV: async (req, res) => {
    try {
      const { name, template, data } = req.body;
      const existingCVs = await CV.countDocuments({ userId: req.user.id });

      const newCV = new CV({
        userId: req.user.id,
        name: name || "CV Mới",
        template: template || "modern",
        type: "created",
        isDefault: existingCVs === 0,
        data,
      });

      const savedCV = await newCV.save();
      res.status(201).json(savedCV);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo CV", error });
    }
  },

  // Cập nhật CV Builder
  updateCV: async (req, res) => {
    try {
      const updatedCV = await CV.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: req.body },
        { new: true },
      );
      if (!updatedCV)
        return res.status(404).json({ message: "Không tìm thấy CV" });
      res.status(200).json(updatedCV);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật", error });
    }
  },

  // Upload CV file có sẵn
  uploadCV: async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Vui lòng chọn file" });

      const existingCVs = await CV.countDocuments({ userId: req.user.id });

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/cvs/${req.file.filename}`;

      const newCV = new CV({
        userId: req.user.id,
        name: req.file.originalname.replace(/\.[^/.]+$/, ""), // Xóa đuôi file
        type: "uploaded",
        isDefault: existingCVs === 0,
        fileUrl: fileUrl, // URL trả về cho frontend
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      const savedCV = await newCV.save();
      res.status(201).json(savedCV);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi upload file", error });
    }
  },

  // Xóa CV
  deleteCV: async (req, res) => {
    try {
      const cv = await CV.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });
      if (!cv) return res.status(404).json({ message: "CV không tồn tại" });

      // Xóa file vật lý trong ổ cứng nếu là CV upload
      if (cv.type === "uploaded" && cv.fileName) {
        const filePath = path.join(__dirname, "../uploads/cvs", cv.fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa", error });
    }
  },

  // Set Default
  setDefaultCV: async (req, res) => {
    try {
      await CV.updateMany({ userId: req.user.id }, { isDefault: false });
      const updatedCV = await CV.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isDefault: true },
        { new: true },
      );
      res.status(200).json(updatedCV);
    } catch (error) {
      res.status(500).json({ message: "Lỗi set mặc định", error });
    }
  },

  // Tải CV (Tăng view/download và tạo PDF)
  downloadCV: async (req, res) => {
    let browser;

    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID CV không hợp lệ" });
      }

      const cv = await CV.findOneAndUpdate(
        { _id: req.params.id }, // Không check userId để NTD có thể tải nếu có link
        { $inc: { downloads: 1 } },
        { new: true },
      );

      if (!cv) return res.status(404).json({ message: "Không tìm thấy CV" });

      // Trả về file có sẵn nếu là CV upload
      if (cv.type === "uploaded") {
        const uploadedPath = path.join(
          __dirname,
          "../uploads/cvs",
          cv.fileName,
        );
        if (!fs.existsSync(uploadedPath)) {
          return res
            .status(404)
            .json({ message: "File CV không tồn tại trên máy chủ" });
        }

        const downloadName = `${cv.name.replace(/\.[^/.]+$/, "")}${path.extname(cv.fileName)}`;
        return res.download(uploadedPath, downloadName, (err) => {
          if (err && !res.headersSent) {
            console.error(err);
            return res.status(500).json({
              message: "Lỗi khi tải file CV",
              error: err.message || err,
            });
          }
        });
      }

      // Sinh PDF nếu là CV Builder
      const htmlContent = renderCreatedCVHtml(cv);
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });
      await page.emulateMediaType("screen");

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      await page.waitForSelector(".page", { visible: true, timeout: 5000 });
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      });
      await browser.close();
      browser = null;

      const outputFilename = `${cv.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${outputFilename}"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Lỗi sinh file PDF",
          error: error.message || error,
        });
      }
    } finally {
      if (browser) {
        await browser.close().catch((error) => console.error(error));
      }
    }
  },
};

module.exports = cvController;
