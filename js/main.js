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

function renderSkills() {
  var list = document.getElementById("skill-list");
  var filterRow = document.getElementById("filter-row");
  if (!list || typeof SKILLS === "undefined") return;

  if (!SKILLS.length) {
    list.innerHTML = '<div class="empty">No skills posted yet — check back soon.</div>';
    return;
  }

  var tags = Array.from(new Set(SKILLS.flatMap(function (s) { return s.tags; }))).sort();
  if (filterRow) {
    filterRow.innerHTML =
      '<button class="pill active" data-tag="all">All</button>' +
      tags.map(function (t) { return '<button class="pill" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + "</button>"; }).join("");
  }

  function draw(activeTag) {
    var items = SKILLS.filter(function (s) { return activeTag === "all" || s.tags.indexOf(activeTag) !== -1; });
    list.innerHTML = items
      .map(function (s) {
        return (
          '<article class="skill-card" data-id="' + s.id + '">' +
            '<div class="skill-card-head">' +
              '<div class="skill-card-title">' +
                "<h3>" + escapeHtml(s.title) + "</h3>" +
                "<p>" + escapeHtml(s.description) + "</p>" +
                '<div class="tag-row">' + s.tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + "</span>"; }).join("") + "</div>" +
              "</div>" +
              '<div class="chev">&#9662;</div>' +
            "</div>" +
            '<div class="skill-card-body">' +
              '<div class="code-block">' +
                '<button class="copy-btn" type="button">Copy</button>' +
                "<pre><code>" + escapeHtml(s.content) + "</code></pre>" +
              "</div>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    list.querySelectorAll(".skill-card-head").forEach(function (head) {
      head.addEventListener("click", function () {
        head.closest(".skill-card").classList.toggle("open");
      });
    });

    list.querySelectorAll(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var code = btn.parentElement.querySelector("code").textContent;
        navigator.clipboard.writeText(code).then(function () {
          var original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(function () { btn.textContent = original; }, 1500);
        });
      });
    });
  }

  draw("all");

  if (filterRow) {
    filterRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".pill");
      if (!btn) return;
      filterRow.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      draw(btn.getAttribute("data-tag"));
    });
  }
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

document.addEventListener("DOMContentLoaded", function () {
  setActiveNav();
  renderSkills();
  renderFavorites();
});
