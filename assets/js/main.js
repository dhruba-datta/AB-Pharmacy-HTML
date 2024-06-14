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
  function addToCart(productName, quantity) {
    // Check if the product already exists in the cart
    const existingItem = cartItems.find(
      (item) => item.productName === productName
    );
    if (existingItem) {
      // If the product exists, update its quantity
      existingItem.quantity += parseInt(quantity);
    } else {
      // If the product doesn't exist, add it to the cart
      cartItems.push({ productName, quantity: parseInt(quantity) });
    }
    updateCart();
  }

  // Function to update the cart content and notification count
  function updateCart() {
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartNotification = document.getElementById("cart-notification");
    cartItemsContainer.innerHTML = ""; // Clear existing content
    const uniqueProducts = new Set(); // Using a Set to store unique product names
    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItems.forEach((item, index) => {
        uniqueProducts.add(item.productName); // Add each product name to the set
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");
        cartItemElement.innerHTML = `
      <p>${item.productName} = ${item.quantity}</p>
      <i class="bi bi-x-circle remove-icon" data-index="${index}"></i>
    `;
        cartItemsContainer.appendChild(cartItemElement);
      });
    }
    // Update the notification count with the size of the uniqueProducts Set
    cartNotification.textContent = uniqueProducts.size.toString();

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
    cartItems.splice(index, 1);
    updateCart();
  }

  // Function to send order via WhatsApp
  function sendOrder() {
    let message = "";
    cartItems.forEach((item) => {
      message += `${item.productName} = ${item.quantity}\n`;
    });
    const whatsappLink = `https://wa.me/+8801912555765?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");

    // Empty the cart
    cartItems = [];
    updateCart();
  }

  // Increment quantity
  document.querySelectorAll(".btn-plus").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector(".count");
      input.value = parseInt(input.value) + 1;
    });
  });

  // Decrement quantity
  document.querySelectorAll(".btn-minus").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector(".count");
      input.value =
        parseInt(input.value) - 1 > 0 ? parseInt(input.value) - 1 : 1;
    });
  });

  // Handle Order Now button click in product section
  document.querySelectorAll(".product").forEach((button) => {
    const isOutOfStock = button.getAttribute("data-out-of-stock") === "true";
    if (isOutOfStock) {
      button.classList.add("out-of-stock");
      button.disabled = true;
      button.textContent = "Out of Stock"; // Change the button text to "Out of Stock"
    } else {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const productName = button.parentElement.querySelector("h4").innerText;
        const quantity = button.parentElement.querySelector(".count").value;
        addToCart(productName, quantity);
      });
    }
  });

  // Function to toggle the cart visibility
  function toggleCart() {
    var floatingCart = document.getElementById("floatingCart");
    floatingCart.classList.toggle("show");
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
  });
})();
