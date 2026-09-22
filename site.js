(function () {
  "use strict";
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
  var heroes = document.querySelectorAll(".hero, .scroll-hero__overlay");
  heroes.forEach(function (hero) {
    Array.prototype.forEach.call(hero.children, function (child) {
      child.classList.add("hero-line");
    });
  });

  // Scroll reveal (+ immediate hero kick)
  var nodes = document.querySelectorAll(".reveal");
  if (nodes.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      document.querySelectorAll(".hero.reveal, .scroll-hero").forEach(function (hero) {
        requestAnimationFrame(function () { hero.classList.add("is-in"); });
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
        { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
      );
      nodes.forEach(function (el) {
        if (!el.classList.contains("is-in")) io.observe(el);
      });
    }
  }

  /* ---------- Scroll-linked cinematic hero (canvas scrub) ---------- */
  (function initScrollHero() {
    var section = document.getElementById("scroll-hero");
    var canvas = document.getElementById("hero-canvas");
    var progressBar = document.getElementById("hero-progress");
    var hint = document.getElementById("scroll-hint");
    if (!section || !canvas) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 1200, H = 675;
    var progress = 0;
    var posterMode = reduce;

    if (posterMode) {
      section.classList.add("is-poster");
      if (hint) hint.textContent = "Reduced motion — static poster";
      return;
    }

    section.classList.add("is-live");

    function size() {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    var scenes = [
      { title: "Spawn", sub: "dotz · agent runtime", hue: "#e0b48a" },
      { title: "Research", sub: "sophos · sourced claims", hue: "#f0c9a0" },
      { title: "Decide", sub: "solomon · weighed verdict", hue: "#b8895f" },
      { title: "Gate", sub: "PDM Forge · simulator vault", hue: "#8fb387" },
      { title: "Ship", sub: "apotheka · storefront mosaic", hue: "#ead9c8" }
    ];

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawFrame(t) {
      // t in [0,1]
      ctx.clearRect(0, 0, W, H);
      // espresso ground
      var g = ctx.createRadialGradient(W * 0.7, H * 0.2, 40, W * 0.5, H * 0.5, W * 0.7);
      g.addColorStop(0, "rgba(240,201,160," + (0.18 + t * 0.12) + ")");
      g.addColorStop(0.45, "#1a1410");
      g.addColorStop(1, "#140f0c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var sceneIndex = Math.min(scenes.length - 1, Math.floor(t * scenes.length));
      var local = (t * scenes.length) - sceneIndex;
      var scene = scenes[sceneIndex];

      // desk
      ctx.fillStyle = "#221c17";
      roundRect(60, 400, 1080, 200, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(224,180,138,0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // monitor
      ctx.fillStyle = "#0e0b09";
      roundRect(200, 120 + (1 - local) * 20, 560, 320, 18);
      ctx.fill();
      ctx.strokeStyle = scene.hue;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#1a1410";
      roundRect(220, 140 + (1 - local) * 20, 520, 260, 8);
      ctx.fill();

      // animated console lines
      var lines = 5;
      for (var i = 0; i < lines; i++) {
        var w = 120 + ((i * 97 + sceneIndex * 40) % 280);
        var alpha = Math.max(0.2, Math.min(1, local * 1.4 - i * 0.12));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i === 0 ? scene.hue : "#a89888";
        roundRect(250, 170 + i * 36 + (1 - local) * 10, w * (0.5 + local * 0.5), i === 0 ? 14 : 10, 4);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // side panels morph
      ctx.fillStyle = "#2e261f";
      roundRect(800, 160, 300, 110, 14);
      ctx.fill();
      roundRect(800, 290, 300, 110, 14);
      ctx.fill();
      ctx.fillStyle = scene.hue;
      roundRect(820, 180, 100 + local * 80, 12, 4);
      ctx.fill();
      roundRect(820, 310, 80 + local * 100, 12, 4);
      ctx.fill();

      // cup
      ctx.fillStyle = "#e0b48a";
      roundRect(100, 430, 70, 70, 8);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(135, 430, 35, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#f7efe6";
      ctx.fill();

      // steam keyed to progress
      ctx.strokeStyle = "rgba(234,217,200," + (0.4 + local * 0.4) + ")";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (var s = 0; s < 3; s++) {
        ctx.beginPath();
        var sx = 120 + s * 16;
        ctx.moveTo(sx, 420);
        ctx.bezierCurveTo(sx - 8, 400 - local * 30, sx + 10, 380 - local * 40, sx, 360 - local * 50);
        ctx.stroke();
      }

      // caption
      ctx.fillStyle = "#f7efe6";
      ctx.font = "800 42px Syne, system-ui, sans-serif";
      ctx.fillText(scene.title, 80, 70);
      ctx.fillStyle = scene.hue;
      ctx.font = "500 22px DM Sans, system-ui, sans-serif";
      ctx.fillText(scene.sub, 80, 104);

      // beat dots
      for (var d = 0; d < scenes.length; d++) {
        ctx.beginPath();
        ctx.arc(80 + d * 28, H - 36, d === sceneIndex ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = d === sceneIndex ? scene.hue : "rgba(168,152,136,0.45)";
        ctx.fill();
      }
    }

    function measureProgress() {
      var track = section.querySelector(".scroll-hero__track") || section;
      var rect = track.getBoundingClientRect();
      var total = track.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      var scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled / total));
    }

    var ticking = false;
    function update() {
      ticking = false;
      progress = measureProgress();
      drawFrame(progress);
      if (progressBar) progressBar.style.width = (progress * 100).toFixed(1) + "%";
      if (hint) {
        if (progress < 0.02) hint.textContent = "Scroll to scrub the story →";
        else if (progress > 0.96) hint.textContent = "Story complete — try a demo below";
        else hint.textContent = "Beat " + (Math.min(5, Math.floor(progress * 5) + 1)) + " / 5";
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { size(); update(); }, { passive: true });
    update();

    // CSS scroll-driven fallback hint class for supporting browsers
    if (CSS && CSS.supports && CSS.supports("animation-timeline", "scroll()")) {
      section.classList.add("has-scroll-timeline");
    }
  })();
})();
