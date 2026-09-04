function setActiveNav() {
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("data-page") === path) a.classList.add("active");
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function initThemeToggle() {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var root = document.documentElement;
    var current = root.getAttribute("data-theme");
    var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = current ? current === "dark" : systemDark;
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

function renderSkills() {
  var list = document.getElementById("skill-list");
  if (!list || typeof SKILLS === "undefined") return;

  if (!SKILLS.length) {
    list.innerHTML = '<div class="empty">No skills posted yet — check back soon.</div>';
    return;
  }

  list.innerHTML = SKILLS.map(function (s) {
    return (
      '<article class="skill-card" data-id="' + s.id + '">' +
        '<div class="skill-card-head">' +
          '<div class="skill-card-title">' +
            "<h3>" + escapeHtml(s.title) + "</h3>" +
            "<p>" + escapeHtml(s.description) + "</p>" +
          "</div>" +
          '<div class="skill-card-actions">' +
            (s.downloadUrl ? '<a class="btn btn-primary btn-sm" href="' + escapeHtml(s.downloadUrl) + '" download onclick="event.stopPropagation()">Download &#8595;</a>' : "") +
            '<div class="chev">&#9662;</div>' +
          "</div>" +
        "</div>" +
        '<div class="skill-card-body">' +
          '<div class="code-block">' +
            "<pre><code>" + escapeHtml(s.content) + "</code></pre>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  list.querySelectorAll(".skill-card-head").forEach(function (head) {
    head.addEventListener("click", function () {
      head.closest(".skill-card").classList.toggle("open");
    });
  });
}

function renderFavorites() {
  var grid = document.getElementById("fav-grid");
  if (!grid || typeof FAVORITES === "undefined") return;

  if (!FAVORITES.length) {
    grid.innerHTML = '<div class="empty">No favorites posted yet — check back soon.</div>';
    return;
  }

  grid.innerHTML = FAVORITES.map(function (f) {
    return (
      '<article class="fav-card">' +
        '<div class="fav-card-top">' +
          "<h3>" + escapeHtml(f.title) + "</h3>" +
          (f.url ? '<a class="fav-link" href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">Visit &#8599;</a>' : "") +
        "</div>" +
        '<span class="tag">' + escapeHtml(f.category) + "</span>" +
        "<p>" + escapeHtml(f.note) + "</p>" +
      "</article>"
    );
  }).join("");
}

// Posted straight from the browser to FormSubmit's "invisible email" endpoint —
// FORMSUBMIT_HASH is a random token FormSubmit issues once the owner's email
// is confirmed, so it reveals nothing about the actual address. See README
// for the one-time setup that produces this value.
var FORMSUBMIT_HASH = "REPLACE_WITH_FORMSUBMIT_HASH";

function initContactForm() {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("contact-status");
  var submitBtn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements["email"].value.trim();
    var message = form.elements["message"].value.trim();

    status.textContent = "Sending…";
    status.className = "contact-status";
    submitBtn.disabled = true;

    fetch("https://formsubmit.co/ajax/" + FORMSUBMIT_HASH, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "New message from People. Data. AI",
        _template: "table",
        "Reply-to email": email,
        Message: message,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success === "true") {
          status.textContent = "Sent — thanks for the note.";
          status.className = "contact-status is-ok";
          form.reset();
        } else {
          status.textContent = "Something went wrong. Please try again.";
          status.className = "contact-status is-error";
        }
      })
      .catch(function () {
        status.textContent = "Something went wrong. Please try again.";
        status.className = "contact-status is-error";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setActiveNav();
  initThemeToggle();
  renderSkills();
  renderFavorites();
  initContactForm();
});
