// Modal Nạp Linh Thạch (Form nạp tiền với mã xác nhận bảo mật cố định 666)
function renderRechargeModal(suggestedAmount = null) {
  const existing = document.getElementById('recharge-modal');
  if (existing) existing.remove();

  const user = window.store.user;
  const currentBalance = user ? (user.linhThach || 0) : 0;
  const defaultAmount = suggestedAmount || 5000;

  const modalHtml = `
    <div id="recharge-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      
      <!-- Backdrop close -->
      <div class="absolute inset-0 cursor-pointer" onclick="window.closeRechargeModal()"></div>

      <!-- Modal Card -->
      <div class="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 z-10 border border-amber-500/40 shadow-2xl shadow-amber-500/10">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40">
              ⚡
            </div>
            <div>
              <h3 class="font-cinzel text-xl font-bold text-slate-100 flex items-center gap-2">
                Khai Thông Linh Mạch
              </h3>
              <p class="text-xs text-amber-400/80">Nạp Thêm Linh Thạch Vào Đan Điền</p>
            </div>
          </div>
          <button onclick="window.closeRechargeModal()" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Current Balance -->
        <div class="my-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-400">Số Dư Hiện Tại</div>
            <div class="text-xl font-bold text-amber-300 font-cinzel">
              ${currentBalance.toLocaleString('vi-VN')} <span class="text-xs text-amber-400 font-normal">Linh Thạch</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-[11px] text-emerald-400 font-medium">Linh Căn Trực Tuyến</div>
            <div class="text-xs text-slate-500"><i class="fa-solid fa-shield-halved text-emerald-400 mr-1"></i>Hộ Pháp Phong Ấn</div>
          </div>
        </div>

        <!-- Form Nạp -->
        <form id="recharge-form" onsubmit="window.handleRechargeSubmit(event)" class="space-y-4">
          
          <!-- 1. Ô Nhập Số Lượng Linh Thạch -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Số Lượng Linh Thạch Muốn Nạp <span class="text-amber-400">*</span>
            </label>
            <div class="relative">
              <input type="number" 
                     id="recharge-amount" 
                     name="amount" 
                     min="10" 
                     max="1000000"
                     step="10" 
                     value="${defaultAmount}" 
                     required 
                     class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-amber-300 font-bold text-lg font-cinzel tracking-wider outline-none transition" />
              <div class="absolute left-3.5 top-3.5 text-amber-400 text-base">
                💎
              </div>
            </div>
            <div class="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1 font-medium">
              <i class="fa-solid fa-circle-info text-[10px]"></i>
              <span>Giới hạn tích trữ đan điền tối đa: 1.000.000 Linh Thạch.</span>
            </div>

            <!-- Nút chọn nhanh số lượng -->
            <div class="grid grid-cols-4 gap-2 mt-2">
              <button type="button" onclick="document.getElementById('recharge-amount').value = 1000" class="py-1 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition">
                +1,000
              </button>
              <button type="button" onclick="document.getElementById('recharge-amount').value = 5000" class="py-1 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition">
                +5,000
              </button>
              <button type="button" onclick="document.getElementById('recharge-amount').value = 20000" class="py-1 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition">
                +20,000
              </button>
              <button type="button" onclick="document.getElementById('recharge-amount').value = 100000" class="py-1 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition">
                +100,000
              </button>
            </div>
          </div>

          <!-- 2. Ô Nhập Mã Xác Nhận Bảo Mật -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Mã Xác Nhận Bảo Mật <span class="text-rose-400">*</span>
              </label>
              <span class="text-[11px] text-slate-400 font-mono">
                <i class="fa-solid fa-key text-amber-400 mr-1"></i>Mã Cơ Mật Tông Môn
              </span>
            </div>
            <div class="relative">
              <input type="password" 
                     id="recharge-secret" 
                     name="secretCode" 
                     placeholder="Nhập mã xác nhận bảo mật" 
                     value="" 
                     required 
                     class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-emerald-300 font-mono text-base font-bold tracking-widest outline-none transition" />
              <div class="absolute left-3.5 top-3.5 text-slate-400 text-sm">
                <i class="fa-solid fa-lock text-emerald-400"></i>
              </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              Pháp ấn bảo hộ cố định của tông môn. Nhập chính xác mật mã cơ mật để linh khí tự động quy hồi.
            </p>
          </div>

          <!-- Error / Message Box -->
          <div id="recharge-msg" class="hidden text-xs p-3 rounded-xl"></div>

          <!-- Nút Xác Nhận Nạp -->
          <div class="pt-2">
            <button type="submit" 
                    id="recharge-btn"
                    class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>Khai Ấn & Cộng Dồn Linh Thạch</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openRechargeModal = renderRechargeModal;
window.closeRechargeModal = function() {
  const modal = document.getElementById('recharge-modal');
  if (modal) modal.remove();
};

window.handleRechargeSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const amount = Number(form.amount.value);
  const secretCode = form.secretCode.value;
  const btn = document.getElementById('recharge-btn');
  const msgBox = document.getElementById('recharge-msg');

  const user = window.store.user;
  const currentBalance = user ? (user.linhThach || 0) : 0;
  if (user && user.role !== 'admin' && currentBalance + amount > 1000000) {
    const maxAllowed = Math.max(0, 1000000 - currentBalance);
    msgBox.className = 'text-xs p-3 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-300 flex items-center gap-2';
    msgBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-sm"></i> <span>Giới hạn tối đa là 1.000.000 Linh Thạch! Đạo hữu chỉ có thể nạp thêm tối đa ${maxAllowed.toLocaleString('vi-VN')} Linh Thạch.</span>`;
    msgBox.classList.remove('hidden');
    window.showToast(`Chỉ có thể nạp thêm tối đa ${maxAllowed.toLocaleString('vi-VN')} Linh Thạch!`, 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang quán thông linh khí...`;

  try {
    const data = await window.api.recharge(amount, secretCode);
    
    // Cập nhật số dư trong store
    window.store.updateLinhThach(data.linhThach);

    // Hiển thị thông báo thành công
    msgBox.className = 'text-xs p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 flex items-center gap-2';
    msgBox.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i> <span>${data.message}</span>`;
    msgBox.classList.remove('hidden');

    window.showToast(data.message, 'success');

    // Đóng modal sau 1.2s và re-render views nếu cần
    setTimeout(() => {
      window.closeRechargeModal();
      if (window.store.currentView === 'cart') {
        window.renderView();
      }
    }, 1200);

  } catch (err) {
    msgBox.className = 'text-xs p-3 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-300 flex items-center gap-2';
    msgBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-sm"></i> <span>${err.message}</span>`;
    msgBox.classList.remove('hidden');
    window.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Khai Ấn & Cộng Dồn Linh Thạch`;
  }
};
