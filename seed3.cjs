const fs = require('fs');
const envConfig = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});
const processEnv = { ...process.env, ...envConfig };
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = processEnv.VITE_XH_SUPABASE_URL;
const supabaseKey = processEnv.VITE_XH_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Delete previous sample products
  await supabase.from('products').delete().like('name', 'Sản phẩm mẫu độc quyền%');
  await supabase.from('products').delete().like('code', 'SP-GEL-%');
  await supabase.from('products').delete().like('code', 'JD-%');

  // 2. We'll use 3 categories.
  const catNames = ['Kim Cương Viên', 'Trang Sức Cưới', 'Nhẫn Kim Cương'];
  const catIds = [
    'fc651777-4ce7-4641-b40f-f518c4445597',
    '417d953c-a239-4d53-b7e1-d372eeeb2a91',
    'a3715b1f-1a0f-4bbe-b0dc-0aefb65836c2'
  ];


  // 3. Create 21 diamond products, 7 per category
  const products = [];

  const names = [
    // Category 1: Kim Cương Viên
    ['Kim Cương Viên Thiên Nhiên GIA', 'Kim Cương Viên Kiểm Định SJC', 'Kim Cương Nước D Độ Tinh Khiết VVS1', 'Kim Cương Tròn Trắng Tự Nhiên', 'Kim Cương Trái Tim 1 Carat', 'Kim Cương Hình Giọt Nước Tinh Xảo', 'Kim Cương Viên Cắt Excellent'],
    // Category 2: Trang Sức Cưới
    ['Bộ Trang Sức Cưới Đính Kim Cương', 'Nhẫn Cưới Nam Nữ Vàng Trắng', 'Lắc Tay Cô Dâu Kim Cương', 'Dây Chuyền Cưới Trái Tim Bạch Kim', 'Kiềng Cưới Vàng 18K Đính Đá', 'Hoa Tai Cưới Kim Cương', 'Nhẫn Cầu Hôn Solitaire'],
    // Category 3: Nhẫn Kim Cương
    ['Nhẫn Nữ Kim Cương 5li1', 'Nhẫn Nam Đính Kim Cương Tấm', 'Nhẫn Bạch Kim Kim Cương Halo', 'Nhẫn Cầu Hôn Vàng Hồng Tinh Tế', 'Nhẫn Vàng 18K Viền Kim Cương', 'Nhẫn Nữ Kim Cương 6li3', 'Nhẫn Nữ Hoàng Kim Cương GIA']
  ];

  const sizes = ['4li5', '5li1', '5li4', '6li3', '7li2', '8li1'];
  const weights = ['0,40 carat', '0,50 carat', '0,60 carat', '1,20 carat', '1,50 carat'];
  const materials = ['Kim Cương', 'Vàng Trắng 18K', 'Bạch Kim', 'Vàng Hồng'];

  for (let i = 0; i < 21; i++) {
    const catIndex = i % 3; // divide evenly
    const catId = catIds[catIndex];
    // i / 3 gets 0, 1, 2, 3, 4, 5, 6 for the 7 items in each category
    const nameIndex = Math.floor(i / 3);
    const name = names[catIndex][nameIndex] || `Sản phẩm mẫu ${i}`;

    // Price between 10m and 150m
    const price = Math.floor(Math.random() * 140 + 10) * 1000000;
    const isOutOfStock = i % 8 === 0;

    products.push({
      category_id: catId,
      code: `DIA-${catIndex + 1}-${Date.now().toString().slice(-4)}-${i.toString().padStart(2, '0')}`,
      name: name,
      description: `Sản phẩm ${name} hoàn hảo và đẳng cấp, có đầy đủ chứng nhận kiểm định GIA/SJC. Sự lựa chọn tuyệt vời.`,
      listed_price: price,
      promotion_price: null,
      max_discount_percent: Math.floor(Math.random() * 5) + 5, // 5 to 9%
      stock_status: isOutOfStock ? 'out_of_stock' : 'in_stock',
      stock_quantity: isOutOfStock ? 0 : Math.floor(Math.random() * 3 + 1),
      is_visible_ipad: true,
      material: materials[Math.floor(Math.random() * materials.length)],
      weight: weights[Math.floor(Math.random() * weights.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      thumbnail_url: `https://picsum.photos/seed/diamond${Date.now()}${i}/600/300`
    });
  }

  console.log("Inserting diamond products...");
  const { error } = await supabase.from('products').insert(products);
  if (error) {
    console.error("Error inserting products:", error);
  } else {
    console.log('Successfully inserted 21 diamond products.');
  }
}

run();
