(function () {
  var API = "/api/try-work-sample";
  var MIN = 200;
  var MAX = 12000;
  var LIBS = {
    pdf: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    pdfWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    docx: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js",
    turnstile: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  };
  var DOCS = ["brief", "evaluator", "materials"];
  var MARKER = /^<<<(BRIEF|EVALUATOR|MATERIALS)>>>[ \t]*$/gm;

  var form = document.getElementById("try-form");
  if (!form) return;
  var jd = document.getElementById("jd");
  var fileInput = document.getElementById("jd-file");
  var fileStatus = document.getElementById("file-status");
  var count = document.getElementById("jd-count");
  var runBtn = document.getElementById("run");
  var quota = document.getElementById("quota");
  var formError = document.getElementById("form-error");
  var progress = document.getElementById("progress");
  var elapsedEl = document.getElementById("elapsed");
  var results = document.getElementById("results");
  var resultNotice = document.getElementById("result-notice");
  var saveBtn = document.getElementById("save-pdf");

  var state = {
    available: false,
    siteKey: null,
    widget: null,
    token: null,
    running: false,
    active: "brief",
    userPicked: false,
    finished: false,
  };

  // ---------- helpers ----------
  var loaded = {};
  function loadScript(src) {
    if (!loaded[src]) {
      loaded[src] = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = function () { reject(new Error("Couldn't load " + src)); };
        document.head.appendChild(s);
      });
    }
    return loaded[src];
  }

  function show(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  function fmt(n) { return n.toLocaleString("en"); }

  function updateCount() {
    var n = jd.value.trim().length;
    count.textContent = fmt(n) + " / " + fmt(MAX);
    count.classList.toggle("is-over", n > MAX);
    updateRunState();
  }

  function updateRunState() {
    var n = jd.value.trim().length;
    runBtn.disabled = !(state.available && state.token && !state.running && n >= MIN && n <= MAX);
  }

  // ---------- availability + human check ----------
  function init() {
    fetch(API, { headers: { accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (info) {
        if (!info.available) {
          quota.textContent = info.reason === "not-configured" || info.reason === "disabled"
            ? "The live demo is switched off right now. You can still download the skill."
            : "Today's free runs are used up. Come back tomorrow, or download the skill.";
          return;
        }
        state.available = true;
        state.siteKey = info.siteKey;
        quota.textContent = info.limitPerVisitor + " free runs per person per day.";
        return loadScript(LIBS.turnstile).then(renderTurnstile);
      })
      .catch(function () {
        quota.textContent = "The live demo is unavailable right now. You can still download the skill.";
      });
  }

  function renderTurnstile() {
    if (!window.turnstile || !state.siteKey) return;
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    state.widget = window.turnstile.render("#turnstile", {
      sitekey: state.siteKey,
      action: "try-wsb",
      theme: dark ? "dark" : "light",
      callback: function (t) { state.token = t; updateRunState(); },
      "expired-callback": function () { state.token = null; updateRunState(); },
      "error-callback": function () { state.token = null; updateRunState(); },
    });
  }

  function resetTurnstile() {
    state.token = null;
    if (window.turnstile && state.widget !== null) window.turnstile.reset(state.widget);
    updateRunState();
  }

  // ---------- file upload ----------
  function readFile(file) {
    var name = file.name.toLowerCase();
    if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error("That file is over 10 MB."));
    if (/\.(txt|md)$/.test(name)) return file.text();
    if (/\.pdf$/.test(name)) {
      return Promise.all([file.arrayBuffer(), loadScript(LIBS.pdf)]).then(function (res) {
        var pdfjs = window.pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = LIBS.pdfWorker;
        return pdfjs.getDocument({ data: res[0] }).promise.then(function (pdf) {
          var pages = [];
          for (var i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            pages.push(pdf.getPage(i).then(function (p) { return p.getTextContent(); }).then(function (tc) {
              return tc.items.map(function (it) { return it.str + (it.hasEOL ? "\n" : ""); }).join("");
            }));
          }
          return Promise.all(pages).then(function (texts) { return texts.join("\n\n"); });
        });
      });
    }
    if (/\.docx$/.test(name)) {
      return Promise.all([file.arrayBuffer(), loadScript(LIBS.docx)]).then(function (res) {
        return window.mammoth.extractRawText({ arrayBuffer: res[0] }).then(function (r) { return r.value; });
      });
    }
    return Promise.reject(new Error("Use a PDF, Word (.docx) or text file, or paste the text."));
  }

  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    show(formError, "");
    fileStatus.textContent = "Reading " + file.name + "…";
    readFile(file)
      .then(function (text) {
        text = String(text).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
        if (!text) throw new Error("Couldn't find any text in that file. If it's a scanned PDF, paste the text instead.");
        if (text.length > MAX) {
          text = text.slice(0, MAX);
          fileStatus.textContent = file.name + " (trimmed to " + fmt(MAX) + " characters)";
        } else {
          fileStatus.textContent = file.name;
        }
        jd.value = text;
        updateCount();
      })
      .catch(function (e) {
        fileStatus.textContent = "";
        show(formError, e.message || "Couldn't read that file.");
      })
      .then(function () { fileInput.value = ""; });
  });

  jd.addEventListener("input", updateCount);

  // ---------- tabs ----------
  function select(name, byUser) {
    if (byUser) state.userPicked = true;
    state.active = name;
    DOCS.forEach(function (d) {
      var on = d === name;
      document.getElementById("tab-" + d).setAttribute("aria-selected", String(on));
      document.getElementById("doc-" + d).hidden = !on;
    });
    updateSaveState();
  }

  DOCS.forEach(function (d) {
    document.getElementById("tab-" + d).addEventListener("click", function () { select(d, true); });
  });

  // ---------- rendering ----------
  function split(text) {
    var out = { brief: "", evaluator: "", materials: "" };
    var current = null;
    var last = 0;
    var m;
    MARKER.lastIndex = 0;
    while ((m = MARKER.exec(text))) {
      if (current) out[current] = text.slice(last, m.index);
      current = m[1].toLowerCase();
      last = MARKER.lastIndex;
    }
    // Hide a marker that is only half streamed in.
    if (current) out[current] = text.slice(last).replace(/\n?<{1,3}[A-Z]*>{0,3}$/, "");
    return { docs: out, current: current };
  }

  function renderMarkdown(md) {
    var html = DOMPurify.sanitize(marked.parse(md, { gfm: true, breaks: false }), {
      FORBID_TAGS: ["style", "form", "input", "img", "iframe"],
      FORBID_ATTR: ["style"],
    });
    var tpl = document.createElement("template");
    tpl.innerHTML = html;
    tpl.content.querySelectorAll("table").forEach(function (t) {
      var wrap = document.createElement("div");
      wrap.className = "table-wrap";
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
    tpl.content.querySelectorAll("a").forEach(function (a) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    return tpl.content;
  }

  function credit() {
    var p = document.createElement("p");
    p.className = "doc__credit";
    p.innerHTML = 'Created with <a href="https://dhrumeel.xyz" target="_blank" rel="noopener">dhrumeel.xyz</a>';
    return p;
  }

  var buffer = "";
  var renderQueued = false;
  var doneDocs = {};

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    setTimeout(function () {
      renderQueued = false;
      render(state.finished);
    }, 250);
  }

  function render(final) {
    var parsed = split(buffer);
    DOCS.forEach(function (d, i) {
      var md = parsed.docs[d].trim();
      var body = document.querySelector("#doc-" + d + " .doc__body");
      var finished = final || (parsed.current && DOCS.indexOf(parsed.current) > i);
      body.replaceChildren();
      if (md) {
        body.appendChild(renderMarkdown(md));
        if (finished) body.appendChild(credit());
      } else if (!final) {
        var wait = document.createElement("p");
        wait.className = "doc__waiting";
        wait.textContent = "Not written yet.";
        body.appendChild(wait);
      }
      doneDocs[d] = !!(finished && md);
      var tab = document.getElementById("tab-" + d);
      tab.classList.toggle("is-writing", !final && parsed.current === d);
      tab.classList.toggle("is-done", doneDocs[d]);
    });
    if (parsed.current && !final) {
      setStep(parsed.current);
      if (!state.userPicked && state.active !== parsed.current) select(parsed.current, false);
    }
    updateSaveState();
  }

  function updateSaveState() {
    saveBtn.disabled = !doneDocs[state.active];
  }

  // ---------- progress ----------
  var timer = null;
  function setStep(step) {
    var idx = ["thinking"].concat(DOCS).indexOf(step);
    progress.querySelectorAll("[data-step]").forEach(function (li, i) {
      li.classList.toggle("is-done", i < idx);
      li.classList.toggle("is-active", i === idx);
    });
  }

  function startClock() {
    var t0 = Date.now();
    elapsedEl.textContent = "";
    timer = setInterval(function () {
      var s = Math.round((Date.now() - t0) / 1000);
      elapsedEl.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + " elapsed · usually 2–4 minutes";
    }, 1000);
  }

  function stopClock() {
    clearInterval(timer);
    timer = null;
  }

  // ---------- run ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (runBtn.disabled) return;
    show(formError, "");
    show(resultNotice, "");

    state.running = true;
    state.userPicked = false;
    state.finished = false;
    buffer = "";
    doneDocs = {};
    updateRunState();
    runBtn.textContent = "Working…";

    var token = state.token;
    resetTurnstile();

    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jd: jd.value.trim(), token: token }),
    })
      .then(function (res) {
        var type = res.headers.get("content-type") || "";
        if (!res.ok || type.indexOf("ndjson") === -1) {
          return res.json().catch(function () { return {}; }).then(function (b) {
            throw new Error(b.error || "Something went wrong. Please try again.");
          });
        }
        progress.hidden = false;
        results.hidden = false;
        setStep("thinking");
        startClock();
        select("brief", false);
        render(false);
        progress.scrollIntoView({ behavior: "smooth", block: "start" });
        return readStream(res.body);
      })
      .catch(function (err) {
        show(formError, err.message);
      })
      .then(function () {
        stopClock();
        state.running = false;
        runBtn.textContent = "Build the work sample";
        updateRunState();
      });
  });

  function readStream(body) {
    var reader = body.getReader();
    var decoder = new TextDecoder();
    var pending = "";
    var finished = false;

    function handle(line) {
      if (!line.trim()) return;
      var ev;
      try { ev = JSON.parse(line); } catch (e) { return; }
      if (ev.t === "text") {
        buffer += ev.d;
        queueRender();
      } else if (ev.t === "done") {
        finished = true;
        finish(ev.truncated
          ? "It hit the length limit, so the last document may stop mid-way."
          : "");
      } else if (ev.t === "error") {
        finished = true;
        finish(ev.msg || "Something went wrong.");
      }
    }

    function pump() {
      return reader.read().then(function (r) {
        if (r.done) {
          if (pending) handle(pending);
          if (!finished) finish("The connection dropped before it finished. What arrived is below.");
          return;
        }
        pending += decoder.decode(r.value, { stream: true });
        var lines = pending.split("\n");
        pending = lines.pop();
        lines.forEach(handle);
        return pump();
      });
    }
    return pump();
  }

  function finish(message) {
    state.finished = true;
    stopClock();
    if (buffer.trim() === "NOT_A_JOB_DESCRIPTION") {
      progress.hidden = true;
      results.hidden = true;
      show(formError, "That doesn't look like a job description. Paste the role's JD and try again.");
      return;
    }
    render(true);
    progress.querySelectorAll("[data-step]").forEach(function (li) {
      li.classList.remove("is-active");
      li.classList.add("is-done");
    });
    elapsedEl.textContent = message ? "" : "Done.";
    show(resultNotice, message);
  }

  // ---------- PDF ----------
  saveBtn.addEventListener("click", function () {
    var doc = document.getElementById("doc-" + state.active);
    var title = document.title;
    document.body.classList.add("print-one");
    doc.classList.add("is-printing");
    document.title = doc.getAttribute("data-name") + " - Work sample";
    var restore = function () {
      document.body.classList.remove("print-one");
      doc.classList.remove("is-printing");
      document.title = title;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  });

  updateCount();
  init();
})();
