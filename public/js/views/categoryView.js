// Trang Danh Sách Sản Phẩm Theo Danh Mục ("Xem Tất Cả" & "Khám Phá Toàn Bộ")
// Hỗ trợ chia theo các phân mục con (subCategory) & lọc theo Phẩm cấp (Hoàng • Huyền • Địa • Thiên)

let currentCategoryFilter = {
  category: 'all',
  subCategory: 'all',
  grade: 'all',
  search: '',
  sort: 'newest'
};

const CATEGORY_META = {
  'all': {
    name: 'Toàn Bộ Kho Tàng Bảo Vật',
    desc: 'Khám phá tất cả kỳ trân dị bảo trong thiên hạ được niêm yết tại Vạn Bảo Các',
    icon: 'fa-globe',
    subCategories: []
  },
  'cong-phap': {
    name: 'Công Pháp & Bí Tịch',
    desc: 'Vô thượng huyền công khai phá kinh mạch, tâm pháp dưỡng sinh, đấu pháp và ma công cấm thuật',
    icon: 'fa-book-skull',
    subCategories: ['Tâm Pháp', 'Đấu Pháp', 'Bách Nghệ Điển Tịch', 'Ma Đạo Bí Tịch']
  },
  'dan-duoc': {
    name: 'Đan Dược & Linh Thảo',
    desc: 'Luyện đan nghịch thiên cải mệnh, đan dược đột phá cảnh giới và kỳ hoa dị thảo ngàn năm',
    icon: 'fa-mortar-pestle',
    subCategories: ['Đan Dược Đột Phá', 'Đan Dược Hỗ Trợ', 'Linh Thảo, Dược Liệu']
  },
  'phap-bao': {
    name: 'Pháp Bảo & Binh Khí',
    desc: 'Thần binh công kích, giáp trụ hộ thân, nhẫn không gian trữ vật và ngự không phi thuyền',
    icon: 'fa-wand-magic-sparkles',
    subCategories: ['Công Kích Pháp Bảo', 'Hộ Thân Pháp Bảo', 'Không Gian Pháp Bảo', 'Ngự Không Pháp Bảo']
  },
  'linh-vat': {
    name: 'Linh Vật',
    desc: 'Thượng cổ thần thú, ấu thú linh sủng, tinh thạch khoáng vật và pháp trận hộ sơn',
    icon: 'fa-dragon',
    subCategories: ['Linh Sủng, Yêu Thú', 'Linh Tài, Tạp Vật']
  }
};

async function renderCategoryView(categoryId = 'all') {
  const container = document.getElementById('main-content');
  if (!container) return;

  const validId = CATEGORY_META[categoryId] ? categoryId : 'all';
  currentCategoryFilter.category = validId;

  // Nếu là xem toàn bộ kho tàng, reset tất cả bộ lọc về mặc định
  if (validId === 'all') {
    currentCategoryFilter.subCategory = 'all';
    currentCategoryFilter.grade = 'all';
    currentCategoryFilter.search = '';
    currentCategoryFilter.sort = 'newest';
  } else {
    // Nếu chuyển sang danh mục cụ thể, reset subCategory về all nếu không thuộc danh mục đó
    const catMeta = CATEGORY_META[validId];
    if (!catMeta.subCategories.includes(currentCategoryFilter.subCategory)) {
      currentCategoryFilter.subCategory = 'all';
    }
  }

  const catMeta = CATEGORY_META[validId];

  const categoryTabs = [
    { id: 'all', name: 'Tất Cả Danh Mục' },
    { id: 'cong-phap', name: 'Công Pháp & Bí Tịch' },
    { id: 'dan-duoc', name: 'Đan Dược & Linh Thảo' },
    { id: 'phap-bao', name: 'Pháp Bảo & Binh Khí' },
    { id: 'linh-vat', name: 'Linh Vật' }
  ];

  const catTabsHtml = categoryTabs.map(t => {
    const isActive = t.id === validId;
    return `
      <button onclick="window.navigateToCategory('${t.id}')" 
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25' 
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }">
        ${t.name}
      </button>
    `;
  }).join('');

  // Sub-category tabs nếu có
  let subCatTabsHtml = '';
  if (catMeta.subCategories.length > 0) {
    const allActive = currentCategoryFilter.subCategory === 'all';
    subCatTabsHtml = `
      <div class="flex items-center gap-2 overflow-x-auto pb-1 mt-3">
        <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider whitespace-nowrap">
          Phân Mục:
        </span>
        <button onclick="window.setSubCategoryFilter('${validId}', 'all')" 
                class="px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  allActive 
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }">
          Tất Cả Mục
        </button>
        ${catMeta.subCategories.map(sc => {
          const isAct = currentCategoryFilter.subCategory === sc;
          return `
            <button onclick="window.setSubCategoryFilter('${validId}', '${sc}')" 
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      isAct 
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }">
              ${sc}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center text-xs text-slate-400 mb-4 gap-2">
        <a href="#home" class="hover:text-emerald-400">Trang Chủ</a>
        <i class="fa-solid fa-chevron-right text-[10px]"></i>
        <span class="text-slate-100 font-medium">${catMeta.name}</span>
      </nav>

      <!-- Category Header Title & Search -->
      <div class="mb-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span class="text-emerald-400">🌿</span>
            <span>${catMeta.name}</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">${catMeta.desc}</p>
        </div>

        <!-- Search input -->
        <div class="relative w-full md:w-72">
          <input type="text" 
                 id="cat-search-input" 
                 placeholder="Tìm kiếm bảo vật..." 
                 value="${currentCategoryFilter.search}" 
                 oninput="window.handleCategorySearch('${validId}', this.value)"
                 class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 outline-none transition" />
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-500 text-xs"></i>
        </div>
      </div>

      <!-- Category Switcher Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        ${catTabsHtml}
      </div>

      <!-- Sub-Category Tabs (Chia theo các mục) -->
      ${subCatTabsHtml}

      <!-- BỘ LỌC PHẨM CẤP: Hoàng (xám) • Huyền (xanh) • Địa (tím) • Thiên (vàng kim) -->
      <div class="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8 pb-4 border-b border-slate-800">
        
        <!-- Các nút bấm lọc nhanh phẩm cấp -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Phẩm Cấp:</span>
          
          <!-- Tất Cả -->
          <button onclick="window.setGradeFilter('${validId}', 'all')" 
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCategoryFilter.grade === 'all' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }">
            Tất Cả
          </button>

          <!-- Hoàng (Xám) -->
          <button onclick="window.setGradeFilter('${validId}', 'Hoang')" 
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCategoryFilter.grade === 'Hoang' 
                      ? 'bg-slate-700 text-slate-100 border border-slate-400 shadow-md' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }">
            Hoàng Giai
          </button>

          <!-- Huyền (Xanh) -->
          <button onclick="window.setGradeFilter('${validId}', 'Huyen')" 
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCategoryFilter.grade === 'Huyen' 
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-900 text-cyan-500/80 hover:text-cyan-400 border border-slate-800'
                  }">
            Huyền Giai
          </button>

          <!-- Địa (Tím) -->
          <button onclick="window.setGradeFilter('${validId}', 'Dia')" 
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCategoryFilter.grade === 'Dia' 
                      ? 'bg-purple-950 text-purple-300 border border-purple-400 shadow-md shadow-purple-500/20' 
                      : 'bg-slate-900 text-purple-500/80 hover:text-purple-400 border border-slate-800'
                  }">
            Địa Giai
          </button>

          <!-- Thiên (Vàng kim / Đỏ) -->
          <button onclick="window.setGradeFilter('${validId}', 'Thien')" 
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCategoryFilter.grade === 'Thien' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-400 shadow-md shadow-amber-500/30' 
                      : 'bg-slate-900 text-amber-500/80 hover:text-amber-400 border border-slate-800'
                  }">
            Thiên Giai (Chí Tôn)
          </button>
        </div>

        <!-- Sorting dropdown -->
        <div class="flex items-center space-x-2">
          <span class="text-xs text-slate-400">Sắp xếp:</span>
          <select onchange="window.handleCategorySort('${validId}', this.value)" 
                  class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500">
            <option value="newest" ${currentCategoryFilter.sort === 'newest' ? 'selected' : ''}>Mới Nhất</option>
            <option value="price_asc" ${currentCategoryFilter.sort === 'price_asc' ? 'selected' : ''}>Linh Thạch: Thấp -> Cao</option>
            <option value="price_desc" ${currentCategoryFilter.sort === 'price_desc' ? 'selected' : ''}>Linh Thạch: Cao -> Thấp</option>
            <option value="stock_desc" ${currentCategoryFilter.sort === 'stock_desc' ? 'selected' : ''}>Tồn Kho Nhiều Nhất</option>
          </select>
        </div>

      </div>

      <!-- Container danh sách bảo vật (chia theo các mục) -->
      <div id="category-sections-container">
        <div class="py-16 text-center text-emerald-400 flex items-center justify-center gap-2">
          <i class="fa-solid fa-spinner fa-spin text-xl"></i>
          <span class="text-sm font-cinzel">Đang khai mở các phân mục bảo vật...</span>
        </div>
      </div>

    </div>
  `;

  await fetchAndRenderCategoryProducts(validId);
}

async function fetchAndRenderCategoryProducts(categoryId) {
  const container = document.getElementById('category-sections-container');
  if (!container) return;

  try {
    const params = {
      category: categoryId,
      subCategory: currentCategoryFilter.subCategory,
      grade: currentCategoryFilter.grade,
      search: currentCategoryFilter.search,
      sort: currentCategoryFilter.sort
    };

    const data = await window.api.getProducts(params);
    const products = data.products || [];

    if (products.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center">
          <div class="text-5xl mb-3 text-slate-600">📜</div>
          <h3 class="font-cinzel text-lg font-bold text-slate-300">Không tìm thấy bảo vật phù hợp</h3>
          <p class="text-xs text-slate-500 mt-1">Xin hãy thử thay đổi bộ lọc phân mục, phẩm cấp hoặc từ khóa tìm kiếm.</p>
          <button onclick="window.resetCategoryFilters('${categoryId}')" class="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-semibold hover:bg-slate-800 transition">
            Xem Toàn Bộ Bảo Vật
          </button>
        </div>
      `;
      return;
    }

    const gradeColors = {
      Hoang: { label: 'Hoàng', badgeClass: 'grade-badge-Hoang', cardBorder: 'grade-card-Hoang' },
      Huyen: { label: 'Huyền', badgeClass: 'grade-badge-Huyen', cardBorder: 'grade-card-Huyen' },
      Dia: { label: 'Địa', badgeClass: 'grade-badge-Dia', cardBorder: 'grade-card-Dia' },
      Thien: { label: 'Thiên', badgeClass: 'grade-badge-Thien', cardBorder: 'grade-card-Thien' },
      Tien: { label: 'Thiên', badgeClass: 'grade-badge-Thien', cardBorder: 'grade-card-Thien' }
    };

    // Hàm render 1 Card sản phẩm
    function renderProductCard(product) {
      const grade = gradeColors[product.grade] || gradeColors.Hoang;
      const isOutOfStock = (product.stock || 0) <= 0;
      const isFavorited = (window.store.user && window.store.user.wishlist) 
        ? window.store.user.wishlist.some(wId => (wId._id || wId).toString() === product._id.toString())
        : false;

      return `
        <div class="treasure-card ${grade.cardBorder} rounded-2xl overflow-hidden flex flex-col justify-between group relative border">
          
          <!-- Badge Phẩm Cấp & Yêu Thích -->
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
            ` : `
              <div class="absolute bottom-2 left-3 text-[10px] text-slate-400 flex items-center gap-1.5">
                <span>Tồn kho: <strong class="text-emerald-400">${product.stock}</strong></span>
                ${product.subType ? `<span class="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-[9px]">${product.subType}</span>` : ''}
              </div>
            `}
          </div>

          <!-- Content -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="text-[11px] text-emerald-400/80 font-medium line-clamp-1 mb-1 flex items-center gap-1">
                <i class="fa-solid fa-cauldron text-[10px]"></i>
                <span>${product.subCategory || 'Bảo Khố'}</span>
              </div>

              <h3 onclick="window.navigateToProduct('${product._id}')" class="font-cinzel text-base font-bold text-slate-100 hover:text-emerald-400 transition cursor-pointer line-clamp-1">
                ${product.name}
              </h3>

              <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                ${product.description}
              </p>
            </div>

            <!-- Price & Action -->
            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-slate-400 uppercase">Giá Bán</div>
                <div class="text-amber-300 font-bold text-base font-cinzel flex items-center gap-1">
                  <span>💎 ${(product.price || 0).toLocaleString('vi-VN')}</span>
                  <span class="text-[10px] text-amber-400/70 font-sans">LT</span>
                </div>
              </div>

              <button onclick="window.handleAddToCart('${product._id}', 1, event)" 
                      ${isOutOfStock ? 'disabled' : ''}
                      class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                        isOutOfStock 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/30'
                      }">
                <i class="fa-solid fa-cart-plus"></i>
                <span>${isOutOfStock ? 'Hết Hàng' : 'Thu Nạp'}</span>
              </button>
            </div>
          </div>

        </div>
      `;
    }

    // CHIA THEO CÁC MỤC (subCategory)
    // Gom nhóm sản phẩm theo subCategory
    const groups = {};
    products.forEach(p => {
      const subCat = p.subCategory || 'Khác';
      if (!groups[subCat]) groups[subCat] = [];
      groups[subCat].push(p);
    });

    // Render từng nhóm phân mục
    let html = '';
    const groupKeys = Object.keys(groups);

    // Nếu chỉ có 1 nhóm hoặc người dùng lọc theo 1 subCategory cụ thể
    if (groupKeys.length === 1 && currentCategoryFilter.subCategory !== 'all') {
      const items = groups[groupKeys[0]];
      html = `
        <div class="mb-8">
          <div class="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
            <h2 class="font-cinzel text-lg sm:text-xl font-bold text-emerald-300 flex items-center gap-2">
              <span>✦</span>
              <span>${groupKeys[0]}</span>
            </h2>
            <span class="text-xs text-slate-400">${items.length} bảo vật</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${items.map(renderProductCard).join('')}
          </div>
        </div>
      `;
    } else {
      // Hiển thị chia theo các mục rõ ràng
      html = groupKeys.map(subCatName => {
        const items = groups[subCatName];
        return `
          <section class="mb-12">
            <div class="flex items-center justify-between pb-3 mb-5 border-b border-slate-800/80">
              <h2 class="font-cinzel text-lg sm:text-xl font-bold text-emerald-300 flex items-center gap-2">
                <span class="text-amber-400">❖</span>
                <span>${subCatName}</span>
              </h2>
              <span class="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                ${items.length} bảo vật
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              ${items.map(renderProductCard).join('')}
            </div>
          </section>
        `;
      }).join('');
    }

    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-rose-400 text-xs">
        Lỗi tải bảo vật: ${err.message}
      </div>
    `;
  }
}

window.renderCategoryView = renderCategoryView;

window.setSubCategoryFilter = function(categoryId, subCategory) {
  currentCategoryFilter.subCategory = subCategory;
  renderCategoryView(categoryId);
};

window.setGradeFilter = function(categoryId, grade) {
  currentCategoryFilter.grade = grade;
  renderCategoryView(categoryId);
};

window.resetCategoryFilters = function(categoryId) {
  currentCategoryFilter = {
    category: categoryId,
    subCategory: 'all',
    grade: 'all',
    search: '',
    sort: 'newest'
  };
  renderCategoryView(categoryId);
};

let searchDebounceTimer = null;
window.handleCategorySearch = function(categoryId, val) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    currentCategoryFilter.search = val.trim();
    fetchAndRenderCategoryProducts(categoryId);
  }, 350);
};

window.handleCategorySort = function(categoryId, sort) {
  currentCategoryFilter.sort = sort;
  fetchAndRenderCategoryProducts(categoryId);
};
