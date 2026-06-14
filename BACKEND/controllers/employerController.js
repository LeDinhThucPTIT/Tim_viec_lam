// controllers/employerController.js
const Job = require("../models/Job");
const Application = require("../models/Application");
const Employer = require("../models/Employer");
const mongoose = require("mongoose");

const employerController = {
  // ==========================================
  // PHẦN 1: THỐNG KÊ (DASHBOARD & CHARTS)
  // ==========================================

  getDashboardStats: async (req, res) => {
    try {
      const employerId = req.user.id;

      // 1. Lấy tất cả ID các công việc của công ty này
      const jobs = await Job.find({ employerId }, "_id views");
      const jobIds = jobs.map((j) => j._id);

      // Tính tổng lượt xem từ tất cả các job
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

      // 2. Chạy 4 truy vấn đếm cùng lúc (Song song) để tối ưu tốc độ
      const [totalJobs, activeJobs, totalApplications, newApplications] =
        await Promise.all([
          Job.countDocuments({ employerId }),
          Job.countDocuments({ employerId, status: "active" }),
          Application.countDocuments({ job: { $in: jobIds } }),
          Application.countDocuments({ job: { $in: jobIds }, status: "new" }),
        ]);

      res.status(200).json({
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications,
        totalViews,
        profileViews: 128, // Giả lập (có thể tính sau)
        hiredThisMonth: 3, // Giả lập
        responseRate: 78, // Giả lập
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi lấy thống kê", error: error.message });
    }
  },

  getChartData: async (req, res) => {
    try {
      const employerId = req.user.id;
      const jobIds = (await Job.find({ employerId }, "_id")).map((j) => j._id);

      // Dùng Aggregation Pipeline để gom nhóm CV theo trạng thái
      const applicationsByStatus = await Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      // Map lại dữ liệu cho khớp với frontend
      const statusMap = {
        new: { label: "Mới", color: "#6366f1" },
        reviewing: { label: "Đang xem xét", color: "#f59e0b" },
        interviewed: { label: "Phỏng vấn", color: "#3b82f6" },
        offered: { label: "Đã offer", color: "#00b14f" },
        rejected: { label: "Từ chối", color: "#ef4444" },
      };

      const formattedStatus = applicationsByStatus.map((item) => ({
        status: statusMap[item._id]?.label || item._id,
        count: item.count,
        color: statusMap[item._id]?.color || "#ccc",
      }));

      res.status(200).json({
        applicationsByStatus: formattedStatus,
        applicationsByDay: [], // Thêm logic aggregate theo ngày sau
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi vẽ biểu đồ", error: error.message });
    }
  },

  // ==========================================
  // PHẦN 2: QUẢN LÝ TIN ĐĂNG (JOBS)
  // ==========================================

  getPostedJobs: async (req, res) => {
    try {
      const { status, keyword } = req.query;
      let query = { employerId: req.user.id };

      if (status && status !== "all") query.status = status;
      if (keyword) query.title = { $regex: keyword, $options: "i" };

      const jobs = await Job.find(query).sort({ createdAt: -1 });
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy danh sách việc làm" });
    }
  },

  updateJob: async (req, res) => {
    try {
      const job = await Job.findOneAndUpdate(
        { _id: req.params.id, employerId: req.user.id },
        req.body,
        { new: true },
      );
      if (!job)
        return res.status(404).json({ message: "Không tìm thấy tin đăng" });
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật tin" });
    }
  },

  changeJobStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const job = await Job.findOneAndUpdate(
        { _id: req.params.id, employerId: req.user.id },
        { status },
        { new: true },
      );
      res.status(200).json({ success: true, id: job._id, status: job.status });
    } catch (error) {
      res.status(500).json({ message: "Lỗi đổi trạng thái" });
    }
  },

  // ==========================================
  // PHẦN 3: QUẢN LÝ ỨNG VIÊN (APPLICATIONS)
  getApplications: async (req, res) => {
    try {
      const { jobId, status } = req.query;
      const employerId = req.user.id;

      let jobQuery = { employerId };
      if (jobId && jobId !== "all") jobQuery._id = jobId;
      const jobIds = (await Job.find(jobQuery, "_id")).map((j) => j._id);

      let appQuery = { job: { $in: jobIds } };
      if (status && status !== "all") appQuery.status = status;

      const applications = await Application.find(appQuery)
        .populate("job", "title employerId")
        .populate("candidate", "name email phone avatar profile")
        .sort({ createdAt: -1 });

      const formattedApps = applications.map((app) => {
        const pdfUrl =
          app.cvType === "pdf" && app.pdfCvUrl
            ? `${req.protocol}://${req.get("host")}${app.pdfCvUrl}`
            : null;

        return {
          id: app._id,
          jobId: app.job ? app.job._id : null,
          jobTitle: app.job ? app.job.title : "Việc làm đã bị xóa",
          status: app.status,
          appliedAt: app.createdAt,
          cv: {
            type: app.cvType,
            pdfUrl,
            onlineSnapshot:
              app.cvType === "online" ? app.onlineCvSnapshot : null,
          },
          coverLetter: app.coverLetter,
          note: app.note,
          candidate: {
            id: app.candidate ? app.candidate._id : null,
            name:
              app.fullName || (app.candidate ? app.candidate.name : "Ẩn danh"),
            email: app.email || (app.candidate ? app.candidate.email : ""),
            phone: app.phone || (app.candidate ? app.candidate.phone : ""),
            avatar: app.candidate ? app.candidate.avatar : null,
            headline:
              app.onlineCvSnapshot?.headline ||
              app.candidate?.profile?.headline,
          },
        };
      });

      res.status(200).json(formattedApps);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy hồ sơ", error: error.message });
    }
  },

  updateApplicationStatus: async (req, res) => {
    try {
      let { status, note } = req.body;
      const appId = req.params.appId;
      const allowedStatuses = [
        "new",
        "reviewing",
        "interviewed",
        "offered",
        "rejected",
      ];
      const statusMessages = {
        new: "Đã chuyển hồ sơ về trạng thái mới",
        reviewing: "Đã chuyển hồ sơ sang đang xem xét",
        interviewed: "Đã chuyển hồ sơ sang đã phỏng vấn",
        offered: "Đã gửi offer cho ứng viên",
        rejected: "Đã từ chối ứng viên",
      };

      if (!mongoose.Types.ObjectId.isValid(appId)) {
        return res.status(400).json({
          success: false,
          message: "ID hồ sơ không hợp lệ",
        });
      }

      // normalize common shortcuts from frontend
      if (status === "offer") status = "offered";
      if (status === "reject") status = "rejected";

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Trường status là bắt buộc",
          allowedStatuses,
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái hồ sơ không hợp lệ",
          allowedStatuses,
        });
      }

   
      const application = await Application.findById(appId).populate("job");

      if (!application) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
      }

      if (!application.job) {
        return res
          .status(404)
          .json({ success: false, message: "Tin tuyển dụng không tồn tại" });
      }

      // Kiểm tra xem Job của đơn này có đúng là do Employer này tạo không
      if (application.job.employerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thao tác trên đơn này",
        });
      }

      application.status = status;
      if (note !== undefined) application.note = note;

      // Avoid unnecessary DB write if nothing changed
      const needsSave =
        application.isModified &&
        (application.isModified("status") || application.isModified("note"));
      if (needsSave) await application.save();

      // Add a debug header so frontend can identify the handler
      res.setHeader("X-Api-Handler", "updateApplicationStatus");

      res.status(200).json({
        success: true,
        message: statusMessages[application.status],
        appId: application._id,
        status: application.status,
        note: application.note,
        data: {
          id: application._id,
          appId: application._id,
          jobId: application.job._id,
          jobTitle: application.job.title,
          candidateId: application.candidate,
          status: application.status,
          note: application.note,
          updatedAt: application.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi cập nhật hồ sơ",
        error: error.message,
      });
    }
  },

  offerApplication: async (req, res) => {
    req.body.status = "offered";
    return employerController.updateApplicationStatus(req, res);
  },

  rejectApplication: async (req, res) => {
    req.body.status = "rejected";
    return employerController.updateApplicationStatus(req, res);
  },

  // ==========================================
  // PHẦN 4: HỒ SƠ CÔNG TY (PROFILE)
  // ==========================================

  getCompanyProfile: async (req, res) => {
    try {
      const profile = await Employer.findById(req.user.id).select("-password");
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy thông tin công ty" });
    }
  },

  updateCompanyProfile: async (req, res) => {
    try {
      const profile = await Employer.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
      }).select("-password");
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật công ty" });
    }
  },
};

module.exports = employerController;
