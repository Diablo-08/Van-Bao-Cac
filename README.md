# 🌿 VẠN BẢO CÁC (Thương Mại Điện Tử Tu Tiên Đa Bên)

Hệ thống Thương Mại Điện Tử Tu Tiên nội bộ dành cho nhóm 5 người quản lý (1 Admin + 4 Seller) và các đạo hữu tu sĩ (Buyer), với cơ chế tiền tệ riêng (**Linh Thạch**), phân quyền chặt chẽ và giao diện huyền huyễn (tông màu slate tối, điểm nhấn ngọc bích và vàng kim).

---

## ⚡ Tech Stack

- **Backend**: Node.js, Express 5, Mongoose, JWT, Bcryptjs
- **Database**: MongoDB Atlas (`cultivation_db`)
- **Frontend**: Vanilla JS (Single Page Application), Tailwind CSS (CDN), FontAwesome 6, Google Fonts (*Playfair Display*, *Lora*, *Be Vietnam Pro* - 100% hỗ trợ tiếng Việt UTF-8), Celestial Ambient Canvas Particles
- **Cổng truy cập**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Thông Tin Tài Khoản Quản Trị Tối Cao (Admin)

Toàn bộ tài khoản cũ đã được làm sạch khỏi hệ thống. Tài khoản Admin duy nhất hiện tại:

| Thuộc tính | Giá trị |
| :--- | :--- |
| **Tên Đăng Nhập / Đạo Hiệu** | **`Bất Giới`** |
| **Mật Khẩu (Password)** | **`phatotrongtam`** |
| **Email (Truyền Âm Phù)** | `batgioi@vanbaocac.com` |
| **Vai Trò (Role)** | `admin` (Tông Chủ Vạn Bảo Các) |
| **Linh Thạch Khởi Đầu** | 999,999 Linh Thạch |
| **Động Phủ** | Vạn Bảo Các Tổng Điện |

*Hệ thống cho phép đăng nhập linh hoạt bằng cả **Tên Đăng Nhập (`Bất Giới`)** hoặc **Email (`batgioi@vanbaocac.com`)**.*

---

## 👥 Cơ Chế Tạo 4 Tài Khoản Seller Cho Nhóm

Theo đúng tài liệu đặc tả:
1. Admin **`Bất Giới`** đăng nhập vào hệ thống tại [http://localhost:5000](http://localhost:5000).
2. Nhấn vào Avatar hoặc chọn **👑 Đại Điện Tông Chủ (Admin Panel)**.
3. Sử dụng form **"Sắc Phong Động Chủ Seller"** để tự tay cấp tài khoản cho 4 thành viên còn lại trong nhóm:
   - Điền Đạo Hiệu
   - Email
   - Mật Khẩu
   - Tên Động Phủ
   - Số Linh Thạch ban đầu
4. Thành viên sau khi được Admin cấp tài khoản có thể đăng nhập ngay để đăng bán và quản lý bảo vật của riêng mình.

---

## 🛍️ Đăng Ký Tài Khoản Cho Người Dùng Mới (Buyer)

- Trên màn hình xác thực, bất kỳ khách vãng lai nào cũng có thể nhấn tab **"Đăng Ký Đạo Hữu"** để tạo tài khoản Người Mua (Buyer).
- Mọi tài khoản đăng ký mới tự động nhận vai trò **Buyer** và được tặng sẵn **1,000 Linh Thạch** để mua sắm.

---

## 💎 Cơ Chế Nạp Linh Thạch (Mã 666)

- Khi nhấn vào Avatar hoặc khi thanh toán thiếu tiền, mở modal **Nạp Thêm Linh Thạch**.
- Nhập số lượng Linh Thạch muốn nạp (có nút chọn nhanh: `+1,000`, `+5,000`, `+20,000`, `+100,000`).
- Nhập mã xác nhận bảo mật cố định: **`666`**.
- Bấm xác nhận -> Tiền được cộng dồn vào tài khoản lập tức và cập nhật số dư toàn bộ giao diện.
