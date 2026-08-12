/* Main site script: render products, manage cart, WhatsApp integration */

// Simple helper functions
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

// Cart structure: [{id, name, price, qty, weight, image}]
let cart = [];
const CART_KEY = 'honey_shop_cart_v1';

// Elements
const productsEl = qs('#products');
const cartCountEl = qs('#cart-count');
const cartDrawer = qs('#cart-drawer');
const cartItemsEl = qs('#cart-items');
const totalJarsEl = qs('#total-jars');
const estimatedTotalEl = qs('#estimated-total');
const stickyBar = qs('#sticky-order-bar');
const stickyCount = qs('#sticky-count');
const stickyTotal = qs('#sticky-total');
const viewOrderBtn = qs('#view-order');
const btnCart = qs('#btn-cart');
const closeCartBtn = qs('#close-cart');
const clearCartBtn = qs('#clear-cart');
const orderWhatsAppBtn = qs('#order-whatsapp');
const floatingWhatsApp = qs('#floating-whatsapp');
const heroWhatsApp = qs('#hero-whatsapp');
const toast = qs('#toast');
const btnHamburger = qs('#btn-hamburger');
const mobileNav = qs('#mobile-nav');
const yearEl = qs('#year');

// Initialize
function init(){
  yearEl.textContent = new Date().getFullYear();
  renderProducts();
  loadCart();
  bindUI();
  updateCartUI();
}

// Render products from products.js
function renderProducts(){
  productsEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.opacity=0.6"></div>
      <div class="product-info">
        <div class="badge">${p.badge || ''}</div>
        <h4>${p.name}</h4>
        <p class="muted">${p.description}</p>
        <div class="price">${businessConfig.currency}${p.price.toFixed(2)} <small> • ${p.weight.toUpperCase()}</small></div>
        <div class="qty-controls" data-id="${p.id}">
          <button class="qty-decrease" aria-label="Decrease quantity">-</button>
          <input class="qty-input" type="number" min="1" value="1" aria-label="Quantity for ${p.name}">
          <button class="qty-increase" aria-label="Increase quantity">+</button>
        </div>
        <div class="add-row">
          <button class="btn btn-secondary add-to-cart" data-id="${p.id}">Add to Order</button>
          <button class="btn btn-whatsapp quick-order" data-id="${p.id}">Order Now</button>
        </div>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

// UI bindings
function bindUI(){
  // Product quantity controls and actions
  productsEl.addEventListener('click', (e)=>{
    const card = e.target.closest('.product-card');
    if(!card) return;
    const id = parseInt(card.querySelector('.qty-controls').dataset.id,10);
    const input = card.querySelector('.qty-input');
    if(e.target.classList.contains('qty-increase')){ input.value = Math.max(1, parseInt(input.value||1)+1); }
    if(e.target.classList.contains('qty-decrease')){ input.value = Math.max(1, parseInt(input.value||1)-1); }
    if(e.target.classList.contains('add-to-cart')){ addToCart(id, parseInt(input.value||1)); }
    if(e.target.classList.contains('quick-order')){ quickWhatsAppOrder(id, parseInt(input.value||1)); }
  });

  // Open/close cart
  btnCart.addEventListener('click', ()=> toggleCart(true));
  closeCartBtn.addEventListener('click', ()=> toggleCart(false));
  viewOrderBtn && viewOrderBtn.addEventListener('click', ()=> toggleCart(true));

  // Clear cart
  clearCartBtn.addEventListener('click', ()=>{ cart = []; saveCart(); renderCart(); showToast('🧺 Basket cleared'); });

  // Order via WhatsApp from cart
  orderWhatsAppBtn.addEventListener('click', sendWhatsAppOrder);

  // Floating WhatsApp
  floatingWhatsApp.addEventListener('click', (e)=>{
    e.preventDefault();
    const msg = `Hello! 👋%0A%0AI found your honey website and would like to know more about your products. 🍯🐝`;
    const url = `https://wa.me/${businessConfig.whatsappNumber}?text=${msg}`;
    window.open(url,'_blank');
  });

  // Hero WhatsApp
  heroWhatsApp.addEventListener('click', (e)=>{
    const msg = `Hello! 👋%0A%0AI would like to place a honey order.%0A%0APlease let me know about availability and delivery.%0A%0AThank you! 🐝`;
    window.open(`https://wa.me/${businessConfig.whatsappNumber}?text=${msg}`,'_blank');
  });

  // Mobile menu
  btnHamburger.addEventListener('click', ()=>{
    const open = mobileNav.getAttribute('aria-hidden') === 'false';
    mobileNav.setAttribute('aria-hidden', String(open));
    mobileNav.style.display = open ? 'none' : 'block';
  });

  // Smooth close when nav link clicked
  mobileNav.addEventListener('click', (e)=>{ if(e.target.tagName==='A'){ mobileNav.style.display='none'; mobileNav.setAttribute('aria-hidden','true'); } });

  // FAQ accordion
  qsa('.faq-question').forEach(btn =>{
    btn.addEventListener('click', ()=>{
      const open = btn.classList.toggle('open');
      const answer = btn.nextElementSibling;
      if(open){ answer.style.maxHeight = answer.scrollHeight + 'px'; } else { answer.style.maxHeight = null; }
    });
  });

  // Cart item buttons (delegation)
  cartItemsEl.addEventListener('click', (e)=>{
    const id = e.target.closest('[data-id]')?.dataset?.id;
    if(!id) return;
    const pid = parseInt(id,10);
    if(e.target.classList.contains('remove-item')){ removeFromCart(pid); }
    if(e.target.classList.contains('item-increase')){ updateQuantity(pid, getCartItem(pid).qty + 1); }
    if(e.target.classList.contains('item-decrease')){ updateQuantity(pid, getCartItem(pid).qty - 1); }
  });
}

function getCartItem(id){ return cart.find(i=>i.id===id); }

function addToCart(id, qty){
  const p = products.find(x=>x.id===id);
  if(!p) return showToast('Product not found');
  const existing = getCartItem(id);
  if(existing){ existing.qty = Math.max(1, existing.qty + qty); }
  else{ cart.push({id:p.id, name:p.name, price:p.price, qty:qty, weight:p.weight, image:p.image}); }
  saveCart(); renderCart(); showToast('🍯 Added to your Honey Basket!');
}

function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(); renderCart(); }

function updateQuantity(id,newQty){
  newQty = Math.max(1, newQty);
  const item = getCartItem(id);
  if(!item) return;
  item.qty = newQty;
  saveCart(); renderCart();
}

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function loadCart(){ const raw = localStorage.getItem(CART_KEY); if(raw){ try{ cart = JSON.parse(raw); }catch(e){ cart = []; } } else cart = []; renderCart(); }

function calculateTotal(){ let totalJars=0; let totalPrice=0; cart.forEach(i=>{ totalJars += i.qty; totalPrice += i.qty * i.price; }); return {totalJars, totalPrice}; }

function renderCart(){
  cartItemsEl.innerHTML = '';
  if(cart.length===0){ cartItemsEl.innerHTML = `<div class="empty-cart">🐝<p>Your Honey Basket is empty.</p><button class="btn btn-primary" id="explore-honey">Explore Our Honey</button></div>`; qs('#explore-honey')?.addEventListener('click', ()=>{ toggleCart(false); document.querySelector('#our-honey').scrollIntoView({behavior:'smooth'}); }); }
  cart.forEach(item=>{
    const div = document.createElement('div'); div.className='cart-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.style.opacity=0.6">
      <div class="cart-info">
        <strong>${item.name}</strong>
        <div>${businessConfig.currency}${item.price.toFixed(2)} × ${item.qty}</div>
        <div class="qty-controls">
          <button class="item-decrease" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button class="item-increase" data-id="${item.id}">+</button>
          <button class="remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  const totals = calculateTotal();
  totalJarsEl.textContent = totals.totalJars;
  estimatedTotalEl.textContent = `${businessConfig.currency}${totals.totalPrice.toFixed(2)}`;
  cartCountEl.textContent = totals.totalJars;
  stickyCount.textContent = totals.totalJars;
  stickyTotal.textContent = `${businessConfig.currency}${totals.totalPrice.toFixed(2)}`;
  // Show sticky bar when items exist
  if(totals.totalJars>0){ stickyBar.setAttribute('aria-hidden','false'); stickyBar.style.display='flex'; } else { stickyBar.setAttribute('aria-hidden','true'); stickyBar.style.display='none'; }
}

function toggleCart(open){ if(open){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); } else { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); } }

function updateCartUI(){ renderCart(); }

function sendWhatsAppOrder(){
  if(cart.length===0) return showToast('Your basket is empty');
  let lines = [`Hello! 👋\n\nI would like to place a honey order:\n`];
  cart.forEach(i=>{
    lines.push(`🍯 ${i.name}\nQuantity: ${i.qty} jars\nSize: ${i.weight} each\n\n`);
  });
  const totals = calculateTotal();
  lines.push(`Total jars: ${totals.totalJars}\nEstimated total: ${businessConfig.currency}${totals.totalPrice.toFixed(2)}\n\nName:\nDelivery location:\n\nThank you! 🐝`);
  const message = encodeURIComponent(lines.join(''));
  const url = `https://wa.me/${businessConfig.whatsappNumber}?text=${message}`;
  window.open(url,'_blank');
}

function quickWhatsAppOrder(id, qty){
  const p = products.find(x=>x.id===id);
  if(!p) return showToast('Product not found');
  const lines = [`Hello! 👋\n\nI would like to order:\n\n🍯 ${p.name}\n\nQuantity: ${qty} jars\nSize: ${p.weight} each\n\nPlease let me know about availability and delivery.\n\nThank you! 🐝`];
  const message = encodeURIComponent(lines.join(''));
  const url = `https://wa.me/${businessConfig.whatsappNumber}?text=${message}`;
  window.open(url,'_blank');
}

function showToast(text, timeout=2000){ toast.textContent = text; toast.style.display = 'block'; setTimeout(()=>{ toast.style.display='none'; }, timeout); }

// Start
init();
