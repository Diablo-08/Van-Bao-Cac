// Modal / Sidebar Chi Tiết Cá Nhân (Khai mở khi nhấn vào Avatar)
function renderUserModal() {
  const existing = document.getElementById('user-sidebar-modal');
  if (existing) existing.remove();

  const user = window.store.user;
  if (!user) return;

  const roleConfigs = {
    admin: { label: 'Tông Chủ (Quản Trị Tối Cao)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    seller: { label: 'Động Chủ (Luyện Khí / Luyện Đan Sư)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    buyer: { label: 'Đạo Hữu Tu Sĩ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  };
  const roleInfo = roleConfigs[user.role] || roleConfigs.buyer;

  const modalHtml = `
    <div id="user-sidebar-modal" class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      
      <!-- Backdrop close -->
      <div class="flex-1 cursor-pointer" onclick="window.closeUserSidebar()"></div>

      <!-- Slide-over Drawer -->
      <div class="w-full max-w-md bg-slate-950 border-l border-emerald-900/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div>
          <!-- Header Modal -->
          <div class="flex items-center justify-between pb-5 border-b border-slate-800">
            <div class="flex items-center space-x-2">
              <span class="text-xl">📜</span>
              <h3 class="font-cinzel text-lg font-bold text-slate-100">Thông Tin Tu Sĩ</h3>
            </div>
            <button onclick="window.closeUserSidebar()" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Avatar & Tên & Thân Phận -->
          <div class="py-6 flex flex-col items-center text-center">
            <div class="relative mb-3">
              <img src="${user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.name}" 
                   alt="${user.name}" 
                   class="w-20 h-20 rounded-full border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/20 object-cover bg-slate-900" />
              <div class="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] text-black font-bold">
                ✓
              </div>
            </div>
            <h4 class="text-xl font-bold text-slate-100 font-cinzel">${user.name}</h4>
            <p class="text-xs text-slate-400 mt-0.5">${user.email}</p>
            
            <div class="mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}">
              ${roleInfo.label}
            </div>

            <div class="mt-2 text-xs text-emerald-400/90 flex items-center gap-1.5">
              <i class="fa-solid fa-mountain-sun"></i>
              <span>Động Phủ: <strong>${user.dongPhu || 'Thanh Vân Động Phủ'}</strong></span>
            </div>

            ${(user.role === 'admin' || user.role === 'seller') ? `
              <button onclick="window.openEditAvatarModal()" class="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                <i class="fa-solid fa-camera"></i>
                <span>Chỉnh Sửa Pháp Tướng (Avatar)</span>
              </button>
            ` : ''}
          </div>

          <!-- Thẻ Số Dư Linh Thạch & Nút Nạp -->
          <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 rounded-2xl p-5 border border-amber-500/30 shadow-lg relative overflow-hidden mb-6">
            <div class="absolute -right-4 -bottom-4 text-7xl text-amber-500/10 pointer-events-none font-cinzel">
              💎
            </div>
            <div class="text-xs uppercase tracking-wider text-amber-400/80 font-medium">Tài Nguyên Bản Thân</div>
            <div class="flex items-baseline space-x-2 my-2">
              <span class="text-3xl font-extrabold text-amber-300 font-cinzel tracking-wider">
                ${window.formatScientificOrLocale(user.linhThach || 0)}
              </span>
              <span class="text-sm font-semibold text-amber-400">Linh Thạch</span>
            </div>
            <p class="text-[11px] text-slate-400 mb-4">
              Dùng để giao thương, mua sắm bảo vật, pháp bảo và linh đan tại Vạn Bảo Các.
            </p>

            <!-- Nút ⚡ Nạp Thêm Linh Thạch (Theo đặc tả) -->
            <button onclick="window.closeUserSidebar(); window.openRechargeModal();" 
                    class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition duration-200">
              <i class="fa-solid fa-bolt text-black animate-bounce"></i>
              <span>⚡ Nạp Thêm Linh Thạch</span>
            </button>
          </div>

          <!-- NÚT KHÔNG GIAN TRỮ VẬT (BẤM VÀO NHẢY VÀO TRANG RIÊNG) -->
          <a href="#inventory" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-slate-100 hover:text-emerald-300 transition group mb-4 shadow-xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30 group-hover:scale-105 transition">
                🎒
              </div>
              <div>
                <div class="text-sm font-bold font-cinzel text-emerald-300 group-hover:text-emerald-200">Không gian trữ vật</div>
              </div>
            </div>
            <div class="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <span>Mở Ra</span>
              <i class="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition"></i>
            </div>
          </a>

          <!-- Danh Mục Điều Hướng Trong Sidebar -->
          <div class="space-y-2">
            <a href="#cart" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-emerald-400 transition">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <i class="fa-solid fa-cart-shopping text-sm"></i>
                </div>
                <span class="text-sm font-medium">Càn Khôn Đại</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                ${window.store.cartCount || 0}
              </span>
            </a>

            <a href="#wishlist" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-pink-400 transition">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <i class="fa-solid fa-heart text-sm"></i>
                </div>
                <span class="text-sm font-medium">Bảo Vật Yêu Thích</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                ${window.store.wishlistCount || 0}
              </span>
            </a>

            <a href="#orders" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-blue-400 transition">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <i class="fa-solid fa-receipt text-sm"></i>
                </div>
                <span class="text-sm font-medium">Bảo Vật Đã Mua</span>
              </div>
              <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
            </a>

            <button onclick="window.openChangePasswordModal()" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-amber-400 transition cursor-pointer text-left">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <i class="fa-solid fa-key text-sm"></i>
                </div>
                <span class="text-sm font-medium">Đổi Mật Khẩu</span>
              </div>
              <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
            </button>

            ${user.role === 'admin' ? `
              <a href="#admin" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/40 text-amber-200 transition">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <i class="fa-solid fa-crown text-sm"></i>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-amber-300">Đại Điện Tông Chủ</div>
                    <div class="text-[11px] text-amber-400/70">Quản trị, tạo Seller cho 4 thành viên</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-xs text-amber-400"></i>
              </a>
            ` : ''}

            ${(user.role === 'seller' || user.role === 'admin') ? `
              <a href="#seller" onclick="window.closeUserSidebar()" class="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/40 text-cyan-200 transition">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <i class="fa-solid fa-fire-burner text-sm"></i>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-cyan-300">Động Phủ Gian Hàng</div>
                    <div class="text-[11px] text-cyan-400/70">Đăng bán & quản lý bảo vật</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-xs text-cyan-400"></i>
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Logout Button -->
        <div class="pt-6 border-t border-slate-800">
          <button onclick="window.handleLogout()" class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 transition">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Bế Quan Xuất Trần (Đăng Xuất)</span>
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openUserSidebar = renderUserModal;
window.closeUserSidebar = function() {
  const modal = document.getElementById('user-sidebar-modal');
  if (modal) modal.remove();
};

// --- MODAL CHỈNH SỬA PHÁP TƯỚNG (AVATAR) CHO TÔNG CHỦ & SELLERS ---
window.openEditAvatarModal = function() {
  const existing = document.getElementById('edit-avatar-modal');
  if (existing) existing.remove();

  const user = window.store.user;
  const currentAvatar = user ? (user.avatar || '') : '';

  const html = `
    <div id="edit-avatar-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div class="absolute inset-0 cursor-pointer" onclick="document.getElementById('edit-avatar-modal').remove()"></div>
      
      <div class="relative w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center space-x-2.5">
            <span class="text-xl">🎭</span>
            <h3 class="font-cinzel text-lg font-bold text-slate-100">Đổi Pháp Tướng (Avatar)</h3>
          </div>
          <button onclick="document.getElementById('edit-avatar-modal').remove()" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="window.handleUpdateAvatarSubmit(event)" class="space-y-4">
          <!-- Preview Avatar -->
          <div class="flex flex-col items-center justify-center py-2">
            <div class="w-24 h-24 rounded-full border-2 border-cyan-400 p-1 shadow-lg shadow-cyan-500/20 bg-slate-900 overflow-hidden">
              <img id="avatar-preview-img" 
                   src="${currentAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (user ? user.name : 'VBC')}" 
                   class="w-full h-full object-cover rounded-full" 
                   onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" />
            </div>
            <span class="text-[11px] text-slate-400 mt-2">Xem trước pháp tướng hiện diện</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Liên Kết Ảnh Mới (Image URL) <span class="text-cyan-400">*</span>
            </label>
            <input type="url" 
                   name="avatar" 
                   id="avatar-url-input" 
                   required
                   value="${currentAvatar}" 
                   placeholder="https://images.unsplash.com/... hoặc link ảnh online" 
                   oninput="document.getElementById('avatar-preview-img').src = this.value.trim() || 'https://api.dicebear.com/7.x/bottts/svg?seed=preview'"
                   class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
            <p class="text-[10px] text-slate-500 mt-1">Dán link ảnh trực tiếp (JPG, PNG, GIF, WebP, SVG)</p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="document.getElementById('edit-avatar-modal').remove()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition">
              Hủy Bỏ
            </button>
            <button type="submit" id="save-avatar-btn" class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Lưu Pháp Tướng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleUpdateAvatarSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const avatarUrl = form.avatar.value.trim();
  const btn = document.getElementById('save-avatar-btn');

  if (!avatarUrl) {
    window.showToast('Vui lòng nhập link ảnh hợp lệ!', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang quán chiếu...`;

  try {
    const res = await window.api.updateAvatar(avatarUrl);
    if (window.store.user) {
      window.store.user.avatar = res.avatar || avatarUrl;
    }
    window.showToast(res.message || 'Cập nhật pháp tướng thành công!', 'success');
    document.getElementById('edit-avatar-modal')?.remove();
    
    // Cập nhật lại giao diện
    if (window.renderNavbar) window.renderNavbar();
    if (document.getElementById('user-sidebar-modal')) {
      window.openUserSidebar();
    }
    if (window.store.currentView === 'seller' && window.renderSellerView) {
      window.renderSellerView();
    }
  } catch (err) {
    window.showToast(err.message || 'Lỗi cập nhật pháp tướng!', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Lưu Pháp Tướng</span>`;
    }
  }
};

// --- MODAL ĐỔI MẬT KHẨU ---
window.openChangePasswordModal = function() {
  const existing = document.getElementById('change-password-modal');
  if (existing) existing.remove();

  const html = `
    <div id="change-password-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div class="absolute inset-0 cursor-pointer" onclick="document.getElementById('change-password-modal').remove()"></div>
      
      <div class="relative w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center space-x-2.5">
            <span class="text-xl">🔐</span>
            <h3 class="font-cinzel text-lg font-bold text-slate-100">Đổi Mật Khẩu Tu Vi</h3>
          </div>
          <button onclick="document.getElementById('change-password-modal').remove()" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="window.handleChangePasswordSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mật Khẩu Hiện Tại <span class="text-amber-400">*</span>
            </label>
            <input type="password" 
                   name="currentPassword" 
                   required
                   placeholder="Nhập mật khẩu hiện tại" 
                   class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mật Khẩu Mới (Tối thiểu 6 ký tự) <span class="text-amber-400">*</span>
            </label>
            <input type="password" 
                   name="newPassword" 
                   required
                   minlength="6"
                   placeholder="Nhập mật khẩu mới" 
                   class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Xác Nhận Mật Khẩu Mới <span class="text-amber-400">*</span>
            </label>
            <input type="password" 
                   name="confirmPassword" 
                   required
                   minlength="6"
                   placeholder="Nhập lại mật khẩu mới" 
                   class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 outline-none transition" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="document.getElementById('change-password-modal').remove()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition">
              Hủy
            </button>
            <button type="submit" id="change-pass-btn" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition">
              <i class="fa-solid fa-key"></i>
              <span>Cập Nhật Mật Khẩu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleChangePasswordSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const currentPassword = form.currentPassword.value;
  const newPassword = form.newPassword.value;
  const confirmPassword = form.confirmPassword.value;
  const btn = document.getElementById('change-pass-btn');

  if (newPassword !== confirmPassword) {
    window.showToast('Xác nhận mật khẩu mới không trùng khớp!', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang tái tạo ấn pháp...`;

  try {
    const res = await window.api.changePassword(currentPassword, newPassword);
    window.showToast(res.message || 'Đổi mật khẩu thành công!', 'success');
    document.getElementById('change-password-modal')?.remove();
  } catch (err) {
    window.showToast(err.message || 'Lỗi đổi mật khẩu!', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-key"></i> <span>Cập Nhật Mật Khẩu</span>`;
    }
  }
};
