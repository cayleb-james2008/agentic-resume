/* demos.js — v4 lab bay
 * Truthful product surfaces (see design/BUILD-NOTES-demos-v3.md).
 * Markup lives in #lab tab panels; element IDs unchanged from v3.
 * prefers-reduced-motion shortens timers via prefersReduce().
 */
(function () {
  "use strict";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function prefersReduce() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, prefersReduce() ? Math.min(ms, 40) : ms);
    });
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ========== dotz — live workflow graph ========== */
  (function initDotz() {
    var logEl = $("#dotz-log");
    var statusEl = $("#dotz-status");
    var phaseEl = $("#dotz-phase");
    var runBtn = $("#dotz-run");
    var resetBtn = $("#dotz-reset");
    if (!logEl || !runBtn) return;

    var running = false;
    var roles = ["scout", "planner", "worker", "reviewer"];
    var tools = {
      scout: ["memory_recall", "grep", "ls", "browser"],
      planner: ["openspec", "subagent", "read"],
      worker: ["edit", "bash", "write", "sandbox_run"],
      reviewer: ["grep", "test", "ultra_review", "vcs_diff"]
    };

    function stamp() {
      return new Date().toTimeString().slice(0, 8);
    }
    function log(line) {
      var code = logEl.querySelector("code");
      if (!code) return;
      code.textContent += "\n[" + stamp() + "] " + line;
      logEl.scrollTop = logEl.scrollHeight;
    }
    function node(role) {
      return $('.wf-node[data-role="' + role + '"]');
    }
    function setState(role, state) {
      var n = node(role);
      if (!n) return;
      n.dataset.phase = state;
      var s = n.querySelector("[data-state]");
      if (s) s.textContent = state;
      n.classList.toggle("is-running", state === "running");
      n.classList.toggle("is-done", state === "done");
      n.classList.toggle("is-verify", state === "verify");
      n.classList.toggle("is-landed", state === "landed");
    }
    function clearChips(role) {
      var n = node(role);
      if (!n) return;
      var box = n.querySelector("[data-chips]");
      if (box) box.innerHTML = "";
    }
    function addChip(role, tool, done) {
      var n = node(role);
      if (!n) return;
      var box = n.querySelector("[data-chips]");
      if (!box) return;
      var chip = document.createElement("span");
      chip.className = "tool-chip" + (done ? " is-done" : " is-run");
      chip.textContent = tool;
      box.appendChild(chip);
    }
    function setPhase(label) {
      if (phaseEl) phaseEl.textContent = label;
    }
    function resetGraph() {
      running = false;
      ["lead"].concat(roles).forEach(function (r) {
        clearChips(r);
        setState(r, r === "lead" ? "ready" : "pending");
      });
      logEl.querySelector("code").textContent =
        "$ ready — run pipeline to disperse scout / planner / worker / reviewer";
      setPhase("idle");
      statusEl.textContent = "Graph idle · verify gate closed";
      runBtn.disabled = false;
    }

    async function runPipeline() {
      if (running) return;
      running = true;
      runBtn.disabled = true;
      roles.forEach(function (r) { clearChips(r); setState(r, "pending"); });
      setState("lead", "running");
      setPhase("decompose");
      log("lead · receive prompt · profile=WORKFLOW");
      log("lead · decompose → scout / planner / worker / reviewer");
      statusEl.textContent = "Dispersing subagents…";
      await delay(280);

      // Fan out scout + planner in parallel feel
      setState("scout", "running");
      setState("planner", "running");
      setPhase("fan-out");
      for (var i = 0; i < 2; i++) {
        addChip("scout", tools.scout[i], false);
        addChip("planner", tools.planner[i], false);
        log("tool · scout." + tools.scout[i] + " → running");
        log("tool · planner." + tools.planner[i] + " → running");
        await delay(220);
        var chipsS = node("scout").querySelectorAll(".tool-chip");
        var chipsP = node("planner").querySelectorAll(".tool-chip");
        if (chipsS[i]) chipsS[i].className = "tool-chip is-done";
        if (chipsP[i]) chipsP[i].className = "tool-chip is-done";
      }
      addChip("scout", tools.scout[2], true);
      addChip("planner", tools.planner[2], true);
      setState("scout", "done");
      setState("planner", "done");
      log("scout · context packed · planner · build units sequenced");
      await delay(200);

      setState("worker", "running");
      setPhase("implement");
      statusEl.textContent = "Worker implementing…";
      for (var w = 0; w < tools.worker.length; w++) {
        addChip("worker", tools.worker[w], false);
        log("tool · worker." + tools.worker[w] + " → running");
        await delay(200);
        var wc = node("worker").querySelectorAll(".tool-chip");
        if (wc[w]) wc[w].className = "tool-chip is-done";
      }
      setState("worker", "done");
      log("worker · patch staged · sandbox_run green (sim)");
      await delay(180);

      setState("reviewer", "running");
      setPhase("adversarial verify");
      statusEl.textContent = "Adversarial verify — independent of worker claims";
      for (var r = 0; r < tools.reviewer.length; r++) {
        addChip("reviewer", tools.reviewer[r], false);
        log("tool · reviewer." + tools.reviewer[r] + " → running");
        await delay(200);
        var rc = node("reviewer").querySelectorAll(".tool-chip");
        if (rc[r]) rc[r].className = "tool-chip is-done";
      }
      setState("reviewer", "verify");
      log("verify · PASS — gaps=0 · quality bar met");
      await delay(220);

      setPhase("land");
      setState("lead", "landed");
      setState("reviewer", "landed");
      log("land · verified result committed to session · receipt=demo-" + Date.now().toString(36));
      statusEl.textContent = "Landed · adversarial verify PASS · human gate idle";
      setPhase("landed");
      running = false;
      runBtn.disabled = false;
    }

    runBtn.addEventListener("click", function () { runPipeline(); });
    if (resetBtn) resetBtn.addEventListener("click", resetGraph);
    resetGraph();
  })();

  /* ========== Sophos — coding agent session ========== */
  (function initSophos() {
    var form = $("#sophos-form");
    var stream = $("#sophos-stream");
    var status = $("#sophos-status");
    var provider = $("#sophos-provider");
    var input = $("#sophos-input");
    if (!form || !stream) return;

    var providers = ["openrouter", "ollama-cloud", "anthropic", "openai"];
    var pi = 0;
    var busy = false;

    function append(kind, html) {
      var el = document.createElement("div");
      el.className = "sophos-msg sophos-msg--" + kind;
      el.innerHTML = html;
      stream.appendChild(el);
      stream.scrollTop = stream.scrollHeight;
      return el;
    }

    $all("#sophos-tree [data-file]").forEach(function (li) {
      li.addEventListener("click", function () {
        $all("#sophos-tree [data-file]").forEach(function (x) { x.classList.remove("is-active"); });
        li.classList.add("is-active");
        status.textContent = "Focused · " + li.getAttribute("data-file");
      });
    });

    if (provider) {
      provider.addEventListener("click", function () {
        pi = (pi + 1) % providers.length;
        provider.textContent = "provider · " + providers[pi];
        status.textContent = "Provider switched → " + providers[pi];
      });
      provider.title = "Click to cycle provider (demo)";
      provider.style.cursor = "pointer";
    }

    async function runSession(prompt) {
      if (busy) return;
      busy = true;
      form.querySelector("button").disabled = true;
      append("user", "<strong>You</strong><p>" + esc(prompt) + "</p>");
      status.textContent = "Agent thinking…";
      await delay(240);

      var steps = [
        { kind: "tool", tool: "read", detail: "src/auth/middleware.ts · 84 lines" },
        { kind: "tool", tool: "read", detail: "tests/auth.test.ts · locate expiry assertions" },
        { kind: "tool", tool: "terminal", detail: "$ npx vitest run tests/auth.test.ts --reporter=dot" },
        { kind: "tool", tool: "edit", detail: "middleware.ts · tighten maxAge + clock skew window" },
        { kind: "tool", tool: "edit", detail: "auth.test.ts · add failing → then passing expiry case" },
        { kind: "tool", tool: "terminal", detail: "$ npx vitest run tests/auth.test.ts → 12 passed" },
        { kind: "agent", text: "JWT expiry check tightened; new regression test green. Ready for your review before commit." }
      ];

      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.kind === "tool") {
          append(
            "tool",
            '<span class="sophos-tool-tag">' + esc(s.tool) + "</span>" +
            "<code>" + esc(s.detail) + "</code>"
          );
          status.textContent = "Tool · " + s.tool;
        } else {
          append("agent", "<strong>Sophos</strong><p>" + esc(s.text) + "</p>");
          status.textContent = "Session idle · last tools: read / edit / terminal";
        }
        await delay(260);
      }
      busy = false;
      form.querySelector("button").disabled = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (input.value || "").trim() || "Tighten JWT expiry check";
      runSession(q);
    });

    // Seed empty state
    stream.innerHTML =
      '<div class="sophos-msg sophos-msg--system"><p>βeta coding session · credits: Prime Intellect prime-agent · tools stream below</p></div>';
  })();

  /* ========== Solomon — RSI lane board ========== */
  (function initSolomon() {
    var board = $("#sol-lanes");
    var notes = $("#sol-notes");
    var status = $("#sol-status");
    if (!board) return;

    var lanes = [
      {
        id: "dotz",
        name: "dotz",
        metric: "cold_start_ms 526",
        backlog: "Fix windowless spawn guard on Windows",
        gate: "RED",
        step: "idle",
        branch: "rsi/dotz-windowless"
      },
      {
        id: "sophos",
        name: "sophos",
        metric: "vitest 1116/1118",
        backlog: "Stabilize OnboardingWizard jsdom nav",
        gate: "GREEN",
        step: "idle",
        branch: "rsi/sophos-wizard"
      },
      {
        id: "solomon",
        name: "solomon (self)",
        metric: "cargo test 1189p/2f",
        backlog: "cfg-gate probe.rs for Linux compile",
        gate: "RED",
        step: "idle",
        branch: "rsi/solomon-linux-probe"
      }
    ];
    var active = 0;
    var moneyDenied = 0;

    function paint() {
      board.innerHTML = "";
      lanes.forEach(function (lane, idx) {
        var card = document.createElement("article");
        card.className = "lane-card" + (idx === active ? " is-active" : "") +
          (lane.gate === "GREEN" ? " is-green" : " is-red");
        card.innerHTML =
          '<header><span class="lane-name">' + esc(lane.name) + "</span>" +
          '<span class="lane-gate gate-' + lane.gate.toLowerCase() + '">' + lane.gate + "</span></header>" +
          '<p class="lane-metric"><span class="meta">metric</span> ' + esc(lane.metric) + "</p>" +
          '<p class="lane-backlog"><span class="meta">backlog</span> ' + esc(lane.backlog) + "</p>" +
          '<p class="lane-step meta">step · ' + esc(lane.step) + " · " + esc(lane.branch) + "</p>";
        card.addEventListener("click", function () {
          active = idx;
          paint();
          status.textContent = "Focused lane · " + lane.name;
        });
        board.appendChild(card);
      });
    }

    function step(kind) {
      var lane = lanes[active];
      if (kind === "money") {
        moneyDenied += 1;
        notes.innerHTML =
          "<strong>money_guard DENY</strong> — fail-closed. Action <code>withdraw</code> / money-out is not whitelisted. " +
          "Denied attempts: " + moneyDenied + ". Only permitted money action would be a whitelisted live-money lane <code>place_trade</code> — surface today: NONE.";
        notes.className = "supervisor-box is-deny";
        status.textContent = "Fail-closed money guard · DENY (pages operator)";
        return;
      }
      if (kind === "observe") {
        lane.step = "observe";
        notes.textContent = "Supervisor: observed " + lane.name + " · metric fresh · objective backlog still tops queue.";
        notes.className = "supervisor-box";
        status.textContent = "Observe complete · " + lane.metric;
      } else if (kind === "implement") {
        lane.step = "implement";
        notes.textContent = "Supervisor: agent implementing on " + lane.branch + " — Solomon never hand-patches; keystone invariant holds.";
        notes.className = "supervisor-box";
        status.textContent = "Implement running · " + lane.backlog;
      } else if (kind === "gate") {
        lane.step = "gate";
        // Force honest gate: empty/substance-less would be RED; demo flips based on prior
        if (lane.id === "sophos") {
          lane.gate = "GREEN";
          notes.textContent = "Gate GREEN — project-native tests honestly green. Eligible to ship as PR.";
        } else {
          lane.gate = "RED";
          notes.textContent = "Gate RED — project-native gate not honestly green (or substanceless). Ship blocked.";
        }
        notes.className = "supervisor-box";
        status.textContent = "Gate " + lane.gate + " · " + lane.name;
      } else if (kind === "ship") {
        lane.step = "ship";
        if (lane.gate !== "GREEN") {
          notes.innerHTML = "<strong>ship-or-revert → REVERT</strong> — honest-green ship gate refused. Branch left unmerged; lane parked.";
          notes.className = "supervisor-box is-deny";
          status.textContent = "Reverted · gate was " + lane.gate;
        } else {
          notes.innerHTML = "<strong>ship-or-revert → SHIP</strong> — commit + push as PR on " + esc(lane.branch) + ". Deploy remains human-gated.";
          notes.className = "supervisor-box is-ship";
          status.textContent = "Shipped PR · " + lane.branch;
          lane.step = "shipped";
        }
      }
      paint();
    }

    $all("[data-sol-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        step(btn.getAttribute("data-sol-step"));
      });
    });
    var reset = $("#sol-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        lanes.forEach(function (l) {
          l.step = "idle";
          l.gate = l.id === "sophos" ? "GREEN" : "RED";
        });
        moneyDenied = 0;
        notes.textContent = "Supervisor: lanes reset · waiting for a loop step.";
        notes.className = "supervisor-box";
        status.textContent = "Reset · money-out still denied by default.";
        paint();
      });
    }
    paint();
  })();

  /* ========== PDM Forge — deeper vault simulator ========== */
  (function initPdm() {
    var logEl = $("#pdm-log");
    var receipts = $("#pdm-receipts");
    if (!logEl) return;

    var state = {
      phase: "WIP",
      part: null,
      rev: null,
      gate: "idle",
      muts: 0,
      hashes: [],
      receipts: [],
      tampered: false
    };

    function log(line) {
      var code = logEl.querySelector("code");
      code.textContent += "\n$ " + line;
      logEl.scrollTop = logEl.scrollHeight;
    }
    function hash(prev, payload) {
      var s = (prev || "genesis") + "|" + payload;
      var h = 0;
      for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return ("00000000" + (h >>> 0).toString(16)).slice(-8);
    }
    function paint() {
      $("#pdm-state").textContent = state.phase;
      $("#pdm-part").textContent = state.part || "—";
      $("#pdm-rev").textContent = state.rev || "—";
      $("#pdm-gate").textContent = state.gate;
      $("#pdm-muts").textContent = String(state.muts);
      $("#pdm-ledger").textContent = state.hashes.length
        ? state.hashes.length + " · tip " + state.hashes[state.hashes.length - 1] + (state.tampered ? " · TAMPER" : "")
        : "empty";
      if (receipts) {
        receipts.innerHTML = "";
        if (!state.receipts.length) {
          var empty = document.createElement("li");
          empty.className = "meta";
          empty.textContent = "No receipts yet.";
          receipts.appendChild(empty);
        } else {
          state.receipts.slice().reverse().forEach(function (r) {
            var li = document.createElement("li");
            li.innerHTML = "<code>" + esc(r.hash) + "</code> · " + esc(r.action) + " · " + esc(r.part) + " @ " + esc(r.rev);
            receipts.appendChild(li);
          });
        }
      }
    }
    function pushReceipt(action, h) {
      state.receipts.push({
        action: action,
        hash: h,
        part: state.part || "—",
        rev: state.rev || "—"
      });
    }

    $all("[data-pdm]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-pdm");
        if (act === "checkout") {
          state.part = "PFV-100";
          state.rev = "revB";
          state.phase = "CheckedOut";
          state.gate = "idle";
          state.muts = 0;
          log("SIMULATOR checkout " + state.part + "_" + state.rev + " → exclusive lock");
          pushReceipt("checkout", hash("genesis", "co|" + state.part + "|" + state.rev));
        } else if (act === "mutate") {
          if (!state.part) { log("refuse — checkout first"); paint(); return; }
          state.muts += 1;
          state.rev = "revB." + state.muts;
          state.phase = "Mutating";
          state.gate = "dirty";
          log("mutate · dim change · mass property recalc (sim) · rev → " + state.rev);
          pushReceipt("mutate", hash(state.hashes[0] || "co", "mu|" + state.rev + "|" + state.muts));
        } else if (act === "gate") {
          if (!state.part) { log("refuse — checkout first"); paint(); return; }
          if (state.muts < 1) { log("refuse — mutate before gate"); paint(); return; }
          state.gate = "GATE PASS";
          state.phase = "Approved";
          log("policy gate · 8/8 rules PASS (naming, refs, materials, mass Δ) (sim)");
          pushReceipt("gate", hash("gate", state.part + "|" + state.rev + "|PASS"));
        } else if (act === "release") {
          if (state.gate !== "GATE PASS") { log("refuse — gate not PASS"); paint(); return; }
          var prev = state.hashes.length ? state.hashes[state.hashes.length - 1] : "genesis";
          var h = hash(prev, state.part + "@" + state.rev + "@" + Date.now());
          state.hashes.push(h);
          state.phase = "Released";
          state.tampered = false;
          log("ledger append · hash=" + h + " · prev=" + prev.slice(0, 8));
          pushReceipt("ledger", h);
        } else if (act === "tamper") {
          if (!state.hashes.length) { log("no ledger to tamper"); paint(); return; }
          state.tampered = true;
          state.hashes[state.hashes.length - 1] = "deadbeef";
          log("TAMPER injected · chain break on verify");
          pushReceipt("tamper", "deadbeef");
        } else if (act === "reset") {
          state = { phase: "WIP", part: null, rev: null, gate: "idle", muts: 0, hashes: [], receipts: [], tampered: false };
          logEl.querySelector("code").textContent = "$ SIMULATOR ready — checkout → mutate → gate → ledger";
          log("reset vault toy");
        }
        paint();
      });
    });
    paint();
  })();

  /* ========== apotheka — honest site page gallery ========== */
  (function initApotheka() {
    var gallery = $("#apo-gallery");
    var status = $("#apo-status");
    if (!gallery) return;

    var pages = {
      hero: {
        title: "01 · Archive drop 001 — live now",
        body: "A vault of curated archive pieces. Y2K, cyber, grunge and gorp — sourced deadstock, measurements on listings, shop on Depop.",
        cta: "Shop on Depop → @apotheka",
        note: "Hero paper card + editorial figure from the real static index.html"
      },
      vault: {
        title: "02 · Fresh in the vault",
        body: "Sample grid: Ribbed Baby Tee · Cyber Zip Hoodie · Skeleton Knit · Tactical Cargo · Racing Bomber · Mesh Long Sleeve — prices move; Depop listing governs.",
        cta: "full catalog on Depop →",
        note: "Vault rail is a lookbook mosaic, not a cart/checkout backend"
      },
      policies: {
        title: "03 · Good to know before you buy",
        body: "Shipping & dispatch (tracked, 24–48h aim) · Fit help (pit-to-pit & length on listings). Bundle deals via Depop messages.",
        cta: "Policies panel on-site",
        note: "Static policy copy — no Stripe/Shopify integration in-repo"
      },
      footer: {
        title: "Footer · cluster",
        body: "APOTHEKA · curated archive & deadstock vault · part of the sophos / outis / neptune / apotheka cluster.",
        cta: "github.com/cayleb-james2008/apotheka-site",
        note: "Single-page static site (.nojekyll + assets + index.html)"
      }
    };

    function show(key) {
      var p = pages[key] || pages.hero;
      gallery.innerHTML =
        '<article class="apo-card">' +
        '<p class="eyebrow">' + esc(p.note) + "</p>" +
        "<h4>" + esc(p.title) + "</h4>" +
        "<p>" + esc(p.body) + "</p>" +
        '<p class="apo-cta meta">' + esc(p.cta) + "</p>" +
        "</article>";
      status.textContent = "Viewing " + key + " — static storefront page mock from the real repo.";
      $all("[data-apo]").forEach(function (chip) {
        var on = chip.getAttribute("data-apo") === key;
        chip.classList.toggle("is-active", on);
        chip.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    $all("[data-apo]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        show(chip.getAttribute("data-apo"));
      });
    });
    show("hero");
  })();
})();
