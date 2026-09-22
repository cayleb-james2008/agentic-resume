/* v5 — one GSAP signature beat + matchMedia reduced-motion
   Nested: gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-performance */
(function () {
  "use strict";

  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Hero video: play muted loop only when file loads AND motion allowed */
  var video = document.getElementById("hero-video");
  var poster = document.querySelector(".hero-poster");
  if (video) {
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hideVideo = function () {
      video.setAttribute("hidden", "");
      video.removeAttribute("autoplay");
      try { video.pause(); } catch (e) {}
      if (poster) poster.removeAttribute("hidden");
    };
    var showVideo = function () {
      video.removeAttribute("hidden");
      if (poster) poster.setAttribute("hidden", "");
    };
    if (reduce) {
      hideVideo();
    } else {
      video.addEventListener("error", hideVideo);
      /* If source 404 / missing, error fires; keep poster */
      var src = video.querySelector("source");
      if (!src || !src.getAttribute("src")) {
        hideVideo();
      } else {
        /* Probe: HEAD-less — try play; on failure keep poster */
        var playPromise = video.play();
        if (playPromise && playPromise.then) {
          playPromise.then(showVideo).catch(hideVideo);
        }
        video.addEventListener("loadeddata", function () {
          if (video.readyState >= 2 && video.videoWidth > 0) showVideo();
        });
      }
    }
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();

  /* ONE signature: Work band → flagship (dotz) stamp reveal */
  mm.add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    function (context) {
      var card = document.querySelector(".work-card--flagship");
      if (!card) return;

      var title = card.querySelector(".work-card__title");
      var visual = card.querySelector(".work-card__visual");
      var stamp = card.querySelector(".work-card__stamp");
      var out = card.querySelector(".work-card__out");

      if (context.conditions.reduce) {
        gsap.set([title, visual, out].filter(Boolean), {
          clearProps: "all",
          autoAlpha: 1,
          y: 0,
        });
        if (stamp) gsap.set(stamp, { width: "3rem", clearProps: "transform" });
        return;
      }

      gsap.set([title, out].filter(Boolean), { autoAlpha: 0, y: 28 });
      if (visual) gsap.set(visual, { autoAlpha: 0, y: 36 });
      if (stamp) gsap.set(stamp, { width: 0 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 78%",
          once: true,
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      if (title) tl.to(title, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
      if (stamp) {
        tl.to(
          stamp,
          { width: "3rem", duration: 0.55, ease: "power2.out" },
          0.15
        );
      }
      if (out) tl.to(out, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.2);
      if (visual) tl.to(visual, { autoAlpha: 1, y: 0, duration: 0.75 }, 0.12);

      return function () {
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
      };
    }
  );
})();
