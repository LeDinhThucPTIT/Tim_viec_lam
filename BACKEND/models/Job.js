const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
      index: true,
    },

    // SUBSET PATTERN: Nhúng thông tin công ty để frontend đọc nhanh
    companySnapshot: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },
      companyName: { type: String },
      logo: { type: String },
      size: { type: String },
      industry: { type: String },
      verified: { type: Boolean },
    },

    title: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true },
    jobType: { type: String },
    experience: { type: String },

    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "VND" },
      negotiable: { type: Boolean, default: false },
    },

    skills: [{ type: String }],
    description: { type: String, required: true },
    benefits: [{ type: String }],

    deadline: { type: Date },

    views: { type: Number, default: 0 },
    applied: { type: Number, default: 0 },

    urgent: { type: Boolean, default: false },
    hot: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "paused", "closed", "draft"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
