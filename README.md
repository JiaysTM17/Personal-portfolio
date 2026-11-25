<div align="center">

# Trương Gia Kiệt (`@JiaysTM17`) — Personal Portfolio

**Computer Science Student (HCMUTE) • Software & Fullstack Developer**

[![Live Portfolio](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2563eb?style=for-the-badge&logo=githubpages&logoColor=white)](https://jiaystm17.github.io/Personal-portfolio/)
[![GitHub Profile](https://img.shields.io/badge/GitHub-@JiaysTM17-12151d?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JiaysTM17)
[![Email](https://img.shields.io/badge/Email-truonggiakiet110806@gmail.com-059669?style=for-the-badge&logo=gmail&logoColor=white)](mailto:truonggiakiet110806@gmail.com)

</div>

---

## 📌 Tổng Quan (Overview)

Trang web **Portfolio cá nhân** của **Trương Gia Kiệt** — được thiết kế theo phong cách **Dark Brutalist Agency** kết hợp **Bento Grid** hiện đại, tối ưu hiệu năng và đồng bộ trực tiếp với các dự án thực tế trên GitHub. Điểm nhấn đặc biệt của trang là hệ thống **Swarm Rebuild Engine** mô phỏng hàng chục AI agents cùng lúc dựng lại toàn bộ giao diện theo thời gian thực.

### ✨ Tính Năng Nổi Bật

* **Hero Typographic Layering:** Chân dung tách nền kết hợp chữ nền `"PORTFOLIO"` cỡ lớn và cột chỉ số thực tế (`10` Public Repos, `06` Dự án tiêu biểu, `3,151` Automated Tests).
* **Bento Engineering Hub:**
  * `01 // NARRATIVE`: Định hướng phát triển hệ thống Backend & Fullstack.
  * `02 // KEY METRICS`: Lưới thống kê liên kết trực tiếp tới từng repository và sản phẩm triển khai.
  * `03 // CORE TECH STACK`: Ma trận công nghệ thực chiến (`Java 21`, `Spring Boot 3.3.5`, `React.js`, `Node.js`, `PostgreSQL`, `MongoDB`, `Docker`, `Gemini API`, `Tailwind CSS`, `GitHub Actions`).
  * `04 // STUDIO CLOCK`: Đồng hồ thời gian thực múi giờ TP. Hồ Chí Minh (`GMT+7`).
* **Selected Work & Lightbox Modal:** Bộ lọc dự án theo danh mục, thẻ giao diện độ phân giải cao và hộp thoại xem chi tiết kèm liên kết GitHub / Live Site.
* **Technical Architecture & Reports:** Trình bày các tài liệu đặc tả hệ thống và báo cáo kiểm thử tự động từ các đồ án thực tế.
* **Interactive Controls:** `Zen Focus Mode`, `Click-to-Copy Email`, `CV Resume Modal (In / Lưu PDF)` và biểu mẫu liên hệ trực tiếp qua `mailto:`.

---

## 🤖 Swarm Rebuild Engine (`effects/agent-replay.js` & `effects/agent-replay.css`)

Hệ thống mô phỏng đa tác tử (Multi-Agent UI/UX Build Replay) chạy hoàn toàn bằng Vanilla JavaScript + `requestAnimationFrame` 60fps:

* **66-Agent `"HELLO"` Intro Formation:**
  * Lúc khởi động trên nền trống (`4.7s`), **66 mũi tên màu** (18 agents chính + 48 mũi tên intro) xuất phát tản đều khắp màn hình theo lưới `11×6`, sau đó lướt theo đường cong Bézier (`easeInOutSine`) tụ lại thành chữ **`HELLO`** rõ nét (chữ `O` dáng superellipse đồng bộ tỷ lệ với `H-E-L-L`).
  * Trong lúc giữ chữ **`HELLO`**, từng mũi tên tự xoay độc lập theo nhiều hướng trước khi chuyển tiếp mượt sang đội hình build trang.
* **4 Parallel Tracks & 14–18 Dynamic Agents:**
  * Thu thập và lọc tự động **~320+ layer DOM hiển thị thực** (bỏ qua phần tử ẩn `0×0`), chia đều qua 4 track song song với số lượng agents hoạt động thay đổi linh hoạt từ **14 đến 18 agents**.
  * Tách riêng phần SVG mũi tên (`.agent-arrow`) để xoay đầu mượt theo hướng bay trong khi nhãn tên luôn nằm ngang dễ đọc.
* **Chống giật & chống lệch chữ (`Zero-Jitter`):**
  * Tính toán mục tiêu ổn định ngoài vòng lặp `requestAnimationFrame` và loại bỏ CSS `transition: transform` trên con trỏ để giữ chuyển động 60fps mượt mà.
  * Khóa tạm `minHeight` khi gõ hiệu ứng chữ (`typeElementText`) và chỉ gõ cho thẻ lá (`el.children.length === 0`) để không gây xô lệch bố cục hay mất chữ.
* **Hai chế độ `Touring` + Hiệu ứng Đàn Cá Quanh Chuột (`Cursor Vortex`):**
  * **Touring ON (Cuộn tự động):** Tự động cuộn một chiều mượt mà theo tiến trình dựng trang.
  * **Touring OFF (Người dùng tự kéo):** Chỉ build các layer trong khung hình hiện tại; khi chờ cuộn xuống hoặc khi hoàn tất toàn trang (cả 2 chế độ), các agents tập hợp lại và bơi nối đuôi theo chiều kim đồng hồ thành 2 làn gợn sóng quanh con trỏ chuột.
* **Floating Control Dock:** Cho phép bật/tắt `Touring`, đổi tốc độ `1x / 2x / 3x`, bật/tắt âm thanh tổng hợp bằng **Web Audio API** (`🔊 / 🔇`), chuyển nhanh `Replay / Go Live` hoặc thu gọn thành pill `Swarm Replay`.

---

## 🚀 Dự Án Tiêu Biểu (Featured Projects)

| # | Dự án | Công nghệ chính | Điểm nhấn kỹ thuật | Repository |
| :- | :--- | :--- | :--- | :--- |
| **01** | **UTECOFFE** | Java 21, Spring Boot 3.3.5, PostgreSQL, WebSocket, Docker | Hệ thống TMĐT OMO, quầy KDS realtime, CSDL 34 bảng, domain `utecoffe.io.vn` | [JiaysTM17/UTECoffe](https://github.com/JiaysTM17/UTECoffe) |
| **02** | **NEXORA** | TypeScript, System Design, Brand Visual Identity | Sàn TMĐT thời trang OOTD Community, Re-Loved Trade-In, Luxury VAS Care | [JiaysTM17/nexora](https://github.com/JiaysTM17/nexora) |
| **03** | **Fullstack E-Commerce** | React, Node.js, Express, MongoDB | **3,151 / 3,151** Automated Tests (1.29s), Escrow Vault, bảo mật OWASP | [JiaysTM17/Fullstack-Ecommerce](https://github.com/JiaysTM17/Fullstack-Ecommerce) |
| **04** | **Kiệt AI Assistant** | Google Gemini API, Node.js, Express | API trợ lý AI song ngữ Việt - Anh đồng bộ ngữ cảnh từ GitHub | [JiaysTM17/portfolio-assistant-api](https://github.com/JiaysTM17/portfolio-assistant-api) |
| **05** | **Task Manager** | HTML5, CSS3 Grid, JavaScript ES6+ | Ứng dụng quản lý công việc cá nhân, lưu trữ bền vững LocalStorage | [JiaysTM17/task-manager](https://github.com/JiaysTM17/task-manager) |
| **06** | **LTW Video System** | Spring Boot, Spring Data JPA, Sitemesh 3, PostgreSQL | Hệ thống quản lý & truyền phát video học phần Lập trình Web (HCMUTE) | [JiaysTM17/LTW_BT16.11.2026_JPA_Video](https://github.com/JiaysTM17/LTW_BT16.11.2026_JPA_Video) |

---

## 📂 Cấu Trúc Thư Mục (Repository Structure)

```text
Personal-portfolio/
├── index.html                 # Cấu trúc giao diện chính (Semantic HTML5 + Tailwind CSS)
├── style.css                  # Tùy biến scrollbar, hiệu ứng glow, modal & responsive
├── script.js                  # Logic lọc dự án, modal, Studio Clock, Click-to-Copy & CV
├── README.md                  # Tài liệu giới thiệu, kiến trúc Swarm Replay & hướng dẫn chạy
├── .gitignore                 # Quy tắc loại trừ file tạm
├── effects/                   # Hệ thống Swarm Rebuild Engine
│   ├── agent-replay.css       # Bounding box, lớp blank/wireframe/built & floating dock UI
│   └── agent-replay.js        # Intro HELLO (66 mũi tên), 14-18 agents, Touring & Cursor Vortex
└── assets/                    # Tài nguyên hình ảnh đã tối ưu
    ├── portrait_kiet.png      # Chân dung tách nền chuyên nghiệp
    ├── banner-strip.png       # Dải banner studio moodboard
    ├── utecoffe.png           # Logo thương hiệu UTECoffe
    ├── nexora.jpg             # Nhận diện thương hiệu NEXORA
    ├── project-fullstack.png  # Mockup Fullstack E-Commerce
    ├── project-ai.png         # Mockup Kiệt AI Assistant
    ├── project-task.png       # Mockup Task Manager
    └── project-video.png      # Mockup LTW Video Streaming
```

---

## 💻 Chạy Dự Án Local

Mở terminal tại thư mục dự án và khởi chạy bằng Python hoặc Node.js:

```bash
# Cách 1: Python HTTP Server
python -m http.server 3000

# Cách 2: Node.js Serve
npx serve -l 3000
```

Sau đó truy cập tại trình duyệt: `http://localhost:3000`

---

<div align="center">
  <sub>© 2026 <strong>Trương Gia Kiệt</strong> • Built with clean code in Ho Chi Minh City, Vietnam.</sub>
</div>
