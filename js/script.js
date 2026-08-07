/* ==========================================================================
   Matheus Biancardine — Federal MG 2026
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Header: fundo ao rolar, menu mobile e link ativo
     ---------------------------------------------------------------------- */

  function initHeader() {
    var bar = document.querySelector(".header-bar");
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.getElementById("mobile-menu");
    if (!bar) return;

    var onScroll = function () {
      bar.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && menu) {
      var setOpen = function (open) {
        menu.dataset.open = open ? "true" : "false";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      };

      toggle.addEventListener("click", function () {
        setOpen(menu.dataset.open !== "true");
      });

      menu.addEventListener("click", function (event) {
        if (event.target.closest("a")) setOpen(false);
      });
    }

    // Link ativo conforme a seção visível
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav__links a")
    );
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    var spy = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          })[0];
        if (!visible) return;

        links.forEach(function (link) {
          var isCurrent = link.getAttribute("href") === "#" + visible.target.id;
          if (isCurrent) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     Animação de entrada por scroll
     ---------------------------------------------------------------------- */

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.dataset.visible = "true";
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (item) {
      item.dataset.visible = "false";
      observer.observe(item);
    });
  }

  /* ----------------------------------------------------------------------
     Carrossel de credenciais
     ---------------------------------------------------------------------- */

  function initCarousel() {
    var carousel = document.getElementById("credenciais");
    if (!carousel) return;

    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll(".carousel__slide")
    );
    var dotsNav = carousel.querySelector(".carousel__dots");
    var prev = carousel.querySelector(".carousel__arrow--prev");
    var next = carousel.querySelector(".carousel__arrow--next");
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;

    var dots = slides.map(function (slide, index) {
      var title = slide.querySelector("h3");
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute(
        "aria-label",
        "Ir para " + (title ? title.textContent.trim() : "credencial " + (index + 1))
      );
      dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        goTo(index);
        restart();
      });
      dotsNav.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        if (i === current) {
          slide.dataset.active = "true";
        } else {
          delete slide.dataset.active;
        }
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-selected", i === current ? "true" : "false");
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        goTo(current + 1);
      }, 6500);
    }

    prev.addEventListener("click", function () {
      goTo(current - 1);
      restart();
    });
    next.addEventListener("click", function () {
      goTo(current + 1);
      restart();
    });

    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", restart);

    // Swipe no mobile
    var startX = null;
    carousel.addEventListener(
      "touchstart",
      function (event) {
        startX = event.touches[0].clientX;
        window.clearInterval(timer);
      },
      { passive: true }
    );
    carousel.addEventListener("touchend", function (event) {
      if (startX === null) return;
      var delta = startX - event.changedTouches[0].clientX;
      if (delta > 50) goTo(current + 1);
      if (delta < -50) goTo(current - 1);
      startX = null;
      restart();
    });

    restart();
  }

  /* ----------------------------------------------------------------------
     Propostas: ver mais / esconder
     ---------------------------------------------------------------------- */

  function initProposals() {
    var cards = [];

    document.querySelectorAll(".proposal__toggle").forEach(function (button, index) {
      var card = button.closest(".proposal");
      var label = button.querySelector("span");
      var text = card.querySelector(".proposal__text");

      text.id = text.id || "proposta-texto-" + (index + 1);
      button.setAttribute("aria-controls", text.id);
      cards.push({ card: card, text: text });

      button.addEventListener("click", function () {
        var expanded = card.dataset.expanded === "true";

        // A altura é medida do conteúdo real: o texto nunca fica cortado.
        text.style.maxHeight = expanded ? "" : text.scrollHeight + "px";
        card.dataset.expanded = expanded ? "false" : "true";
        button.setAttribute("aria-expanded", expanded ? "false" : "true");
        label.textContent = expanded ? "Ver mais" : "Esconder";
      });
    });

    // Ao mudar a largura da tela o texto reflui e a altura precisa ser refeita.
    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        cards.forEach(function (entry) {
          if (entry.card.dataset.expanded !== "true") return;
          entry.text.style.maxHeight = "none";
          entry.text.style.maxHeight = entry.text.scrollHeight + "px";
        });
      }, 150);
    });
  }

  /* ----------------------------------------------------------------------
     Galeria: lightbox
     ---------------------------------------------------------------------- */

  function initLightbox() {
    var items = document.querySelectorAll(".gallery-item");
    if (!items.length) return;

    var open = function (src, alt, caption) {
      var box = document.createElement("div");
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Visualização da imagem");

      box.innerHTML =
        '<button type="button" class="lightbox__close" aria-label="Fechar">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"' +
        ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';

      var img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      box.appendChild(img);

      if (caption) {
        var text = document.createElement("p");
        text.textContent = caption;
        box.appendChild(text);
      }

      var close = function () {
        box.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
      };
      var onKey = function (event) {
        if (event.key === "Escape") close();
      };

      box.addEventListener("click", close);
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      document.body.appendChild(box);
      box.querySelector(".lightbox__close").focus();
    };

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        var figure = item.closest("figure");
        var caption = figure && figure.querySelector("figcaption");
        open(img.src, img.alt, caption ? caption.textContent.trim() : "");
      });
    });
  }

  /* ----------------------------------------------------------------------
     Vídeos: apenas um tocando por vez
     ---------------------------------------------------------------------- */

  function initVideos() {
    var videos = Array.prototype.slice.call(
      document.querySelectorAll(".video-card video")
    );
    videos.forEach(function (video) {
      video.addEventListener("play", function () {
        videos.forEach(function (other) {
          if (other !== video) other.pause();
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initReveal();
    initCarousel();
    initProposals();
    initLightbox();
    initVideos();
  });
})();
