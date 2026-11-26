window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').classList.add('done');
    }, 900);
  });

  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

/* ---------- Cart ---------- */
(function () {
  var WHATSAPP = '2349015387982';
  var EMAIL = 'Ferryspice03@gmail.com';
  var STORE_KEY = 'ferryhaven-cart';
  var CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { cart = []; }

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {} }
  function parsePrice(text) { return parseFloat(String(text).replace(/[^0-9.]/g, '')) || 0; }
  function money(n) {
    return '#' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // Add a size picker and an Add to cart button to every product card
  document.querySelectorAll('.collection .card').forEach(function (card) {
    var tag = card.querySelector('.tag');
    var name = card.querySelector('h3').textContent.trim();
    var category = card.querySelector('.coord').textContent.trim();
    var price = parsePrice(card.querySelector('.price').textContent);
    var img = card.querySelector('img').getAttribute('src');
    var isHeadwear = /headwear/i.test(category);

    var buy = document.createElement('div');
    buy.className = 'buy';
    var select = null;
    if (!isHeadwear) {
      select = document.createElement('select');
      select.setAttribute('aria-label', 'Size for ' + name);
      CLOTHING_SIZES.forEach(function (s) {
        var o = document.createElement('option'); o.value = s; o.textContent = s;
        if (s === 'M') o.selected = true;
        select.appendChild(o);
      });
      buy.appendChild(select);
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn dark add-btn';
    btn.textContent = 'Add to cart';
    btn.addEventListener('click', function () {
      var size = select ? select.value : 'One size';
      addItem({ name: name, price: price, img: img, size: size });
      btn.textContent = 'Added';
      btn.classList.add('added');
      setTimeout(function () { btn.textContent = 'Add to cart'; btn.classList.remove('added'); }, 1400);
    });
    buy.appendChild(btn);
    tag.appendChild(buy);
  });

  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  var toggle = document.getElementById('cartToggle');
  var itemsEl = document.getElementById('cartItems');
  var emptyEl = document.getElementById('cartEmpty');
  var footEl = document.getElementById('cartFoot');
  var toast = document.getElementById('cartToast');
  var toastTimer;

  function addItem(item) {
    var existing = cart.find(function (i) { return i.name === item.name && i.size === item.size; });
    if (existing) existing.qty += 1;
    else { item.qty = 1; cart.push(item); }
    save(); render();
    showToast(item.name + (item.size !== 'One size' ? ' (' + item.size + ')' : '') + ' added to cart');
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function orderText() {
    var lines = ['Hi Ferry Haven, I\'d like to place an order:', ''];
    cart.forEach(function (i) {
      lines.push('- ' + i.name + ' | Size: ' + i.size + ' | Qty: ' + i.qty + ' | ' + money(i.price * i.qty));
    });
    lines.push('', 'Subtotal: ' + money(total()), '', 'Please confirm availability, shipping and how to pay. Thanks!');
    return lines.join('\n');
  }

  function total() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }

  function render() {
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    document.getElementById('cartCount').textContent = count;
    itemsEl.innerHTML = cart.map(function (i, idx) {
      return '<div class="cart-item">' +
        '<img src="' + esc(i.img) + '" alt="">' +
        '<div><h4>' + esc(i.name) + '</h4><span class="meta">Size: ' + esc(i.size) + '</span>' +
        '<div class="qty"><button type="button" data-act="dec" data-i="' + idx + '" aria-label="Decrease quantity">&minus;</button>' +
        '<span>' + i.qty + '</span>' +
        '<button type="button" data-act="inc" data-i="' + idx + '" aria-label="Increase quantity">+</button></div>' +
        '<button type="button" class="cart-remove" data-act="rm" data-i="' + idx + '">Remove</button></div>' +
        '<span class="line-price">' + money(i.price * i.qty) + '</span>' +
        '</div>';
    }).join('');
    var empty = cart.length === 0;
    emptyEl.style.display = empty ? '' : 'none';
    footEl.style.display = empty ? 'none' : '';
    document.getElementById('cartTotal').textContent = money(total());
    var text = orderText();
    document.getElementById('cartWhatsApp').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    document.getElementById('cartEmail').href = 'mailto:' + EMAIL + '?subject=' +
      encodeURIComponent('Order — Ferry Haven') + '&body=' + encodeURIComponent(text);
  }

  itemsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var i = +b.getAttribute('data-i');
    var act = b.getAttribute('data-act');
    if (act === 'inc') cart[i].qty += 1;
    if (act === 'dec') cart[i].qty -= 1;
    if (act === 'rm' || cart[i].qty < 1) cart.splice(i, 1);
    save(); render();
  });

  document.getElementById('cartClear').addEventListener('click', function () { cart = []; save(); render(); });

  function openCart() {
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false; toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('cart-open');
    document.getElementById('cartClose').focus();
  }
  function closeCart() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true; toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cart-open');
  }
  toggle.addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  render();
})();

/* ---------- Jerseys: tap (or Enter) shows the back ---------- */
document.querySelectorAll('.img-wrap.flip').forEach(function (w) {
  function toggle() { w.classList.toggle('show-back'); }
  w.addEventListener('click', function () { if (!window.matchMedia('(hover:hover)').matches) toggle(); });
  w.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});
