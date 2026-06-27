/* ==========================================================================
   Dheeraj Chandra — Portfolio v2
   Minimal JS: content render + single scroll-reveal. That's it.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.PORTFOLIO || {};
  const $ = (s, c = document) => c.querySelector(s);
  const el = (t, cls, html) => {
    const n = document.createElement(t);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const canTouch = () => window.matchMedia("(pointer: coarse)").matches;
  const haptic = (pattern = 8) => {
    if (canTouch() && "vibrate" in navigator) navigator.vibrate(pattern);
  };

  const ICON = {
    github:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6a11.5 11.5 0 0 0 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M14 5h5v5M19 5l-9 9M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="m3 7 9 6 9-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };

  /* ---------- Render ---------- */
  function render() {
    const p = D.PROFILE || {};

    $("#heroName").textContent = p.firstName || "Dheeraj";
    $("#heroIntro").textContent = p.intro || "";
    $("#heroIntro2").textContent = p.intro2 || "";
    $("#contactAvail").textContent = p.availability || "";
    $("#contactMail").textContent = p.email || "";
    $("#asciiArt").textContent = D.ASCII || "";

    // Work
    const wl = $("#workList");
    wl.replaceChildren();
    (D.PROJECTS || []).forEach((pr, i) => {
      const item = el("article", "work-item reveal");
      item.innerHTML = `
        <span class="work-index">${String(i + 1).padStart(2, "0")}</span>
        <div class="work-main">
          <h3 class="work-name">${pr.name}</h3>
          <p class="work-blurb">${pr.blurb}</p>
          <div class="work-tech">${(pr.stack || []).map((s) => `<span>${s}</span>`).join("")}</div>
        </div>
        <div class="work-side">
          <span class="work-year">${pr.year || ""}</span>
          <div class="work-links">
            <a href="${pr.repo}" target="_blank" rel="noopener" title="Source" aria-label="${pr.name} source">${ICON.github}<span>Source</span></a>
            ${pr.live ? `<a href="${pr.live}" target="_blank" rel="noopener" title="Live" aria-label="${pr.name} live">${ICON.external}<span>Live</span></a>` : ""}
          </div>
        </div>`;
      wl.appendChild(item);
    });

    // About
    const at = $("#aboutText");
    at.replaceChildren();
    (D.ABOUT || []).forEach((t) => at.appendChild(el("p", null, t)));

    // Stack
    const sg = $("#stackGrid");
    sg.replaceChildren();
    Object.entries(D.STACK || {}).forEach(([group, items]) => {
      const g = el("div", "stack-group");
      g.appendChild(el("h3", null, group));
      const list = el("ul", "stack-list");
      items.forEach((it) => list.appendChild(el("li", null, it)));
      g.appendChild(list);
      sg.appendChild(g);
    });

    // Timeline
    const tl = $("#timeline");
    tl.replaceChildren();
    (D.EXPERIENCE || []).forEach((x) => {
      const item = el("div", "tl-item reveal");
      item.innerHTML = `
        <div class="tl-head">
          <div><span class="tl-role">${x.role}</span><span class="tl-org"> · ${x.org}</span></div>
          <span class="tl-period">${x.period}</span>
        </div>
        <p class="tl-detail">${x.detail}</p>`;
      tl.appendChild(item);
    });

    // Contact links
    const cl = $("#contactLinks");
    cl.replaceChildren();
    [
      { label: "GitHub", href: p.github, icon: ICON.github },
      { label: "LinkedIn", href: p.linkedin, icon: ICON.linkedin },
      { label: "LeetCode", href: p.leetcode, icon: ICON.external },
      { label: "Email", href: `mailto:${p.email}`, icon: ICON.mail },
    ].forEach((l) => {
      const a = el("a", "contact-link");
      a.href = l.href;
      if (!l.href.startsWith("mailto:")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.setAttribute("aria-label", l.label === "Email" ? "Send email" : `Open ${l.label}`);
      a.innerHTML = `${l.icon}<span>${l.label}</span>`;
      cl.appendChild(a);
    });
  }

  /* ---------- Single reveal observer (gentle, staggered) ---------- */
  function setupReveal() {
    const items = [...document.querySelectorAll(".reveal")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((i) => i.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            const peers = e.target.parentElement
              ? [...e.target.parentElement.children].filter((c) => c.classList.contains("reveal"))
              : [e.target];
            const peerIdx = peers.indexOf(e.target);
            e.target.style.transitionDelay = `${Math.min(Math.max(peerIdx, 0), 4) * 0.06}s`;
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((i) => io.observe(i));
    // Safety net: if anything is still hidden after load + a tick, reveal it
    setTimeout(() => {
      items.forEach((i) => { if (!i.classList.contains("in")) i.classList.add("in"); });
    }, 1500);
  }

  /* ---------- Nav: scroll state + active section + mobile menu ---------- */
  function setupNav() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("docked", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // active link
    const links = [...document.querySelectorAll(".nav-links a")];
    const mobileLinks = [];
    const map = {};
    links.forEach((l) => {
      const id = l.getAttribute("href").slice(1);
      const s = document.getElementById(id);
      if (s) map[id] = l;
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const l = map[e.target.id];
          if (l && e.isIntersecting) {
            links.forEach((x) => x.classList.remove("active"));
            links.forEach((x) => x.removeAttribute("aria-current"));
            mobileLinks.forEach((x) => x.classList.remove("active"));
            l.classList.add("active");
            l.setAttribute("aria-current", "page");
            mobileLinks
              .filter((x) => x.getAttribute("href") === l.getAttribute("href"))
              .forEach((x) => x.classList.add("active"));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    [...document.querySelectorAll("main section[id]")].forEach((s) => spy.observe(s));

    // mobile menu
    const toggle = $("#navToggle");
    const menu = el("div", "mobile-menu");
    menu.id = "mobileMenu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", "Menu");
    menu.setAttribute("aria-hidden", "true");
    menu.innerHTML = ["work", "about", "stack", "experience", "contact"]
      .map((id) => `<a href="#${id}">${id.charAt(0).toUpperCase() + id.slice(1)}</a>`)
      .join("");
    document.body.appendChild(menu);
    mobileLinks.push(...menu.querySelectorAll("a"));
    toggle.setAttribute("aria-controls", "mobileMenu");
    toggle.setAttribute("aria-expanded", "false");

    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      if (open) window.setTimeout(() => mobileLinks[0]?.focus({ preventScroll: true }), 40);
    };

    toggle.addEventListener("click", () => {
      setMenu(!menu.classList.contains("open"));
    });
    [...menu.querySelectorAll("a")].forEach((a) =>
      a.addEventListener("click", () => {
        setMenu(false);
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760 && menu.classList.contains("open")) setMenu(false);
    });
  }

  function setupTactileFeedback() {
    document.addEventListener(
      "pointerdown",
      (e) => {
        const target = e.target.closest("a, button, .stack-list li");
        if (!target) return;
        haptic(target.classList.contains("nav-toggle") ? 12 : 7);
      },
      { passive: true }
    );
  }

  /* ---------- Init ---------- */
  function init() {
    render();
    setupReveal();
    setupNav();
    setupTactileFeedback();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
