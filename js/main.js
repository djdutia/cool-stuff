function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function paragraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .map(function (block) { return "<p>" + escapeHtml(block.trim()) + "</p>"; })
    .join("");
}

function setActiveNav() {
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    if (a.getAttribute("data-page") === path) a.classList.add("is-active");
  });
}

function initThemeToggle() {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var root = document.documentElement;
    // Light is the default, so anything that isn't an explicit "dark" is light.
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

function renderSkills() {
  var list = document.getElementById("skill-list");
  if (!list || typeof SKILLS === "undefined") return;

  if (!SKILLS.length) {
    list.innerHTML = '<p class="empty">No skills posted yet — check back soon.</p>';
    return;
  }

  list.innerHTML = SKILLS.map(function (s, i) {
    var previewId = "preview-" + s.id;
    return (
      '<article class="entry">' +
        '<h2 class="entry__title">' + escapeHtml(s.title) + "</h2>" +
        '<div class="entry__desc">' + paragraphs(s.description) + "</div>" +
        '<div class="entry__actions">' +
          (s.downloadUrl
            ? '<a class="btn btn--sm" href="' + escapeHtml(s.downloadUrl) + '" download>Download the skill</a>'
            : "") +
          '<button class="disclosure" type="button" aria-expanded="false" aria-controls="' + previewId + '">' +
            "Preview the file" +
            '<span class="disclosure__chev" aria-hidden="true"></span>' +
          "</button>" +
        "</div>" +
        '<div class="entry__preview" id="' + previewId + '" hidden>' +
          '<pre class="manuscript"><code>' + escapeHtml(s.content) + "</code></pre>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  list.querySelectorAll(".disclosure").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
}

function renderFavorites() {
  var list = document.getElementById("fav-grid");
  if (!list || typeof FAVORITES === "undefined") return;

  if (!FAVORITES.length) {
    list.innerHTML = '<p class="empty">Nothing here yet — check back soon.</p>';
    return;
  }

  list.innerHTML = FAVORITES.map(function (f) {
    var body =
      '<div class="row__body">' +
        '<h2 class="row__title">' + escapeHtml(f.title) + "</h2>" +
        '<p class="row__note">' + escapeHtml(f.note) + "</p>" +
      "</div>" +
      '<span class="row__meta">' + escapeHtml(f.category) +
        (f.url ? '<span class="row__arrow" aria-hidden="true">↗</span>' : "") +
      "</span>";

    return f.url
      ? '<a class="row" href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">' + body + "</a>"
      : '<div class="row">' + body + "</div>";
  }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
  setActiveNav();
  initThemeToggle();
  renderSkills();
  renderFavorites();
});
