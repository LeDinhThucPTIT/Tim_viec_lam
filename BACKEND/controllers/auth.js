// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employer = require("../models/Employer");

// Hàm tạo Token dùng chung
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "jwt_secret_key_topcv",
    {
      expiresIn: "7d", // Token sống trong 7 ngày
    },
  );
};

// ==========================================
// REGISTER - Đăng ký
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, companyName, email, phone, password, role } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if ((!name && !companyName) || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    let token;

    // 3. Phân luồng đăng ký dựa vào Role
    if (role === "employer") {
      // 3.1 Xử lý đăng ký cho Nhà tuyển dụng
      const existingEmployer = await Employer.findOne({ email });
      if (existingEmployer) {
        return res.status(400).json({
          message: "Email này đã được sử dụng cho tài khoản Nhà tuyển dụng.",
        });
      }

      newUser = new Employer({
        companyName,
        email,
        phone,
        password: hashedPassword,
        role: "employer",
      });

      await newUser.save();
      token = generateToken(newUser._id, newUser.role);
    } else {
      // 3.2 Xử lý đăng ký cho Ứng viên (Candidate)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email này đã được đăng ký. Vui lòng đăng nhập." });
      }

      newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "candidate",
      });

      await newUser.save();
      token = generateToken(newUser._id, newUser.role);
    }

    // 4. Trả về kết quả cho Frontend
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar || null,
        logo: newUser.logo || null,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau." });
  }
};

// ==========================================
// LOGIN - Đăng nhập
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // 1. Tìm trong bảng User trước
    let user = await User.findOne({ email });
    let isEmployer = false;

    // 2. Nếu không thấy, tìm tiếp bên bảng Employer
    if (!user) {
      user = await Employer.findOne({ email });
      isEmployer = true;
    }

    // 3. Nếu tìm cả 2 bảng đều không có
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // 4. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // 5. Tạo token và trả về
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: !isEmployer ? user.avatar : undefined,
        logo: isEmployer ? user.logo : undefined,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau." });
  }
};

// ==========================================
// GET PROFILE - Lấy thông tin cá nhân
// ==========================================
exports.getProfile = async (req, res) => {
  try {
    if (!req.user?.id || !req.user?.role) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Candidate => lấy từ bảng User
    if (req.user.role === "candidate") {
      const user = await User.findById(req.user.id)
        .select("-password")
        .populate("savedJobs") // Lấy chi tiết thông tin công việc đã lưu
        .populate("appliedJobs"); // Lấy chi tiết thông tin công việc đã ứng tuyển.lean();

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy candidate" });
      }

      return res.status(200).json({ user });
    }

    // Employer => lấy từ bảng Employer
    if (req.user.role === "employer") {
      const employer = await Employer.findById(req.user.id)
        .select("-password")
        .lean();

      if (!employer) {
        return res.status(404).json({ message: "Không tìm thấy employer" });
      }

      return res.status(200).json({ user: employer });
    }

    return res.status(403).json({ message: "Role không hợp lệ" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy thông tin profile", error: error.message });
  }
}; 

// ==========================================
// UPDATE PROFILE - Cập nhật thông tin cá nhân
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      headline,
      location,
      experience,
      education,
      skills,
      bio,
      linkedin,
      github,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Họ và tên là bắt buộc!" });
    }

    const updateData = {
      name,
      phone,
      headline,
      location,
      experience,
      education,
      skills: Array.isArray(skills) ? skills : [],
      bio,
      linkedin,
      github,
    };


    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để cập nhật!" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi updateProfile:", error);
    return res.status(500).json({ message: "Lỗi server khi lưu hồ sơ!" });
  }
};

// ==========================================
// CHANGE PASSWORD - Đổi mật khẩu
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ các trường mật khẩu!" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp!" });
    }

    let user = await User.findById(req.user.id);
    if (!user) {
      user = await Employer.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác!" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi changePassword:", error);
    return res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
  }
};

// ==========================================
// UPDATE AVATAR - Cập nhật ảnh đại diện / Logo
// ==========================================
exports.updateAvatar = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một file ảnh!" });
    }

    const protocol = req.protocol;
    const host = req.get("host");
    const fileUrl = `${protocol}://${host}/uploads/img/${req.file.filename}`;

    let updatedAccount;


    if (req.user.role === "candidate") {
      updatedAccount = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: fileUrl },
        { new: true },
      ).select("-password");
    } else if (req.user.role === "employer") {
      updatedAccount = await Employer.findByIdAndUpdate(
        req.user.id,
        { logo: fileUrl },
        { new: true },
      ).select("-password");
    } else {
      return res.status(403).json({ message: "Quyền truy cập không hợp lệ!" });
    }

    if (!updatedAccount) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản để cập nhật!" });
    }

   
    return res.status(200).json({
      message: "Cập nhật ảnh thành công!",
     
      avatarUrl:
        req.user.role === "employer"
          ? updatedAccount.logo
          : updatedAccount.avatar,
      user: updatedAccount,
    });
  } catch (error) {
    console.error("Lỗi updateAvatar:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật ảnh đại diện!" });
  }
};
