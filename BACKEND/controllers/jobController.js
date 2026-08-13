const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const Employer = require("../models/Employer");
const fs = require("fs/promises");

const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove uploaded CV:", error.message);
    }
  }
};

const jobController = {
  // 1. Lấy danh sách việc làm (Có filter & phân trang)
  getJobs: async (req, res) => {
    try {
      const {
        keyword,
        location,
        category,
        experience,
        salary,
        page = 1,
        limit = 6,
      } = req.query;

      let query = { status: "active" };

      // Lọc theo keyword (tìm trong title, tên công ty, hoặc kỹ năng)
      if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [
          { title: regex },
          { "companySnapshot.companyName": regex },
          { skills: { $in: [regex] } },
        ];
      }

      if (location && location !== "all")
        query.location = new RegExp(location, "i");
      if (category && category !== "all") query.category = category;
      if (experience && experience !== "all") query.experience = experience;

      // Lọc theo lương (Đầu vào VD: "15000000-25000000" hoặc "30000000-")
      if (salary && salary !== "all") {
        const [minStr, maxStr] = salary.split("-");
        const min = Number(minStr);
        const max = Number(maxStr);

        if (max) {
          query["salary.min"] = { $gte: min };
          query["salary.max"] = { $lte: max };
        } else {
          // Nếu không có max (VD: mức lương trên 30tr)
          query["salary.min"] = { $gte: min };
        }
      }

      const skip = (Number(page) - 1) * Number(limit);
      const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
      const total = await Job.countDocuments(query);

      let appliedJobIds = new Set();
      let savedJobIds = new Set();

      if (req.user?.role === "candidate") {
        const user = await User.findById(req.user.id).select(
          "appliedJobs savedJobs",
        );
        if (user) {
          savedJobIds = new Set(
            (user.savedJobs || []).map((id) => id.toString()),
          );
        }

        const applications = await Application.find({
          candidate: req.user.id,
          job: { $in: jobs.map((job) => job._id) },
        })
          .select("job")
          .lean();

        appliedJobIds = new Set(
          applications.map((application) => application.job.toString()),
        );
      }

      const jobsWithFlags = jobs.map((job) => ({
        ...job.toObject(),
        isApplied: appliedJobIds.has(job._id.toString()),
        isSaved: savedJobIds.has(job._id.toString()),
      }));

      res.status(200).json({
        data: jobsWithFlags,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách việc làm",
        error: error.message,
      });
    }
  },

  // 2. Lấy việc làm nổi bật (Hot Jobs)
  getHotJobs: async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 6;
      const jobs = await Job.find({ status: "active", hot: true })
        .sort({ createdAt: -1 })
        .limit(limit);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // 3. Lấy việc làm gợi ý
  getRecommendedJobs: async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 4;
      // Tạm thời lấy các job mới nhất. Sau này có thể viết thuật toán gợi ý theo User Skills
      const jobs = await Job.find({ status: "active" })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // 4. Lấy chi tiết 1 việc làm
  getJobById: async (req, res) => {
    try {
      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true },
      );

      if (!job) {
        return res.status(404).json({ message: "Không tìm thấy việc làm" });
      }

      const jobData = job.toObject();

      // 1. In log ra để "bắt tận tay" xem req.user có gì
      console.log("=== DEBUG GET JOB ===");
      console.log("User Role:", req.user?.role);
      console.log("User ID:", req.user?.id || req.user?._id);
      console.log("Job ID:", job._id);

      // 2. Mở rộng điều kiện check role (bao gồm cả 'candidate' và 'user')
      if (
        req.user &&
        (req.user.role === "candidate" || req.user.role === "user")
      ) {
        // Lấy ID chuẩn xác (phòng trường hợp token dùng _id)
        const currentUserId = req.user.id || req.user._id;

        const [application, user] = await Promise.all([
          Application.findOne({
            job: job._id,
            candidate: currentUserId, // Dùng biến ID đã chuẩn hóa ở trên
          })
            .select("_id status note")
            .lean(),
          User.findById(currentUserId).select("savedJobs").lean(),
        ]);

        console.log("Application tìm thấy:", application); // <-- Check xem tìm thấy đơn không

        jobData.isApplied = Boolean(application);
        jobData.isSaved = Boolean(
          user?.savedJobs?.some((id) => id.toString() === job._id.toString()),
        );

        if (application) {
          // Gán data cho Frontend
          jobData.currentUserApplication = {
            status: application.status,
            note: application.note,
          };
          jobData.applicationStatus = application.status;
        }
      } else {
        jobData.isApplied = false;
        jobData.isSaved = false;
      }

      res.status(200).json(jobData);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  checkAlreadyApplied: async (req, res, next) => {
    try {
      const existingApp = await Application.findOne({
        job: req.params.id,
        candidate: req.user.id,
      })
        .select("_id")
        .lean();

      if (existingApp) {
        return res.status(409).json({
          success: false,
          isApplied: true,
          message: "Bạn đã ứng tuyển công việc này rồi",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Lỗi kiểm tra trạng thái ứng tuyển",
        error: error.message,
      });
    }
  },

  // 5. Ứng tuyển việc làm
  applyJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      const candidateId = req.user.id;

      // Hứng dữ liệu text từ formData (Frontend gửi lên)
      const { fullName, email, phone, coverLetter, onlineCvSnapshot } =
        req.body;
      const rawCvType = req.body.cvType;
      const cvType =
        typeof rawCvType === "string"
          ? rawCvType.trim().toLowerCase()
          : rawCvType;

      const uploadedFile =
        req.file ||
        (req.files && req.files.cv && req.files.cv[0]) ||
        (req.files && req.files.file && req.files.file[0]);

      // 1. Kiểm tra xem đã ứng tuyển chưa
      const existingApp = await Application.findOne({
        job: jobId,
        candidate: candidateId,
      });
      if (existingApp) {
        await removeUploadedFile(req.file);
        return res.status(409).json({
          success: false,
          isApplied: true,
          message: "Bạn đã ứng tuyển công việc này rồi",
        });
      }

      // 2. Chuẩn bị payload để lưu
      const applicationData = {
        job: jobId,
        candidate: candidateId,
        fullName,
        email,
        phone,
        coverLetter,
        cvType,
      };

      // 3. Xử lý logic theo loại CV
      if (cvType === "pdf") {
        if (!uploadedFile) {
          return res.status(400).json({ message: "Vui lòng đính kèm file CV" });
        }
        applicationData.pdfCvUrl = `/uploads/cvs/${uploadedFile.filename}`;
      } else if (cvType === "online") {
        if (!onlineCvSnapshot) {
          await removeUploadedFile(uploadedFile);
          return res
            .status(400)
            .json({ message: "Không tìm thấy dữ liệu CV Online" });
        }
        applicationData.onlineCvSnapshot =
          typeof onlineCvSnapshot === "string"
            ? JSON.parse(onlineCvSnapshot)
            : onlineCvSnapshot;
      } else {
        await removeUploadedFile(uploadedFile);
        return res.status(400).json({
          message:
            "Loại CV không hợp lệ. Vui lòng gửi cvType = 'pdf' hoặc 'online'.",
          receivedType: rawCvType,
        });
      }

      // 4. Lưu Application vào DB
      const application = new Application(applicationData);
      await application.save();

      // 5. Tăng biến đếm applied của Job lên 1
      await Job.findByIdAndUpdate(jobId, { $inc: { applied: 1 } });

      // 6. Push vào mảng appliedJobs của User
      await User.findByIdAndUpdate(candidateId, {
        $addToSet: { appliedJobs: jobId },
      });

      res.status(201).json({
        success: true,
        isApplied: true,
        message: "Ứng tuyển thành công!",
      });
    } catch (error) {
      // Bắt lỗi Unique Index nếu bị click đúp tạo 2 request cùng lúc
      if (error.code === 11000) {
        await removeUploadedFile(req.file);
        return res.status(409).json({
          success: false,
          isApplied: true,
          message: "Bạn đã ứng tuyển công việc này rồi",
        });
      }
      await removeUploadedFile(req.file);
      res
        .status(500)
        .json({ message: "Lỗi khi ứng tuyển", error: error.message });
    }
  },

  // 6. Lưu việc làm (Yêu thích) - Có tính năng Toggle (Lưu/Hủy lưu)
  saveJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;

      const user = await User.findById(userId);
      const isSaved = user.savedJobs.includes(jobId);

      if (isSaved) {
        // Nếu đã lưu rồi -> Hủy lưu
        await User.findByIdAndUpdate(userId, { $pull: { savedJobs: jobId } });
        res.status(200).json({
          success: true,
          message: "Đã bỏ lưu việc làm",
          isSaved: false,
        });
      } else {
        // Nếu chưa lưu -> Thêm vào danh sách
        await User.findByIdAndUpdate(userId, {
          $addToSet: { savedJobs: jobId },
        });
        res
          .status(200)
          .json({ success: true, message: "Đã lưu việc làm", isSaved: true });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi lưu việc làm", error: error.message });
    }
  },

  // 7. Xóa việc làm (Dành cho Employer chỉ xóa chính tin của mình)
  deleteJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      const employerId = req.user.id;

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Không tìm thấy việc làm" });
      }

      if (job.employerId.toString() !== employerId) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền xóa việc làm này" });
      }

      await Job.findByIdAndDelete(jobId);
      await Employer.findByIdAndUpdate(employerId, { $inc: { totalJobs: -1 } });
      await Application.deleteMany({ job: jobId });
      await User.updateMany(
        { $or: [{ appliedJobs: jobId }, { savedJobs: jobId }] },
        { $pull: { appliedJobs: jobId, savedJobs: jobId } },
      );

      res
        .status(200)
        .json({ success: true, message: "Xóa việc làm thành công" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi xóa việc làm", error: error.message });
    }
  },

  // 8. Tạo tin tuyển dụng mới (Dành cho Employer)
  createJob: async (req, res) => {
    try {
      // req.user.id có được là nhờ middleware verifyToken
      const employerId = req.user.id;

      // Tìm thông tin công ty đang đăng nhập
      const employer = await Employer.findById(employerId);
      if (!employer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy thông tin nhà tuyển dụng" });
      }

      const jobData = req.body;

      // Khởi tạo Job mới
      const newJob = new Job({
        ...jobData,
        employerId: employer._id,

        companySnapshot: {
          id: employer._id,
          companyName: employer.companyName,
          logo: employer.logo,
          size: employer.size,
          industry: employer.industry,
          verified: employer.verified,
        },
      });

      await newJob.save();

      // Cập nhật tăng tổng số Job của Employer này lên 1
      await Employer.findByIdAndUpdate(employerId, { $inc: { totalJobs: 1 } });

      res.status(201).json({
        success: true,
        message: "Đăng tin tuyển dụng thành công",
        data: newJob,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi tạo tin tuyển dụng", error: error.message });
    }
  },
};

module.exports = jobController;
