/* ===================================================================
   AADHAAR — shared interactions
   =================================================================== */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    function closeSubmenus() {
      links.querySelectorAll(".has-submenu").forEach(function (item) {
        item.classList.remove("submenu-open");
        var submenuToggle = item.querySelector(".nav-submenu-toggle");
        if (submenuToggle) submenuToggle.setAttribute("aria-expanded", "false");
      });
    }

    toggle.addEventListener("click", function () {
      toggle.classList.toggle("open");
      links.classList.toggle("open");
      if (!links.classList.contains("open")) closeSubmenus();
    });
    links.querySelectorAll(".nav-submenu-toggle").forEach(function (submenuToggle) {
      submenuToggle.addEventListener("click", function () {
        var item = submenuToggle.closest(".has-submenu");
        if (!item) return;
        var isOpen = item.classList.toggle("submenu-open");
        submenuToggle.setAttribute("aria-expanded", String(isOpen));
      });
    });

    // close on link click (mobile)
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.classList.remove("open");
        links.classList.remove("open");
        closeSubmenus();
      });
    });

    // sticky header shadow
    var header = document.querySelector(".site-header");
    var onScroll = function () {
      if (window.scrollY > 10) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Welcome loader ---- */
  function initLoader(onComplete) {
    var loader = document.querySelector(".page-loader");
    var title = loader && loader.querySelector("[data-loader-title]");
    var shouldShow = document.documentElement.classList.contains("show-welcome-loader");
    if (!loader || !title || !shouldShow) {
      if (loader) loader.remove();
      document.body.classList.remove("is-loading");
      onComplete();
      return;
    }

    window.scrollTo(0, 0);
    var message = title.textContent.trim();
    title.textContent = "";
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var characters = [];
    Array.from(message).forEach(function (character) {
      var span = document.createElement("span");
      span.className = "loader-letter";
      span.setAttribute("aria-hidden", "true");
      span.textContent = character === " " ? "\u00a0" : character;
      title.appendChild(span);
      characters.push(span);
    });

    function whenVisible(callback) {
      if (!document.hidden) {
        callback();
        return;
      }

      function resume() {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", resume);
        callback();
      }
      document.addEventListener("visibilitychange", resume);
    }

    function closeLoader() {
      loader.classList.add("is-exiting");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        document.documentElement.classList.remove("show-welcome-loader");
        document.body.classList.remove("is-loading");
        onComplete();
      }, reducedMotion ? 20 : 650);
    }

    function showNextCharacter(index) {
      if (document.hidden) {
        whenVisible(function () { showNextCharacter(index); });
        return;
      }
      if (index >= characters.length) {
        window.setTimeout(closeLoader, 800);
        return;
      }

      characters[index].classList.add("is-visible");
      window.setTimeout(function () { showNextCharacter(index + 1); }, 125);
    }

    function startLoader() {
      if (document.hidden) {
        whenVisible(startLoader);
        return;
      }
      if (reducedMotion) {
        characters.forEach(function (character) { character.classList.add("is-visible"); });
        window.setTimeout(closeLoader, 450);
        return;
      }
      showNextCharacter(0);
    }

    window.setTimeout(startLoader, 100);
  }

  /* ---- Hero heading typewriter ---- */
  function initTypewriter() {
    var heading = document.querySelector("[data-typewriter]");
    if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    var characters = [];
    textNodes.forEach(function (textNode) {
      var text = textNode.nodeValue.replace(/\s+/g, " ");
      if (textNode === heading.lastChild) text = text.replace(/\s+$/, "");
      var fragment = document.createDocumentFragment();

      Array.from(text).forEach(function (character) {
        var span = document.createElement("span");
        span.className = "typewriter-char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = character;
        fragment.appendChild(span);
        characters.push(span);
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    heading.classList.add("typing");
    heading.setAttribute("aria-busy", "true");

    var characterIndex = 0;
    function resumeTypewriter() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", resumeTypewriter);
      typeNextCharacter();
    }

    function typeNextCharacter() {
      if (document.hidden) {
        document.addEventListener("visibilitychange", resumeTypewriter);
        return;
      }

      if (characterIndex === characters.length) {
        heading.classList.remove("typing");
        heading.removeAttribute("aria-busy");
        return;
      }

      characters[characterIndex].classList.add("is-visible");
      characterIndex += 1;
      window.setTimeout(typeNextCharacter, 28);
    }

    window.setTimeout(typeNextCharacter, 220);
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Animated counters ---- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1800;
    var start = null;
    var node = el.querySelector(".counter-num") || el;
    var suffixHTML = suffix ? '<span class="suffix">' + suffix + '</span>' : '';
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = Math.floor(eased * target);
      node.innerHTML = val.toLocaleString("en-IN") + suffixHTML;
      if (p < 1) requestAnimationFrame(tick);
      else node.innerHTML = target.toLocaleString("en-IN") + suffixHTML;
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-target]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCounter(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---- Top and bottom scroll button ---- */
  function initScrollControl() {
    var button = document.createElement("button");
    button.className = "scroll-control";
    button.type = "button";
    button.setAttribute("aria-label", "Scroll to bottom");
    var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2.5");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    icon.appendChild(path);
    button.appendChild(icon);
    document.body.appendChild(button);

    function update() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      button.hidden = maxScroll <= 0;
      if (button.hidden) return;

      var atTop = window.scrollY < 120;
      button.setAttribute("aria-label", atTop ? "Scroll to bottom" : "Scroll to top");
      path.setAttribute("d", atTop ? "M12 5v14m-6-6 6 6 6-6" : "M12 19V5m-6 6 6-6 6 6");
    }

    var updateScheduled = false;
    function scheduleUpdate() {
      if (updateScheduled) return;
      updateScheduled = true;
      window.requestAnimationFrame(function () {
        updateScheduled = false;
        update();
      });
    }

    button.addEventListener("click", function () {
      var target = window.scrollY < 120 ? document.documentElement.scrollHeight : 0;
      window.scrollTo({ top: target, behavior: "smooth" });
    });

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
  }

  /* ---- Footer year ---- */
  function initYear() {
    var y = document.querySelectorAll(".year");
    y.forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initYear();
    initLoader(function () {
      initScrollControl();
      initTypewriter();
      initReveal();
      initCounters();
    });
  });
})();
