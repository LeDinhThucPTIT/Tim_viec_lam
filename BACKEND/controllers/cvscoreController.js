const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI từ biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cvscoreController = {
  // ==========================================
  // POST /api/cv/score - API Chấm điểm CV
  // ==========================================
  scoreCV: async (req, res) => {
    try {
      //  Nhận dữ liệu từ Frontend gửi lên
      const { cvText, jobTitle, jobDesc } = req.body;

      //  Validate đầu vào
      if (!cvText || cvText.trim().length < 100) {
        return res.status(400).json({
          message:
            "Nội dung CV quá ngắn hoặc không hợp lệ. Vui lòng nhập tối thiểu 100 ký tự.",
        });
      }

      // Khởi tạo Model Gemini 2.5 Flash (đã xác thực là API Key của bạn hỗ trợ)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.2, // Nhiệt độ thấp giúp AI đánh giá logic, khắt khe và nhất quán hơn
          responseMimeType: "application/json", // Ép buộc AI chỉ trả về định dạng JSON thuần túy
        },
      });

      //  Xây dựng Prompt chuẩn xác khớp với Frontend
      const prompt = `
        Bạn là chuyên gia HR và Headhunter cấp cao tại Việt Nam với 15 năm kinh nghiệm tuyển dụng trong ngành IT.
        Nhiệm vụ của bạn là đọc, phân tích, chấm điểm và đưa ra nhận xét chi tiết cho CV sau.

        === NỘI DUNG CV CỦA ỨNG VIÊN ===
        ${cvText}

        === VỊ TRÍ ỨNG TUYỂN ===
        Vị trí mong muốn: ${jobTitle || "Chưa xác định"}
        ${jobDesc ? `Mô tả công việc (JD) chi tiết:\n${jobDesc}` : "Không có mô tả JD cụ thể."}

        === YÊU CẦU TRẢ VỀ ===
        Phân tích và CHỈ trả về một đối tượng JSON với cấu trúc CHÍNH XÁC như sau (không thêm bất kỳ văn bản, lời chào hay markdown nào khác bên ngoài JSON):
        {
          "overallScore": <số nguyên từ 0 đến 100 phản ánh chất lượng tổng thể>,
          "grade": "<Chọn 1 trong các hạng: A+|A|B+|B|C+|C|D>",
          "summary": "<Viết nhận xét tổng quan khoảng 2-3 câu bằng tiếng Việt, đánh giá mức độ phù hợp và ấn tượng chung>",
          "sections": {
            "format": { "score": <0-100>, "details": "<Nhận xét ngắn về bố cục, sự chuyên nghiệp>" },
            "experience": { "score": <0-100>, "details": "<Nhận xét ngắn về kinh nghiệm làm việc>" },
            "skills": { "score": <0-100>, "details": "<Nhận xét ngắn về kỹ năng chuyên môn>" },
            "education": { "score": <0-100>, "details": "<Nhận xét ngắn về học vấn>" },
            "presentation": { "score": <0-100>, "details": "<Nhận xét ngắn về văn phong, cách hành văn>" },
            "ats_compatibility": { "score": <0-100>, "details": "<Nhận xét khả năng qua vòng quét tự động ATS>" }
          },
          "strengths": ["<Điểm mạnh 1>", "<Điểm mạnh 2>", "<Điểm mạnh 3>"],
          "weaknesses": ["<Điểm yếu 1 cần khắc phục>", "<Điểm yếu 2>", "<Điểm yếu 3>"],
          "tips": ["<Gợi ý hành động thực tế 1>", "<Gợi ý 2>", "<Gợi ý 3>"],
          "keywords": {
            "found": ["<Từ khóa kỹ năng/công cụ có trong CV>", "<Từ khóa 2>"],
            "missing": ["<Từ khóa quan trọng nên bổ sung dựa trên JD hoặc chức danh>"]
          },
          "jobMatch": ${jobDesc ? "<số nguyên 0-100 đánh giá độ khớp với JD>" : "null"},
          "hiringChance": "<Chọn 1: Cao|Khá cao|Trung bình|Thấp>",
          "estimatedSalary": "<Ước lượng mức lương thị trường VN hiện tại, ví dụ: '15,000,000 - 20,000,000 VND'>",
          "improvementPriority": ["<Việc cần sửa ngay số 1>", "<Việc cần sửa ngay số 2>"]
        }
      `;

      //  Gọi AI sinh nội dung
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      //  Xử lý và Parse JSON

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Lỗi parse JSON từ AI:", responseText);
        return res
          .status(500)
          .json({ message: "Phản hồi từ AI không đúng định dạng JSON." });
      }

      //  Trả kết quả thành công về cho Frontend
      return res.status(200).json(parsedData);
    } catch (error) {
      console.error("Lỗi hệ thống khi gọi Gemini API:", error);

      // Bắt các lỗi cụ thể để báo lại Frontend rõ ràng hơn
      if (error.message.includes("API key not valid")) {
        return res
          .status(401)
          .json({ message: "Lỗi cấu hình: API Key không hợp lệ." });
      }

      return res.status(500).json({
        message:
          "Có lỗi xảy ra trong quá trình phân tích CV. Vui lòng thử lại sau.",
        error: error.message,
      });
    }
  },
};

module.exports = cvscoreController;
