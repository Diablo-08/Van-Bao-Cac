const fetch = globalThis.fetch;

async function verify() {
  // 1. Login as admin
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "Bất Giới", password: "phatotrongtam" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("✓ Admin logged in:", loginData.user.name);

  // 2. Verify admin inventory is empty
  const ordersRes = await fetch("http://localhost:5000/api/orders/my-orders", {
    headers: { "Authorization": "Bearer " + token }
  });
  const ordersData = await ordersRes.json();
  console.log("✓ Admin orders count:", ordersData.orders.length, "(should be 0)");
  if (ordersData.orders.length !== 0) throw new Error("Admin inventory not reset!");

  // 3. Check productDetailView for duplicate emojis
  const pdvRes = await fetch("http://localhost:5000/js/views/productDetailView.js");
  const pdvCode = await pdvRes.text();
  
  // Check that the button text no longer has ❤️ emoji (icon already present via fa-heart)
  if (pdvCode.includes("❤️ Thêm vào Yêu Thích")) {
    throw new Error("Still has duplicate ❤️ emoji in Yêu Thích button!");
  }
  console.log("✓ No duplicate ❤️ in Yêu Thích button text");

  // Check that the button text no longer has 🛒 emoji (icon already present via fa-cart-shopping)
  if (pdvCode.includes("🛒 Thêm vào Giỏ Hàng")) {
    throw new Error("Still has duplicate 🛒 emoji in Giỏ Hàng button!");
  }
  console.log("✓ No duplicate 🛒 in Giỏ Hàng button text");

  // 4. Check inventoryView uses live product data for image sync
  const invRes = await fetch("http://localhost:5000/js/views/inventoryView.js");
  const invCode = await invRes.text();
  if (!invCode.includes("getProducts")) {
    throw new Error("inventoryView should fetch live product data for image sync!");
  }
  console.log("✓ inventoryView fetches live product data for synced images");

  if (!invCode.includes("Hết Hàng")) {
    throw new Error("inventoryView should display out-of-stock status!");
  }
  console.log("✓ inventoryView shows out-of-stock status");

  // 5. Check app.js no longer has duplicate emoji in wishlist toggle
  const appRes = await fetch("http://localhost:5000/js/app.js");
  const appCode = await appRes.text();
  if (appCode.includes("❤️ Thêm vào Yêu Thích")) {
    throw new Error("app.js still has ❤️ emoji in wishlist toggle text!");
  }
  console.log("✓ app.js wishlist toggle text clean");

  console.log("\n🌟 ALL CHECKS PASSED!");
}

verify().catch(err => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
