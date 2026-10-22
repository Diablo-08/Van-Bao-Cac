// Trang Không Gian Trữ Vật (Túi Trữ Vật & Pháp Bảo Đã Sở Hữu)
// Yêu cầu: "Đổi tên Kho đồ tu sĩ thành Không gian trữ vật và bỏ dòng chú thích bên dưới."
async function renderInventoryView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-20 text-center text-emerald-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở phong ấn không gian trữ vật...</p>
    </div>
  `;

  try {
    // 1. Lấy lịch sử đơn hàng để biết đã mua gì
    const ordersData = await window.api.getMyOrders();
    const orders = ordersData.orders || [];

    // Gom nhóm product IDs đã mua (unique)
    const purchasedMap = new Map();
    orders.forEach(ord => {
      (ord.items || []).forEach(item => {
        const prodId = item.product && (item.product._id || item.product);
        const key = prodId ? prodId.toString() : item.name;
        if (!purchasedMap.has(key)) {
          purchasedMap.set(key, {
            productId: prodId ? prodId.toString() : null,
            name: item.name,
            fallbackImage: item.image || (item.product && item.product.image) || '/images/logo.png'
          });
        }
      });
    });

    if (purchasedMap.size === 0) {
      container.innerHTML = `
        <div class="max-w-md mx-auto py-20 px-4 text-center">
          <div class="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 text-3xl mx-auto flex items-center justify-center mb-4 text-slate-500">
            🎒
          </div>
          <h2 class="font-cinzel text-2xl font-bold text-slate-100">Không Gian Trữ Vật Trống Rỗng</h2>
          <p class="text-xs text-slate-400 mt-2 mb-6">
            Đạo hữu hiện chưa thu nạp bảo vật nào vào không gian trữ vật.
          </p>
          <a href="#category/all" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-2">
            <i class="fa-solid fa-compass"></i>
            <span>Đến Kho Bảo Vật Tầm Bảo</span>
          </a>
        </div>
      `;
      return;
    }

    // 2. Lấy dữ liệu sản phẩm LIVE từ API để đồng bộ ảnh và trạng thái tồn kho
    const allProductsData = await window.api.getProducts({ limit: 500 });
    const allProducts = allProductsData.products || [];

    // Tạo map productId -> live product data
    const liveProductMap = {};
    allProducts.forEach(p => {
      liveProductMap[p._id.toString()] = p;
    });

    // 3. Ghép dữ liệu: ưu tiên ảnh live, fallback về ảnh snapshot trong order
    const items = [];
    purchasedMap.forEach((entry) => {
      const live = entry.productId ? liveProductMap[entry.productId] : null;
      items.push({
        name: live ? live.name : entry.name,
        image: (live && live.image) ? live.image : entry.fallbackImage,
        stock: live ? (live.stock || 0) : -1 // -1 nghĩa là sản phẩm đã bị xóa khỏi kho
      });
    });

    const itemsGrid = items.map(it => {
      const isDeleted = it.stock === -1;

      return `
        <div class="rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition duration-300 flex flex-col group select-none">
          
          <!-- Hình ảnh bảo vật (đồng bộ từ kho bán hàng) -->
          <div class="relative w-full aspect-square overflow-hidden bg-slate-950">
            <img src="${it.image}" 
                 alt="${it.name}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                 onerror="this.src='/images/logo.png'" />
            
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none"></div>

            ${isDeleted ? `
              <div class="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                <span class="px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-600 text-[11px] font-bold tracking-wider uppercase">
                  Đã thu hồi
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Tên bảo vật -->
          <div class="p-4 flex-1 flex items-center justify-center text-center bg-slate-900/60">
            <h3 class="font-cinzel text-sm sm:text-base font-bold ${isDeleted ? 'text-slate-500' : 'text-slate-100 group-hover:text-emerald-300'} transition line-clamp-2">
              ${it.name}
            </h3>
          </div>

        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header Kho Đồ -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30 shadow-inner">
              🎒
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-1">
                <span>✨</span> Túi Trữ Vật Càn Khôn
              </div>
              <h1 class="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100">
                Không gian trữ vật
              </h1>
            </div>
          </div>

          <div class="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 self-start sm:self-auto">
            <span class="text-emerald-400 font-bold">${items.length}</span>
            <span>Bảo vật trong túi</span>
          </div>
        </div>

        <!-- Lưới bảo vật trong kho đồ (Chỉ hiện ảnh và tên) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          ${itemsGrid}
        </div>

      </div>
    `;

  } catch (err) {
    console.error('Lỗi nạp kho đồ tu sĩ:', err);
    container.innerHTML = `
      <div class="max-w-md mx-auto py-20 text-center text-rose-400">
        <div class="text-3xl mb-2">⚠️</div>
        <p class="text-sm font-semibold">Linh mạch hỗn loạn, không thể mở kho đồ lúc này.</p>
        <p class="text-xs text-slate-400 mt-1">${err.message}</p>
      </div>
    `;
  }
}

window.renderInventoryView = renderInventoryView;
