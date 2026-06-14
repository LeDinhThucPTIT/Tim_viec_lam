const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const employerRoutes = require("./employerRoutes");
const companyRoutes = require("./companyRoutes");
const cvRoutes = require("./cvRoutes");
function route(app) {
  app.use("/auth", authRoutes);
  app.use("/jobs", jobRoutes);
  app.use("/employer", employerRoutes);
  app.use("/companies", companyRoutes);
  app.use("/cvs", cvRoutes);
}

module.exports = route;
