// Màn Hình Xác Thực (Auth Screen: Đăng Nhập & Đăng Ký Chuẩn Public Web)
function renderAuthView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div class="w-full max-w-lg">
        
        <!-- Logo & Tiêu đề Huyền Huyễn -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 mb-3 rounded-full overflow-hidden border border-emerald-400/40 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20">
            <img src="/images/logo.png" 
                 alt="Vạn Bảo Các Logo" 
                 class="w-full h-full object-cover scale-[1.2] hover:scale-[1.28] transition duration-300" 
                 onerror="this.src='https://i.ibb.co/HTnWSF38/VBC-logo.png'" />
          </div>
          <h1 class="font-cinzel text-3xl sm:text-4xl font-extrabold tracking-widest shimmer-text">
            VẠN BẢO CÁC
          </h1>
          <p class="text-sm text-emerald-400/90 mt-1 uppercase tracking-widest font-medium">
            Thương Mại Điện Tử Tu Tiên Đa Bên
          </p>
          <p class="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Hộ pháp kết giới nghiêm ngặt. Xin xuất trình Đạo hiệu (Tên đăng nhập) hoặc Email để bước vào tiên giới.
          </p>
        </div>

        <!-- Auth Card Tabs -->
        <div class="glass-modal rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          
          <!-- Tab Navigation -->
          <div class="flex rounded-xl bg-slate-950 p-1.5 border border-slate-800 mb-6">
            <button id="tab-login-btn" onclick="window.switchAuthTab('login')" class="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 bg-emerald-500 text-slate-950 shadow-md">
              <i class="fa-solid fa-key mr-1.5"></i>Đăng Nhập
            </button>
            <button id="tab-register-btn" onclick="window.switchAuthTab('register')" class="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 text-slate-400 hover:text-slate-200">
              <i class="fa-solid fa-user-plus mr-1.5"></i>Đăng Ký Đạo Hữu
            </button>
          </div>

          <!-- Alert / Error message container -->
          <div id="auth-alert" class="hidden mb-4 p-3 rounded-xl text-xs flex items-center gap-2"></div>

          <!-- FORM 1: ĐĂNG NHẬP (Chấp nhận Tên đăng nhập HOẶC Email) -->
          <form id="auth-login-form" onsubmit="window.handleLoginSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên Đăng Nhập Hoặc Email <span class="text-emerald-400">*</span>
              </label>
              <div class="relative">
                <input type="text" 
                       id="login-identifier" 
                       name="identifier" 
                       required 
                       placeholder="Nhập Tên đăng nhập hoặc Email" 
                       autocomplete="username"
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-user-shield text-emerald-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật Mã Tu Vi (Mật Khẩu) <span class="text-emerald-400">*</span>
              </label>
              <div class="relative">
                <input type="password" 
                       id="login-password" 
                       name="password" 
                       required 
                       placeholder="Nhập mật khẩu tu vi" 
                       autocomplete="current-password"
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-lock text-emerald-400"></i>
                </div>
              </div>
            </div>

            <button type="submit" 
                    id="login-submit-btn" 
                    class="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition">
              <i class="fa-solid fa-door-open"></i>
              <span>Khai Môn Nhập Điện (Đăng Nhập)</span>
            </button>
          </form>

          <!-- FORM 2: ĐĂNG KÝ (Dành cho Người Mua - Buyer Mới) -->
          <form id="auth-register-form" onsubmit="window.handleRegisterSubmit(event)" class="space-y-4 hidden">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Đạo Hiệu (Tên Đăng Nhập) <span class="text-emerald-400">*</span>
              </label>
              <div class="relative">
                <input type="text" 
                       id="reg-name" 
                       name="name" 
                       required 
                       placeholder="Ví dụ: Tiêu Dao Kiếm Khách" 
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-user-ninja text-emerald-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Truyền Âm Phù (Email) <span class="text-emerald-400">*</span>
              </label>
              <div class="relative">
                <input type="email" 
                       id="reg-email" 
                       name="email" 
                       required 
                       placeholder="daohu@vanbaocac.com" 
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-envelope text-emerald-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên Động Phủ (Nơi Cư Trú)
              </label>
              <div class="relative">
                <input type="text" 
                       id="reg-dongphu" 
                       name="dongPhu" 
                       placeholder="Ví dụ: Thanh Vân Động, Bích Ba Cốc..." 
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-mountain-sun text-emerald-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật Mã Tu Vi (Mật Khẩu) <span class="text-emerald-400">*</span>
              </label>
              <div class="relative">
                <input type="password" 
                       id="reg-password" 
                       name="password" 
                       required 
                       minlength="6"
                       placeholder="Tối thiểu 6 ký tự bảo mật" 
                       class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 text-sm outline-none transition" />
                <div class="absolute left-3.5 top-3.5 text-slate-500">
                  <i class="fa-solid fa-lock text-emerald-400"></i>
                </div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <span class="text-emerald-400 font-semibold">🌿 Phúc lợi nhập môn:</span> Mọi đạo hữu ghi danh mới đều được tông môn ban tặng sẵn <strong class="text-amber-400">1,000 Linh Thạch</strong> vào đan điền để khởi đầu hành trình mua sắm.
            </div>

            <button type="submit" 
                    id="register-submit-btn" 
                    class="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition">
              <i class="fa-solid fa-user-check"></i>
              <span>Ghi Danh Nhập Môn (Đăng Ký)</span>
            </button>
          </form>

        </div>

        <!-- Footer note -->
        <div class="text-center mt-6 text-xs text-slate-500">
          Vạn Bảo Các © 2026 • Bảo mật bằng pháp trận Thiên Đạo
        </div>

      </div>
    </div>
  `;
}

window.renderAuthView = renderAuthView;

window.switchAuthTab = function(tab) {
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('auth-login-form');
  const regForm = document.getElementById('auth-register-form');
  const alertBox = document.getElementById('auth-alert');
  if (alertBox) alertBox.classList.add('hidden');

  if (tab === 'login') {
    loginBtn.className = 'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 bg-emerald-500 text-slate-950 shadow-md';
    regBtn.className = 'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 text-slate-400 hover:text-slate-200';
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
  } else {
    regBtn.className = 'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 bg-emerald-500 text-slate-950 shadow-md';
    loginBtn.className = 'flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition duration-200 text-slate-400 hover:text-slate-200';
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
};

window.handleLoginSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const identifier = (form.identifier ? form.identifier.value : (form.email ? form.email.value : '')).trim();
  const password = form.password.value;
  const btn = document.getElementById('login-submit-btn');
  const alertBox = document.getElementById('auth-alert');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang mở cổng truyền tống...`;

  try {
    const data = await window.api.login(identifier, password);
    window.store.setToken(data.token);
    window.store.setUser(data.user);
    window.showToast(data.message, 'success');

    // Chuyển về Trang Chủ
    window.store.setView('home');
  } catch (err) {
    alertBox.className = 'mb-4 p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-950/70 border border-rose-500 text-rose-300';
    alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${err.message}</span>`;
    alertBox.classList.remove('hidden');
    window.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-door-open"></i> Khai Môn Nhập Điện (Đăng Nhập)`;
  }
};

window.handleRegisterSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;
  const dongPhu = form.dongPhu.value || 'Thanh Vân Động';
  const btn = document.getElementById('register-submit-btn');
  const alertBox = document.getElementById('auth-alert');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang thắp hương tế cáo...`;

  try {
    const data = await window.api.register(name, email, password, dongPhu);
    window.store.setToken(data.token);
    window.store.setUser(data.user);
    window.showToast(data.message, 'success');

    // Chuyển về Trang Chủ
    window.store.setView('home');
  } catch (err) {
    alertBox.className = 'mb-4 p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-950/70 border border-rose-500 text-rose-300';
    alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${err.message}</span>`;
    alertBox.classList.remove('hidden');
    window.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-user-check"></i> Ghi Danh Nhập Môn (Đăng Ký)`;
  }
};
