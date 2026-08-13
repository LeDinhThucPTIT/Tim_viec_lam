// ===========================

// Sidebar bộ lọc tìm việc
// ===========================

import React from 'react';
import { Card, Select, Button, Divider, Slider } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import './JobFilter.css';

const { Option } = Select;

const LOCATIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai'];
const EXPERIENCES = ['Dưới 1 năm', '1-2 năm', '2-3 năm', '3-5 năm', '5+ năm'];
const JOB_TYPES = [
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
  { value: 'remote', label: 'Remote' },
  { value: 'internship', label: 'Thực tập' },
  { value: 'contract', label: 'Hợp đồng' },
];
const CATEGORIES = [
  'IT - Phần mềm', 'Thiết kế', 'Marketing', 'Tài chính / Kế toán',
  'Kinh doanh / Sales', 'Nhân sự', 'Kỹ thuật', 'Giáo dục',
];

const JobFilter = ({ filters, onChange, onReset }) => {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasActiveFilter = Object.values(filters).some((v) => v && v !== 'all');

  return (
    <Card className="job-filter" bordered={false}>
      <div className="job-filter__header">
        <div className="job-filter__title">
          <FilterOutlined />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        {hasActiveFilter && (
          <button className="job-filter__reset" onClick={onReset}>
            <ReloadOutlined /> Đặt lại
          </button>
        )}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div className="job-filter__body">
        {/* Location */}
        <div className="job-filter__group">
          <label className="job-filter__label">Địa điểm</label>
          <Select
            placeholder="Chọn địa điểm"
            value={filters.location || undefined}
            onChange={(v) => handleChange('location', v)}
            allowClear
            style={{ width: '100%' }}
          >
            {LOCATIONS.map((loc) => (
              <Option key={loc} value={loc}>{loc}</Option>
            ))}
          </Select>
        </div>

        {/* Category */}
        <div className="job-filter__group">
          <label className="job-filter__label">Ngành nghề</label>
          <Select
            placeholder="Chọn ngành nghề"
            value={filters.category || undefined}
            onChange={(v) => handleChange('category', v)}
            allowClear
            style={{ width: '100%' }}
          >
            {CATEGORIES.map((cat) => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </div>

        {/* Experience */}
        <div className="job-filter__group">
          <label className="job-filter__label">Kinh nghiệm</label>
          <Select
            placeholder="Chọn kinh nghiệm"
            value={filters.experience || undefined}
            onChange={(v) => handleChange('experience', v)}
            allowClear
            style={{ width: '100%' }}
          >
            {EXPERIENCES.map((exp) => (
              <Option key={exp} value={exp}>{exp}</Option>
            ))}
          </Select>
        </div>

        {/* Job Type */}
        <div className="job-filter__group">
          <label className="job-filter__label">Loại hình làm việc</label>
          <div className="job-filter__types">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                className={`job-filter__type-btn ${filters.jobType === type.value ? 'active' : ''}`}
                onClick={() =>
                  handleChange('jobType', filters.jobType === type.value ? '' : type.value)
                }
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Salary */}
        <div className="job-filter__group">
          <label className="job-filter__label">Mức lương (triệu VND)</label>
          <Select
            placeholder="Chọn mức lương"
            value={filters.salary || undefined}
            onChange={(v) => handleChange('salary', v)}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="5000000-10000000">5 - 10 triệu</Option>
            <Option value="10000000-20000000">10 - 20 triệu</Option>
            <Option value="20000000-30000000">20 - 30 triệu</Option>
            <Option value="30000000-50000000">30 - 50 triệu</Option>
            <Option value="50000000">Trên 50 triệu</Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default JobFilter;
