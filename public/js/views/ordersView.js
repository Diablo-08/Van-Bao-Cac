// Trang Lịch Sử Mua Hàng (Bảo vật đã tiếp nhận tại Động Phủ)
async function renderOrdersView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-16 text-center text-blue-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở khế ước động phủ...</p>
    </div>
  `;

  try {
    const data = await window.api.getMyOrders();
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="max-w-md mx-auto py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 text-blue-400/50 text-3xl mx-auto flex items-center justify-center mb-4">
            📜
          </div>
          <h2 class="font-cinzel text-2xl font-bold text-slate-100">Chưa Có Khế Ước Giao Dịch</h2>
          <p class="text-xs text-slate-400 mt-2 mb-6">
            Đạo hữu chưa hoàn tất giao dịch bảo vật nào tại Vạn Bảo Các.
          </p>
          <a href="#home" class="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition">
            Dạo Chợ Mua Sắm
          </a>
        </div>
      `;
      return;
    }

    const ordersHtml = orders.map(ord => {
      const itemsList = (ord.items || []).map(i => {
        const itemImg = i.image || (i.product && i.product.image) || '/images/logo.png';
        const prodId = i.product && (i.product._id || i.product);
        return `
          <div class="flex items-center justify-between text-xs py-2 border-b border-slate-800/40 gap-3 hover:bg-slate-900/30 px-2 rounded-lg transition">
            <div class="flex items-center space-x-3 cursor-pointer" onclick="${prodId ? `window.navigateToProduct('${prodId}')` : ''}">
              <img src="${itemImg}" alt="${i.name}" class="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-900 shadow" onerror="this.src='/images/logo.png'" />
              <div>
                <div class="text-slate-200 font-semibold hover:text-emerald-300 transition">${i.name}</div>
                <div class="text-[11px] text-slate-400">Số lượng: <span class="text-emerald-400 font-bold">×${i.quantity}</span></div>
              </div>
            </div>
            <div class="text-amber-400 font-cinzel font-semibold whitespace-nowrap">
              ${(i.price * i.quantity).toLocaleString('vi-VN')} LT
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="glass-modal rounded-2xl p-6 border border-slate-800 space-y-4">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Mã Khế Ước: ${ord._id}</span>
              <div class="text-xs text-slate-400 mt-0.5">Thời gian: ${new Date(ord.createdAt).toLocaleString('vi-VN')}</div>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
              <i class="fa-solid fa-circle-check text-emerald-400"></i>
              <span>${ord.status || 'Đã chuyển đến động phủ'}</span>
            </div>
          </div>

          <div class="space-y-1">
            ${itemsList}
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Tổng Linh Thạch Tiêu Hao:</span>
            <span class="text-base font-bold text-amber-300 font-cinzel">
              💎 ${(ord.totalAmount || 0).toLocaleString('vi-VN')} Linh Thạch
            </span>
          </div>

        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div class="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <span class="text-2xl text-blue-400">📜</span>
          <div>
            <h1 class="font-cinzel text-2xl font-bold text-slate-100">Bảo Vật Đã Tiếp Nhận</h1>
            <p class="text-xs text-slate-400">Lịch sử giao dịch và pháp bảo đã chuyển đến động phủ của đạo sĩ</p>
          </div>
        </div>

        <div class="space-y-4">
          ${ordersHtml}
        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center text-rose-400">
        Lỗi lịch sử khế ước: ${err.message}
      </div>
    `;
  }
}

window.renderOrdersView = renderOrdersView;
