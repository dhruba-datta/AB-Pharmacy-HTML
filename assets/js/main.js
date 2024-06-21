(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };

  // Function to close the navigation bar
  const closeNavbar = () => {
    document.getElementById("navbar").classList.remove("show");
    // Reset dropdown styles
    document.querySelectorAll(".dropdown ul").forEach((dropdown) => {
      dropdown.style.opacity = "";
      dropdown.style.visibility = "";
    });
  };

  // Add event listener to each dropdown item
  document.querySelectorAll(".dropdown ul li a").forEach((item) => {
    item.addEventListener("click", () => {
      closeNavbar();
    });
  });

  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select("#header");
    let offset = header.offsetHeight;

    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  };

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Mobile nav toggle
   */
  on("click", ".mobile-nav-toggle", function (e) {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  /**
   * Mobile nav dropdowns activate
   */
  on(
    "click",
    ".navbar .dropdown > a",
    function (e) {
      if (select("#navbar").classList.contains("navbar-mobile")) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle("dropdown-active");
      }
    },
    true
  );

  /**
   * Scroll with offset on links with a class name .scrollto
   */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select("#navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  /**
   * Scroll with offset on page load with hash links in the URL
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Portfolio isotope and filter
   */
  window.addEventListener("load", () => {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
      });

      let portfolioFilters = select("#portfolio-flters li", true);

      on(
        "click",
        "#portfolio-flters li",
        function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
          portfolioIsotope.on("arrangeComplete", function () {
            AOS.refresh();
          });
        },
        true
      );
    }
  });

  /**
   * Initiate portfolio lightbox
   */
  const portfolioLightbox = GLightbox({
    selector: ".portfolio-lightbox",
  });

  /**
   * Portfolio details slider
   */
  new Swiper(".portfolio-details-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  });

  /**
   * Animation on scroll
   */
  window.addEventListener("load", () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  });

  /**
   * Navbar dropdown links for sorting and scrolling to portfolio section
   */
  on(
    "click",
    ".dropdown a",
    function (e) {
      e.preventDefault();
      let filter = this.getAttribute("href").substring(1); // get filter id without #
      let portfolioFilters = select("#portfolio-flters li", true);
      portfolioFilters.forEach(function (el) {
        el.classList.remove("filter-active");
        if (el.id === filter) {
          el.classList.add("filter-active");
          el.click();
        }
      });
      scrollto("#portfolio");
    },
    true
  );

  // Array to store selected products and quantities
  let cartItems = [];

  // Function to add items to the cart
  function addToCart(productName, price, quantity) {
    addItemToCart(productName, price, quantity);
  }

  // Function to add item to cart
  function addItemToCart(productName, price, quantity) {
    const existingItem = cartItems.find(
      (item) => item.productName === productName
    );
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      cartItems.push({
        productName,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      });
    }
    updateCart();
  }

  // Function to update the cart content and notification count
  function updateCart() {
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartNotification = document.getElementById("cart-notification");
    const totalPriceElement = document.getElementById("total-price");
    cartItemsContainer.innerHTML = ""; // Clear existing content
    let total = 0;

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");
        cartItemElement.innerHTML = `
          <p class="item-name" data-serial="${index + 1}">${
          item.productName
        }</p>
          <p class="item-quantity">${item.quantity} x ৳${item.price.toFixed(
          2
        )}</p>
          <p class="item-price">৳${(item.price * item.quantity).toFixed(2)}</p>
          <i class="bi bi-x-circle remove-icon" data-index="${index}"></i>
        `;
        cartItemsContainer.appendChild(cartItemElement);
      });
    }

    cartNotification.textContent = cartItems.length.toString();
    totalPriceElement.textContent = `৳${total.toFixed(2)}`;

    // Attach event listeners to the remove icons
    document.querySelectorAll(".remove-icon").forEach((icon) => {
      icon.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        removeFromCart(index);
      });
    });
  }

  // Function to remove items from the cart
  function removeFromCart(index) {
    const removedItem = cartItems.splice(index, 1)[0];
    updateCart();
    restoreAddToCartButton(removedItem.productName);
  }

  // Initialize the cart to show "Your cart is empty." by default
  document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    attachAddToCartListeners();
    setupOrderFormModal();
  });

  // Function to setup the order form modal
  function setupOrderFormModal() {
    var modal = document.getElementById("orderFormModal");
    var span = document.getElementsByClassName("close")[0];

    // Open the form modal when the Order Now button is clicked
    document.querySelector(".order-button").addEventListener("click", () => {
      if (cartItems.length > 0) {
        modal.style.display = "block";
      } else {
        alert("Your shopping cart is empty!");
      }
    });

    // Close the form modal when the close button is clicked
    span.onclick = function () {
      modal.style.display = "none";
    };

    // Close the form modal when clicking outside of it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    // Handle the form submission
    document
      .getElementById("orderForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const shopName = document.getElementById("shopName").value;
        const shopAddress = document.getElementById("shopAddress").value;

        // Send order details to WhatsApp
        sendOrder({ shopName, shopAddress });

        // Close the form modal
        modal.style.display = "none";
      });
  }

  // Function to send order via WhatsApp
  function sendOrder(userDetails) {
    let message = `${userDetails.shopName}\nAddress: ${userDetails.shopAddress}\n\n`;
    cartItems.forEach((item) => {
      message += `${item.productName} = ${item.quantity}\n`;
    });
    const whatsappLink = `https://wa.me/+8801912555765?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");

    // Restore the "Add to Cart" buttons and reset the quantities
    cartItems.forEach((item) => {
      restoreAddToCartButton(item.productName);
    });

    // Empty the cart
    cartItems = [];
    updateCart();
  }

  // Function to restore "Add to Cart" button
  function restoreAddToCartButton(productName) {
    const productElement = Array.from(
      document.querySelectorAll(".portfolio-item")
    ).find((el) => el.querySelector("h4").innerText === productName);
    const addToCartButton = productElement.querySelector(".product");
    const quantityDiv = productElement.querySelector(".quantity");

    quantityDiv.style.display = "none";
    addToCartButton.style.display = "block";
    addToCartButton.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        quantityDiv.style.display = "block";
        addToCartButton.style.display = "none";

        const quantityInput = quantityDiv.querySelector(".count");
        quantityInput.value = 1; // Reset the quantity to 1
        const quantity = quantityInput.value;
        const priceText =
          addToCartButton.parentElement.querySelector("span").textContent;
        const price = parseFloat(priceText.match(/\d+(\.\d+)?/)[0]); // Extract numeric value from the price text
        addToCart(productName, price, quantity);
      },
      { once: true }
    );
  }

  // Increment quantity
  document.querySelectorAll(".btn-plus").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector(".count");
      input.value = parseInt(input.value) + 1;
      const productName = button
        .closest(".member-info")
        .querySelector("h4").innerText;
      updateCartItem(productName, input.value);
    });
  });

  // Decrement quantity
  document.querySelectorAll(".btn-minus").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector(".count");
      input.value =
        parseInt(input.value) - 1 > 0 ? parseInt(input.value) - 1 : 1;
      const productName = button
        .closest(".member-info")
        .querySelector("h4").innerText;
      updateCartItem(productName, input.value);
    });
  });

  // Update cart item quantity
  function updateCartItem(productName, quantity) {
    const existingItem = cartItems.find(
      (item) => item.productName === productName
    );
    if (existingItem) {
      existingItem.quantity = parseInt(quantity);
    } else {
      cartItems.push({ productName, quantity: parseInt(quantity) });
    }
    updateCart();
  }

  // Function to attach event listeners to Add to Cart buttons
  function attachAddToCartListeners() {
    document.querySelectorAll(".product").forEach((button) => {
      const isOutOfStock = button.getAttribute("data-out-of-stock") === "true";
      if (isOutOfStock) {
        button.classList.add("out-of-stock");
        button.disabled = true;
        button.textContent = "Out of Stock"; // Change the button text to "Out of Stock"
      } else {
        button.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            const productElement = button.closest(".portfolio-item");
            const productName = productElement.querySelector("h4").innerText;
            const quantityDiv = button.parentElement.querySelector(".quantity");
            const quantityInput = quantityDiv.querySelector(".count");

            // Show the quantity selection tool
            quantityDiv.style.display = "block";
            // Remove the "Add to Cart" button
            button.style.display = "none";

            // Add the item to the cart with the initial quantity
            const quantity = quantityInput.value;
            const priceText =
              button.parentElement.querySelector("span").textContent;
            const price = parseFloat(priceText.match(/\d+(\.\d+)?/)[0]); // Extract numeric value from the price text
            addToCart(productName, price, quantity);
          },
          { once: true }
        ); // Attach the event listener only once
      }
    });
  }

  // Function to toggle the cart visibility
  function toggleCart() {
    const cart = document.getElementById("floatingCart");
    cart.classList.toggle("active");
  }

  // Add event listener to the order button
  document.querySelector(".order-button").addEventListener("click", () => {
    if (cartItems.length > 0) {
      sendOrder();
    } else {
      alert("Your shopping cart is empty!");
    }
  });

  // Close the cart when clicking outside of it
  window.onclick = function (event) {
    var floatingCart = document.getElementById("floatingCart");
    if (
      !event.target.matches(".floating-cart-button") &&
      !floatingCart.contains(event.target)
    ) {
      if (floatingCart.classList.contains("show")) {
        floatingCart.classList.remove("show");
      }
    }
  };

  // Close the cart when clicking the close button
  document.querySelector(".close-button").addEventListener("click", () => {
    var floatingCart = document.getElementById("floatingCart");
    floatingCart.classList.remove("show");
  });

  // Initialize the cart to show "Your cart is empty." by default
  document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    attachAddToCartListeners();
  });

  // table popup
  document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("marketModal");
    var span = document.getElementsByClassName("close")[0];

    var tableCells = document.querySelectorAll("td[data-market-name]");

    tableCells.forEach(function (cell) {
      cell.addEventListener("click", function () {
        var marketName = this.getAttribute("data-market-name");
        var marketDetails = this.getAttribute("data-market-details");

        document.getElementById("marketName").textContent = marketName;
        document.getElementById("marketDetails").textContent = marketDetails;

        modal.style.display = "block";
      });
    });

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  });
})();
