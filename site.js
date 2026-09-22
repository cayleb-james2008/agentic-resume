(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sticky header state
  var topbar = document.querySelector(".topbar");
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav.main");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Mark hero children for staggered entrance
  var heroes = document.querySelectorAll(".hero");
  heroes.forEach(function (hero) {
    Array.prototype.forEach.call(hero.children, function (child) {
      child.classList.add("hero-line");
    });
  });

  // Scroll reveal (+ immediate hero kick so it feels alive <1s)
  var nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }

  // Hero reveals immediately on load for kinetic first impression
  heroes.forEach(function (hero) {
    if (hero.classList.contains("reveal")) {
      requestAnimationFrame(function () {
        hero.classList.add("is-in");
      });
    }
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
  );
  nodes.forEach(function (el) {
    if (!(el.classList.contains("hero") && el.classList.contains("is-in"))) {
      io.observe(el);
    }
  });
})();
