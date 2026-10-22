// Trang Bảo Vật Tâm Niệm (Wishlist / Yêu Thích)
async function renderWishlistView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-16 text-center text-pink-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở tâm niệm tra cứu bảo vật yêu thích...</p>
    </div>
  `;

  try {
    const data = await window.api.getWishlist();
    const items = data.items || [];

    if (items.length === 0) {
      container.innerHTML = `
        <div class="max-w-md mx-auto py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 text-pink-500/50 text-3xl mx-auto flex items-center justify-center mb-4">
            ❤️
          </div>
          <h2 class="font-cinzel text-2xl font-bold text-slate-100">Tâm Niệm Trống Vắng</h2>
          <p class="text-xs text-slate-400 mt-2 mb-6">
            Đạo hữu chưa lưu giữ bảo vật nào vào tâm niệm. Hãy nhấn vào biểu tượng trái tim ở các thẻ bảo vật để ghi nhớ!
          </p>
          <a href="#home" class="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition">
            Khám Phá Bảo Vật
          </a>
        </div>
      `;
      return;
    }

    const gradeColors = {
      Hoang: 'grade-card-Hoang',
      Huyen: 'grade-card-Huyen',
      Dia: 'grade-card-Dia',
      Thien: 'grade-card-Thien',
      Tien: 'grade-card-Thien'
    };

    const gridHtml = items.map(product => {
      const isOutOfStock = (product.stock || 0) <= 0;
      const borderClass = gradeColors[product.grade] || 'grade-card-Hoang';

      return `
        <div class="treasure-card ${borderClass} rounded-2xl overflow-hidden flex flex-col justify-between group relative border">
          
          <!-- Nút bỏ thích -->
          <button onclick="window.handleToggleWishlist('${product._id}', event)" 
                  title="Xóa khỏi tâm niệm"
                  class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md text-pink-500 hover:scale-110 flex items-center justify-center transition border border-slate-700/60 shadow-md">
            <i class="fa-solid fa-heart text-sm"></i>
          </button>

          <!-- Ảnh -->
          <div class="relative h-48 overflow-hidden bg-slate-950 cursor-pointer" onclick="window.navigateToProduct('${product._id}')">
            <img src="${product.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}" 
                 alt="${product.name}" 
                 class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
          </div>

          <!-- Nội dung -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="text-[10px] text-emerald-400/80 font-medium mb-1">
                ${product.seller?.dongPhu || 'Thần Luyện Động Phủ'}
              </div>
              <h3 onclick="window.navigateToProduct('${product._id}')" class="font-cinzel text-base font-bold text-slate-100 hover:text-emerald-400 transition cursor-pointer line-clamp-1">
                ${product.name}
              </h3>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2">
                ${product.description}
              </p>
            </div>

            <!-- Giá & Nút Thêm Giỏ Hàng -->
            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-slate-400 uppercase">Giá Bán</div>
                <div class="text-amber-300 font-bold text-sm font-cinzel">
                  💎 ${(product.price || 0).toLocaleString('vi-VN')} LT
                </div>
              </div>

              <button onclick="window.handleAddToCart('${product._id}', 1, event)" 
                      ${isOutOfStock ? 'disabled' : ''}
                      class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isOutOfStock 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                      }">
                <i class="fa-solid fa-cart-plus"></i>
                <span>${isOutOfStock ? 'Hết' : 'Thu Nạp'}</span>
              </button>
            </div>

          </div>

        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div class="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-6">
          <span class="text-2xl text-pink-500">💖</span>
          <div>
            <h1 class="font-cinzel text-2xl font-bold text-slate-100">Bảo Vật Tâm Niệm (${items.length})</h1>
            <p class="text-xs text-slate-400">Các pháp bảo, linh đan, công pháp đạo hữu đang khắc ghi trong lòng</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${gridHtml}
        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center text-rose-400">
        Lỗi tâm niệm: ${err.message}
      </div>
    `;
  }
}

window.renderWishlistView = renderWishlistView;
