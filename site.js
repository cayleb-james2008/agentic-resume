(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ---------- Mobile drawer (Shoelace) ---------- */
  (function initDrawer() {
    var toggle = $("#dock-toggle");
    var drawer = $("#mobile-drawer");
    if (!toggle || !drawer) return;
    toggle.addEventListener("click", function () {
      drawer.show();
      toggle.setAttribute("aria-expanded", "true");
    });
    drawer.addEventListener("sl-after-hide", function () {
      toggle.setAttribute("aria-expanded", "false");
    });
    $all(".drawer-links a", drawer).forEach(function (a) {
      a.addEventListener("click", function () {
        try { drawer.hide(); } catch (e) {}
      });
    });
  })();

  /* ---------- CRT hero: real <video> play/pause (NOT scroll scrub) ---------- */
  (function initCrt() {
    var crt = $("#hero-crt");
    var video = $("#hero-video");
    var btn = $("#crt-play");
    var meta = $("#crt-meta");
    if (!crt || !video) return;

    function setPoster(msg) {
      crt.classList.add("is-poster");
      crt.classList.remove("is-playing");
      try { video.pause(); } catch (e) {}
      if (btn) {
        btn.textContent = "Play reel";
        btn.setAttribute("aria-pressed", "false");
      }
      if (meta) meta.textContent = msg || "SIGNAL STANDBY · poster only";
    }

    function setPlaying() {
      crt.classList.remove("is-poster");
      crt.classList.add("is-playing");
      if (btn) {
        btn.textContent = "Pause";
        btn.setAttribute("aria-pressed", "true");
      }
      if (meta) meta.textContent = "LIVE · hero-reel.mp4 · muted loop";
    }

    if (reduce) {
      setPoster("Reduced motion — static poster");
      video.removeAttribute("autoplay");
      video.removeAttribute("loop");
      if (btn) btn.hidden = true;
      return;
    }

    crt.classList.add("is-poster");
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    video.addEventListener("error", function () {
      setPoster("Video unavailable — showing poster");
      if (btn) btn.hidden = true;
    });

    if (btn) {
      btn.addEventListener("click", function () {
        if (video.paused) {
          var p = video.play();
          if (p && typeof p.then === "function") {
            p.then(setPlaying).catch(function () {
              setPoster("Playback blocked — tap again or check autoplay policy");
            });
          } else {
            setPlaying();
          }
        } else {
          video.pause();
          crt.classList.remove("is-playing");
          crt.classList.add("is-poster");
          btn.textContent = "Play reel";
          btn.setAttribute("aria-pressed", "false");
          if (meta) meta.textContent = "PAUSED · press play";
        }
      });
    }
  })();

  /* ---------- Channel dial → Shoelace tab ---------- */
  function showLabChannel(name) {
    var tabs = $("#lab-tabs");
    if (!tabs || !name) return;
    var show = function () {
      try {
        tabs.show(name);
      } catch (e) {
        var tab = tabs.querySelector('sl-tab[panel="' + name + '"]');
        if (tab) tab.click();
      }
      var lab = $("#lab");
      if (lab) lab.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    if (customElements.get("sl-tab-group")) {
      show();
    } else if (window.customElements && customElements.whenDefined) {
      customElements.whenDefined("sl-tab-group").then(show);
    } else {
      setTimeout(show, 200);
    }
  }

  $all("[data-channel]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var name = el.getAttribute("data-channel");
      if (!name) return;
      if (el.getAttribute("href") === "#lab" || (el.getAttribute("href") || "").indexOf("#lab") !== -1) {
        e.preventDefault();
        showLabChannel(name);
      } else if (el.tagName === "A" && (el.getAttribute("href") || "").indexOf("index.html#lab") !== -1) {
        // cross-page: stash channel for index boot
        try { sessionStorage.setItem("lab-channel", name); } catch (err) {}
      }
    });
  });

  // Boot channel from hash or session
  (function bootChannel() {
    var fromStore = null;
    try { fromStore = sessionStorage.getItem("lab-channel"); sessionStorage.removeItem("lab-channel"); } catch (e) {}
    var hash = (location.hash || "").replace(/^#/, "");
    var map = { "demo-dotz": "dotz", "demo-sophos": "sophos", "demo-solomon": "solomon", "demo-pdm": "pdm", "demo-apotheka": "apotheka" };
    var name = fromStore || map[hash] || (["dotz","sophos","solomon","pdm","apotheka"].indexOf(hash) >= 0 ? hash : null);
    if (name && $("#lab-tabs")) {
      setTimeout(function () { showLabChannel(name); }, 50);
    }
  })();

  /* ---------- Reveal + anime.js entrances ---------- */
  (function initMotion() {
    var nodes = $all(".reveal");
    if (!nodes.length) return;

    function markIn(el) {
      el.classList.add("is-in");
    }

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(markIn);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          markIn(el);
          if (typeof anime === "function") {
            anime({
              targets: el,
              opacity: [0, 1],
              translateY: [18, 0],
              duration: 620,
              easing: "easeOutCubic"
            });
          }
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    // Kick identity immediately
    $all(".broadcast .reveal, .page-hero.reveal").forEach(function (el) {
      requestAnimationFrame(function () {
        markIn(el);
        if (typeof anime === "function") {
          anime({
            targets: el.querySelectorAll("h1, .lede, .cta-row, .eyebrow, .status-row, .crt__bezel"),
            opacity: [0, 1],
            translateY: [12, 0],
            delay: anime.stagger(70),
            duration: 560,
            easing: "easeOutCubic"
          });
        }
      });
    });

    nodes.forEach(function (el) {
      if (!el.classList.contains("is-in")) io.observe(el);
    });

    // Outline mark — no sticker bob/glitch (prefers calm brand)
    var marks = $all(".brand__mark, .boot__mascot");
    if (marks.length && typeof anime === "function" && !reduce) {
      anime({
        targets: marks,
        opacity: [0.85, 1],
        duration: 1800,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine"
      });
    }


  })();

  /* ---------- Dock scroll state ---------- */
  var dock = $(".dock");
  if (dock) {
    var onScroll = function () {
      dock.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
