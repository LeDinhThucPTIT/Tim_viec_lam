const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(
  {
    // ===========================
    // AUTH
    // ===========================
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "employer",
    },

    // ===========================
    // COMPANY PROFILE
    // ===========================
    companyName: {
      type: String,

      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "linear-gradient(135deg,#0d3d2b,#006638)",
    },

    industry: {
      type: String,
    },

    size: {
      type: String,
    },

    founded: {
      type: String,
    },

    location: {
      type: String,
    },

    address: {
      type: String,
    },

    website: {
      type: String,
    },

    phone: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    whyJoin: {
      type: [String],
      default: [],
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // STATS
    // ===========================
    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    followerCount: {
      type: Number,
      default: 0,
    },

    totalJobs: {
      type: Number,
      default: 0,
    },

    totalApplications: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Search
employerSchema.index({
  companyName: "text",
  industry: "text",
});

module.exports = mongoose.model("Employer", employerSchema);
