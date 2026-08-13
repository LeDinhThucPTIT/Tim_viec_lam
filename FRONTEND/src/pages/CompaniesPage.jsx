// ===========================
// pages/CompaniesPage.jsx
// ===========================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Select,
  Row,
  Col,
  Tag,
  Spin,
  Empty,
  message,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import companyService from "../services/companyService"; // Tích hợp service dùng Axios
import "./CompaniesPage.css";

const { Option } = Select;

const CompaniesPage = () => {
  const navigate = useNavigate();

  // State quản lý dữ liệu từ API
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12; // Số lượng công ty hiển thị trên 1 trang

  // State quản lý bộ lọc
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");

  // ==========================================
  // TỐI ƯU SEARCH
  // ==========================================
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timerId);
  }, [keyword]);

  // ==========================================
  // RESET PAGE: Quay về trang 1 khi thay đổi bộ lọc
  // ==========================================
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, industry, location]);

  // ==========================================
  // FETCH FILTERS (Chạy 1 lần khi render)
  // ==========================================
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await companyService.getFilters();
        // Lấy data từ Axios (response.data) hoặc từ response trực tiếp nếu đã config interceptor
        const filterData = response.data || response;

        setIndustries(filterData.industries || []);
        setLocations(filterData.locations || []);
      } catch (err) {
        console.error("Lỗi fetch filters:", err);
        message.error("Không thể tải danh sách bộ lọc từ hệ thống!");
      }
    };
    fetchFilters();
  }, []);

  // ==========================================
  // FETCH COMPANIES (Chạy lại khi bộ lọc hoặc trang thay đổi)
  // ==========================================
  useEffect(() => {
    const fetchCompaniesData = async () => {
      setLoading(true);
      try {
        const response = await companyService.getCompanies({
          keyword: debouncedKeyword,
          industry: industry,
          location: location,
          page: page,
          limit: pageSize,
        });

        const responseData = response.data || response;
        // Backend trả về object chứa { companies, total, page, totalPages }
        setCompanies(responseData.companies || []);
        setTotal(responseData.total || 0);
      } catch (err) {
        console.error("Lỗi fetch companies:", err);
        message.error("Không thể tải danh sách công ty!");
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesData();
  }, [debouncedKeyword, industry, location, page]);

  return (
    <div className="companies-page">
      {/* Header & Thanh Tìm Kiếm */}
      <div className="companies-header">
        <div className="container">
          <h1 className="companies-header__title">Khám phá công ty</h1>
          <p className="companies-header__subtitle">
            Hàng ngàn doanh nghiệp hàng đầu đang tuyển dụng
          </p>
          <div className="companies-search">
            <Input
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              placeholder="Nhập tên công ty, ngành nghề..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              size="large"
              style={{ flex: 1, maxWidth: 420, borderRadius: 10 }}
              allowClear
            />

            {/* Bộ lọc Ngành nghề (Có sẵn lựa chọn cứng) */}
            <Select
              placeholder="Tất cả ngành nghề"
              value={industry || undefined}
              onChange={setIndustry}
              allowClear
              size="large"
              style={{ width: 200, borderRadius: 10 }}
            >
              <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
              <Option value="Thương mại điện tử">Thương mại điện tử</Option>
              <Option value="Ngân hàng / Tài chính">
                Ngân hàng / Tài chính
              </Option>
              <Option value="Bán lẻ / Hàng tiêu dùng">
                Bán lẻ / Hàng tiêu dùng
              </Option>
              <Option value="Giáo dục / Đào tạo">Giáo dục / Đào tạo</Option>
              <Option value="Viễn thông">Viễn thông</Option>
              <Option value="Y tế / Chăm sóc sức khỏe">
                Y tế / Chăm sóc sức khỏe
              </Option>

              {/* Load thêm các ngành nghề khác từ API (loại bỏ trùng lặp) */}
              {industries
                .filter(
                  (i) =>
                    ![
                      "Công nghệ thông tin",
                      "Thương mại điện tử",
                      "Ngân hàng / Tài chính",
                      "Bán lẻ / Hàng tiêu dùng",
                      "Giáo dục / Đào tạo",
                      "Viễn thông",
                      "Y tế / Chăm sóc sức khỏe",
                    ].includes(i),
                )
                .map((i) => (
                  <Option key={i} value={i}>
                    {i}
                  </Option>
                ))}
            </Select>

            {/* Bộ lọc Địa điểm (Có sẵn lựa chọn cứng) */}
            <Select
              placeholder="Tất cả địa điểm"
              value={location || undefined}
              onChange={setLocation}
              allowClear
              size="large"
              style={{ width: 160, borderRadius: 10 }}
            >
              <Option value="Hà Nội">Hà Nội</Option>
              <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
              <Option value="Đà Nẵng">Đà Nẵng</Option>
              <Option value="Cần Thơ">Cần Thơ</Option>
              <Option value="Hải Phòng">Hải Phòng</Option>
              <Option value="Bình Dương">Bình Dương</Option>

              {/* Load thêm các địa điểm khác từ API (loại bỏ trùng lặp) */}
              {locations
                .filter(
                  (l) =>
                    ![
                      "Hà Nội",
                      "Hồ Chí Minh",
                      "Đà Nẵng",
                      "Cần Thơ",
                      "Hải Phòng",
                      "Bình Dương",
                    ].includes(l),
                )
                .map((l) => (
                  <Option key={l} value={l}>
                    {l}
                  </Option>
                ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Kết Quả Trả Về */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <div className="companies-result-count">
          Tìm thấy <strong>{total}</strong> công ty phù hợp
        </div>

        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          {companies.length > 0 ? (
            <>
              <Row gutter={[20, 20]}>
                {companies.map((company) => (
                  <Col
                    key={company._id || company.id}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                  >
                    <div
                      className="company-detail-card"
                      onClick={() =>
                        navigate(`/companies/${company._id || company.id}`)
                      }
                    >
                      {company.verified && (
                        <div className="company-detail-card__verified">
                          <CheckCircleFilled /> Đã xác thực
                        </div>
                      )}
                      <div className="company-detail-card__logo-wrap">
                        <img
                          src={company.logo}
                          alt={company.companyName || company.name}
                          className="company-detail-card__logo"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              company.companyName || company.name || "Company",
                            )}&background=00b14f&color=fff&size=80`;
                          }}
                        />
                      </div>
                      <h3 className="company-detail-card__name">
                        {company.companyName || company.name}
                      </h3>
                      <p className="company-detail-card__industry">
                        {company.industry}
                      </p>
                      <div className="company-detail-card__info">
                        <span>
                          <EnvironmentOutlined /> {company.location}
                        </span>
                        <span>
                          <TeamOutlined /> {company.size || "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="company-detail-card__tags">
                        {(company.tags || []).slice(0, 2).map((t) => (
                          <Tag
                            key={t}
                            style={{
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            {t}
                          </Tag>
                        ))}
                      </div>
                      <div className="company-detail-card__jobs">
                        <span className="company-jobs-count">
                          {company.jobs || 0}
                        </span>{" "}
                        việc làm đang tuyển
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Hiển thị phân trang */}
              <div style={{ marginTop: 40, textAlign: "center" }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={pageSize}
                  onChange={(newPage) => setPage(newPage)}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            !loading && (
              <div style={{ marginTop: 40 }}>
                <Empty description="Không tìm thấy công ty nào phù hợp với bộ lọc của bạn" />
              </div>
            )
          )}
        </Spin>
      </div>
    </div>
  );
};

export default CompaniesPage;
