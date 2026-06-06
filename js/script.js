document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const langSelect = document.getElementById("langSelect");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("mainNav");
  const searchFields = document.querySelectorAll('input[type="search"][name="q"]');

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const isDarkActive = () => root.classList.contains("theme-dark") || (!root.classList.contains("theme-light") && prefersDark.matches);

  const setNavToggleState = (isOpen) => {
    if (!toggle) {
      return;
    }

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menu principal" : "Abrir menu principal");
    toggle.setAttribute("title", isOpen ? "Cerrar menu principal" : "Abrir menu principal");
  };

  const applyTheme = (theme) => {
    root.classList.remove("theme-light", "theme-dark");

    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else if (theme === "light") {
      root.classList.add("theme-light");
    }

    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      const darkMode = isDarkActive();

      themeToggle.setAttribute("aria-pressed", String(darkMode));
      themeToggle.setAttribute("aria-label", darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      themeToggle.setAttribute("title", darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro");

      if (icon) {
        icon.className = darkMode ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
      }
    }
  };

  const savedTheme = window.localStorage.getItem("lexi-theme");
  applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "system");

  const applyLanguage = (langCode) => {
    const normalized = langCode === "EN" ? "en" : "es";
    root.setAttribute("lang", normalized);
  };

  if (langSelect) {
    const savedLang = window.localStorage.getItem("lexi-lang");
    const initialLang = savedLang === "EN" ? "EN" : "ES";
    langSelect.value = initialLang;
    applyLanguage(initialLang);

    langSelect.addEventListener("change", () => {
      window.localStorage.setItem("lexi-lang", langSelect.value);
      applyLanguage(langSelect.value);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = isDarkActive() ? "light" : "dark";
      window.localStorage.setItem("lexi-theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  prefersDark.addEventListener("change", () => {
    if (!window.localStorage.getItem("lexi-theme")) {
      applyTheme("system");
    }
  });

  if (toggle && nav) {
    setNavToggleState(false);

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      setNavToggleState(isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        setNavToggleState(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        setNavToggleState(false);
        toggle.focus();
      }
    });
  }

  if (searchFields.length > 0) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query) {
      searchFields.forEach((field) => {
        field.value = query;
      });
    }

    searchFields.forEach((field) => {
      field.addEventListener("invalid", () => {
        field.setCustomValidity("Introduce un termino para buscar.");
      });

      field.addEventListener("input", () => {
        field.setCustomValidity("");
      });
    });
  }
});
