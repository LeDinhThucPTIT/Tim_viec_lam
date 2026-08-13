// ===========================
// pages/JobListPage.jsx
// Trang danh sách việc làm + filter
// ===========================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Pagination, Spin, Empty, Input, Select, Button, Tag } from 'antd';
import { SearchOutlined, SortAscendingOutlined } from '@ant-design/icons';
import JobCard from '../components/job/JobCard';
import JobFilter from '../components/job/JobFilter';
import jobService from '../services/jobService';
import './JobListPage.css';

const { Option } = Select;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'salary_desc', label: 'Lương cao nhất' },
  { value: 'hot', label: 'Nổi bật nhất' },
];

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    experience: '',
    salary: '',
    jobType: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await jobService.getJobs({
        keyword,
        ...filters,
        page,
        limit: 6,
      });
      setJobs(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [keyword, filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilter = () => {
    setFilters({ location: '', category: '', experience: '', salary: '', jobType: '' });
    setKeyword('');
    setPage(1);
  };

  const activeFilterTags = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ key: k, value: v }));

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="job-list-page">
      {/* Page header */}
      <div className="job-list-header">
        <div className="container">
          <h1 className="job-list-header__title">Tìm kiếm việc làm</h1>
          <p className="job-list-header__subtitle">
            Khám phá hàng nghìn cơ hội việc làm đang chờ đợi bạn
          </p>
          {/* Top search */}
          <div className="job-list-header__search">
            <Input
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Tìm theo vị trí, kỹ năng, công ty..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
              style={{ flex: 1, borderRadius: 10 }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{ height: 40, paddingInline: 28, fontWeight: 600, borderRadius: 10 }}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="container">
        <Row gutter={[24, 0]} className="job-list-layout">
          {/* Sidebar filter */}
          <Col xs={0} sm={0} md={7} lg={6}>
            <JobFilter
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilter}
            />
          </Col>

          {/* Main content */}
          <Col xs={24} md={17} lg={18}>
            {/* Toolbar */}
            <div className="job-list-toolbar">
              <div className="job-list-toolbar__left">
                {loading ? (
                  <span className="job-list-count">Đang tải...</span>
                ) : (
                  <span className="job-list-count">
                    Tìm thấy <strong>{total}</strong> việc làm
                    {keyword && <span> cho "<em>{keyword}</em>"</span>}
                  </span>
                )}
                {/* Active filter tags */}
                <div className="job-list-filter-tags">
                  {activeFilterTags.map((tag) => (
                    <Tag
                      key={tag.key}
                      closable
                      onClose={() => removeFilter(tag.key)}
                      color="green"
                      style={{ borderRadius: 6 }}
                    >
                      {tag.value}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="job-list-toolbar__right">
                <SortAscendingOutlined style={{ color: '#6b7280' }} />
                <Select
                  value={sort}
                  onChange={setSort}
                  bordered={false}
                  style={{ minWidth: 140 }}
                  size="small"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Job grid */}
            {loading ? (
              <div className="job-list-loading">
                <Spin size="large" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="job-list-empty">
                <Empty
                  description="Không tìm thấy việc làm phù hợp"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button onClick={handleResetFilter} type="primary">
                    Xóa bộ lọc
                  </Button>
                </Empty>
              </div>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {jobs.map((job) => (
                    <Col key={job.id} xs={24} sm={12} xl={12}>
                      <JobCard job={job} />
                    </Col>
                  ))}
                </Row>
                <div className="job-list-pagination">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={6}
                    onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} việc làm`}
                  />
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default JobListPage;
