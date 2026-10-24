// Trang Chủ (Home Page: Hero Banner + 4 Danh Mục x 5 Sản Phẩm Nổi Bật)
async function renderHomeView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="py-12 flex justify-center items-center">
      <div class="text-emerald-400 flex items-center space-x-3">
        <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
        <span class="text-base font-cinzel">Linh khí ngưng tụ, đang mở kho tàng Vạn Bảo Các...</span>
      </div>
    </div>
  `;

  try {
    const data = await window.api.getFeaturedByCategory();
    const categoriesData = data.data || {};

    const gradeColors = {
      Hoang: { label: 'Hoàng', badgeClass: 'grade-badge-Hoang', cardBorder: 'grade-card-Hoang', text: 'text-slate-300' },
      Huyen: { label: 'Huyền', badgeClass: 'grade-badge-Huyen', cardBorder: 'grade-card-Huyen', text: 'text-cyan-400' },
      Dia: { label: 'Địa', badgeClass: 'grade-badge-Dia', cardBorder: 'grade-card-Dia', text: 'text-purple-400' },
      Thien: { label: 'Thiên', badgeClass: 'grade-badge-Thien', cardBorder: 'grade-card-Thien', text: 'text-amber-400' },
      Tien: { label: 'Thiên', badgeClass: 'grade-badge-Thien', cardBorder: 'grade-card-Thien', text: 'text-amber-400' }
    };

    let categoriesHtml = '';

    const categoryKeys = ['cong-phap', 'dan-duoc', 'phap-bao', 'linh-vat'];

    for (const catKey of categoryKeys) {
      const item = categoriesData[catKey];
      if (!item) continue;
      const { categoryInfo, products } = item;

      let productsGrid = '';
      if (!products || products.length === 0) {
        productsGrid = `
          <div class="col-span-full py-8 text-center text-slate-500 text-sm">
            Hiện chưa có bảo vật nào trong phân loại này.
          </div>
        `;
      } else {
        productsGrid = products.map(product => {
          const grade = gradeColors[product.grade] || gradeColors.Huyen;
          const isOutOfStock = (product.stock || 0) <= 0;
          const isFavorited = (window.store.user && window.store.user.wishlist) 
            ? window.store.user.wishlist.some(wId => (wId._id || wId).toString() === product._id.toString())
            : false;

          return `
            <div class="treasure-card ${grade.cardBorder} rounded-2xl overflow-hidden flex flex-col justify-between group relative border">
              
              <!-- Badge Phẩm Cấp & Nút Thích -->
              <div class="absolute top-3 left-3 z-10">
                <span class="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${grade.badgeClass}">
                  ${grade.label} Phẩm
                </span>
              </div>

              <div class="absolute top-3 right-3 z-10">
                <button onclick="window.handleToggleWishlist('${product._id}', event)" 
                        class="w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-400 hover:text-pink-500 hover:scale-110 flex items-center justify-center transition border border-slate-700/60 shadow-md">
                  <i class="fa-solid fa-heart text-sm ${isFavorited ? 'text-pink-500' : ''}"></i>
                </button>
              </div>

              <!-- Product Image (Click to PDP) -->
              <div class="relative h-48 overflow-hidden bg-slate-950 cursor-pointer" onclick="window.navigateToProduct('${product._id}')">
                <img src="${product.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}" 
                     alt="${product.name}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                     onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'"/>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                
                ${isOutOfStock ? `
                  <div class="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                    <span class="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500 text-xs font-bold tracking-wider uppercase">
                      Đã hết hàng
                    </span>
                  </div>
                ` : ''}
              </div>

              <!-- Content -->
              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div class="text-[11px] text-emerald-400/90 font-medium line-clamp-1 mb-1 flex items-center gap-1.5">
                    <i class="fa-solid fa-tag text-[10px] text-emerald-400/70"></i>
                    <span>${product.subCategory || 'Bảo Khố'}</span>
                  </div>
                  ${product.subType ? `
                    <div class="mb-1.5">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950 text-cyan-300 border border-cyan-500/30">
                        ${product.subType}
                      </span>
                    </div>
                  ` : ''}

                  <h3 onclick="window.navigateToProduct('${product._id}')" class="font-cinzel text-base font-bold text-slate-100 hover:text-emerald-400 transition cursor-pointer line-clamp-1">
                    ${product.name}
                  </h3>

                  <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    ${product.description}
                  </p>
                </div>

                <!-- Price & Action Button -->
                <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div class="text-[10px] text-slate-400 uppercase">Giá Bán</div>
                    <div class="text-amber-300 font-bold text-sm sm:text-base font-cinzel flex items-center gap-1">
                      <span>💎 ${(product.price || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <button onclick="window.handleAddToCart('${product._id}', 1, event)" 
                          ${isOutOfStock ? 'disabled' : ''}
                          class="px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                            isOutOfStock 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/30'
                          }">
                    <i class="fa-solid fa-cart-plus"></i>
                    <span class="hidden sm:inline">${isOutOfStock ? 'Hết Hàng' : 'Thu Nạp'}</span>
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('');
      }

      categoriesHtml += `
        <section class="mb-14">
          <!-- Section Title & "Xem Tất Cả" Button (Theo đặc tả) -->
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-slate-800/80 gap-3">
            <div>
              <div class="flex items-center space-x-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-sm">
                  <i class="fa-solid ${categoryInfo.icon}"></i>
                </div>
                <h2 class="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 tracking-wide">
                  ${categoryInfo.name}
                </h2>
              </div>
              <p class="text-xs text-slate-400 mt-1 pl-10">
                ${categoryInfo.description}
              </p>
            </div>

            <!-- Nút "Xem tất cả" chuyển sang trang danh mục -->
            <button onclick="window.navigateToCategory('${categoryInfo.id}')" 
                    class="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-2 transition group">
              <span>Xem Tất Cả</span>
              <i class="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition duration-200"></i>
            </button>
          </div>

          <!-- Grid 5 Sản Phẩm Nổi Bật -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            ${productsGrid}
          </div>
        </section>
      `;
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <!-- HERO BANNER (Chiếm khoảng 1/3 màn hình theo đặc tả) -->
        <div class="relative w-full rounded-3xl overflow-hidden mb-12 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 min-h-[300px] flex items-center p-6 sm:p-10 lg:p-14">
          
          <!-- Mystic background pattern -->
          <div class="absolute inset-0 opacity-20 pointer-events-none mystic-bg"></div>
          <div class="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-emerald-500/5 to-transparent pointer-events-none"></div>

          <div class="relative z-10 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
              <span class="animate-pulse">✨</span> Tông Môn Đấu Giá Bảo Khố Vạn Cổ
            </div>

            <h1 class="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 leading-snug sm:leading-normal">
              <span>Khai Mở Kỳ Trân</span>
              <span class="block mt-2 sm:mt-3 text-4xl sm:text-5xl lg:text-6xl shimmer-text" style="font-family: 'Lora', 'Playfair Display', serif;">Tr<span style="font-size: 1.1em; display: inline-block;">ấ</span>n Sơn Bảo Vật</span>
            </h1>

            <p class="text-sm sm:text-base text-slate-300 mt-4 font-normal leading-relaxed">
              Nơi quy tụ bốn đại kỳ bảo chấn động tam giới: Công Pháp Vô Thượng, Nghịch Thiên Linh Đan, Thần Binh Tuyệt Thế và Dị Chủng Thần Thú. Mọi giao dịch tại Vạn Bảo Các đều được ấn định tức thì bằng bản nguyên <strong>Linh Thạch</strong>.
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button onclick="window.navigateToCategory('all')" class="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition">
                <i class="fa-solid fa-compass"></i>
                <span>Khám Phá Toàn Bộ Bảo Vật</span>
              </button>

              <button onclick="window.openRechargeModal()" class="px-5 py-3 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition">
                <i class="fa-solid fa-bolt text-amber-400"></i>
                <span>Nạp Linh Thạch</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4 DANH MỤC & SẢN PHẨM NỔI BẬT -->
        ${categoriesHtml}

      </div>
    `;

  } catch (err) {
    console.error('Lỗi render trang chủ:', err);
    container.innerHTML = `
      <div class="max-w-lg mx-auto py-16 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <h3 class="text-lg font-bold text-rose-400">Không thể kết nối linh thần tới Vạn Bảo Các</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">${err.message}</p>
        <button onclick="window.renderView()" class="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs">
          Thử Lại
        </button>
      </div>
    `;
  }
}

window.renderHomeView = renderHomeView;
