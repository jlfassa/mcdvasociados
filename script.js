"use strict";

const hasGsap = typeof window.gsap !== "undefined";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("js-ready");

const header = document.querySelector("[data-header]");

const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuClose = document.querySelector("[data-menu-close]");
const menuLinks = document.querySelectorAll("[data-menu-link]");

const revealTargets = document.querySelectorAll("[data-reveal]");

if (!hasGsap) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("is-visible"));
  }
}

function updateHeader() {
  if (!header) return;

  const hero = document.querySelector("[data-hero-portal]");
  const threshold = hero ? hero.offsetHeight - 80 : 40;

  header.classList.toggle("scrolled", window.scrollY > threshold);
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", updateHeader);
updateHeader();

let menuOpen = false;

function openMenu() {
  if (!menu || menuOpen) return;

  menuOpen = true;
  menu.classList.add("active");
  document.body.classList.add("menu-open");

  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Cerrar menú");
}

function closeMenu() {
  if (!menu || !menuOpen) return;

  menuOpen = false;
  menu.classList.remove("active");
  document.body.classList.remove("menu-open");

  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menú");
}

menuToggle?.addEventListener("click", () => {
  menuOpen ? closeMenu() : openMenu();
});

menuClose?.addEventListener("click", closeMenu);

menuLinks.forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");

    if (targetId && targetId.startsWith("#")) {
      event.preventDefault();
      const targetElement = document.querySelector(targetId);

      closeMenu();

      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    } else {
      closeMenu();
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuOpen) closeMenu();
});

const heroPortal = document.querySelector("[data-hero-portal]");
const heroPortalVideos = document.querySelectorAll("[data-hero-portal-video]");

const HERO_VIDEO_MAX_SECONDS = 6;

function initHeroVideoCarousel() {
  if (!heroPortalVideos.length) return;

  if (reducedMotion.matches) {
    heroPortalVideos[0].pause();
    return;
  }

  let current = 0;

  function playAt(index, restart) {
    heroPortalVideos.forEach((video, i) => {
      video.classList.toggle("is-active", i === index);
      if (i !== index && !video.paused) video.pause();
    });

    const video = heroPortalVideos[index];
    if (restart) video.currentTime = 0;
    video.play().catch(() => {});
  }

  function advance() {
    current = (current + 1) % heroPortalVideos.length;
    playAt(current, true);
  }

  heroPortalVideos.forEach((video, i) => {
    const source = video.dataset.src;
    if (source) video.src = source;

    video.addEventListener("ended", () => {
      if (i === current) advance();
    });

    video.addEventListener("timeupdate", () => {
      if (i === current && video.currentTime >= HERO_VIDEO_MAX_SECONDS) advance();
    });
  });

  if (heroPortalVideos[0].paused) {
    playAt(0, true);
  } else {
    heroPortalVideos[0].classList.add("is-active");
  }

  if ("IntersectionObserver" in window && heroPortal) {
    const heroVisibilityObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const active = heroPortalVideos[current];
          if (!active) return;
          if (entry.isIntersecting) {
            active.play().catch(() => {});
          } else {
            active.pause();
          }
        });
      },
      { threshold: 0 }
    );
    heroVisibilityObserver.observe(heroPortal);
  }
}

initHeroVideoCarousel();

if (hasGsap && typeof ScrollTrigger !== "undefined" && !reducedMotion.matches) {
  gsap.registerPlugin(ScrollTrigger);

  const heroPortalVideoWrap = document.querySelector("[data-hero-portal-video-carousel]");
  const heroPortalDuotone = document.querySelector("[data-hero-portal-duotone]");
  const heroPortalPanelLeft = document.querySelector('[data-hero-portal-panel="left"]');
  const heroPortalPanelRight = document.querySelector('[data-hero-portal-panel="right"]');
  const heroPortalLogo = document.querySelector("[data-hero-portal-logo]");
  const heroPortalMeta = document.querySelectorAll("[data-hero-portal-meta]");
  const heroPortalMessage = document.querySelector("[data-hero-portal-message]");

  const heroPortalReady =
    heroPortal &&
    heroPortalVideoWrap &&
    heroPortalPanelLeft &&
    heroPortalPanelRight &&
    heroPortalLogo &&
    heroPortalMessage &&
    header &&
    window.matchMedia("(min-width: 900px)").matches;

  if (heroPortalReady) {
    heroPortal.classList.add("is-portal-active");

    gsap.set([heroPortalPanelLeft, heroPortalPanelRight], { display: "block", xPercent: 0 });

    gsap.set(header, { opacity: 0 });

    gsap.set(heroPortalMessage, { opacity: 0, y: 18 });

    const heroPortalTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroPortal,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6
      }
    });

    heroPortalTl
      .to(heroPortalPanelLeft, { xPercent: -100, duration: 0.45, ease: "none" }, 0)
      .to(heroPortalPanelRight, { xPercent: 100, duration: 0.45, ease: "none" }, 0)
      .fromTo(heroPortalLogo, { opacity: 1, scale: 0.86 }, { scale: 1.08, duration: 0.45, ease: "none" }, 0)
      .fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "none" }, 0)
      .fromTo(heroPortalVideoWrap, { scale: 1.15 }, { scale: 1, duration: 0.55, ease: "none" }, 0)
      .fromTo(heroPortalDuotone, { opacity: 0 }, { opacity: 0.4, duration: 0.45, ease: "none" }, 0.05)
      .to(heroPortalLogo, { opacity: 0, duration: 0.15, ease: "none" }, 0.55)
      .to(heroPortalMeta, { opacity: 0, duration: 0.15, ease: "none" }, 0.55)
      .fromTo(
        heroPortalMessage,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.22, ease: "none" },
        0.7
      )
      .to({}, { duration: 0.28 });
  }

  gsap.utils.toArray("[data-reveal]:not(#home [data-reveal])").forEach(element => {
    gsap.fromTo(
      element,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
} else {
  document.querySelectorAll("#home [data-reveal]").forEach(el => el.classList.add("is-visible"));
}

const WA_NUMBER = "5492804607019";
const defaultMessage = "Hola, quisiera hacer una consulta con MCDV & Asociados.";

function waLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

["waContact", "waFloat"].forEach(id => {
  const element = document.getElementById(id);
  if (element) element.href = waLink(defaultMessage);
});

const contactForm = document.getElementById("contactForm");
const formConfirm = document.getElementById("formConfirm");

function setFieldError(input, message) {
  if (!input) return;
  const errorId = input.getAttribute("aria-describedby");
  const errorEl = errorId && document.getElementById(errorId);

  input.classList.toggle("is-invalid", Boolean(message));

  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.classList.toggle("show", Boolean(message));
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const mensajeInput = document.getElementById("mensaje");

    const nombre = nombreInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const telefono = document.getElementById("telefono")?.value.trim() || "No brindó teléfono";
    const mensaje = mensajeInput?.value.trim() || "";

    let firstInvalid = null;

    [
      [nombreInput, nombre, "Contanos tu nombre para poder responderte."],
      [mensajeInput, mensaje, "Contanos brevemente tu situación."]
    ].forEach(([input, value, message]) => {
      if (!input) return;
      const invalid = !value;
      setFieldError(input, invalid ? message : "");
      if (invalid && !firstInvalid) firstInvalid = input;
    });

    if (emailInput) {
      const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setFieldError(emailInput, emailOk ? "" : "Revisá el formato del email (ej: nombre@dominio.com).");
      if (!emailOk && !firstInvalid) firstInvalid = emailInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const text =
      "Hola, soy " + nombre +
      ". Mi email es " + (email || "no brindó email") +
      ". Teléfono: " + telefono +
      ". Consulta: " + mensaje;

    formConfirm?.classList.add("show");
    window.open(waLink(text), "_blank", "noopener");
    contactForm.reset();
  });

  contactForm.querySelectorAll("input, textarea").forEach(field => {
    field.addEventListener("input", () => setFieldError(field, ""));
  });
}

if (reducedMotion.matches) {
  if (hasGsap) gsap.globalTimeline.pause(0);
  document.documentElement.style.scrollBehavior = "auto";
}
