# 🌿 VẠN BẢO CÁC (Thương Mại Điện Tử Tu Tiên Đa Bên)

Hệ thống Thương Mại Điện Tử Tu Tiên nội bộ dành cho nhóm 5 người quản lý (1 Admin + 4 Seller) và các đạo hữu tu sĩ (Buyer), với cơ chế tiền tệ riêng (**Linh Thạch**), phân quyền chặt chẽ và giao diện phong cách huyền huyễn (tông màu slate tối, điểm nhấn ngọc bích và vàng kim).

---

## ⚡ Tech Stack

- **Backend**: Node.js, Express 5, Mongoose, JWT, Bcryptjs
- **Database**: MongoDB Atlas (`cultivation_db`)
- **Frontend**: Vanilla JS (Single Page Application), Tailwind CSS (CDN), FontAwesome 6, Google Fonts (*Playfair Display*, *Lora*, *Be Vietnam Pro* - 100% hỗ trợ tiếng Việt UTF-8), Celestial Ambient Canvas Particles
- **Cổng truy cập**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 BẢNG TÀI KHOẢN VÀ MẬT KHẨU (ADMIN & 4 SELLERS)

Hệ thống hỗ trợ đăng nhập bằng cả **Đạo Hiệu (Tên đăng nhập)** hoặc **Email**:

### 1. 👑 Tài Khoản Quản Trị Tối Cao (Admin)

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Đạo Hiệu (Tên Đăng Nhập)** | **`Bất Giới`** |
| **Mật Khẩu (Password)** | **`phatotrongtam`** |
| **Email (Truyền Âm Phù)** | `batgioi@vanbaocac.com` |
| **Vai Trò (Role)** | `admin` (Tông Chủ Vạn Bảo Các) |
| **Động Phủ Quản Lý** | Vạn Bảo Các Tổng Điện |
| **Quyền Hạn** | Quản trị toàn hệ thống, sắc phong Seller, chỉnh sửa tất cả bảo vật |

---

### 2. 🏰 4 Tài Khoản Seller Quản Lý 4 Đại Danh Mục

| STT | Đạo Hiệu (Tên Đăng Nhập) | Email Đăng Nhập | Mật Khẩu | Danh Mục Quản Lý | Tên Động Phủ | Số Lượng Bảo Vật |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **1** | **`Thiên Thư Các Chủ`** | `congphap@vanbaocac.com` | **`seller123`** | **Công Pháp & Bí Tịch** | Thiên Thư Các | 28 món |
| **2** | **`Bách Thảo Đan Vương`** | `danduoc@vanbaocac.com` | **`seller123`** | **Đan Dược & Linh Thảo** | Bách Thảo Đan Các | 21 món |
| **3** | **`Vạn Kiếm Tông Chủ`** | `phapbao@vanbaocac.com` | **`seller123`** | **Pháp Bảo & Binh Khí** | Vạn Kiếm Luyện Khí Phủ | 23 món |
| **4** | **`Vạn Thú Trang Chủ`** | `linhvat@vanbaocac.com` | **`seller123`** | **Linh Vật** | Vạn Thú Sơn Trang | 10 món |

> 💡 **Ghi chú**: Đạo hữu có thể dùng **Tên Đăng Nhập** (ví dụ: `Thiên Thư Các Chủ`) hoặc **Email** (ví dụ: `congphap@vanbaocac.com`) kèm mật khẩu `seller123` để đăng nhập vào Động Phủ Luyện Chế quản lý danh mục tương ứng.

---

## 🛍️ Đăng Ký Tài Khoản Cho Người Mua (Buyer)

- Trên màn hình xác thực, bất kỳ khách vãng lai nào cũng có thể nhấn tab **"Đăng Ký Đạo Hữu"** để tạo tài khoản Người Mua (Buyer).
- Mặc định khi gia nhập giới tu tiên, mỗi đạo hữu Buyer được tặng sẵn **1,000 Linh Thạch** trong đan điền.

---

## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ
node server.js
```

Cổng giao thương mở tại: **http://localhost:5000**
