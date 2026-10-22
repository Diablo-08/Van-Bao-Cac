require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, isMongo, User, Product, Order, UserModel, ProductModel, OrderModel, getFallbackData, saveFallbackData } = require('./services/db');

// Kho ảnh chất lượng cao huyền huyễn
const IMG = {
  congphap: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop'
  ],
  danduoc: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop'
  ],
  phapbao: [
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'
  ],
  linhvat: [
    'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop'
  ]
};

let imgCounters = { congphap: 0, danduoc: 0, phapbao: 0, linhvat: 0 };
function getImg(category) {
  const key = category.replace('-', '');
  const arr = IMG[key] || IMG.phapbao;
  const url = arr[imgCounters[key] % arr.length];
  imgCounters[key]++;
  return url;
}

const PRICE_MAP = {
  Hoang: [300, 1200],
  Huyen: [2500, 9500],
  Dia: [15000, 48000],
  Thien: [80000, 250000]
};
let pCount = { Hoang: 0, Huyen: 0, Dia: 0, Thien: 0 };
function genPrice(grade) {
  const [min, max] = PRICE_MAP[grade];
  const step = Math.floor((max - min) / 6);
  const val = min + (pCount[grade]++ % 7) * step;
  return Math.round(val / 50) * 50;
}

function createItem(name, description, grade, category, subCategory, subType = '', stock = 15) {
  return {
    name,
    description,
    lore: `Bảo vật trấn sơn thuộc phân loại [${subCategory} - ${subType || grade}], ẩn chứa linh khí thiên địa vô cùng tinh thuần.`,
    grade,
    category,
    subCategory,
    subType,
    price: genPrice(grade),
    stock,
    image: getImg(category),
    isFeatured: grade === 'Thien' || grade === 'Dia'
  };
}

// DANH SÁCH TOÀN BỘ SẢN PHẨM MỚI THEO YÊU CẦU ĐẶC TẢ
const ALL_PRODUCTS_DATA = [
  // ========================================================
  // I. CÔNG PHÁP VÀ BIỂN TỊCH (cong-phap)
  // ========================================================
  // 1. Tâm Pháp
  createItem('Trường Xuân Công', 'Tâm pháp dưỡng sinh thuần chính, gia tăng thọ nguyên, tích lũy linh lực ôn hòa.', 'Hoang', 'cong-phap', 'Tâm Pháp', 'Sơ Cấp', 25),
  createItem('Thái Thượng Cảm Ứng Thiên', 'Khai mở thần thức, cảm ứng linh khí thiên địa, đả thông kinh mạch sơ khởi.', 'Hoang', 'cong-phap', 'Tâm Pháp', 'Sơ Cấp', 30),
  createItem('Bổ Thiên Quyết', 'Tự bù đắp khiếm khuyết căn cốt, mài giũa linh lực tinh khiết gấp đôi công pháp thường.', 'Huyen', 'cong-phap', 'Tâm Pháp', 'Sơ Cấp', 15),
  createItem('Đại Hoang Kinh', 'Hấp thụ linh khí cạn kiệt của vạn vật thiên địa, ngưng tụ Kim Đan hùng hậu như đại địa.', 'Dia', 'cong-phap', 'Tâm Pháp', 'Trung Cấp', 8),
  createItem('Thái Hư Hóa Long Quyết', 'Luyện hóa chấn long khí, biến hóa thân thể thành Chân Long, ngự trị quy tắc không gian.', 'Thien', 'cong-phap', 'Tâm Pháp', 'Cao Cấp', 2),

  // 2. Đấu Pháp - Thể Tu
  createItem('Cửu Thiên Lôi Đình Chưởng', 'Ngưng tụ lôi điện vào lòng bàn tay, đánh ra chưởng lực tàn phá kinh mạch.', 'Huyen', 'cong-phap', 'Đấu Pháp', 'Thể Tu - Quyền Cước', 12),
  createItem('Bát Sái Thần Thương (Bí Phổ)', 'Mũi thương uy lực cuồn cuộn, quét sạch ngàn quân, phá vỡ mọi phòng ngự.', 'Dia', 'cong-phap', 'Đấu Pháp', 'Thể Tu - Binh Khí', 6),
  createItem('Bất Động Minh Vương Thân', 'Rèn luyện nhục thân cứng như kim cương, vạn đao bất nhập, vạn pháp khó đả thương.', 'Dia', 'cong-phap', 'Đấu Pháp', 'Thể Tu - Luyện Thể', 5),

  // 2. Đấu Pháp - Pháp Tu Thần Thông
  createItem('Vạn Kiếm Quy Tông', 'Điều khiển hàng vạn thanh kiếm cùng lúc, hóa thành kiếm trận diệt sát vạn vật.', 'Thien', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Ngự Binh', 3),
  createItem('Cửu Tiêu Lôi Động', 'Triệu hồi thiên lôi từ cửu tầng mây, giội lôi phạt xuống đầu địch thủ.', 'Dia', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Ngũ Hành', 7),
  createItem('Tam Muội Chân Hỏa Thuật', 'Ngưng tụ ngọn lửa không熄 từ tâm, tinh, khí, thiêu rụi cả thần thức đối phương.', 'Dia', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Ngũ Hành', 7),
  createItem('Thái Cực Bát Quái Kính (Pháp Quyết)', 'Hóa giải và phản lại 30% sát thương pháp thuật của đối thủ.', 'Huyen', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Hộ Thể', 14),
  createItem('Hỗn Độn Linh Khiên', 'Mượn khí hỗn độn tạo thành màn chắn hộ thân kiên cố bất xâm.', 'Dia', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Hộ Thể', 9),
  createItem('Lục Nhâm Thần Hộ', 'Thuật hộ thân sơ cấp, ngưng tụ linh khí thành màng chắn giảm chấn thương.', 'Hoang', 'cong-phap', 'Đấu Pháp', 'Pháp Tu - Hộ Thể', 20),

  // 3. Bách Nghệ Điển Tịch
  createItem('Đan Đạo Điển Tịch', 'Tổng hợp bí quyết điều hòa dược tính, hỏa候 luyện đan từ Nhất phẩm đến Lục phẩm.', 'Huyen', 'cong-phap', 'Bách Nghệ Điển Tịch', 'Đan Đạo', 16),
  createItem('Luyện Khí Sách Lược', 'Bí kỹ dung hợp linh tài, khai quang khắc ấn phù văn vào binh khí.', 'Huyen', 'cong-phap', 'Bách Nghệ Điển Tịch', 'Luyện Khí', 18),
  createItem('Trận Pháp Kinh', 'Hướng dẫn bố trí các đại trận phòng thủ, tụ linh và diệt sát bằng linh thạch.', 'Dia', 'cong-phap', 'Bách Nghệ Điển Tịch', 'Trận Pháp', 8),
  createItem('Phù Lục Bí Yếu', 'Phương pháp vẽ các loại phù lục tấn công, ẩn thân và gia tốc cấp tốc.', 'Hoang', 'cong-phap', 'Bách Nghệ Điển Tịch', 'Phù Lục', 25),

  // 4. Ma Đạo Bí Tịch
  createItem('Thôn Thiên Ma Công', 'Cướp đoạt tu vi và thể chất của kẻ khác để làm cường hóa bản thân.', 'Thien', 'cong-phap', 'Ma Đạo Bí Tịch', 'Thôn Phệ & Hút Huyết', 2),
  createItem('Huyết Thần Kinh', 'Tự luyện hóa bản thân thành Huyết Thần, bất tử bất diệt miễn là còn một giọt máu.', 'Dia', 'cong-phap', 'Ma Đạo Bí Tịch', 'Thôn Phệ & Hút Huyết', 4),
  createItem('Mê Hồn Đại Pháp', 'Tẩy não, khống chế thần trí và thao túng suy nghĩ của tu sĩ cấp thấp.', 'Hoang', 'cong-phap', 'Ma Đạo Bí Tịch', 'Mê Hồn & Tâm Ma', 18),
  createItem('Thiên Ma Loạn Tâm Kinh', 'Dẫn dụ tâm ma đối thủ, khiến đối phương bấn loạn đến mức tẩu hỏa nhập ma.', 'Huyen', 'cong-phap', 'Ma Đạo Bí Tịch', 'Mê Hồn & Tâm Ma', 10),
  createItem('Nhiên Huyết Độc Linh Thuật', 'Đốt cháy 50% thọ nguyên và máu để tăng vọt 300% sức mạnh trong ngắn hạn.', 'Huyen', 'cong-phap', 'Ma Đạo Bí Tịch', 'Nhiên Huyết Bộc Phát', 12),
  createItem('Huyết Độn Đại Pháp', 'Hóa thành chùm máu đào tẩu ngàn dặm trong chớp mắt khi lâm nguy.', 'Hoang', 'cong-phap', 'Ma Đạo Bí Tịch', 'Nhiên Huyết Bộc Phát', 22),
  createItem('U Mộc Tế Ma Thuật', 'Hiến tế linh hồn sinh linh để triệu hồi ma ma thần từ Cửu U.', 'Dia', 'cong-phap', 'Ma Đạo Bí Tịch', 'Hiến Tế Triệu Hóa', 5),
  createItem('Cửu U Triệu Hồn Khúc', 'Đánh thức các oán linh dưới lòng đất đứng lên chiến đấu.', 'Huyen', 'cong-phap', 'Ma Đạo Bí Tịch', 'Hiến Tế Triệu Hóa', 10),
  createItem('Khôi Lỗi Và Luyện Thi Thuật', 'Bí thuật chế tạo con rối chiến đấu và luyện hóa xác chết tu sĩ thành Âm Thi bất tử.', 'Dia', 'cong-phap', 'Ma Đạo Bí Tịch', 'Khôi Lỗi & Luyện Thi', 6),
  createItem('Trùng Thuật Và Độc Nghệ', 'Bí thuật nuôi dưỡng Vạn Độc Cổ Trùng và phối chế các loại độc dược vô hình vô ảnh.', 'Huyen', 'cong-phap', 'Ma Đạo Bí Tịch', 'Trùng Thuật & Độc Nghệ', 11),

  // ========================================================
  // II. ĐAN DƯỢC & LINH THẢO (dan-duoc)
  // ========================================================
  // 1. Đan Dược Đột Phá
  createItem('Tẩy Tủy Đan', 'Lọc sạch tạp chất trong cơ thể, cải thiện căn cốt cho người mới bắt đầu.', 'Hoang', 'dan-duoc', 'Đan Dược Đột Phá', 'Sơ Cấp', 35),
  createItem('Tụ Linh Đan', 'Tăng tốc độ hấp thụ linh khí gấp 3 lần trong lúc tọa thiền.', 'Hoang', 'dan-duoc', 'Đan Dược Đột Phá', 'Sơ Cấp', 40),
  createItem('Thông Mạch Đan', 'Khai thông các kinh mạch bế tắc, hỗ trợ nạp khí nhập thể.', 'Hoang', 'dan-duoc', 'Đan Dược Đột Phá', 'Sơ Cấp', 30),
  createItem('Trúc Cơ Đan', 'Thánh dược bắt buộc phải có để đột phá từ Luyện Khí lên Trúc Cơ.', 'Huyen', 'dan-duoc', 'Đan Dược Đột Phá', 'Trung Cấp', 20),
  createItem('Thanh Tâm Định Thần Đan', 'Trừ khử tâm ma, giữ tinh thần tỉnh táo khi xung kích cảnh giới mới.', 'Huyen', 'dan-duoc', 'Đan Dược Đột Phá', 'Trung Cấp', 15),
  createItem('Ngưng Kim Đan', 'Tăng 50% tỷ lệ kết đan thành công, bảo vệ kinh mạch không bị linh lực bộc phát.', 'Dia', 'dan-duoc', 'Đan Dược Đột Phá', 'Cao Cấp', 8),
  createItem('Nguyên Anh Đan', 'Hỗ trợ phá đan hóa anh, tăng cơ hội đột phá Nguyên Anh Kỳ.', 'Thien', 'dan-duoc', 'Đan Dược Đột Phá', 'Cao Cấp', 4),
  createItem('Hóa Thần Đan', 'Bảo vật vô giá giúp thần thức hòa nhập thiên địa, đột phá Hóa Thần cảnh.', 'Thien', 'dan-duoc', 'Đan Dược Đột Phá', 'Cao Cấp', 2),

  // 2. Đan Dược Hỗ Trợ
  createItem('Cửu Chuyển Hoàn Hồn Đan', 'Keo kiệt kéo lại một mạng sống từ tay Diêm Vương miễn là thần hồn chưa diệt.', 'Thien', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Hồi Phục', 2),
  createItem('Tối Linh Hồi Khí Đan', 'Khôi phục ngay lập tức 80% linh lực đã cạn kiệt trong giao chiến.', 'Dia', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Hồi Phục', 12),
  createItem('Hồi Xuân Đan', 'Chữa lành các vết thương bên ngoài và vết thương nội tạng nhẹ.', 'Hoang', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Hồi Phục', 50),
  createItem('Bát Nhã Định Tâm Đan', 'Trừ khử ảo giác, xoa dịu thần thức bị chấn thương nặng.', 'Dia', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Tịnh Tâm', 7),
  createItem('Tịnh Thần Đan', 'Nâng cao khả năng tập trung, giúp khôi phục nhanh thần thức.', 'Huyen', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Tịnh Tâm', 18),
  createItem('Bạo Giáp Đan', 'Tăng 100% lực tấn công trong 15 phút, sau đó suy yếu 24 giờ.', 'Huyen', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Bộc Phát', 14),
  createItem('Cuồng Phong Đan', 'Tăng vọt tốc độ di chuyển và thân pháp gấp đôi trong thời gian ngắn.', 'Hoang', 'dan-duoc', 'Đan Dược Hỗ Trợ', 'Bộc Phát', 25),

  // 3. Linh Thảo, Dược Liệu
  createItem('Bách Niên Linh Chi', 'Dược liệu cơ bản dùng luyện chế các loại đan dược sơ cấp.', 'Hoang', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Dược Liệu Cơ Bản', 30),
  createItem('Vạn Niên Tuyết Liên', 'Mọc trên đỉnh núi tuyết vĩnh cửu, tích tụ hàn khí ngàn năm dùng tịnh hóa cơ thể.', 'Dia', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Hàn Băng Thần Thảo', 6),
  createItem('Thiên Niên Cửu Nhập Long Nữ Thảo', 'Dược liệu huyền thoại tích tụ khí huyết của Rồng, nguyên liệu chính luyện Nguyên Anh Đan.', 'Thien', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Chân Long Kỳ Thảo', 3),
  createItem('Hỏa Hoàng Quả', 'Tích tụ hỏa tinh linh khí, giúp tu sĩ hệ Hỏa tăng cường pháp lực.', 'Huyen', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Hỏa Tinh Quả', 16),
  createItem('Băng Tinh Tuyết Hoa', 'Hoa tuyết trong suốt như pha lê, dùng chế tạo đan dược giải độc và tịnh tâm.', 'Huyen', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Hàn Băng Thần Thảo', 15),
  createItem('Nguyện Lực Linh Cốt', 'Xương cốt thấm đượm nguyện lực thiên địa, dùng cho các bài thuốc gia tăng căn cốt.', 'Dia', 'dan-duoc', 'Linh Thảo, Dược Liệu', 'Linh Cốt', 5),

  // ========================================================
  // III. PHÁP BẢO & BINH KHÍ (phap-bao)
  // ========================================================
  // 1. Công Kích Pháp Bảo
  createItem('Trảm Tiên Kiếm', 'Thần kiếm chém sắt như bùn, có thể chém đứt pháp bảo đối phương.', 'Thien', 'phap-bao', 'Công Kích Pháp Bảo', 'Kiếm Đạo Binh Khí', 1),
  createItem('Thanh Liên Phi Kiếm', 'Bộ kiếm nhẹ như cánh sen, tốc độ bay xé gió cực nhanh.', 'Dia', 'phap-bao', 'Công Kích Pháp Bảo', 'Kiếm Đạo Binh Khí', 6),
  createItem('Tử Điện Kiếm', 'Lưỡi kiếm tích tụ lôi điện, tạo hiệu ứng làm tê liệt kẻ thù.', 'Huyen', 'phap-bao', 'Công Kích Pháp Bảo', 'Kiếm Đạo Binh Khí', 12),
  createItem('Bát Sái Thần Thương', 'Trường thương bằng tinh thiết, nặng ngàn cân, thích hợp cho Thể Tu.', 'Dia', 'phap-bao', 'Công Kích Pháp Bảo', 'Đao, Thương, Côn, Phủ', 5),
  createItem('Xích Diễm Cuồng Đao', 'Đao pháp bộc phát ngọn lửa đỏ rực, quét qua hóa thành tro bụi.', 'Huyen', 'phap-bao', 'Công Kích Pháp Bảo', 'Đao, Thương, Côn, Phủ', 10),
  createItem('Hỗn Nguyên Kim Côn', 'Thần côn biến hóa dài ngắn tùy ý, đập tan vách đá dễ dàng.', 'Dia', 'phap-bao', 'Công Kích Pháp Bảo', 'Đao, Thương, Côn, Phủ', 5),
  createItem('Cửu Thiên Phần Thiên Lệnh', 'Lệnh bài điều khiển hỏa biển đốt cháy ngàn dặm.', 'Thien', 'phap-bao', 'Công Kích Pháp Bảo', 'Kỳ Môn Binh Khí', 2),
  createItem('Vô Hình Phi Đao Trận', 'Trận phi đao ẩn hình trong không trung, hạ sát kẻ địch vô thanh vô ảnh.', 'Dia', 'phap-bao', 'Công Kích Pháp Bảo', 'Kỳ Môn Binh Khí', 6),
  createItem('Luyện Cốt Phiên', 'Pháp bảo ma đạo hấp thụ oán khí để triệu hồi bộ xương chiến đấu.', 'Huyen', 'phap-bao', 'Công Kích Pháp Bảo', 'Kỳ Môn Binh Khí', 10),

  // 2. Hộ Thân Pháp Bảo
  createItem('Huyền Vũ Bảo Giáp', 'Đúc từ vảy Linh Thú Huyền Vũ, đao thương bất nhập, kháng 80% sát thương.', 'Thien', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Giáp Trụ & Y Phục', 2),
  createItem('Bách Hạc Tiên Y', 'Áo lông hạc nhẹ nhàng, giảm nhẹ sát thương và hỗ trợ thân pháp nhẹ như mây.', 'Dia', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Giáp Trụ & Y Phục', 7),
  createItem('Tử Tiêu Đạo Bào', 'Trang phục tu sĩ kháng bụi bẩn, tự động đẩy lùi các đòn tấn công sơ cấp.', 'Huyen', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Giáp Trụ & Y Phục', 15),
  createItem('Thái Cực Bát Quái Kính', 'Kính hộ thân phản xạ lại các đòn tấn công pháp thuật.', 'Dia', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Khiên & Kính Hộ Thân', 6),
  createItem('Ngọc Phù Hộ Thân', 'Tự động vỡ ra để đỡ 1 đòn chí mạng cho chủ nhân.', 'Hoang', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Khiên & Kính Hộ Thân', 25),
  createItem('Cửu Long Đỉnh', 'Bảo đỉnh thần cổ thả xuống 9 luồng khí rồng bảo vệ toàn diện.', 'Thien', 'phap-bao', 'Hộ Thân Pháp Bảo', 'Khiên & Kính Hộ Thân', 2),

  // 3. Không Gian Pháp Bảo
  createItem('Túi Trữ Vật Sơ Cấp', 'Không gian chứa đồ khoảng 10 mét khối.', 'Hoang', 'phap-bao', 'Không Gian Pháp Bảo', 'Túi & Nhẫn Trữ Vật', 30),
  createItem('Nhẫn Khung Thương', 'Nhẫn đeo tay chứa được cả một ngọn núi nhỏ bên trong.', 'Dia', 'phap-bao', 'Không Gian Pháp Bảo', 'Túi & Nhẫn Trữ Vật', 6),
  createItem('Thâm Lam Trữ Vật Yêu Đới', 'Thắt lưng lưu trữ vật phẩm thời trang và tiện lợi.', 'Huyen', 'phap-bao', 'Không Gian Pháp Bảo', 'Túi & Nhẫn Trữ Vật', 12),
  createItem('Bích Ngọc Di Động Động Phủ', 'Tòa nhà di động đầy đủ linh trận Tụ Linh, phòng ngủ và phòng luyện đan.', 'Thien', 'phap-bao', 'Không Gian Pháp Bảo', 'Động Phủ Di Động', 2),

  // 4. Ngự Không Pháp Bảo
  createItem('Vương Xuyên Phi Thuyền', 'Thuyền lớn chở được 50 người, bay xuyên qua các tầng mây.', 'Dia', 'phap-bao', 'Ngự Không Pháp Bảo', 'Phi Thuyền & Bảo Tọa', 5),
  createItem('Cửu Long Kim Liễn', 'Xe kéo bởi 9 con rồng, thể hiện uy nghiêm tối cao.', 'Thien', 'phap-bao', 'Ngự Không Pháp Bảo', 'Phi Thuyền & Bảo Tọa', 1),
  createItem('Thất Phong Luân', 'Bánh xe đạp dưới chân giúp lướt đi trong gió cấp tốc.', 'Huyen', 'phap-bao', 'Ngự Không Pháp Bảo', 'Phi Hành Khí Cá Nhân', 16),
  createItem('Hỏa Phượng Vũ Dực', 'Đôi cánh lửa gắn sau lưng giúp bay lượn tự do như chim Phượng Hoàng.', 'Dia', 'phap-bao', 'Ngự Không Pháp Bảo', 'Phi Hành Khí Cá Nhân', 6),

  // ========================================================
  // IV. LINH VẬT (linh-vat)
  // ========================================================
  // 1. Linh Sủng, Yêu Thú
  createItem('Thần Diệu Hỏa Hồ', 'Cáo lửa linh thông, biết nhả lửa và biến hóa quyến rũ kẻ địch.', 'Huyen', 'linh-vat', 'Linh Sủng, Yêu Thú', 'Ấu Thú Đẳng Cấp', 8),
  createItem('Lôi Đình Cửu Hạc', 'Chim hạc mang sức mạnh sấm sét, có thể dùng làm phi hành linh sủng.', 'Dia', 'linh-vat', 'Linh Sủng, Yêu Thú', 'Ấu Thú Đẳng Cấp', 5),
  createItem('Kim Sĩ Bạt Ma Độc Cụ', 'Trâu một sừng sức mạnh vô song, hỗ trợ xông phá trận hình.', 'Dia', 'linh-vat', 'Linh Sủng, Yêu Thú', 'Trụ Thú & Tọa Kỵ', 4),
  createItem('Địa Hỏa Xích Long Thú', 'Linh thú mang huyết thanh Chân Long, phun lửa địa hỏa thiêu rụi quân địch.', 'Thien', 'linh-vat', 'Linh Sủng, Yêu Thú', 'Trụ Thú & Tọa Kỵ', 2),

  // 2. Linh Tài, Tạp Vật
  createItem('Huyền Thiết Tinh', 'Tinh hoa sắt đen dùng rèn luyện các loại binh khí bén nhọn.', 'Hoang', 'linh-vat', 'Linh Tài, Tạp Vật', 'Tinh Thạch & Khoáng Vật', 40),
  createItem('Hỗn Độn Thạch', 'Đá chứa khí khởi nguyên của vũ trụ, nguyên liệu đúc Pháp bảo cao cấp.', 'Thien', 'linh-vat', 'Linh Tài, Tạp Vật', 'Tinh Thạch & Khoáng Vật', 3),
  createItem('Thiên Cương Sắt', 'Kháng ma thuật tốt, dùng đúc giáp trụ hộ thân.', 'Huyen', 'linh-vat', 'Linh Tài, Tạp Vật', 'Tinh Thạch & Khoáng Vật', 20),
  createItem('Bát Quái Trận Kỳ', 'Cờ trận dùng để dựng trận pháp ẩn hình hoặc bảo vệ động phủ lập tức.', 'Huyen', 'linh-vat', 'Linh Tài, Tạp Vật', 'Pháp Trận & Phù Lục', 15),
  createItem('Chu Sa Tiên Phù', 'Bùa linh vẽ bằng chu sa dùng để định thân hoặc gia tốc.', 'Hoang', 'linh-vat', 'Linh Tài, Tạp Vật', 'Pháp Trận & Phù Lục', 50),
  createItem('Địa Hỏa Lô', 'Lò luyện đan/luyện khí tích tụ hỏa tinh từ lòng đất, tăng 20% tỷ lệ luyện chế thành công.', 'Dia', 'linh-vat', 'Linh Tài, Tạp Vật', 'Pháp Trận & Phù Lục', 6)
];

async function runSeed() {
  await connectDB();
  console.log('🔮 Bắt đầu đồng bộ toàn bộ bảo vật mới cho Vạn Bảo Các...');

  // 1. Tìm hoặc tạo tài khoản Admin "Bất Giới"
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('phatotrongtam', 10);
    admin = await User.create({
      name: 'Bất Giới',
      email: 'batgioi@vanbaocac.com',
      password: hashedPassword,
      role: 'admin',
      linhThach: 999999,
      dongPhu: 'Vạn Bảo Các Tổng Điện',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80'
    });
    console.log('👑 Đã tạo mới tài khoản Admin Bất Giới!');
  } else {
    console.log(`👑 Đã tìm thấy Admin hiện hữu: ${admin.name} (${admin._id})`);
  }

  // 2. Tạo hoặc đồng bộ 4 tài khoản Seller chuyên biệt cho 4 danh mục
  const sellersConfig = [
    {
      category: 'cong-phap',
      name: 'Thiên Thư Các Chủ',
      email: 'congphap@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Thiên Thư Các'
    },
    {
      category: 'dan-duoc',
      name: 'Bách Thảo Đan Vương',
      email: 'danduoc@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Bách Thảo Đan Các'
    },
    {
      category: 'phap-bao',
      name: 'Vạn Kiếm Tông Chủ',
      email: 'phapbao@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Vạn Kiếm Luyện Khí Phủ'
    },
    {
      category: 'linh-vat',
      name: 'Vạn Thú Trang Chủ',
      email: 'linhvat@vanbaocac.com',
      password: 'seller123',
      dongPhu: 'Vạn Thú Sơn Trang'
    }
  ];

  const sellerMap = {};
  for (const cfg of sellersConfig) {
    let seller = await User.findOne({ email: cfg.email });
    const hashedPassword = await bcrypt.hash(cfg.password, 10);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cfg.name)}`;

    if (!seller) {
      seller = await User.create({
        name: cfg.name,
        email: cfg.email,
        password: hashedPassword,
        role: 'seller',
        dongPhu: cfg.dongPhu,
        linhThach: 50000,
        avatar
      });
      console.log(`🏪 Đã tạo mới Seller [${cfg.name}] phụ trách [${cfg.category}]`);
    } else {
      seller.role = 'seller';
      seller.dongPhu = cfg.dongPhu;
      seller.avatar = avatar;
      await seller.save();
      console.log(`🏪 Đã đồng bộ Seller [${seller.name}] (${seller._id})`);
    }
    sellerMap[cfg.category] = seller._id;
  }

  // 3. Gán seller tương ứng cho từng sản phẩm theo category
  const productsWithSeller = ALL_PRODUCTS_DATA.map(item => ({
    ...item,
    seller: sellerMap[item.category] || admin._id
  }));

  // 4. Xóa toàn bộ bảo vật cũ và thêm toàn bộ bảo vật mới
  if (isMongo()) {
    await ProductModel.deleteMany({});
    const inserted = await ProductModel.insertMany(productsWithSeller);
    console.log(`✨ Đã nạp thành công ${inserted.length} bảo vật mới vào MongoDB Atlas!`);
  } else {
    const fallback = getFallbackData();
    fallback.products = [];
    for (const p of productsWithSeller) {
      await Product.create(p);
    }
    console.log(`✨ Đã nạp thành công ${productsWithSeller.length} bảo vật mới vào Bộ lưu trữ!`);
  }

  console.log('🎉 Toàn bộ danh mục và bảo vật mới đã được cập nhật hoàn tất!');
  if (require.main === module) {
    process.exit(0);
  }
}

module.exports = runSeed;

if (require.main === module) {
  runSeed().catch(err => {
    console.error('Lỗi khởi tạo thế giới:', err);
    process.exit(1);
  });
}
