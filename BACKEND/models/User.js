const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, default: "candidate" },

    // Đưa các trường này ra lớp ngoài cùng để khớp với req.body
    headline: { type: String },
    location: { type: String },
    experience: { type: String },
    education: { type: String },
    skills: [{ type: String }], // Lưu mảng các kỹ năng
    bio: { type: String },
    linkedin: { type: String },
    github: { type: String },

    // Tham chiếu danh sách job
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
