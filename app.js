/* EMBER & LEAF — no frameworks required.
   Demo data is stored in this browser only. */

"use strict";

const PRODUCTS = [
  {
    id: "monsoon",
    name: "Monsoon Malabar",
    type: "coffee",
    price: 420,
    badge: "House favourite",
    description: "Full-bodied, low acidity, with dark chocolate and spice.",
    notes: "Dark chocolate · toasted nuts",
    size: "250 g",
    image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "sunrise",
    name: "Sunrise Espresso",
    type: "coffee",
    price: 460,
    badge: "Smooth & balanced",
    description: "A rounded everyday espresso with caramel sweetness.",
    notes: "Caramel · hazelnut · cocoa",
    size: "250 g",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "highland",
    name: "Highland Filter",
    type: "coffee",
    price: 490,
    badge: "Bright & lively",
    description: "A clean, expressive cup for pour-over and filter brewers.",
    notes: "Citrus · brown sugar · florals",
    size: "250 g",
    image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "midnight",
    name: "Midnight Decaf",
    type: "coffee",
    price: 480,
    badge: "Anytime cup",
    description: "A comforting cup with sweetness, without the caffeine.",
    notes: "Milk chocolate · almond",
    size: "250 g",
    image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "earlgrey",
    name: "Citrus Earl Grey",
    type: "tea",
    price: 350,
    badge: "Classic, lifted",
    description: "Black tea with a bright bergamot aroma and citrus finish.",
    notes: "Bergamot · orange peel",
    size: "100 g",
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "jasmine",
    name: "Jasmine Green",
    type: "tea",
    price: 390,
    badge: "Soft & fragrant",
    description: "Delicate green tea scented with a gentle floral lift.",
    notes: "Jasmine · fresh grass",
    size: "100 g",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "chai",
    name: "Warming Masala Chai",
    type: "tea",
    price: 320,
    badge: "A cosy classic",
    description: "Robust black tea with warming, aromatic spices.",
    notes: "Cardamom · ginger · cinnamon",
    size: "100 g",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "mint",
    name: "Garden Mint Herbal",
    type: "tea",
    price: 340,
    badge: "Naturally caffeine-free",
    description: "A refreshing, clean herbal infusion for a slower evening.",
    notes: "Peppermint · spearmint",
    size: "60 g",
    image: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=85"
  }
];

const PACKS = {
  coffee: [
    { label: "250 g", multiplier: 1 },
    { label: "500 g", multiplier: 1.85 },
    { label: "1 kg", multiplier: 3.5 }
  ],
  tea: [
    { label: "50 g", multiplier: 0.55 },
    { label: "100 g", multiplier: 1 },
    { label: "200 g", multiplier: 1.85 }
  ]
};

const state = {
  filter: "all",
  sort: "featured",
  cart: loadJSON("el-cart", []),
  selections: {},
  step: 1
};

let toastTimer;

/* STORAGE AND HELPER FUNCTIONS */

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Local storage unavailable", error);
  }
}

function money(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function productById(id) {
  return PRODUCTS.find(product => product.id === id);
}

function packOptions(product, selected = "") {
  return PACKS[product.type]
    .map(pack => `
      <option
        value="${pack.label}"
        ${selected === pack.label ? "selected" : ""}
      >
        ${pack.label}
      </option>
    `)
    .join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* PRODUCT CATALOGUE */

function getVisibleProducts() {
  let products = PRODUCTS.filter(product =>
    state.filter === "all" || product.type === state.filter
  );

  if (state.sort === "price-low") {
    products.sort((a, b) => a.price - b.price);
  }

  if (state.sort === "price-high") {
    products.sort((a, b) => b.price - a.price);
  }

  if (state.sort === "name") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  return products;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");

  if (!grid) return;

  grid.innerHTML = getVisibleProducts().map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80'"
        >

        <span class="product-badge">
          ${escapeHTML(product.badge)}
        </span>

        <button
          class="quick-add"
          data-add="${product.id}"
          aria-label="Add ${escapeHTML(product.name)} to bag"
        >+</button>
      </div>

      <div class="product-info">
        <p class="product-type">
          ${product.type === "coffee" ? "SPECIALTY COFFEE" : "LOOSE-LEAF TEA"}
          · ${product.size}
        </p>

        <div class="product-title-row">
          <h3>${escapeHTML(product.name)}</h3>
          <span class="product-price">${money(product.price)}</span>
        </div>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <span class="product-notes">
          ${escapeHTML(product.notes)}
        </span>
      </div>
    </article>
  `).join("");
}

function setFilter(filter) {
  state.filter = filter;

  document.querySelectorAll("[data-filter]").forEach(button => {
    const active = button.dataset.filter === filter;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  renderProducts();
}

/* SHOPPING BAG */

function addToCart(id) {
  const product = productById(id);

  if (!product) return;

  const existing = state.cart.find(item =>
    item.id === id && item.pack === product.size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id,
      pack: product.size,
      quantity: 1
    });
  }

  persistCart();
  renderCart();

  showToast(`${product.name} added to your bag.`);
}

function persistCart() {
  saveJSON("el-cart", state.cart);
}

function cartTotals() {
  return state.cart.reduce((sum, item) => {
    const product = productById(item.id);

    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderCart() {
  const count = state.cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  document.getElementById("cartSubtotal").textContent = money(cartTotals());

  const container = document.getElementById("cartItems");

  if (!state.cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        Your bag is taking a little breather.<br>
        Find a blend you love and add it here.
      </div>
    `;

    return;
  }

  container.innerHTML = state.cart.map((item, index) => {
    const product = productById(item.id);

    if (!product) return "";

    return `
      <div class="cart-line">
        <img src="${product.image}" alt="" loading="lazy">

        <div>
          <h3>${escapeHTML(product.name)}</h3>
          <p>${escapeHTML(item.pack)} · ${money(product.price)} each</p>

          <div class="qty-controls">
            <button
              type="button"
              data-cart-action="decrease"
              data-index="${index}"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-cart-action="increase"
              data-index="${index}"
              aria-label="Increase quantity"
            >+</button>
          </div>

          <button
            class="remove-item"
            type="button"
            data-cart-action="remove"
            data-index="${index}"
          >Remove</button>
        </div>

        <span class="cart-line-price">
          ${money(product.price * item.quantity)}
        </span>
      </div>
    `;
  }).join("");
}

function changeCartItem(index, action) {
  const item = state.cart[index];

  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;
  }

  if (action === "remove" || item.quantity < 1) {
    state.cart.splice(index, 1);
  }

  persistCart();
  renderCart();
}

function openCart() {
  document.getElementById("cartOverlay").hidden = false;
  document.body.classList.add("no-scroll");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  document.getElementById("cartOverlay").hidden = true;
  document.body.classList.remove("no-scroll");
  document.getElementById("openCart").focus();
}

/* SUBSCRIPTION PRODUCT PICKER */

function renderBlendPicker() {
  const picker = document.getElementById("blendPicker");

  if (!picker) return;

  picker.innerHTML = PRODUCTS.map(product => {
    const selection = state.selections[product.id] || {
      selected: false,
      pack: product.size,
      quantity: 1
    };

    return `
      <article class="blend-option ${selection.selected ? "selected" : ""}">
        <img src="${product.image}" alt="" loading="lazy">

        <div class="blend-main">
          <div class="blend-heading">
            <strong>${escapeHTML(product.name)}</strong>
            <span>${money(product.price)}</span>
          </div>

          <small>
            ${product.type === "coffee" ? "Coffee beans" : "Loose-leaf tea"}
            · ${escapeHTML(product.notes)}
          </small>

          <div class="blend-controls">
            <label class="blend-select">
              <input
                type="checkbox"
                data-select-blend="${product.id}"
                ${selection.selected ? "checked" : ""}
              >
              Include
            </label>

            <label for="pack-${product.id}">Pack</label>

            <select id="pack-${product.id}" data-pack="${product.id}">
              ${packOptions(product, selection.pack)}
            </select>

            <label for="qty-${product.id}">Qty</label>

            <select id="qty-${product.id}" data-qty="${product.id}">
              ${[1, 2, 3, 4, 5].map(n => `
                <option
                  value="${n}"
                  ${selection.quantity === n ? "selected" : ""}
                >${n}</option>
              `).join("")}
            </select>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* SUBSCRIPTION PRICE CALCULATIONS */

function packPrice(product, packLabel) {
  const pack = PACKS[product.type].find(
    item => item.label === packLabel
  );

  return pack
    ? Math.round(product.price * pack.multiplier)
    : product.price;
}

function selectedSubscriptionItems() {
  return Object.entries(state.selections)
    .filter(([, selection]) => selection.selected)
    .map(([id, selection]) => {
      const product = productById(id);

      return product
        ? {
            product,
            pack: selection.pack,
            quantity: Number(selection.quantity) || 1,
            unitPrice: packPrice(product, selection.pack)
          }
        : null;
    })
    .filter(Boolean);
}

function subscriptionMath() {
  const frequency = document.getElementById("frequency").value;
  const duration = Number(document.getElementById("duration").value) || 1;

  /*
    This demo estimates four weekly deliveries per month.
    A real subscription system should calculate actual delivery dates.
  */

  const deliveryCount = frequency === "weekly"
    ? duration * 4
    : duration;

  const items = selectedSubscriptionItems();

  const perDelivery = items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  return {
    frequency,
    duration,
    deliveryCount,
    items,
    perDelivery,
    total: perDelivery * deliveryCount
  };
}

function updateSummary() {
  const plan = subscriptionMath();

  document.getElementById("summaryFrequency").textContent =
    plan.frequency === "weekly" ? "Weekly" : "Monthly";

  document.getElementById("summaryDuration").textContent =
    `${plan.duration} ${plan.duration === 1 ? "month" : "months"}`;

  document.getElementById("summaryItems").textContent =
    `${plan.items.length} ${plan.items.length === 1 ? "blend" : "blends"}`;

  document.getElementById("summaryDelivery").textContent =
    money(plan.perDelivery);

  document.getElementById("summaryTotal").textContent =
    money(plan.total);
}

/* SUBSCRIPTION WIZARD */

function showStep(step) {
  state.step = step;

  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.classList.toggle(
      "active",
      Number(panel.dataset.panel) === step
    );
  });

  document.querySelectorAll("[data-step-indicator]").forEach(indicator => {
    indicator.classList.toggle(
      "active",
      Number(indicator.dataset.stepIndicator) === step
    );
  });

  if (step === 2) {
    renderBlendPicker();
  }

  updateSummary();

  const heading = document.querySelector(
    `[data-panel="${step}"] h3`
  );

  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
}

function validateStepTwo() {
  if (!selectedSubscriptionItems().length) {
    showToast("Please include at least one coffee or tea blend.");
    return false;
  }

  return true;
}

function validateContact() {
  const form = document.getElementById("subscriptionForm");

  const required = [
    ...form.querySelectorAll(
      '[data-panel="3"] input[required], [data-panel="3"] textarea[required]'
    )
  ];

  for (const input of required) {
    if (input.type === "checkbox" && !input.checked) {
      input.focus();
      showToast("Please confirm the demo checkout note.");
      return false;
    }

    if (input.type !== "checkbox" && !input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }

  const phone = document.getElementById("customerPhone");
  const digits = phone.value.replace(/\D/g, "");

  if (digits.length < 10) {
    phone.setCustomValidity(
      "Enter a phone number with at least 10 digits."
    );

    phone.reportValidity();
    phone.setCustomValidity("");

    return false;
  }

  return true;
}

/* SUBSCRIPTION REVIEW */

function submitSubscription(event) {
  event.preventDefault();

  if (!validateContact()) return;

  const plan = subscriptionMath();

  if (!plan.items.length) {
    showStep(2);
    showToast("Choose at least one blend first.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const day = document.getElementById("deliveryDay").value;

  const windowValue = document.getElementById(
    "deliveryWindow"
  ).selectedOptions[0].textContent;

  const details = document.getElementById("confirmationDetails");

  details.innerHTML = `
    <div>
      <span>Name</span>
      <strong>${escapeHTML(name)}</strong>
    </div>

    <div>
      <span>Delivery schedule</span>
      <strong>
        ${plan.frequency === "weekly" ? "Weekly" : "Monthly"}
        · ${escapeHTML(day)}
      </strong>
    </div>

    <div>
      <span>Preferred time</span>
      <strong>${escapeHTML(windowValue)}</strong>
    </div>

    <div>
      <span>Duration / deliveries</span>
      <strong>
        ${plan.duration} months / ${plan.deliveryCount} estimated
      </strong>
    </div>

    <div>
      <span>Selected blends</span>
      <strong>
        ${plan.items.map(item =>
          `${escapeHTML(item.product.name)} × ${item.quantity} (${escapeHTML(item.pack)})`
        ).join("; ")}
      </strong>
    </div>

    <div>
      <span>Per delivery</span>
      <strong>${money(plan.perDelivery)}</strong>
    </div>

    <div>
      <span>Estimated plan total</span>
      <strong>${money(plan.total)}</strong>
    </div>
  `;

  document.getElementById("confirmationMessage").textContent =
    `Thanks, ${name}. Here's the plan you configured. Nothing has been purchased or scheduled.`;

  document.getElementById("confirmationModal").hidden = false;
  document.body.classList.add("no-scroll");

  document.getElementById("closeConfirmation").focus();
}

function closeConfirmation() {
  document.getElementById("confirmationModal").hidden = true;
  document.body.classList.remove("no-scroll");
}

/* INITIALISE ALL WEBSITE FEATURES */

function init() {
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();

  renderProducts();
  renderCart();
  renderBlendPicker();
  updateSummary();

  /* Product filters */
  document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  /* Product sorting */
  document.getElementById("sortProducts").addEventListener(
    "change",
    event => {
      state.sort = event.target.value;
      renderProducts();
    }
  );

  /* Add products to bag */
  document.getElementById("productGrid").addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-add]");

      if (button) {
        addToCart(button.dataset.add);
      }
    }
  );

  /* Shopping bag open and close */
  document.getElementById("openCart").addEventListener(
    "click",
    openCart
  );

  document.getElementById("closeCart").addEventListener(
    "click",
    closeCart
  );

  document.getElementById("closeCartScrim").addEventListener(
    "click",
    closeCart
  );

  /* Shopping bag quantity controls */
  document.getElementById("cartItems").addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-cart-action]");

      if (button) {
        changeCartItem(
          Number(button.dataset.index),
          button.dataset.cartAction
        );
      }
    }
  );

  /* Move from bag to subscription builder */
  document.getElementById("cartCheckout").addEventListener(
    "click",
    () => {
      closeCart();

      document.getElementById("subscription").scrollIntoView({
        behavior: "smooth"
      });

      showToast("Build a subscription to review a complete plan.");
    }
  );

  /* Update totals when schedule changes */
  document.getElementById("frequency").addEventListener(
    "change",
    updateSummary
  );

  document.getElementById("duration").addEventListener(
    "change",
    updateSummary
  );

  /* Track selected products, pack sizes and quantities */
  document.getElementById("blendPicker").addEventListener(
    "change",
    event => {
      const target = event.target;

      const selectId = target.dataset.selectBlend;
      const packId = target.dataset.pack;
      const qtyId = target.dataset.qty;

      if (selectId) {
        const product = productById(selectId);

        const old = state.selections[selectId] || {
          pack: product.size,
          quantity: 1
        };

        state.selections[selectId] = {
          ...old,
          selected: target.checked
        };

        target.closest(".blend-option").classList.toggle(
          "selected",
          target.checked
        );
      }

      if (packId) {
        const product = productById(packId);

        const old = state.selections[packId] || {
          selected: false,
          pack: product.size,
          quantity: 1
        };

        state.selections[packId] = {
          ...old,
          pack: target.value
        };
      }

      if (qtyId) {
        const product = productById(qtyId);

        const old = state.selections[qtyId] || {
          selected: false,
          pack: product.size,
          quantity: 1
        };

        state.selections[qtyId] = {
          ...old,
          quantity: Number(target.value)
        };
      }

      updateSummary();
    }
  );

  /* Next and back buttons */
  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", () => {
      if (
        Number(button.dataset.next) === 3 &&
        !validateStepTwo()
      ) {
        return;
      }

      showStep(Number(button.dataset.next));
    });
  });

  document.querySelectorAll("[data-back]").forEach(button => {
    button.addEventListener("click", () => {
      showStep(Number(button.dataset.back));
    });
  });

  /* Subscription form */
  document.getElementById("subscriptionForm").addEventListener(
    "submit",
    submitSubscription
  );

  /* Confirmation modal */
  document.getElementById("closeConfirmation").addEventListener(
    "click",
    closeConfirmation
  );

  document.getElementById("finishConfirmation").addEventListener(
    "click",
    () => {
      closeConfirmation();

      document.getElementById("home").scrollIntoView({
        behavior: "smooth"
      });
    }
  );

  document.getElementById("confirmationModal").addEventListener(
    "click",
    event => {
      if (event.target.id === "confirmationModal") {
        closeConfirmation();
      }
    }
  );

  /* Newsletter demo */
  document.getElementById("newsletterForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const email = document.getElementById("newsletterEmail");

      if (!email.checkValidity()) {
        email.reportValidity();
        return;
      }

      showToast(
        "Thanks! Newsletter sign-up is a visual demo only."
      );

      email.value = "";
    }
  );

  /* Mobile navigation */
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });

  /* Escape key closes open overlays */
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!document.getElementById("cartOverlay").hidden) {
        closeCart();
      }

      if (!document.getElementById("confirmationModal").hidden) {
        closeConfirmation();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", init);