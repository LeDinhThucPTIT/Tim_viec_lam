// ===========================
// controllers/companyController.js
// Dùng Employer làm Company luôn
// ===========================

const Employer = require("../models/Employer");

const companyController = {
  // [GET] Lấy danh sách filter động
  getFilters: async (req, res) => {
    try {
      const industries = await Employer.distinct("industry");
      const locations = await Employer.distinct("location");

      res.status(200).json({
        industries,
        locations,
      });
    } catch (error) {
      console.error("Lỗi getFilters:", error);

      res.status(500).json({
        message: "Lỗi server khi lấy bộ lọc",
        error: error.message,
      });
    }
  },

  // [GET] Danh sách công ty
  getCompanies: async (req, res) => {
    try {
      const { keyword, industry, location, page = 1, limit = 12 } = req.query;

      let query = {};

      // SEARCH
      if (keyword) {
        query.$or = [
          {
            companyName: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            industry: {
              $regex: keyword,
              $options: "i",
            },
          },
        ];
      }

      // FILTER
      if (industry) {
        query.industry = industry;
      }

      if (location) {
        query.location = {
          $regex: location,
          $options: "i",
        };
      }

      // PAGINATION
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      const skip = (pageNumber - 1) * limitNumber;

      // QUERY
      const [companiesDb, total] = await Promise.all([
        Employer.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Employer.countDocuments(query),
      ]);

      // FORMAT
      const formattedCompanies = companiesDb.map((c) => ({
        ...c,
        id: c._id,
        name: c.companyName,
        jobs: c.totalJobs,
      }));

      res.status(200).json({
        companies: formattedCompanies,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      });
    } catch (error) {
      console.error("Lỗi getCompanies:", error);

      res.status(500).json({
        message: "Lỗi server khi lấy danh sách",
        error: error.message,
      });
    }
  },

  // [GET] Chi tiết công ty
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;

      const company = await Employer.findById(id).lean();

      if (!company) {
        return res.status(404).json({
          message: "Không tìm thấy công ty này",
        });
      }

      // FORMAT
      company.id = company._id;
      company.name = company.companyName;
      company.jobs = company.totalJobs;

      res.status(200).json(company);
    } catch (error) {
      console.error("Lỗi getCompanyById:", error);

      res.status(500).json({
        message: "Lỗi server khi lấy chi tiết công ty",
        error: error.message,
      });
    }
  },
};

module.exports = companyController;
