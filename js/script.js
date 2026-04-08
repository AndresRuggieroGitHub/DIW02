document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "lexiCart";

  const getCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  };

  const cartTotalItems = (cart) => cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotalPrice = (cart) => cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const formatEur = (n) => `${Number(n).toFixed(2)} EUR`;

  const showAlert = (message, type = "success") => {
    let alertBox = document.getElementById("globalAlert");
    if (!alertBox) {
      alertBox = document.createElement("div");
      alertBox.id = "globalAlert";
      alertBox.className = "global-alert";
      document.body.appendChild(alertBox);
    }

    alertBox.innerHTML = `<div class="alert alert-${type} mb-0" role="status">${message}</div>`;

    clearTimeout(showAlert.timer);
    showAlert.timer = setTimeout(() => {
      alertBox.innerHTML = "";
    }, 2200);
  };

  const updateCartBadges = () => {
    const count = cartTotalItems(getCart());
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
    });
  };

  const addToCart = (product) => {
    const cart = getCart();
    const existing = cart.find((p) => p.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }

    saveCart(cart);
    updateCartBadges();
    renderCartDrawer();
  };

  const removeFromCart = (id) => {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    updateCartBadges();
    renderCartDrawer();
    renderCartPage();
  };

  const changeQty = (id, delta) => {
    const cart = getCart();
    const item = cart.find((p) => p.id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
      const next = cart.filter((p) => p.id !== id);
      saveCart(next);
    } else {
      saveCart(cart);
    }

    updateCartBadges();
    renderCartDrawer();
    renderCartPage();
  };

  const clearCart = () => {
    saveCart([]);
    updateCartBadges();
    renderCartDrawer();
    renderCartPage();
  };

  const createCartDrawer = () => {
    if (document.getElementById("cartDrawer")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "cart-drawer-backdrop";
    backdrop.id = "cartDrawerBackdrop";

    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.id = "cartDrawer";
    drawer.setAttribute("aria-label", "Resumen del carrito");

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <strong>Carrito</strong>
        <button class="btn btn-sm btn-outline-secondary" type="button" id="closeCartDrawer">Cerrar</button>
      </div>
      <div class="cart-drawer-body" id="cartDrawerBody"></div>
      <div class="cart-drawer-footer">
        <div class="cart-total-line">
          <span>Total</span>
          <span id="cartDrawerTotal">0.00 EUR</span>
        </div>
        <a class="btn btn-primary w-100" href="carrito.html">Ir al carrito</a>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    backdrop.addEventListener("click", () => toggleCartDrawer(false));
    drawer.querySelector("#closeCartDrawer").addEventListener("click", () => toggleCartDrawer(false));
  };

  const toggleCartDrawer = (open) => {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartDrawerBackdrop");
    if (!drawer || !backdrop) return;

    drawer.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
  };

  const renderCartDrawer = () => {
    const body = document.getElementById("cartDrawerBody");
    const total = document.getElementById("cartDrawerTotal");
    if (!body || !total) return;

    const cart = getCart();

    if (cart.length === 0) {
      body.innerHTML = '<p class="cart-empty">Tu carrito esta vacio.</p>';
      total.textContent = formatEur(0);
      return;
    }

    body.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-drawer-item">
            <div>
              <strong>${item.name}</strong><br>
              <small>Cantidad: ${item.qty}</small>
            </div>
            <div>${formatEur(item.price * item.qty)}</div>
          </div>
        `
      )
      .join("");

    total.textContent = formatEur(cartTotalPrice(cart));
  };

  const setupCartTriggers = () => {
    createCartDrawer();
    renderCartDrawer();

    document.querySelectorAll("[data-cart-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        renderCartDrawer();
        toggleCartDrawer(true);
      });
    });
  };

  const setupAddToCartButtons = () => {
    document.querySelectorAll("[data-add-cart]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: Number(btn.dataset.price)
        };

        addToCart(product);
        showAlert("Producto anadido al carrito");
      });
    });
  };

  let pendingRemoveId = null;

  const renderCartPage = () => {
    const tbody = document.getElementById("cartItems");
    const total = document.getElementById("cartTotal");
    if (!tbody || !total) return;

    const cart = getCart();

    if (cart.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay productos en el carrito.</td></tr>';
      total.textContent = formatEur(0);
      return;
    }

    tbody.innerHTML = cart
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>
              <div class="cart-qty-controls">
                <button class="qty-btn" type="button" data-qty-minus="${item.id}" aria-label="Restar cantidad">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" type="button" data-qty-plus="${item.id}" aria-label="Sumar cantidad">+</button>
              </div>
            </td>
            <td>${formatEur(item.price)}</td>
            <td>${formatEur(item.price * item.qty)}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" type="button" data-remove-id="${item.id}">Eliminar</button>
            </td>
          </tr>
        `
      )
      .join("");

    total.textContent = formatEur(cartTotalPrice(cart));
  };

  const setupCartPageEvents = () => {
    const cartPage = document.querySelector("[data-cart-page]");
    if (!cartPage) return;

    const tbody = document.getElementById("cartItems");
    const clearButton = document.getElementById("clearCart");
    const confirmBtn = document.getElementById("confirmRemoveBtn");
    const modalElement = document.getElementById("confirmRemoveModal");
    const bsModal = modalElement && window.bootstrap ? new bootstrap.Modal(modalElement) : null;

    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const plusId = e.target.getAttribute("data-qty-plus");
        const minusId = e.target.getAttribute("data-qty-minus");
        const removeId = e.target.getAttribute("data-remove-id");

        if (plusId) {
          changeQty(plusId, 1);
          return;
        }

        if (minusId) {
          changeQty(minusId, -1);
          return;
        }

        if (removeId) {
          pendingRemoveId = removeId;
          if (bsModal) {
            bsModal.show();
          } else if (confirm("Quieres eliminar este producto del carrito?")) {
            removeFromCart(removeId);
          }
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (!pendingRemoveId) return;
        removeFromCart(pendingRemoveId);
        pendingRemoveId = null;
        if (bsModal) bsModal.hide();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        clearCart();
        showAlert("Carrito vaciado", "warning");
      });
    }

    renderCartPage();
  };

  const setupNavToggle = () => {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav-left");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  };

  const setupScrollButton = () => {
    const btnSubir = document.getElementById("btnSubir");
    if (!btnSubir) return;

    const onScroll = () => {
      btnSubir.style.display = window.scrollY > 200 ? "block" : "none";
    };

    onScroll();
    window.addEventListener("scroll", onScroll);

    btnSubir.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const setupKeyboardShortcut = () => {
    document.addEventListener("keydown", (e) => {
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (isTyping) return;

      if (e.key.toLowerCase() === "t") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        showAlert("Atajo: volver arriba");
      }
    });
  };

  const setupObserver = () => {
    const items = document.querySelectorAll(".scroll-animado");
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
  };

  const setupActionButtons = () => {
    document.querySelectorAll(".accion").forEach((btn) => {
      btn.addEventListener("click", () => {
        showAlert("Practica iniciada");
      });
    });
  };

  setupObserver();
  setupNavToggle();
  setupScrollButton();
  setupKeyboardShortcut();
  setupActionButtons();
  setupCartTriggers();
  setupAddToCartButtons();
  setupCartPageEvents();
  updateCartBadges();
});