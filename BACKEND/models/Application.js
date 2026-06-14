const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    cvType: { type: String, enum: ["online", "pdf"], required: true },

    onlineCvSnapshot: {
      type: mongoose.Schema.Types.Mixed,

      required: function () {
        return this.cvType === "online";
      },
    },

    pdfCvUrl: {
      type: String,
      required: function () {
        return this.cvType === "pdf";
      },
    },

    coverLetter: { type: String },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewing", "interviewed", "offered", "rejected"],
      default: "new",
    },
  },
  { timestamps: true },
);

// Đảm bảo 1 user chỉ nộp 1 job 1 lần
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
