// Trang Giỏ Hàng & Thanh Toán Bằng Linh Thạch
async function renderCartView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-16 text-center text-emerald-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở Càn Khôn Đại kiểm tra bảo vật...</p>
    </div>
  `;

  try {
    const data = await window.api.getCart();
    const items = data.items || [];
    const totalAmount = data.totalAmount || 0;
    const user = window.store.user;
    const userBalance = user ? (user.linhThach || 0) : 0;
    const isBalanceEnough = userBalance >= totalAmount;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 text-slate-600 text-3xl mx-auto flex items-center justify-center mb-4">
            🛒
          </div>
          <h2 class="font-cinzel text-2xl font-bold text-slate-100">Càn Khôn Đại Trống Rỗng</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Đạo hữu chưa thu nạp bảo vật nào vào túi trữ vật. Hãy dạo bước quanh các gian hàng để thâu lượm kỳ trân dị bảo!
          </p>
          <a href="#home" class="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition">
            <i class="fa-solid fa-compass"></i>
            <span>Dạo Chợ Vạn Bảo Các</span>
          </a>
        </div>
      `;
      return;
    }

    const gradeLabels = {
      Hoang: 'Hoàng',
      Huyen: 'Huyền',
      Dia: 'Địa',
      Thien: 'Thiên',
      Tien: 'Thiên'
    };

    const itemsHtml = items.map(item => {
      const p = item.product;
      const itemGrade = gradeLabels[p.grade] || p.grade;

      return `
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-slate-700 transition">
          
          <!-- Image & Info -->
          <div class="flex items-center space-x-4 w-full sm:w-auto">
            <img src="${p.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200'}" 
                 alt="${p.name}" 
                 class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0" 
                 onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200'"/>
            
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30 uppercase">
                  ${itemGrade} Phẩm
                </span>
                <span class="text-[11px] text-slate-500">${p.seller?.dongPhu || 'Thần Luyện Động Phủ'}</span>
              </div>
              <h4 onclick="window.navigateToProduct('${p._id}')" class="font-cinzel text-sm sm:text-base font-bold text-slate-100 hover:text-emerald-400 transition cursor-pointer truncate mt-1">
                ${p.name}
              </h4>
              <div class="text-xs text-amber-400 font-semibold font-cinzel mt-0.5">
                💎 ${(p.price || 0).toLocaleString('vi-VN')} Linh Thạch
              </div>
            </div>
          </div>

          <!-- Quantity Adjust & Subtotal & Delete -->
          <div class="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            
            <!-- Quantity buttons -->
            <div class="flex items-center rounded-xl bg-slate-900 border border-slate-800">
              <button onclick="window.handleUpdateCartQty('${p._id}', ${item.quantity - 1})" 
                      class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-xl transition">
                <i class="fa-solid fa-minus text-[10px]"></i>
              </button>
              <span class="w-10 text-center text-xs font-bold text-slate-100">${item.quantity}</span>
              <button onclick="window.handleUpdateCartQty('${p._id}', ${item.quantity + 1})" 
                      class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-xl transition">
                <i class="fa-solid fa-plus text-[10px]"></i>
              </button>
            </div>

            <!-- Subtotal -->
            <div class="text-right min-w-[100px]">
              <div class="text-[10px] text-slate-500 uppercase">Thành tiền</div>
              <div class="text-sm font-bold text-amber-300 font-cinzel">
                ${(item.subtotal || 0).toLocaleString('vi-VN')}
              </div>
            </div>

            <!-- Remove Button -->
            <button onclick="window.handleRemoveFromCart('${p._id}')" 
                    title="Trả bảo vật về động phủ"
                    class="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>

          </div>

        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🛒</span>
            <div>
              <h1 class="font-cinzel text-2xl font-bold text-slate-100">Càn Khôn Đại</h1>
              <p class="text-xs text-slate-400">Danh sách bảo vật đã quy tập chờ xuất kho</p>
            </div>
          </div>
          <button onclick="window.handleClearCart()" class="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-broom"></i>
            <span>Dọn Sạch Càn Khôn Đại</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Danh Sách Sản Phẩm (2 Cột) -->
          <div class="lg:col-span-2 space-y-3">
            ${itemsHtml}
          </div>

          <!-- Bảng Tóm Tắt & Thanh Toán (1 Cột) -->
          <div class="space-y-4">
            
            <div class="glass-modal rounded-2xl p-6 border border-slate-800">
              <h3 class="font-cinzel text-base font-bold text-slate-100 pb-3 border-b border-slate-800 mb-4">
                Thanh Toán Linh Thạch
              </h3>

              <!-- Chi tiết số dư vs tổng tiền -->
              <div class="space-y-3 text-xs mb-5">
                <div class="flex items-center justify-between text-slate-400">
                  <span>Số lượng bảo vật:</span>
                  <span class="text-slate-200 font-bold">${data.cartCount || items.length}</span>
                </div>
                
                <div class="flex items-center justify-between text-slate-400">
                  <span>Tổng tiền bảo vật:</span>
                  <span class="text-amber-300 font-bold font-cinzel text-sm">
                    ${totalAmount.toLocaleString('vi-VN')} Linh Thạch
                  </span>
                </div>

                <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span class="text-slate-400">Số dư đan điền của bạn:</span>
                  <span class="font-bold font-cinzel text-sm ${isBalanceEnough ? 'text-emerald-400' : 'text-rose-400'}">
                    ${userBalance.toLocaleString('vi-VN')} Linh Thạch
                  </span>
                </div>

                ${!isBalanceEnough ? `
                  <div class="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-[11px] text-rose-300">
                    <div class="font-bold flex items-center gap-1 mb-1">
                      <i class="fa-solid fa-triangle-exclamation"></i>
                      <span>Linh thạch không đủ!</span>
                    </div>
                    <div>Đạo hữu đang thiếu <strong class="text-amber-300 font-cinzel">${(totalAmount - userBalance).toLocaleString('vi-VN')}</strong> Linh Thạch để hoàn tất giao dịch.</div>
                  </div>
                ` : ''}
              </div>

              <!-- NÚT "✨ Thanh Toán Bằng Linh Thạch" (Theo đặc tả) -->
              <div class="space-y-2">
                <button onclick="window.handleCheckoutSubmit()" 
                        id="checkout-btn"
                        class="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition ${
                          isBalanceEnough 
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25' 
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                        }">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                  <span>✨ Thanh Toán Bằng Linh Thạch</span>
                </button>

                <!-- Nút nạp nhanh nếu thiếu linh thạch -->
                ${!isBalanceEnough ? `
                  <button onclick="window.openRechargeModal(${totalAmount - userBalance})" 
                          class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition">
                    <i class="fa-solid fa-bolt text-amber-400"></i>
                    <span>Nạp Nhanh Linh Thạch</span>
                  </button>
                ` : ''}
              </div>

              <div class="mt-4 text-[10px] text-center text-slate-500">
                ⚡ Sau khi thanh toán, bảo vật sẽ lập tức được chuyển thẳng đến động phủ của đạo sĩ.
              </div>

            </div>

          </div>

        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center text-rose-400">
        Lỗi giỏ hàng: ${err.message}
      </div>
    `;
  }
}

window.renderCartView = renderCartView;

window.handleUpdateCartQty = async function(productId, newQty) {
  try {
    const data = await window.api.updateCart(productId, newQty);
    window.store.updateCartCount(data.cartCount);
    renderCartView();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.handleRemoveFromCart = async function(productId) {
  try {
    const data = await window.api.removeFromCart(productId);
    window.store.updateCartCount(data.cartCount);
    window.showToast(data.message, 'info');
    renderCartView();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.handleClearCart = async function(productId) {
  try {
    await window.api.clearCart();
    window.store.updateCartCount(0);
    window.showToast('Càn khôn đại đã trống!', 'info');
    renderCartView();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

// CHECKOUT LOGIC THEO ĐẶC TẢ CHÍNH XÁC
window.handleCheckoutSubmit = async function() {
  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang khai triển pháp trận kết toán...`;
  }

  try {
    const data = await window.api.checkout();

    // 1. Cập nhật số dư mới
    window.store.updateLinhThach(data.newBalance);
    window.store.updateCartCount(0);

    // 2. Hiển thị Popup Thông Báo chuẩn xác theo tài liệu đặc tả:
    // "Thanh toán thành công! Bảo vật đã được chuyển đến động phủ của đạo sĩ."
    window.showSuccessModal(data.message);

    // Re-render giỏ hàng trống
    renderCartView();

  } catch (err) {
    // Nếu thiếu linh thạch -> Thông báo "Linh thạch không đủ!" kèm nút chuyển nhanh sang nạp linh thạch (nhập mã 666)
    if (err.data && err.data.notEnoughLinhThach) {
      window.showInsufficientBalanceModal(err.data);
    } else {
      window.showToast(err.message, 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ✨ Thanh Toán Bằng Linh Thạch`;
    }
  }
};

// Modal thông báo thành công theo đặc tả
window.showSuccessModal = function(msg) {
  const existing = document.getElementById('checkout-success-modal');
  if (existing) existing.remove();

  const modalHtml = `
    <div id="checkout-success-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div class="relative w-full max-w-md glass-modal rounded-3xl p-8 text-center border-2 border-emerald-400 shadow-2xl shadow-emerald-500/30">
        
        <div class="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 text-4xl mx-auto flex items-center justify-center mb-4 border border-emerald-500/40 animate-pulse">
          ✨
        </div>

        <h3 class="font-cinzel text-2xl font-black text-emerald-300 mb-2">
          GIAO DỊCH VIÊN MÃN
        </h3>

        <!-- Đúng chuẩn text spec: "Thanh toán thành công! Bảo vật đã được chuyển đến động phủ của đạo sĩ." -->
        <p class="text-sm text-slate-200 leading-relaxed my-4 bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30">
          ${msg || 'Thanh toán thành công! Bảo vật đã được chuyển đến động phủ của đạo sĩ.'}
        </p>

        <div class="flex flex-col gap-2.5 mt-6">
          <button onclick="document.getElementById('checkout-success-modal').remove(); window.store.setView('orders');" 
                  class="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition">
            <i class="fa-solid fa-receipt mr-1.5"></i>Kiểm Tra Động Phủ (Bảo Vật Đã Mua)
          </button>
          
          <button onclick="document.getElementById('checkout-success-modal').remove(); window.store.setView('home');" 
                  class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition">
            Tiếp Tục Dạo Vạn Bảo Các
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// Modal thông báo "Linh thạch không đủ!" kèm nút chuyển nhanh nạp linh thạch mã 666
window.showInsufficientBalanceModal = function(data) {
  const existing = document.getElementById('insufficient-balance-modal');
  if (existing) existing.remove();

  const modalHtml = `
    <div id="insufficient-balance-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div class="relative w-full max-w-md glass-modal rounded-3xl p-8 text-center border border-rose-500 shadow-2xl shadow-rose-500/20">
        
        <div class="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 text-3xl mx-auto flex items-center justify-center mb-4 border border-rose-500/40 animate-bounce">
          ⚠️
        </div>

        <h3 class="font-cinzel text-xl font-bold text-rose-400 mb-1">
          Linh thạch không đủ!
        </h3>

        <p class="text-xs text-slate-300 mt-2">
          Số dư hiện tại: <strong class="text-amber-400 font-cinzel">${(data.currentBalance || 0).toLocaleString('vi-VN')}</strong> Linh Thạch.<br/>
          Cần thanh toán: <strong class="text-amber-400 font-cinzel">${(data.requiredAmount || 0).toLocaleString('vi-VN')}</strong> Linh Thạch.
        </p>

        <div class="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          Còn thiếu: <span class="text-rose-400 font-bold font-cinzel text-sm">${(data.shortage || 0).toLocaleString('vi-VN')}</span> Linh Thạch.
        </div>

        <div class="space-y-2 mt-6">
          <!-- Nút chuyển nhanh sang nạp linh thạch -->
          <button onclick="document.getElementById('insufficient-balance-modal').remove(); window.openRechargeModal(${data.shortage || 5000});" 
                  class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition">
            <i class="fa-solid fa-bolt text-black"></i>
            <span>⚡ Nạp Linh Thạch Ngay</span>
          </button>

          <button onclick="document.getElementById('insufficient-balance-modal').remove()" 
                  class="w-full py-2 px-4 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};
