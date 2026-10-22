// Giao Diện Quản Trị Admin Tối Cao (Tông Chủ Vạn Bảo Các)
// Yêu cầu đặc tả: "Admin (1 người): Ngoài quyền mua sắm, Admin có thêm giao diện quản trị đặc biệt để tạo tài khoản Seller cho 4 thành viên còn lại trong nhóm."
async function renderAdminView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  const user = window.store.user;
  if (!user || user.role !== 'admin') {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-20 text-center">
        <div class="text-5xl mb-3 text-rose-500">🚫</div>
        <h2 class="font-cinzel text-xl font-bold text-rose-400">Cấm Địa Tông Môn</h2>
        <p class="text-xs text-slate-400 mt-2 mb-4">Chỉ có Đại Tông Chủ mới có pháp quyết mở phong ấn Đại Điện này.</p>
        <a href="#home" class="px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-semibold">Về Trang Chủ</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-16 text-center text-amber-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở sổ bộ Tông Môn...</p>
    </div>
  `;

  try {
    const statsData = await window.api.getAdminStats();
    const sellersData = await window.api.getAdminSellers();

    const stats = statsData.stats || {};
    const sellers = sellersData.sellers || [];
    const users = statsData.users || [];

    const sellersListHtml = sellers.map((s, idx) => `
      <tr class="border-b border-slate-800/60 hover:bg-slate-900/40 transition">
        <td class="py-3 px-4 text-xs font-mono text-slate-500">#${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
              ${s.name.charAt(0)}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-200">${s.name}</div>
              <div class="text-[10px] text-slate-400">${s.email}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs text-cyan-300 font-semibold">
          <i class="fa-solid fa-cauldron mr-1"></i>${s.dongPhu || 'Thần Luyện Động Phủ'}
        </td>
        <td class="py-3 px-4 text-xs font-cinzel font-bold text-amber-400">
          💎 ${window.formatScientificOrLocale(s.linhThach || 0)}
        </td>
        <td class="py-3 px-4 text-[11px] text-slate-400">
          ${new Date(s.createdAt).toLocaleDateString('vi-VN')}
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2 uppercase tracking-wider">
              👑 Quyền Hạn Tông Chủ
            </div>
            <h1 class="font-cinzel text-2xl sm:text-3xl font-black text-slate-100">
              Đại Điện Quản Trị Vạn Bảo Các
            </h1>
            <p class="text-xs text-slate-400 mt-1 max-w-xl">
              Nơi Tông Chủ điều phối kinh mạch, quản lý 4 Động Chủ Seller, giám sát lưu thông Linh Thạch và phân quyền tông môn.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.renderAdminView()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition">
              <i class="fa-solid fa-arrows-rotate"></i>
              <span>Làm Mới Sổ Bộ</span>
            </button>
          </div>
        </div>

        <!-- 5 Thẻ Thống Kê Tổng Quan -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <!-- Khung Tổng Tu Sĩ: Chú thích chỉ hiển thị số Buyers -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div class="text-xs sm:text-sm text-slate-300 uppercase tracking-wider font-bold">Tổng Tu Sĩ</div>
            <div class="text-3xl sm:text-4xl font-black text-slate-100 font-cinzel my-2">
              ${stats.totalUsers || 0}
            </div>
            <div class="text-xs text-emerald-400 font-semibold">
              ${stats.totalBuyers || 0} Buyers
            </div>
          </div>

          <!-- Khung Động Chủ Seller: Đã bỏ chú thích, tăng size chữ -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div class="text-xs sm:text-sm text-cyan-400 uppercase tracking-wider font-bold">Động Chủ Seller</div>
            <div class="text-3xl sm:text-4xl font-black text-cyan-300 font-cinzel my-2">
              ${stats.totalSellers || 0}
            </div>
            <div></div>
          </div>

          <!-- Khung Tổng Bảo Vật: Đã bỏ chú thích, tăng size chữ -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div class="text-xs sm:text-sm text-amber-400 uppercase tracking-wider font-bold">Tổng Bảo Vật</div>
            <div class="text-3xl sm:text-4xl font-black text-amber-300 font-cinzel my-2">
              ${stats.totalProducts || 0}
            </div>
            <div></div>
          </div>

          <!-- Khung Linh Thạch Lưu Thông: Dùng ký hiệu khoa học khi vượt quá 10 triệu -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div class="text-xs sm:text-sm text-emerald-400 uppercase tracking-wider font-bold">Linh Thạch Lưu Thông</div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-300 font-cinzel my-2 truncate" title="${(stats.totalLinhThachCirculating || 0).toLocaleString('vi-VN')}">
              💎 ${window.formatScientificOrLocale(stats.totalLinhThachCirculating || 0)}
            </div>
            <div class="text-xs text-slate-400 font-medium">
              ${stats.totalOrders || 0} giao dịch
            </div>
          </div>

          <!-- Khung Doanh Thu: Dùng ký hiệu khoa học khi vượt quá 10 triệu -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div class="text-xs sm:text-sm text-purple-400 uppercase tracking-wider font-bold">Tổng Doanh Thu</div>
            <div class="text-2xl sm:text-3xl font-black text-purple-300 font-cinzel my-2 truncate" title="${(stats.totalRevenue || 0).toLocaleString('vi-VN')}">
              💎 ${window.formatScientificOrLocale(stats.totalRevenue || 0)}
            </div>
            <div class="text-xs text-slate-400 font-medium">
              Toàn tông môn
            </div>
          </div>

        </div>

        <!-- FORM ĐẶC BIỆT: TẠO TÀI KHOẢN SELLER CHO 4 THÀNH VIÊN (THEO ĐẶC TẢ) -->
        <div class="glass-modal rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-xl">
          
          <div class="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-6">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-500/40">
              🏰
            </div>
            <div>
              <h2 class="font-cinzel text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                Sắc Phong Động Chủ Seller
              </h2>
              <p class="text-xs text-slate-400">
                Chức năng đặc quyền của Admin để cấp quyền kinh doanh cho các thành viên.
              </p>
            </div>
          </div>

          <!-- Alert message box -->
          <div id="admin-create-alert" class="hidden mb-4 p-3 rounded-xl text-xs"></div>

          <!-- Form tạo Seller -->
          <form id="create-seller-form" onsubmit="window.handleCreateSellerSubmit(event)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Đạo Hiệu Seller <span class="text-amber-400">*</span>
              </label>
              <input type="text" 
                     name="name" 
                     required 
                     placeholder="Ví dụ: Bách Thảo Đan Vương" 
                     class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Truyền Âm Phù (Email) <span class="text-amber-400">*</span>
              </label>
              <input type="email" 
                     name="email" 
                     required 
                     placeholder="sellerX@vanbaocac.com" 
                     class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật Mã Tu Vi (Password) <span class="text-amber-400">*</span>
              </label>
              <input type="password" 
                     name="password" 
                     required 
                     minlength="6"
                     placeholder="Ít nhất 6 ký tự" 
                     value="password123"
                     class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên Động Phủ / Gian Hàng
              </label>
              <input type="text" 
                     name="dongPhu" 
                     placeholder="Ví dụ: Thần Đan Các, Vạn Thú Trang..." 
                     value="Thần Luyện Động Phủ"
                     class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Linh Thạch Ban Thưởng Khởi Đầu
              </label>
              <input type="number" 
                     name="initialLinhThach" 
                     value="50000" 
                     min="1000"
                     class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-amber-300 font-bold font-cinzel outline-none transition" />
            </div>

            <div class="flex items-end">
              <button type="submit" 
                      id="create-seller-btn"
                      class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer">
                <i class="fa-solid fa-award"></i>
                <span>Sắc Phong Động Chủ</span>
              </button>
            </div>

          </form>

        </div>

        <!-- DANH SÁCH 4 ĐỘNG CHỦ SELLER -->
        <div class="glass-modal rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 class="font-cinzel text-lg font-bold text-slate-100">
                Danh Sách Động Chủ Seller (${sellers.length} Vị)
              </h3>
              <p class="text-xs text-slate-400">Các thành viên nắm giữ quyền đăng bán và quản lý bảo vật</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th class="py-2.5 px-4">STT</th>
                  <th class="py-2.5 px-4">Đạo Hiệu & Email</th>
                  <th class="py-2.5 px-4">Động Phủ Quản Lý</th>
                  <th class="py-2.5 px-4">Linh Thạch</th>
                  <th class="py-2.5 px-4">Ngày Nhận Chức</th>
                </tr>
              </thead>
              <tbody>
                ${sellersListHtml || `
                  <tr>
                    <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
                      Chưa có Seller nào được sắc phong.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center text-rose-400">
        Lỗi quản trị: ${err.message}
      </div>
    `;
  }
}

window.renderAdminView = renderAdminView;

window.handleCreateSellerSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('create-seller-btn');
  const alertBox = document.getElementById('admin-create-alert');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang ban sắc lệnh...`;

  const sellerData = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
    dongPhu: form.dongPhu.value,
    initialLinhThach: form.initialLinhThach.value
  };

  try {
    const res = await window.api.createSeller(sellerData);
    alertBox.className = 'mb-4 p-3 rounded-xl text-xs bg-emerald-950/60 border border-emerald-500 text-emerald-300 flex items-center gap-2';
    alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${res.message}</span>`;
    alertBox.classList.remove('hidden');

    window.showToast(res.message, 'success');
    form.reset();

    // Reload admin view after 1s
    setTimeout(() => {
      renderAdminView();
    }, 1200);

  } catch (err) {
    alertBox.className = 'mb-4 p-3 rounded-xl text-xs bg-rose-950/60 border border-rose-500 text-rose-300 flex items-center gap-2';
    alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${err.message}</span>`;
    alertBox.classList.remove('hidden');
    window.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-award"></i> Sắc Phong Động Chủ`;
  }
};
