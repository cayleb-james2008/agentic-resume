/* One local decorative dotz stamp reveal; primary content is never hidden. */
(function () {
  "use strict";

  var year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    function samePageFragmentDestination(link) {
      var destinationUrl;
      var currentUrl;
      try {
        destinationUrl = new URL(link.href, window.location.href);
        currentUrl = new URL(window.location.href);
      } catch (error) {
        return null;
      }
      if (!destinationUrl.hash || destinationUrl.origin !== currentUrl.origin ||
          destinationUrl.pathname !== currentUrl.pathname || destinationUrl.search !== currentUrl.search) {
        return null;
      }

      var id;
      try {
        id = decodeURIComponent(destinationUrl.hash.slice(1));
      } catch (error) {
        id = destinationUrl.hash.slice(1);
      }
      return document.getElementById(id);
    }

    function focusDestination(destination) {
      window.requestAnimationFrame(function () {
        var addedTabindex = false;
        if (!destination.hasAttribute("tabindex")) {
          destination.setAttribute("tabindex", "-1");
          addedTabindex = true;
        }
        try {
          destination.focus({ preventScroll: true });
        } catch (error) {
          destination.focus();
        }
        if (addedTabindex) {
          destination.addEventListener("blur", function () {
            destination.removeAttribute("tabindex");
          }, { once: true });
        }
      });
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        var destination = samePageFragmentDestination(link);
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        if (destination) focusDestination(destination);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
  }

  var signatureCard = document.querySelector(".work-card--flagship");
  // CSS limits both signature states to the aria-hidden stamp; content stays visible.
  var motionAllowed = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (!signatureCard || !motionAllowed || !("IntersectionObserver" in window)) return;

  signatureCard.classList.add("signature-pending");
  var reveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      signatureCard.classList.remove("signature-pending");
      signatureCard.classList.add("signature-visible");
      reveal.disconnect();
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  reveal.observe(signatureCard);
})();
