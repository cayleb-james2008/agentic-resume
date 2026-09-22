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

  /* ---------- Scroll-linked cinematic hero (MP4 scrub) ---------- */
  (function initScrollHero() {
    var section = document.getElementById("scroll-hero");
    var video = document.getElementById("hero-video");
    var progressBar = document.getElementById("hero-progress");
    var hint = document.getElementById("scroll-hint");
    if (!section || !video) return;

    var progress = 0;
    var duration = 0;
    var ready = false;

    function setPosterMode(msg) {
      section.classList.add("is-poster");
      section.classList.remove("is-live");
      try { video.pause(); } catch (e) {}
      if (hint) hint.textContent = msg || "Reduced motion — static poster";
    }

    if (reduce) {
      setPosterMode("Reduced motion — static poster");
      video.removeAttribute("autoplay");
      video.currentTime = 0;
      return;
    }

    section.classList.add("is-live");
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = "auto";

    function measureProgress() {
      var track = section.querySelector(".scroll-hero__track") || section;
      var rect = track.getBoundingClientRect();
      var total = track.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      var scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled / total));
    }

    function scrub(p) {
      if (!ready || !(duration > 0)) return;
      // leave a tiny epsilon so we never fight ended state
      var t = Math.min(duration * 0.999, Math.max(0, p * duration));
      try {
        if (Math.abs(video.currentTime - t) > 0.04) video.currentTime = t;
      } catch (e) {}
    }

    var ticking = false;
    function update() {
      ticking = false;
      progress = measureProgress();
      scrub(progress);
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

    function onMeta() {
      duration = video.duration || 0;
      if (duration > 0 && isFinite(duration)) {
        ready = true;
        update();
      }
    }

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    if (video.readyState >= 1) onMeta();

    // Prefer scrub over autoplay; if metadata fails, fall back to muted loop
    video.addEventListener("error", function () {
      setPosterMode("Video unavailable — showing poster");
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { update(); }, { passive: true });
    update();

    if (CSS && CSS.supports && CSS.supports("animation-timeline", "scroll()")) {
      section.classList.add("has-scroll-timeline");
    }
  })();

})();
