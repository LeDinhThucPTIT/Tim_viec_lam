const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true }, // VD: "CV Frontend"
    type: { type: String, enum: ["created", "uploaded"], required: true },
    isDefault: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },

    // --- NẾU LÀ CV TỰ TẠO TRÊN WEB (type: 'created') ---
    template: { type: String },
    data: {
      fullName: { type: String, trim: true },
      jobTitle: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      location: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
      summary: { type: String, trim: true },
      experiences: [
        {
          _id: false,
          id: String,
          position: String,
          company: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
        },
      ],
      educations: [
        {
          _id: false,
          id: String,
          school: String,
          major: String,
          degree: String,
          startDate: String,
          endDate: String,
          gpa: String,
        },
      ],
      skills: { type: [String], default: [] }, // Set default mảng rỗng
      languages: [{ _id: false, id: String, language: String, level: String }],
      certifications: [
        { _id: false, id: String, name: String, issuer: String, year: String },
      ],
      projects: [
        {
          _id: false,
          id: String,
          name: String,
          tech: String,
          description: String,
          link: String,
        },
      ],
    },

    // --- NẾU LÀ CV UPLOAD PDF (type: 'uploaded') ---
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CV", cvSchema);
