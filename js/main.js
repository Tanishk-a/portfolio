(function () {
  "use strict";

  var THEME_KEY = "theme";
  var SEARCH_DELAY_MS = 150;
  var activeCategory = "all";
  var searchQuery = "";
  var searchTimer = null;

  applyTheme(getInitialTheme());
  initThemeToggle();
  initNav();
  initProfileFallback();
  initContactForm();
  setFooterYear();
  renderProjects();
  initProjectControls();

  function getInitialTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {
      /* storage may be blocked */
    }
    try {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    } catch (e) {
      /* matchMedia may be unavailable */
    }
    return "dark";
  }

  function applyTheme(theme) {
    var next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    var button = document.getElementById("theme-toggle");
    if (button) {
      var isDark = next === "dark";
      button.setAttribute("aria-checked", isDark ? "true" : "false");
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    requestAnimationFrame(function () {
      document.documentElement.classList.add("theme-ready");
    });
  }

  function toggleTheme() {
    var current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* storage may be blocked */
    }
  }

  function initThemeToggle() {
    var button = document.getElementById("theme-toggle");
    if (!button) return;
    button.addEventListener("click", toggleTheme);
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    var links = document.querySelectorAll('.nav-list a[href^="#"]');
    var sections = ["about", "skills", "projects", "contact"]
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav) nav.classList.remove("is-open");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
        }
      });
    });

    if (!("IntersectionObserver" in window) || !sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          links.forEach(function (link) {
            var match = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", match);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.1 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initProfileFallback() {
    var img = document.getElementById("profile-image");
    var fallback = document.querySelector(".profile-fallback");
    if (!img || !fallback) return;

    function showFallback() {
      img.hidden = true;
      fallback.hidden = false;
    }

    img.addEventListener("error", showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.elements.namedItem("name");
      var email = form.elements.namedItem("email");
      var message = form.elements.namedItem("message");
      var valid =
        name &&
        email &&
        message &&
        name.value.trim() &&
        email.value.trim() &&
        message.value.trim();

      status.classList.toggle("is-error", !valid);
      status.textContent = valid
        ? "Thanks — your message is ready. Opening your email client is optional; this is a front-end confirmation only."
        : "Please fill in name, email, and message.";

      if (!valid) return;

      // TODO: Replace [your-email] with a real address if using mailto.
      var subject = encodeURIComponent("Portfolio message from " + name.value.trim());
      var body = encodeURIComponent(
        message.value.trim() + "\n\nFrom: " + email.value.trim()
      );
      form.reset();
      window.location.href =
        "mailto:[your-email]?subject=" + subject + "&body=" + body;
    });
  }

  function setFooterYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initProjectControls() {
    var search = document.getElementById("project-search");
    var chips = document.querySelectorAll(".chip[data-category]");

    if (search) {
      search.addEventListener("input", function () {
        searchQuery = search.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderProjects, SEARCH_DELAY_MS);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-category") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        renderProjects();
      });
    });
  }

  function getProjects() {
    return Array.isArray(window.projects) ? window.projects : [];
  }

  function matchesSearch(project, query) {
    if (!query) return true;
    var haystack = [
      project.title,
      project.description,
      project.tag,
      (project.technologies || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function matchesCategory(project, category) {
    if (!category || category === "all") return true;
    return (project.categories || []).indexOf(category) !== -1;
  }

  function renderProjects() {
    var grid = document.getElementById("project-grid");
    var empty = document.getElementById("project-empty");
    var count = document.getElementById("project-count");
    if (!grid) return;

    var query = searchQuery.toLowerCase().trim();
    var list = getProjects().filter(function (project) {
      return matchesSearch(project, query) && matchesCategory(project, activeCategory);
    });

    grid.replaceChildren();

    list.forEach(function (project) {
      grid.appendChild(createCard(project));
    });

    if (empty) empty.hidden = list.length > 0;
    if (count) {
      count.textContent =
        list.length === 1
          ? "Showing 1 project"
          : "Showing " + list.length + " projects";
    }
  }

  function createCard(project) {
    var card = document.createElement("article");
    card.className = "project-card";

    var tag = document.createElement("p");
    tag.className = "project-tag";
    tag.textContent = project.tag || "";

    var title = document.createElement("h3");
    title.textContent = project.title || "";

    var desc = document.createElement("p");
    desc.textContent = project.description || "";

    var techList = document.createElement("ul");
    techList.className = "card-tech";
    (project.technologies || []).forEach(function (tech) {
      var li = document.createElement("li");
      li.className = "tech-pill";
      li.textContent = tech;
      techList.appendChild(li);
    });

    var links = document.createElement("div");
    links.className = "card-links";

    var github = document.createElement("a");
    github.href = project.githubUrl || "#";
    github.target = "_blank";
    github.rel = "noopener noreferrer";
    github.textContent = "GitHub";
    links.appendChild(github);

    if (project.liveUrl) {
      var live = document.createElement("a");
      live.href = project.liveUrl;
      live.target = "_blank";
      live.rel = "noopener noreferrer";
      live.textContent = "Live App ↗";
      links.appendChild(live);
    }

    card.append(tag, title, desc, techList, links);
    return card;
  }
})();
