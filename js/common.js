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
  function initLoader() {
    var loader = document.querySelector(".page-loader");
    var title = loader && loader.querySelector("[data-loader-title]");
    var shouldShow = document.documentElement.classList.contains("show-welcome-loader");
    if (!loader || !title || !shouldShow) {
      if (loader) loader.remove();
      document.body.classList.remove("is-loading");
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

  /* ---- Page scrollbar below the sticky header ---- */
  function initPageScrollbar() {
    var root = document.documentElement;
    var track = document.createElement("div");
    var thumb = document.createElement("div");
    track.className = "page-scrollbar";
    track.setAttribute("role", "scrollbar");
    track.setAttribute("aria-label", "Page scroll position");
    track.setAttribute("aria-orientation", "vertical");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", "0");
    track.tabIndex = 0;
    if (!document.body.id) document.body.id = "page-content";
    track.setAttribute("aria-controls", document.body.id);
    thumb.className = "page-scrollbar-thumb";
    track.appendChild(thumb);
    document.body.appendChild(track);
    root.classList.add("has-page-scrollbar");

    var thumbHeight = 0;
    var dragging = false;
    var dragStartY = 0;
    var dragStartScroll = 0;

    function getMetrics() {
      var trackHeight = track.clientHeight;
      var maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
      var minimumThumbHeight = window.innerWidth <= 680 ? 44 : 34;
      thumbHeight = Math.min(
        trackHeight,
        Math.max(minimumThumbHeight, trackHeight * window.innerHeight / root.scrollHeight)
      );
      return {
        trackHeight: trackHeight,
        maxScroll: maxScroll,
        maxThumbOffset: Math.max(0, trackHeight - thumbHeight)
      };
    }

    function update() {
      var metrics = getMetrics();
      track.hidden = metrics.maxScroll <= 0 || metrics.trackHeight <= 0;
      if (track.hidden) return;

      var progress = Math.min(1, Math.max(0, window.scrollY / metrics.maxScroll));
      thumb.style.height = thumbHeight + "px";
      thumb.style.transform = "translateY(" + metrics.maxThumbOffset * progress + "px)";
      track.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    }

    function scheduleUpdate() {
      window.requestAnimationFrame(update);
    }

    function setScrollPosition(position) {
      var previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, Math.min(position, root.scrollHeight - window.innerHeight)));
      root.style.scrollBehavior = previousBehavior;
    }

    function scrollToThumbOffset(offset) {
      var metrics = getMetrics();
      var progress = metrics.maxThumbOffset
        ? Math.max(0, Math.min(offset, metrics.maxThumbOffset)) / metrics.maxThumbOffset
        : 0;
      setScrollPosition(progress * metrics.maxScroll);
    }

    function stopDragging() {
      dragging = false;
      thumb.classList.remove("is-dragging");
    }

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();

      if (event.target === thumb) {
        dragging = true;
        dragStartY = event.clientY;
        dragStartScroll = window.scrollY;
        thumb.classList.add("is-dragging");
        track.setPointerCapture(event.pointerId);
        return;
      }

      var rect = track.getBoundingClientRect();
      scrollToThumbOffset(event.clientY - rect.top - thumbHeight / 2);
    });

    track.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      var metrics = getMetrics();
      if (!metrics.maxThumbOffset) return;
      var scrollDelta = (event.clientY - dragStartY) * metrics.maxScroll / metrics.maxThumbOffset;
      setScrollPosition(dragStartScroll + scrollDelta);
    });
    track.addEventListener("pointerup", stopDragging);
    track.addEventListener("pointercancel", stopDragging);

    track.addEventListener("keydown", function (event) {
      var step = Math.max(60, window.innerHeight * 0.8);
      var target;
      if (event.key === "ArrowDown") target = window.scrollY + 60;
      else if (event.key === "ArrowUp") target = window.scrollY - 60;
      else if (event.key === "PageDown") target = window.scrollY + step;
      else if (event.key === "PageUp") target = window.scrollY - step;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = root.scrollHeight - window.innerHeight;
      else return;

      event.preventDefault();
      setScrollPosition(target);
    });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
    update();
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

  /* ---- Responsive footer accordions ---- */
  function initFooterAccordions() {
    var accordions = document.querySelectorAll(".footer-accordion");
    if (!accordions.length) return;

    var mobile = window.matchMedia("(max-width: 680px)");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var transitionHandlers = new WeakMap();
    var transitionTokens = new WeakMap();
    var expandedStates = new WeakMap();

    function clearTransition(accordion, content) {
      var handler = transitionHandlers.get(accordion);
      if (handler) content.removeEventListener("transitionend", handler);
      transitionHandlers.delete(accordion);
      transitionTokens.set(accordion, (transitionTokens.get(accordion) || 0) + 1);
    }

    function clearAnimationStyles(content) {
      content.style.height = "";
      content.style.opacity = "";
      content.style.overflow = "";
    }

    function syncAccordionState() {
      accordions.forEach(function (accordion) {
        var content = accordion.querySelector(".footer-accordion-content");
        clearTransition(accordion, content);
        content.style.transition = "none";
        accordion.open = !mobile.matches;
        expandedStates.set(accordion, accordion.open);
        clearAnimationStyles(content);
        content.offsetHeight;
        content.style.transition = "";
      });
    }

    accordions.forEach(function (accordion) {
      var content = accordion.querySelector(".footer-accordion-content");
      accordion.querySelector("summary").addEventListener("click", function (event) {
        event.preventDefault();
        if (!mobile.matches) return;

        var shouldOpen = !expandedStates.get(accordion);
        expandedStates.set(accordion, shouldOpen);
        clearTransition(accordion, content);
        var token = transitionTokens.get(accordion);

        if (reducedMotion.matches) {
          accordion.open = shouldOpen;
          clearAnimationStyles(content);
          return;
        }

        if (shouldOpen) {
          var startHeight = accordion.open ? content.getBoundingClientRect().height : 0;
          var startOpacity = accordion.open ? parseFloat(window.getComputedStyle(content).opacity) : 0;
          accordion.open = true;
          content.style.overflow = "hidden";
          content.style.height = startHeight + "px";
          content.style.opacity = String(startOpacity);
          content.offsetHeight;

          window.requestAnimationFrame(function () {
            if (transitionTokens.get(accordion) !== token) return;
            content.style.height = content.scrollHeight + "px";
            content.style.opacity = "1";
          });
        } else {
          content.style.overflow = "hidden";
          content.style.height = content.getBoundingClientRect().height + "px";
          content.style.opacity = window.getComputedStyle(content).opacity;
          content.offsetHeight;

          window.requestAnimationFrame(function () {
            if (transitionTokens.get(accordion) !== token) return;
            content.style.height = "0px";
            content.style.opacity = "0";
          });
        }

        var onTransitionEnd = function (transitionEvent) {
          if (transitionEvent.target !== content || transitionEvent.propertyName !== "height") return;
          content.removeEventListener("transitionend", onTransitionEnd);
          transitionHandlers.delete(accordion);
          if (transitionTokens.get(accordion) !== token) return;
          if (!shouldOpen) accordion.open = false;
          clearAnimationStyles(content);
        };
        transitionHandlers.set(accordion, onTransitionEnd);
        content.addEventListener("transitionend", onTransitionEnd);
      });
    });

    syncAccordionState();
    mobile.addEventListener("change", syncAccordionState);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initYear();
    initFooterAccordions();
    initPageScrollbar();
    initScrollControl();
    initTypewriter();
    initReveal();
    initCounters();
    initLoader();
  });
})();
