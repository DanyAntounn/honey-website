Honey Shop — Static Website

Overview

A mobile-first static website to showcase natural honey sold in 1kg jars and enable ordering via WhatsApp.

How to open

- Open `index.html` in your browser.
- Or use Live Server in VS Code and open the site.

Where to change business info

- Edit `js/config.js`.
  - `businessName`, `whatsappNumber`, `phoneNumber`, `instagramUrl`, `currency`.
  - IMPORTANT: Put WhatsApp number without `+`, e.g. `96171234567`.

Where products are defined

- Edit `js/products.js`.
  - Add or remove objects in the `products` array.
  - Fields: `id`, `name`, `description`, `weight`, `price`, `image`, `category`, `available`, `badge`.

Where to change images

- Replace files inside the `images/` folder using the filenames referenced in the HTML and `products.js`.
- If images are missing, the layout will still work; the broken images will show a subtle fallback.

How the cart works

- Cart is stored in `localStorage` under `honey_shop_cart_v1`.
- Functions are in `js/script.js`:
  - `saveCart()`, `loadCart()`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `renderCart()`, `calculateTotal()`.
- Cart persists after refresh.

How WhatsApp ordering works

- Quick product orders: "Order Now" on a product opens WhatsApp with a message for that product and selected quantity.
- Full cart order: "Order via WhatsApp" in the Honey Basket opens WhatsApp with a formatted message including all cart items, totals, and placeholders for name and delivery location.
- WhatsApp URL is generated using `businessConfig.whatsappNumber` and `encodeURIComponent()`.

Uploading to hosting

- This is a static site. Upload the entire `honey-shop` folder to any static hosting provider (Netlify, GitHub Pages, Surge, Vercel static, S3, etc.).
- Ensure `index.html` is the entry file.

Notes and tips

- The design is mobile-first and responsive. Use the CSS in `css/style.css` to tweak colors and spacing.
- Prefer small optimized images for faster mobile performance.
- Replace placeholder testimonials and images with real content.
- To add more products, increment `id` values and add items to `js/products.js`.

Questions or help

If you want me to add more features (search, filters, payment links), tell me which one and I can extend the site.
