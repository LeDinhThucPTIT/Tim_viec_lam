// ===========================
// MOCK DATA - TopCV Clone
// Dữ liệu giả lập để phát triển UI
// Khi có backend thật, chỉ cần thay services/api.js
// ===========================

export const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer (ReactJS)',
    company: {
      id: 'c1',
      name: 'FPT Software',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
      size: '1000-5000 nhân viên',
      industry: 'Công nghệ thông tin',
      verified: true,
    },
    salary: { min: 25000000, max: 45000000, currency: 'VND', negotiable: false },
    location: 'Hà Nội',
    experience: '3-5 năm',
    jobType: 'full-time',
    category: 'IT - Phần mềm',
    skills: ['ReactJS', 'TypeScript', 'Redux', 'REST API', 'Git'],
    description: `
      <p>Chúng tôi đang tìm kiếm Senior Frontend Developer có kinh nghiệm với ReactJS để gia nhập đội ngũ phát triển sản phẩm.</p>
      <h3>Mô tả công việc:</h3>
      <ul>
        <li>Phát triển giao diện người dùng cho các sản phẩm web quy mô lớn</li>
        <li>Tối ưu hóa hiệu suất ứng dụng frontend</li>
        <li>Phối hợp với team Backend và Designer</li>
        <li>Review code và hướng dẫn junior developer</li>
        <li>Tham gia thiết kế kiến trúc hệ thống frontend</li>
      </ul>
      <h3>Yêu cầu:</h3>
      <ul>
        <li>Tối thiểu 3 năm kinh nghiệm với ReactJS</li>
        <li>Thành thạo TypeScript, HTML5, CSS3</li>
        <li>Có kinh nghiệm với Redux/Zustand</li>
        <li>Hiểu biết về RESTful API và GraphQL</li>
        <li>Kỹ năng tiếng Anh đọc hiểu tốt</li>
      </ul>
    `,
    benefits: ['Lương thưởng cạnh tranh', 'Thưởng dự án', 'Bảo hiểm sức khỏe', 'Làm việc hybrid', '13 tháng lương'],
    deadline: '2025-05-30',
    postedAt: '2025-04-15',
    views: 1240,
    applied: 87,
    urgent: true,
    hot: true,
  },
  {
    id: '2',
    title: 'Backend Developer (Node.js + MongoDB)',
    company: {
      id: 'c2',
      name: 'VNG Corporation',
      logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/f5/VNG_Corporation_logo.svg/200px-VNG_Corporation_logo.svg.png',
      size: '5000+ nhân viên',
      industry: 'Công nghệ thông tin',
      verified: true,
    },
    salary: { min: 20000000, max: 40000000, currency: 'VND', negotiable: true },
    location: 'Hồ Chí Minh',
    experience: '2-4 năm',
    jobType: 'full-time',
    category: 'IT - Phần mềm',
    skills: ['Node.js', 'MongoDB', 'Express', 'Docker', 'Redis'],
    description: `<p>VNG Corporation tìm kiếm Backend Developer để phát triển hệ thống phân tán hiệu suất cao.</p>`,
    benefits: ['Lương 13-15 tháng', 'Cổ phần công ty', 'Phòng game thư giãn', 'Ăn trưa miễn phí'],
    deadline: '2025-06-15',
    postedAt: '2025-04-10',
    views: 980,
    applied: 65,
    urgent: false,
    hot: true,
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: {
      id: 'c3',
      name: 'Tiki',
      logo: 'https://salt.tikicdn.com/ts/upload/0e/07/78/ee828743c9aea6a19b4f8978e80ef1d1.png',
      size: '500-1000 nhân viên',
      industry: 'Thương mại điện tử',
      verified: true,
    },
    salary: { min: 15000000, max: 30000000, currency: 'VND', negotiable: false },
    location: 'Hồ Chí Minh',
    experience: '2-3 năm',
    jobType: 'full-time',
    category: 'Thiết kế',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design System'],
    description: `<p>Tiki cần UI/UX Designer sáng tạo để cải thiện trải nghiệm mua sắm trực tuyến của hàng triệu khách hàng.</p>`,
    benefits: ['Lương cạnh tranh', 'Voucher Tiki hàng tháng', 'Team building', 'Đào tạo chuyên sâu'],
    deadline: '2025-05-20',
    postedAt: '2025-04-12',
    views: 756,
    applied: 43,
    urgent: false,
    hot: false,
  },
  {
    id: '4',
    title: 'Data Engineer (Python + Spark)',
    company: {
      id: 'c4',
      name: 'Shopee Vietnam',
      logo: 'https://cf.shopee.vn/file/sg-11134258-7rdw8-m0tqkfmunb6m54',
      size: '5000+ nhân viên',
      industry: 'Thương mại điện tử',
      verified: true,
    },
    salary: { min: 30000000, max: 60000000, currency: 'VND', negotiable: false },
    location: 'Hồ Chí Minh',
    experience: '3-5 năm',
    jobType: 'full-time',
    category: 'IT - Phần mềm',
    skills: ['Python', 'Apache Spark', 'Airflow', 'SQL', 'AWS'],
    description: `<p>Shopee tìm kiếm Data Engineer để xây dựng và duy trì pipeline dữ liệu quy mô lớn.</p>`,
    benefits: ['Lương theo thị trường', 'Thưởng hiệu suất', 'Môi trường quốc tế', 'Bảo hiểm cao cấp'],
    deadline: '2025-06-01',
    postedAt: '2025-04-08',
    views: 1450,
    applied: 102,
    urgent: true,
    hot: true,
  },
  {
    id: '5',
    title: 'Product Manager',
    company: {
      id: 'c5',
      name: 'Grab Vietnam',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grab_%28application%29_logo.svg/200px-Grab_%28application%29_logo.svg.png',
      size: '1000-5000 nhân viên',
      industry: 'Giao thông vận tải / Công nghệ',
      verified: true,
    },
    salary: { min: 35000000, max: 70000000, currency: 'VND', negotiable: true },
    location: 'Hà Nội',
    experience: '4-6 năm',
    jobType: 'full-time',
    category: 'Quản lý sản phẩm',
    skills: ['Product Strategy', 'Agile/Scrum', 'SQL', 'Data Analysis', 'Stakeholder Management'],
    description: `<p>Grab Vietnam tìm kiếm Product Manager để dẫn dắt phát triển sản phẩm cho thị trường Đông Nam Á.</p>`,
    benefits: ['Lương thưởng hấp dẫn', 'Stock options', 'Môi trường quốc tế', 'Flexible working'],
    deadline: '2025-05-25',
    postedAt: '2025-04-05',
    views: 890,
    applied: 54,
    urgent: false,
    hot: false,
  },
  {
    id: '6',
    title: 'DevOps Engineer (AWS / Kubernetes)',
    company: {
      id: 'c6',
      name: 'Techcombank',
      logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/8/87/Techcombank_logo.svg/200px-Techcombank_logo.svg.png',
      size: '5000+ nhân viên',
      industry: 'Ngân hàng / Tài chính',
      verified: true,
    },
    salary: { min: 28000000, max: 55000000, currency: 'VND', negotiable: false },
    location: 'Hà Nội',
    experience: '3-5 năm',
    jobType: 'full-time',
    category: 'IT - Phần mềm',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    description: `<p>Techcombank tìm kiếm DevOps Engineer để xây dựng hạ tầng cloud hiện đại cho ngân hàng số.</p>`,
    benefits: ['Lương cạnh tranh', 'Vay ưu đãi nhân viên', 'Bảo hiểm toàn diện', 'Đào tạo AWS certification'],
    deadline: '2025-06-10',
    postedAt: '2025-04-03',
    views: 672,
    applied: 38,
    urgent: false,
    hot: false,
  },
];

export const mockCompanies = [
  { id: 'c1', name: 'FPT Software', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png', jobs: 24, industry: 'IT' },
  { id: 'c2', name: 'VNG Corporation', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/f5/VNG_Corporation_logo.svg/200px-VNG_Corporation_logo.svg.png', jobs: 18, industry: 'IT' },
  { id: 'c4', name: 'Shopee Vietnam', logo: 'https://cf.shopee.vn/file/sg-11134258-7rdw8-m0tqkfmunb6m54', jobs: 32, industry: 'E-commerce' },
  { id: 'c5', name: 'Grab Vietnam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grab_%28application%29_logo.svg/200px-Grab_%28application%29_logo.svg.png', jobs: 15, industry: 'Tech' },
  { id: 'c6', name: 'Techcombank', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/8/87/Techcombank_logo.svg/200px-Techcombank_logo.svg.png', jobs: 12, industry: 'Finance' },
  { id: 'c7', name: 'Vingroup', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/56/Logo_V_Vingroup_RGB.svg/200px-Logo_V_Vingroup_RGB.svg.png', jobs: 28, industry: 'Conglomerate' },
];

export const mockCategories = [
  { key: 'it', label: 'IT - Phần mềm', icon: '💻', count: 1240 },
  { key: 'design', label: 'Thiết kế', icon: '🎨', count: 320 },
  { key: 'marketing', label: 'Marketing', icon: '📣', count: 580 },
  { key: 'finance', label: 'Tài chính / Kế toán', icon: '💰', count: 410 },
  { key: 'sales', label: 'Kinh doanh / Sales', icon: '📈', count: 760 },
  { key: 'hr', label: 'Nhân sự', icon: '👥', count: 290 },
  { key: 'engineering', label: 'Kỹ thuật / Cơ khí', icon: '⚙️', count: 380 },
  { key: 'edu', label: 'Giáo dục / Đào tạo', icon: '📚', count: 215 },
];

export const mockUser = {
  id: 'u1',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  phone: '0912345678',
  avatar: null,
  role: 'candidate',
  headline: 'Frontend Developer với 3 năm kinh nghiệm',
  location: 'Hà Nội',
  experience: '3 năm',
  education: 'Đại học Bách khoa Hà Nội',
  skills: ['ReactJS', 'JavaScript', 'TypeScript', 'CSS', 'Git'],
  savedJobs: ['1', '3'],
  appliedJobs: ['2'],
};

export const mockStats = {
  totalJobs: 125420,
  totalCompanies: 18300,
  totalCandidates: 980000,
  newJobsToday: 1240,
};
