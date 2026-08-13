// ===========================
// Modal tạo / chỉnh sửa tin tuyển dụng
// ===========================

import React, { useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, Button, Divider,
  Row, Col, Switch, message,
} from 'antd';
import {
  FileTextOutlined, DollarOutlined, EnvironmentOutlined,
  TeamOutlined, TagsOutlined, CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CATEGORIES = [
  'IT - Phần mềm', 'Thiết kế', 'Marketing', 'Tài chính / Kế toán',
  'Kinh doanh / Sales', 'Nhân sự', 'Kỹ thuật', 'Quản lý sản phẩm',
  'Giáo dục', 'Logistics', 'Bán lẻ / Tiêu dùng',
];
const LOCATIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Toàn quốc', 'Remote'];
const EXPERIENCE_OPTIONS = ['Không yêu cầu', 'Dưới 1 năm', '1-2 năm', '2-3 năm', '3-5 năm', '5-7 năm', '7+ năm'];
const JOB_TYPES = [
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
  { value: 'remote',    label: 'Remote' },
  { value: 'internship',label: 'Thực tập' },
  { value: 'contract',  label: 'Hợp đồng' },
];
const SKILL_OPTIONS = [
  'ReactJS', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Node.js',
  'Python', 'Java', 'PHP', 'Go', 'MySQL', 'MongoDB', 'PostgreSQL',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Figma', 'Adobe XD',
  'Agile/Scrum', 'Product Management', 'Data Analysis',
];

const PostJobModal = ({ open, onClose, onSubmit, initialData = null, loading = false }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          salaryMin: initialData.salary?.min,
          salaryMax: initialData.salary?.max,
          deadline: initialData.deadline ? dayjs(initialData.deadline) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      salary: {
        min: values.salaryMin ? Number(values.salaryMin) : null,
        max: values.salaryMax ? Number(values.salaryMax) : null,
        currency: 'VND',
        negotiable: !values.salaryMin && !values.salaryMax,
      },
      deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
    };
    delete payload.salaryMin;
    delete payload.salaryMax;
    await onSubmit(payload);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700 }}>
          <FileTextOutlined style={{ color: 'var(--color-primary)' }} />
          {isEdit ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
      styles={{ body: { maxHeight: '78vh', overflowY: 'auto', paddingRight: 4 } }}
    >
      <Divider />
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* ---- Thông tin cơ bản ---- */}
        <div className="form-section-label">Thông tin cơ bản</div>

        <Form.Item
          name="title"
          label="Tiêu đề công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="VD: Senior Frontend Developer (ReactJS)" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Ngành nghề" rules={[{ required: true }]}>
              <Select placeholder="Chọn ngành nghề" size="large">
                {CATEGORIES.map((c) => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="jobType" label="Hình thức làm việc" rules={[{ required: true }]}>
              <Select placeholder="Chọn hình thức" size="large">
                {JOB_TYPES.map((t) => <Option key={t.value} value={t.value}>{t.label}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="location" label="Địa điểm làm việc" rules={[{ required: true }]}>
              <Select placeholder="Chọn địa điểm" size="large">
                {LOCATIONS.map((l) => <Option key={l} value={l}>{l}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="experience" label="Kinh nghiệm yêu cầu" rules={[{ required: true }]}>
              <Select placeholder="Chọn kinh nghiệm" size="large">
                {EXPERIENCE_OPTIONS.map((e) => <Option key={e} value={e}>{e}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="deadline" label="Hạn nộp hồ sơ" rules={[{ required: true }]}>
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                disabledDate={(d) => d && d < dayjs().startOf('day')}
                placeholder="Chọn ngày hết hạn"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="quantity" label="Số lượng tuyển">
              <Input type="number" min={1} placeholder="VD: 3" size="large" suffix="người" />
            </Form.Item>
          </Col>
        </Row>

        {/* ---- Mức lương ---- */}
        <div className="form-section-label">
          <DollarOutlined /> Mức lương
        </div>
        <Row gutter={16}>
          <Col span={11}>
            <Form.Item name="salaryMin" label="Lương tối thiểu (VND)">
              <Input type="number" placeholder="VD: 20000000" size="large" />
            </Form.Item>
          </Col>
          <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
            <span style={{ color: '#9ca3af' }}>—</span>
          </Col>
          <Col span={11}>
            <Form.Item name="salaryMax" label="Lương tối đa (VND)">
              <Input type="number" placeholder="VD: 40000000" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: -12, marginBottom: 20 }}>
          Để trống cả hai nếu lương thỏa thuận
        </p>

        {/* ---- Kỹ năng ---- */}
        <div className="form-section-label">
          <TagsOutlined /> Kỹ năng yêu cầu
        </div>
        <Form.Item name="skills">
          <Select
            mode="tags"
            size="large"
            placeholder="Chọn hoặc nhập kỹ năng (Enter để thêm)"
            style={{ width: '100%' }}
          >
            {SKILL_OPTIONS.map((s) => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Form.Item>

        {/* ---- Mô tả ---- */}
        <div className="form-section-label">
          <FileTextOutlined /> Mô tả công việc
        </div>
        <Form.Item
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
        >
          <TextArea
            rows={7}
            placeholder={`Mô tả chi tiết về:
• Trách nhiệm và nhiệm vụ chính
• Yêu cầu về kỹ năng và kinh nghiệm
• Các kỹ năng mềm mong muốn
• Yêu cầu về bằng cấp (nếu có)`}
          />
        </Form.Item>

        <Form.Item name="benefits" label="Quyền lợi">
          <TextArea
            rows={4}
            placeholder={`VD:
• Lương thưởng cạnh tranh, xét tăng lương 2 lần/năm
• Bảo hiểm sức khỏe cao cấp
• Làm việc hybrid (3 ngày office, 2 ngày remote)
• Team building hàng quý`}
          />
        </Form.Item>

        {/* ---- Cài đặt ---- */}
        <div className="form-section-label">Cài đặt đăng tin</div>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="urgent" label="Tuyển gấp" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hot" label="Tin nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="publish" label="Đăng ngay" valuePropName="checked" initialValue={true}>
              <Switch defaultChecked />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button size="large" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            size="large"
            onClick={() => {
              form.setFieldValue('publish', false);
              form.submit();
            }}
            disabled={loading}
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{ fontWeight: 700, paddingInline: 32 }}
          >
            {isEdit ? 'Cập nhật tin' : 'Đăng tin ngay'}
          </Button>
        </div>
      </Form>

      <style>{`
        .form-section-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 14px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .form-section-label .anticon { color: var(--color-primary); }
      `}</style>
    </Modal>
  );
};

export default PostJobModal;
