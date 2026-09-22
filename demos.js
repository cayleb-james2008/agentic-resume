(function () {
  "use strict";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- dotz agent console ---------- */
  (function initDotz() {
    var logEl = $("#dotz-log");
    var statusEl = $("#dotz-status");
    if (!logEl || !statusEl) return;
    var agents = [];
    var running = false;

    function stamp() {
      var d = new Date();
      return d.toTimeString().slice(0, 8);
    }
    function log(line) {
      var code = logEl.querySelector("code");
      if (!code) return;
      code.textContent += "\n[" + stamp() + "] " + line;
      logEl.scrollTop = logEl.scrollHeight;
    }
    function refresh() {
      statusEl.textContent = "Agents: " + agents.length + " (" + agents.join(", ") + ") · Pipeline " + (running ? "running" : "idle");
    }

    $all("[data-dotz-spawn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-dotz-spawn");
        if (agents.indexOf(name) !== -1) {
          log("skip — " + name + " already spawned");
          return;
        }
        agents.push(name);
        log("spawn agent " + name + " · pid=sim-" + (1000 + agents.length));
        refresh();
      });
    });

    var runBtn = $("[data-dotz-run]");
    if (runBtn) {
      runBtn.addEventListener("click", function () {
        if (running) return;
        if (!agents.length) {
          log("error — spawn at least one agent");
          refresh();
          return;
        }
        running = true;
        refresh();
        var steps = ["plan", "execute", "critique", "commit"];
        var i = 0;
        function tick() {
          if (i >= steps.length) {
            log("pipeline ok · " + agents.length + " agents · receipt=demo-" + Date.now().toString(36));
            running = false;
            refresh();
            return;
          }
          log("step " + (i + 1) + "/" + steps.length + " · " + steps[i] + " ← " + agents[i % agents.length]);
          i += 1;
          setTimeout(tick, 420);
        }
        log("pipeline start · agents=[" + agents.join(",") + "]");
        setTimeout(tick, 280);
      });
    }

    var clearBtn = $("[data-dotz-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        agents = [];
        running = false;
        logEl.querySelector("code").textContent = "$ ready — spawn an agent to begin";
        refresh();
      });
    }
    refresh();
  })();

  /* ---------- sophos research desk ---------- */
  (function initSophos() {
    var form = $("#sophos-form");
    var cards = $("#sophos-cards");
    var status = $("#sophos-status");
    if (!form || !cards) return;

    var bank = {
      default: [
        { id: "A", title: "Working memory vs scratchpad", source: "arxiv-sim/2401.demo", claim: "Agents that externalize scratchpads reduce loop thrash." },
        { id: "B", title: "Retrieval hygiene", source: "notes/sophos-sim", claim: "Cite before synthesize; reject unsourced summaries." },
        { id: "C", title: "Verification pass", source: "handbook/demo", claim: "A second agent should score claims, not rewrite them." }
      ]
    };

    function render(query) {
      cards.innerHTML = "";
      var list = bank.default;
      list.forEach(function (item) {
        var el = document.createElement("article");
        el.className = "source-card";
        el.dataset.state = "pending";
        el.innerHTML =
          "<header><span class=\"tag\">Source " + item.id + "</span><span class=\"meta\">" + item.source + "</span></header>" +
          "<h4>" + item.title + "</h4>" +
          "<p>" + item.claim + "</p>" +
          "<p class=\"meta\">Matched query: <em>" + query.replace(/</g, "&lt;") + "</em></p>" +
          "<div class=\"demo-toolbar\">" +
          "<button type=\"button\" class=\"btn demo-btn\" data-verdict=\"verify\">Verify</button>" +
          "<button type=\"button\" class=\"btn demo-btn\" data-verdict=\"reject\">Reject</button>" +
          "</div>" +
          "<p class=\"card-state meta\" aria-live=\"polite\">Pending review</p>";
        cards.appendChild(el);
      });
      status.textContent = list.length + " sourced cards — verify or reject each.";
      bindCards();
    }

    function bindCards() {
      $all(".source-card", cards).forEach(function (card) {
        $all("[data-verdict]", card).forEach(function (btn) {
          btn.addEventListener("click", function () {
            var v = btn.getAttribute("data-verdict");
            card.dataset.state = v === "verify" ? "verified" : "rejected";
            card.classList.toggle("is-verified", v === "verify");
            card.classList.toggle("is-rejected", v === "reject");
            var state = card.querySelector(".card-state");
            if (state) state.textContent = v === "verify" ? "Verified ✓" : "Rejected ✕";
            var verified = $all(".source-card.is-verified", cards).length;
            var rejected = $all(".source-card.is-rejected", cards).length;
            status.textContent = "Verified " + verified + " · Rejected " + rejected + " · Pending " + ($all(".source-card", cards).length - verified - rejected);
          });
        });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = ($("#sophos-query").value || "untitled").trim();
      render(q);
    });
  })();

  /* ---------- solomon decision bench ---------- */
  (function initSolomon() {
    var impact = $("#solomon-impact");
    var risk = $("#solomon-risk");
    var impactVal = $("#solomon-impact-val");
    var riskVal = $("#solomon-risk-val");
    var scenario = $("#solomon-scenario");
    var judge = $("#solomon-judge");
    var out = $("#solomon-verdict");
    if (!impact || !judge || !out) return;

    function sync() {
      impactVal.textContent = impact.value;
      riskVal.textContent = risk.value;
    }
    impact.addEventListener("input", sync);
    risk.addEventListener("input", sync);

    judge.addEventListener("click", function () {
      var i = Number(impact.value);
      var r = Number(risk.value);
      var score = i - r;
      var name = scenario.options[scenario.selectedIndex].text;
      var verdict, tone;
      if (score >= 40) { verdict = "GO — ship with monitoring"; tone = "go"; }
      else if (score >= 10) { verdict = "CONDITIONAL — ship with guardrails"; tone = "mid"; }
      else if (score >= -10) { verdict = "HOLD — reduce risk or raise upside"; tone = "mid"; }
      else { verdict = "NO-GO — revisit the bet"; tone = "stop"; }
      out.className = "verdict-box is-" + tone;
      out.innerHTML =
        "<strong>" + verdict + "</strong>" +
        "<span class=\"meta\">Scenario: " + name + " · impact " + i + "% · risk " + r + "% · score " + score + "</span>";
    });
  })();

  /* ---------- PDM Forge vault simulator ---------- */
  (function initPdm() {
    var logEl = $("#pdm-log");
    var stateEl = $("#pdm-state");
    var partEl = $("#pdm-part");
    var gateEl = $("#pdm-gate");
    var ledgerEl = $("#pdm-ledger");
    if (!logEl) return;

    var state = { phase: "WIP", part: null, gate: "idle", hashes: [], tampered: false };

    function log(line) {
      var code = logEl.querySelector("code");
      code.textContent += "\n$ " + line;
      logEl.scrollTop = logEl.scrollHeight;
    }
    function paint() {
      stateEl.textContent = state.phase;
      partEl.textContent = state.part || "—";
      gateEl.textContent = state.gate;
      ledgerEl.textContent = state.hashes.length
        ? state.hashes.length + " entries" + (state.tampered ? " · TAMPER DETECTED" : " · intact")
        : "empty";
    }
    function hash(prev, payload) {
      var s = (prev || "genesis") + "|" + payload;
      var h = 0;
      for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return ("00000000" + (h >>> 0).toString(16)).slice(-8);
    }

    $all("[data-pdm]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-pdm");
        if (act === "checkout") {
          state.part = "PFV-100_revB";
          state.phase = "DesignReview";
          state.gate = "idle";
          log("SIMULATOR checkout " + state.part + " → DesignReview");
        } else if (act === "gate") {
          if (!state.part) { log("refuse — check out a part first"); paint(); return; }
          state.gate = "GATE PASS";
          state.phase = "Approved";
          log("policy gate · 8/8 rules PASS (sim)");
        } else if (act === "release") {
          if (state.gate !== "GATE PASS") { log("refuse — gate not PASS"); paint(); return; }
          var prev = state.hashes.length ? state.hashes[state.hashes.length - 1] : "genesis";
          var h = hash(prev, state.part + "@" + Date.now());
          state.hashes.push(h);
          state.phase = "Released";
          state.tampered = false;
          log("release recorded · hash=" + h + " · prev=" + prev.slice(0, 8));
        } else if (act === "tamper") {
          if (!state.hashes.length) { log("no ledger to tamper"); paint(); return; }
          state.tampered = true;
          state.hashes[state.hashes.length - 1] = "deadbeef";
          log("TAMPER injected · chain break detected on verify");
        } else if (act === "reset") {
          state = { phase: "WIP", part: null, gate: "idle", hashes: [], tampered: false };
          logEl.querySelector("code").textContent = "$ SIMULATOR ready";
          log("reset vault toy");
        }
        paint();
      });
    });
    paint();
  })();

  /* ---------- apotheka storefront mosaic ---------- */
  (function initApotheka() {
    var mosaic = $("#apotheka-mosaic");
    var status = $("#apotheka-status");
    if (!mosaic) return;

    var items = [
      { id: 1, name: "Dawn Elixir", cat: "elixir", tone: "#e0b48a" },
      { id: 2, name: "Forge Kit", cat: "kit", tone: "#b8895f" },
      { id: 3, name: "Caliper Tool", cat: "tool", tone: "#f0c9a0" },
      { id: 4, name: "Night Tonic", cat: "elixir", tone: "#6b4a36" },
      { id: 5, name: "Ledger Kit", cat: "kit", tone: "#8fb387" },
      { id: 6, name: "Probe Tool", cat: "tool", tone: "#ead9c8" }
    ];
    var filter = "all";
    var selected = null;

    function render() {
      mosaic.innerHTML = "";
      var shown = items.filter(function (it) { return filter === "all" || it.cat === filter; });
      shown.forEach(function (it) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mosaic-tile" + (selected === it.id ? " is-selected" : "");
        btn.style.setProperty("--tile", it.tone);
        btn.setAttribute("data-id", String(it.id));
        btn.innerHTML = "<span class=\"mosaic-swatch\" aria-hidden=\"true\"></span><span class=\"mosaic-name\">" + it.name + "</span><span class=\"meta\">" + it.cat + "</span>";
        btn.addEventListener("click", function () {
          selected = it.id;
          status.textContent = "Selected: " + it.name + " (" + it.cat + ") — demo only, not a live shop.";
          render();
        });
        mosaic.appendChild(btn);
      });
      if (!shown.length) status.textContent = "No items in this filter.";
      else if (selected == null) status.textContent = "Showing " + shown.length + " item" + (shown.length === 1 ? "" : "s") + (filter === "all" ? "" : " · " + filter);
    }

    $all("[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        filter = chip.getAttribute("data-filter");
        selected = null;
        $all("[data-filter]").forEach(function (c) { c.classList.toggle("is-active", c === chip); });
        render();
      });
    });
    render();
  })();
})();
