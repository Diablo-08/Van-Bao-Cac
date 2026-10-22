// Giao Diện Động Phủ Luyện Chế / Quản Lý Gian Hàng Seller
// Hỗ trợ phân quyền Seller & Admin, quản lý bảo vật theo phân mục, lọc phẩm cấp

const SUBCATEGORIES_MAP = {
  'cong-phap': ['Tâm Pháp', 'Đấu Pháp', 'Bách Nghệ Điển Tịch', 'Ma Đạo Bí Tịch'],
  'dan-duoc': ['Đan Dược Đột Phá', 'Đan Dược Hỗ Trợ', 'Linh Thảo, Dược Liệu'],
  'phap-bao': ['Công Kích Pháp Bảo', 'Hộ Thân Pháp Bảo', 'Ngự Không Pháp Bảo', 'Không Gian Pháp Bảo'],
  'linh-vat': ['Linh Sủng, Yêu Thú', 'Linh Tài, Tạp Vật']
};

let currentSellerGradeFilter = 'all';

async function renderSellerView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  const user = window.store.user;
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-20 text-center">
        <div class="text-5xl mb-3 text-cyan-500">🚫</div>
        <h2 class="font-cinzel text-xl font-bold text-cyan-400">Động Phủ Bí Mật</h2>
        <p class="text-xs text-slate-400 mt-2 mb-4">Cần thân phận Động Chủ Seller hoặc Tông Chủ Admin để quản lý gian hàng.</p>
        <a href="#home" class="px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-semibold">Về Trang Chủ</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-16 text-center text-cyan-400">
      <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
      <p class="mt-3 font-cinzel text-sm">Đang mở kho tàng Động Phủ...</p>
    </div>
  `;

  try {
    const prodsData = await window.api.getSellerProducts();
    const ordersData = await window.api.getSellerOrders();

    const myProducts = prodsData.products || [];
    const mySales = ordersData.sales || [];

    const totalEarned = mySales.reduce((sum, s) => sum + (s.totalEarned || 0), 0);
    const totalStock = myProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

    const gradeLabels = {
      Hoang: 'Hoàng',
      Huyen: 'Huyền',
      Dia: 'Địa',
      Thien: 'Thiên',
      Tien: 'Thiên'
    };

    const gradeBadgeClasses = {
      Hoang: 'grade-badge-Hoang',
      Huyen: 'grade-badge-Huyen',
      Dia: 'grade-badge-Dia',
      Thien: 'grade-badge-Thien',
      Tien: 'grade-badge-Thien'
    };

    const myProductsRows = myProducts.map((p, idx) => `
      <tr class="seller-product-row border-b border-slate-800/60 hover:bg-slate-900/40 transition" data-grade="${p.grade}">
        <td class="py-3 px-4 text-xs font-mono text-slate-500 w-12">#${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <img src="${p.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'}" 
                 class="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" 
                 onerror="this.src='/images/logo.png'" />
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-200 truncate">${p.name}</div>
              <div class="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5 mt-0.5">
                <i class="fa-solid fa-scroll text-[9px] text-emerald-400/60"></i>
                <span>${p.subCategory || 'Bảo Khố'}</span>
              </div>
              ${p.subType ? `
                <div class="mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    ${p.subType}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </td>
        <td class="py-3 px-4 w-36 min-w-[120px]">
          <span class="text-[11px] px-2.5 py-1 rounded-md font-bold uppercase ${gradeBadgeClasses[p.grade] || gradeBadgeClasses.Hoang}">
            ${gradeLabels[p.grade] || p.grade} Phẩm
          </span>
        </td>
        <td class="py-3 px-4 w-44 min-w-[150px] text-xs font-cinzel font-bold text-amber-400">
          💎 ${(p.price || 0).toLocaleString('vi-VN')} <span class="text-[10px] text-amber-400/70 font-sans">LT</span>
        </td>
        <td class="py-3 px-4 w-24 max-w-[90px] text-center text-xs font-bold ${p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}">
          ${p.stock > 0 ? p.stock : '0 (Hết)'}
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <button onclick="window.openEditProductModal('${p._id}', '${encodeURIComponent(JSON.stringify(p))}')" 
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/40 border border-slate-700 text-cyan-300 text-xs font-semibold transition cursor-pointer">
            <i class="fa-solid fa-pen-to-square mr-1"></i>Sửa
          </button>
          <button onclick="window.handleDeleteProduct('${p._id}', '${p.name}')" 
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 border border-slate-700 text-rose-400 text-xs font-semibold transition cursor-pointer">
            <i class="fa-solid fa-trash mr-1"></i>Xóa
          </button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400 text-cyan-300 text-xs font-bold mb-3 uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/50">
              <span class="animate-pulse">🏰</span>
              <span>Động Phủ Luyện Chế</span>
            </div>
            <h1 class="font-cinzel text-2xl sm:text-3xl font-black text-slate-100">
              Quản Lý Gian Hàng & Lò Luyện
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Động Chủ: <strong class="text-slate-200">${user.name}</strong> • Động Phủ: <strong class="text-cyan-400">${user.dongPhu || 'Thần Luyện Động Phủ'}</strong>
            </p>
          </div>

          <!-- Quick Stats: Doanh Thu -->
          <div class="flex items-center">
            <div class="px-5 py-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/10 text-right">
              <div class="text-[11px] text-amber-400/90 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
                <i class="fa-solid fa-coins text-amber-400 text-xs"></i>
                <span>Doanh Thu Thu Được</span>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-yellow-300 font-cinzel flex items-center justify-end gap-2 drop-shadow-[0_0_12px_rgba(253,224,71,0.4)]">
                <span class="text-2xl animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]">💎</span>
                <span>${window.formatScientificOrLocale(totalEarned)}</span>
                <span class="text-xs sm:text-sm font-sans font-bold text-amber-400">LT</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM ĐĂNG BÁN BẢO VẬT MỚI -->
        <div class="glass-modal rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-xl">
          <div class="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-6">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg border border-cyan-500/40">
              ✨
            </div>
            <div>
              <h2 class="font-cinzel text-lg sm:text-xl font-bold text-slate-100">
                Đăng Bán Bảo Vật Mới Lên Kệ
              </h2>
              <p class="text-xs text-slate-400">Niêm yết bảo vật mới luyện chế để đạo hữu bốn phương cùng chiêm ngưỡng</p>
            </div>
          </div>

          <form id="create-product-form" onsubmit="window.handleCreateProductSubmit(event)" class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Tên bảo vật -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên Bảo Vật <span class="text-cyan-400">*</span>
                </label>
                <input type="text" 
                       name="name" 
                       required 
                       placeholder="Ví dụ: Cửu Long Thần Hỏa Kiếm" 
                       class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
              </div>

              <!-- Danh mục -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Danh Mục <span class="text-cyan-400">*</span>
                </label>
                <select name="category" required onchange="window.updateCreateSubCategories(this.value)" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                  <option value="cong-phap">Công Pháp & Bí Tịch</option>
                  <option value="dan-duoc">Đan Dược & Linh Thảo</option>
                  <option value="phap-bao">Pháp Bảo & Binh Khí</option>
                  <option value="linh-vat">Bảo Khố Tạp Vật</option>
                </select>
              </div>

              <!-- Phân mục -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phân Mục <span class="text-cyan-400">*</span>
                </label>
                <select name="subCategory" id="create-subcategory-select" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                  <!-- dynamically populated -->
                </select>
              </div>

              <!-- Loại bảo vật cụ thể -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Loại (Ví dụ: Tịnh Tâm)
                </label>
                <input type="text" 
                       name="subType" 
                       placeholder="Ví dụ: Tịnh Tâm, Hồi Phục..." 
                       class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
              </div>

              <!-- Phẩm cấp -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phẩm Cấp <span class="text-cyan-400">*</span>
                </label>
                <select name="grade" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                  <option value="Hoang">Hoàng Giai (Phổ thông)</option>
                  <option value="Huyen">Huyền Giai (Tinh xảo)</option>
                  <option value="Dia">Địa Giai (Quý hiếm)</option>
                  <option value="Thien">Thiên Giai (Chí tôn)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Giá Linh Thạch -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Giá Niêm Yết (Linh Thạch) <span class="text-amber-400">*</span>
                </label>
                <input type="number" 
                       name="price" 
                       required 
                       min="1" 
                       placeholder="Ví dụ: 5000" 
                       class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-amber-300 font-cinzel font-bold outline-none transition" />
              </div>

              <!-- Tồn kho -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Số Lượng Tồn Kho <span class="text-cyan-400">*</span>
                </label>
                <input type="number" 
                       name="stock" 
                       required 
                       min="0" 
                       value="10" 
                       class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-emerald-300 font-bold outline-none transition" />
              </div>

              <!-- Ảnh URL -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Link Hình Ảnh Bảo Vật
                </label>
                <input type="url" 
                       name="image" 
                       placeholder="https://images.unsplash.com/..." 
                       class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
              </div>
            </div>

            <!-- Mô tả công hiệu -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mô Tả Công Hiệu Chi Tiết <span class="text-cyan-400">*</span>
              </label>
              <textarea name="description" 
                        required 
                        rows="2" 
                        placeholder="Mô tả công năng, tác dụng khi hấp thụ hoặc xuất thủ..." 
                        class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition"></textarea>
            </div>

            <!-- Điển cố lai lịch -->
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Điển Cố & Lai Lịch (Lore)
              </label>
              <textarea name="lore" 
                        rows="2" 
                        placeholder="Nguồn gốc rèn đúc, truyền thuyết gắn liền với bảo vật..." 
                        class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition"></textarea>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" 
                      id="create-prod-btn" 
                      class="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Đưa Lên Giá Bán</span>
              </button>
            </div>

          </form>
        </div>

        <!-- DANH SÁCH BẢO VẬT CỦA CHÍNH SELLER -->
        <div class="glass-modal rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 class="font-cinzel text-lg font-bold text-slate-100">
                Kho Bảo Vật Đã Niêm Yết (${myProducts.length} Món)
              </h3>
              <p class="text-xs text-slate-400">Quản lý giá bán, phẩm cấp và kiểm kê số lượng tồn kho</p>
            </div>
          </div>

          <!-- THANH LỌC PHẨM CẤP ĐỂ QUẢN LÝ -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Lọc Phẩm Cấp:</span>
              <button onclick="window.filterSellerByGrade('all')" id="seller-filter-btn-all" class="seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-cyan-500 text-slate-950 shadow-md">
                Tất Cả (${myProducts.length})
              </button>
              <button onclick="window.filterSellerByGrade('Hoang')" id="seller-filter-btn-Hoang" class="seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
                Hoàng Phẩm
              </button>
              <button onclick="window.filterSellerByGrade('Huyen')" id="seller-filter-btn-Huyen" class="seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-800">
                Huyền Phẩm
              </button>
              <button onclick="window.filterSellerByGrade('Dia')" id="seller-filter-btn-Dia" class="seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-slate-900 text-purple-400 hover:text-purple-300 border border-slate-800">
                Địa Phẩm
              </button>
              <button onclick="window.filterSellerByGrade('Thien')" id="seller-filter-btn-Thien" class="seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800">
                Thiên Phẩm
              </button>
            </div>
            <div id="seller-filter-count" class="text-xs text-slate-400">
              Đang hiển thị: <strong class="text-cyan-400">${myProducts.length}</strong> bảo vật
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th class="py-2.5 px-4 w-12">STT</th>
                  <th class="py-2.5 px-4">Bảo Vật</th>
                  <th class="py-2.5 px-4 w-36 min-w-[120px]">Phẩm Cấp</th>
                  <th class="py-2.5 px-4 w-44 min-w-[150px]">Đơn Giá</th>
                  <th class="py-2.5 px-4 w-24 max-w-[90px] text-center">Tồn Kho</th>
                  <th class="py-2.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                ${myProductsRows || `
                  <tr>
                    <td colspan="6" class="py-8 text-center text-slate-500 text-xs">
                      Động phủ chưa niêm yết bảo vật nào.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Khởi tạo subcategories cho form tạo mới
    window.updateCreateSubCategories('cong-phap');

  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-16 text-center text-rose-400">
        Lỗi Động Phủ: ${err.message}
      </div>
    `;
  }
}

window.renderSellerView = renderSellerView;

window.updateCreateSubCategories = function(catId) {
  const select = document.getElementById('create-subcategory-select');
  if (!select) return;
  const subs = SUBCATEGORIES_MAP[catId] || [];
  select.innerHTML = subs.map(sub => `<option value="${sub}">${sub}</option>`).join('');
};

window.filterSellerByGrade = function(selectedGrade) {
  currentSellerGradeFilter = selectedGrade;
  const rows = document.querySelectorAll('.seller-product-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const rowGrade = row.getAttribute('data-grade');
    if (selectedGrade === 'all' || rowGrade === selectedGrade || (selectedGrade === 'Thien' && rowGrade === 'Tien')) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const buttons = document.querySelectorAll('.seller-grade-btn');
  buttons.forEach(btn => {
    btn.className = 'seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-slate-900 text-slate-400 hover:text-white border border-slate-800';
  });

  const activeBtn = document.getElementById(`seller-filter-btn-${selectedGrade}`);
  if (activeBtn) {
    activeBtn.className = 'seller-grade-btn px-3 py-1 rounded-xl text-xs font-bold transition bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20';
  }

  const countEl = document.getElementById('seller-filter-count');
  if (countEl) {
    countEl.innerHTML = `Đang hiển thị: <strong class="text-cyan-400">${visibleCount}</strong> bảo vật`;
  }
};

window.handleCreateProductSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('create-prod-btn');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang khắc ấn bảo vật...`;

  const prodData = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    lore: form.lore ? form.lore.value.trim() : '',
    price: form.price.value,
    category: form.category.value,
    subCategory: form.subCategory ? form.subCategory.value : '',
    subType: form.subType ? form.subType.value.trim() : '',
    grade: form.grade.value,
    stock: form.stock.value,
    image: form.image.value.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600'
  };

  try {
    const res = await window.api.createProduct(prodData);
    window.showToast(res.message, 'success');
    form.reset();
    renderSellerView();
  } catch (err) {
    window.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Đưa Lên Giá Bán`;
  }
};

window.handleDeleteProduct = async function(id, name) {
  if (!confirm(`Đạo hữu có chắc muốn thu hồi bảo vật [${name}] khỏi giá bán?`)) return;

  try {
    const res = await window.api.deleteProduct(id);
    window.showToast(res.message, 'info');
    renderSellerView();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

// Modal chỉnh sửa bảo vật: Hỗ trợ sửa Danh Mục & Phân Mục (sau khi chọn danh mục)
window.openEditProductModal = function(id, encodedProd) {
  const p = typeof encodedProd === 'string' ? JSON.parse(decodeURIComponent(encodedProd)) : encodedProd;
  const existing = document.getElementById('edit-product-modal');
  if (existing) existing.remove();

  const currentImg = p.image || '';
  const currentCategory = p.category || 'cong-phap';
  const currentSubCategory = p.subCategory || '';
  const currentGrade = p.grade || 'Hoang';

  const initialSubCats = SUBCATEGORIES_MAP[currentCategory] || [];
  const subCatOptions = initialSubCats.map(sub => 
    `<option value="${sub}" ${sub === currentSubCategory ? 'selected' : ''}>${sub}</option>`
  ).join('');

  const modalHtml = `
    <div id="edit-product-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div class="relative w-full max-w-xl glass-modal rounded-3xl p-6 border border-cyan-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-lg">🛠️</span>
            <h3 class="font-cinzel text-lg font-bold text-slate-100">
              Tu Sửa Bảo Vật: ${p.name}
            </h3>
          </div>
          <button onclick="document.getElementById('edit-product-modal').remove()" class="text-slate-400 hover:text-white">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="window.handleUpdateProductSubmit(event, '${id}')" class="space-y-3.5">
          <div>
            <label class="block text-xs text-slate-300 font-semibold mb-1">Tên Bảo Vật <span class="text-cyan-400">*</span></label>
            <input type="text" name="name" value="${p.name}" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
          </div>

          <!-- Danh Mục, Phân Mục, Loại & Phẩm Cấp -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Danh Mục <span class="text-cyan-400">*</span></label>
              <select name="category" id="edit-product-category" onchange="window.handleEditCategoryChange(this.value)" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                <option value="cong-phap" ${currentCategory === 'cong-phap' ? 'selected' : ''}>Công Pháp & Bí Tịch</option>
                <option value="dan-duoc" ${currentCategory === 'dan-duoc' ? 'selected' : ''}>Đan Dược & Linh Thảo</option>
                <option value="phap-bao" ${currentCategory === 'phap-bao' ? 'selected' : ''}>Pháp Bảo & Binh Khí</option>
                <option value="linh-vat" ${currentCategory === 'linh-vat' ? 'selected' : ''}>Bảo Khố Tạp Vật</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Phân Mục <span class="text-cyan-400">*</span></label>
              <select name="subCategory" id="edit-product-subcategory" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                ${subCatOptions}
              </select>
            </div>

            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Loại</label>
              <input type="text" name="subType" value="${p.subType || ''}" placeholder="Ví dụ: Tịnh Tâm, Hồi Phục..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition" />
            </div>

            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Phẩm Cấp <span class="text-cyan-400">*</span></label>
              <select name="grade" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">
                <option value="Hoang" ${currentGrade === 'Hoang' ? 'selected' : ''}>Hoàng Giai</option>
                <option value="Huyen" ${currentGrade === 'Huyen' ? 'selected' : ''}>Huyền Giai</option>
                <option value="Dia" ${currentGrade === 'Dia' ? 'selected' : ''}>Địa Giai</option>
                <option value="Thien" ${(currentGrade === 'Thien' || currentGrade === 'Tien') ? 'selected' : ''}>Thiên Giai</option>
              </select>
            </div>
          </div>

          <!-- Gắn Link Hình Ảnh Sản Phẩm Trực Tiếp -->
          <div>
            <label class="block text-xs text-slate-300 font-semibold mb-1">
              Link Hình Ảnh Bảo Vật (Gắn link ảnh trực tiếp) <span class="text-cyan-400">*</span>
            </label>
            <div class="flex items-center gap-3">
              <div class="relative flex-1">
                <input type="url" 
                       id="edit-prod-image-input" 
                       name="image" 
                       value="${currentImg}" 
                       placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ" 
                       oninput="document.getElementById('edit-prod-img-preview').src = this.value || '/images/logo.png'"
                       class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 font-mono outline-none transition" />
              </div>
              <div class="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-900 shrink-0 shadow-md">
                <img id="edit-prod-img-preview" 
                     src="${currentImg || '/images/logo.png'}" 
                     alt="Ảnh xem trước" 
                     class="w-full h-full object-cover" 
                     onerror="this.src='/images/logo.png'" />
              </div>
            </div>
            <p class="text-[10px] text-slate-500 mt-1">Đạo hữu có thể dán liên kết ảnh từ Imgur, Unsplash, ImgBB hoặc link ảnh trực tiếp.</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Giá Linh Thạch <span class="text-amber-400">*</span></label>
              <input type="number" name="price" value="${p.price}" min="1" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-amber-300 font-bold outline-none transition" />
            </div>
            <div>
              <label class="block text-xs text-slate-300 font-semibold mb-1">Tồn Kho <span class="text-emerald-400">*</span></label>
              <input type="number" name="stock" value="${p.stock}" min="0" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-emerald-300 font-bold outline-none transition" />
            </div>
          </div>

          <div>
            <label class="block text-xs text-slate-300 font-semibold mb-1">Mô Tả Công Hiệu <span class="text-cyan-400">*</span></label>
            <textarea name="description" rows="3" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">${p.description || ''}</textarea>
          </div>

          <div>
            <label class="block text-xs text-slate-300 font-semibold mb-1">Biến Cố & Lai Lịch (Điển cố / Lore)</label>
            <textarea name="lore" rows="2" placeholder="Nguồn gốc rèn đúc, truyền thuyết hoặc biến cố gắn liền với bảo vật..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none transition">${p.lore || ''}</textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="document.getElementById('edit-product-modal').remove()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition">
              Hủy
            </button>
            <button type="submit" id="save-edit-prod-btn" class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition cursor-pointer">
              Lưu Thay Đổi
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.handleEditCategoryChange = function(catId) {
  const select = document.getElementById('edit-product-subcategory');
  if (!select) return;
  const subs = SUBCATEGORIES_MAP[catId] || [];
  select.innerHTML = subs.map(sub => `<option value="${sub}">${sub}</option>`).join('');
};

window.handleUpdateProductSubmit = async function(e, id) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('save-edit-prod-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang lưu...`;
  }

  const updateData = {
    name: form.name.value.trim(),
    price: form.price.value,
    stock: form.stock.value,
    description: form.description.value.trim(),
    lore: form.lore ? form.lore.value.trim() : '',
    image: form.image.value.trim(),
    category: form.category ? form.category.value : undefined,
    subCategory: form.subCategory ? form.subCategory.value : undefined,
    subType: form.subType ? form.subType.value.trim() : '',
    grade: form.grade ? form.grade.value : undefined
  };

  try {
    const res = await window.api.updateProduct(id, updateData);
    window.showToast(res.message, 'success');
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.remove();

    // Làm mới view hiện tại
    if (window.store.currentView === 'seller') {
      renderSellerView();
    } else if (window.store.currentView === 'product') {
      window.renderProductDetailView(id);
    } else if (window.store.currentView === 'category') {
      window.renderCategoryView(window.store.viewParams?.id || 'all');
    } else {
      window.renderView();
    }
  } catch (err) {
    window.showToast(err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Lưu Thay Đổi`;
    }
  }
};
