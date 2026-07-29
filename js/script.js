(() => {
  "use strict";

  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;
  body.classList.add("is-loading");
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const preloader = $("[data-preloader]");
  const dismissIntro = () => {
    if (!preloader || preloader.classList.contains("is-hidden")) return;
    preloader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    window.setTimeout(() => preloader.remove(), 800);
  };
  $("[data-skip-intro]")?.addEventListener("click", dismissIntro);
  window.addEventListener("load", () => window.setTimeout(dismissIntro, reduceMotion.matches ? 0 : 1900));
  window.setTimeout(dismissIntro, 3200);

  const header = $("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 32);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuButton = $(".menu-toggle");
  const nav = $("#site-nav");
  const setMenu = (open) => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    $(".sr-only", menuButton).textContent = open ? "Close menu" : "Open menu";
    nav.classList.toggle("is-open", open);
    body.style.overflow = open ? "hidden" : "";
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  $(".service-list")?.addEventListener("click", (event) => {
    const button = event.target.closest(".service-item > button");
    if (!button) return;
    const item = button.closest(".service-item");
    const wasOpen = item.classList.contains("is-active");
    $$(".service-item").forEach((service) => {
      service.classList.remove("is-active");
      $("button", service).setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("is-active");
      button.setAttribute("aria-expanded", "true");
    }
  });

  const worlds = {
    digital: { number: "01", title: "Digital<br>Experiences", items: "Landing pages · Websites · Interactive concepts", label: "Stories made<br>scrollable.", small: "IMMERSIVE" },
    publishing: { number: "02", title: "Publishing<br>with Heart", items: "Children’s books · Journals · Workbooks", label: "Ideas made<br>tangible.", small: "STORIES" },
    celebrations: { number: "03", title: "Remarkable<br>Celebrations", items: "Digital invitations · Event moments · Keepsakes", label: "An entrance<br>worth making.", small: "OCCASION" },
    learning: { number: "04", title: "Learning &amp;<br>Creativity", items: "Coloring books · Activities · Educational tools", label: "Wonder made<br>useful.", small: "DISCOVERY" },
    branding: { number: "05", title: "Business &amp;<br>Branding", items: "Branded experiences · Digital assets · Concepts", label: "Presence with<br>purpose.", small: "IDENTITY" }
  };
  const selector = $("[data-world-selector]");
  selector?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-world]");
    if (!button) return;
    const key = button.dataset.world;
    const data = worlds[key];
    if (!data) return;
    $$("[data-world]", selector).forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
    const stage = $(".world-stage", selector);
    stage.className = `world-stage world-stage--${key}`;
    $(".world-stage__number", stage).textContent = data.number;
    $(".world-stage__copy h3", stage).innerHTML = data.title;
    $(".world-stage__copy span", stage).textContent = data.items;
    $(".world-card--a small", stage).textContent = data.small;
    $(".world-card--a strong", stage).innerHTML = data.label;
    if (!reduceMotion.matches) {
      stage.animate([{ opacity: .55, transform: "scale(.99)" }, { opacity: 1, transform: "scale(1)" }], { duration: 500, easing: "cubic-bezier(.22,1,.36,1)" });
    }
  });
  $(".world-tabs")?.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const tabs = $$("[role=tab]", event.currentTarget);
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === "ArrowRight" ? (current + 1) % tabs.length : (current - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });

  $(".faq-list")?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const item = button.closest("article");
    const open = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });

  const form = $("#inquiry-form");
  const validateField = (field) => {
    const error = field.parentElement.querySelector(".field-error");
    let message = "";
    if (field.required && !field.value.trim()) message = "Please complete this field.";
    if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = "Enter a valid email address.";
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const required = $$("[required]", form);
    const valid = required.map(validateField).every(Boolean);
    const status = $(".form-status", form);
    if (!valid) {
      status.textContent = "Please review the highlighted fields and try again.";
      status.classList.add("is-visible");
      form.querySelector("[aria-invalid=true]")?.focus();
      return;
    }
    status.textContent = "Your project details look great. This is a demo form, so nothing was sent. Connect a form endpoint before launch to receive inquiries.";
    status.classList.add("is-visible");
    form.reset();
    required.forEach((field) => field.setAttribute("aria-invalid", "false"));
  });
  form?.addEventListener("blur", (event) => {
    if (event.target.matches("[required]")) validateField(event.target);
  }, true);

  $$('a[href="#"]').forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
  $("[data-back-top]")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" }));
  $("[data-year]").textContent = new Date().getFullYear();
})();
