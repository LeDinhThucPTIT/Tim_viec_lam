
const apiKey = "AIzaSyDZpjPjHygj0C5p7LvAD7hMb7zGjnAM4n4";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function getModels() {
  console.log("Đang hỏi Google xem API Key này được dùng model nào...");
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return console.log("❌ Lỗi từ Google:", data.error.message);
    }

    console.log("\n=== DANH SÁCH MODEL HỢP LỆ CHO API KEY CỦA BẠN ===");
    data.models.forEach((m) => {
      // Chỉ lọc ra các model hỗ trợ sinh text 
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`👉 ${m.name.replace("models/", "")}`);
      }
    });
  } catch (error) {
    console.error("❌ Lỗi mạng:", error);
  }
}

getModels();
