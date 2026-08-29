/* PoorMad — Motion layer
 * Framer-Motion-style API for static HTML. Pure vanilla JS + CSS.
 *  - Scroll-triggered reveals (intersection observer, stagger)
 *  - Hero text-mask reveal (split-letter)
 *  - Magnetic buttons (cursor-attracted)
 *  - 3D card tilt (mouse-tracked, perspective)
 *  - Scroll-progress bar (top of page)
 *  - Parallax (data-parallax="0.3")
 *  - Code-typing effect on [data-typewriter]
 *  - Counter animation on [data-count]
 *  - Spotlight cursor effect on cards
 *  - Smooth scroll for in-page anchors
 *  - Subtle noise overlay + animated grid
 * No external deps. ~9KB minified.
 */
(() => {
  const R = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const ONE = (sel, ctx = document) => ctx.querySelector(sel);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const bar = document.createElement("div");
  bar.className = "pm-scrollbar";
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    bar.style.transform = `scaleX(${p})`;
  };
  document.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* ---------- SCROLL-TRIGGERED REVEALS ----------
   * data-reveal="fade-up | fade-in | slide-left | slide-right | scale | blur"
   * Optional: data-reveal-delay="120" (ms), data-reveal-once="true"
   * Parents with data-reveal-group stagger their children automatically.
   */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const once = el.dataset.revealOnce !== "false";
        const d = parseInt(el.dataset.revealDelay || "0", 10);
        setTimeout(() => el.classList.add("pm-in"), d);
        if (once) revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  // auto-stagger children of [data-reveal-group]
  R("[data-reveal-group]").forEach((group) => {
    let i = 0;
    R(":scope > *", group).forEach((child) => {
      if (!child.dataset.reveal) child.dataset.reveal = "fade-up";
      child.dataset.revealDelay = String(80 + i * 70);
      i++;
    });
  });

  R("[data-reveal]").forEach((el) => revealObserver.observe(el));

  /* ---------- HERO TEXT-MASK REVEAL ----------
   * For [data-split]: splits visible text into chars and animates a clip-path mask.
   */
  if (!reduce) {
    R("[data-split]").forEach((el) => {
      const text = el.textContent;
      el.textContent = "";
      const wrap = document.createElement("span");
      wrap.className = "pm-split";
      const chars = [];
      const tokens = text.split(/(\s+)/); // keep spaces
      tokens.forEach((tok) => {
        if (/^\s+$/.test(tok)) {
          const sp = document.createElement("span");
          sp.className = "pm-sp";
          sp.innerHTML = "&nbsp;";
          wrap.appendChild(sp);
          return;
        }
        const word = document.createElement("span");
        word.className = "pm-word";
        [...tok].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "pm-char";
          c.textContent = ch;
          word.appendChild(c);
          chars.push(c);
        });
        wrap.appendChild(word);
      });
      el.appendChild(wrap);
      // animate
      const obs = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              chars.forEach((c, i) => {
                c.style.transitionDelay = `${i * 22}ms`;
                c.classList.add("pm-char-in");
              });
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!reduce) {
    R("[data-magnetic]").forEach((btn) => {
      const strength = parseFloat(btn.dataset.magnetic || "0.3");
      btn.style.willChange = "transform";
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      };
      const onLeave = () => {
        btn.style.transform = "";
      };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
    });
  }

  /* ---------- 3D CARD TILT ----------
   * Adds [data-tilt] to a card and the mouse position will rotate it
   * around the X/Y axis with a subtle perspective. Children with
   * [data-tilt-shift] parallax on the inverse.
   */
  if (!reduce) {
    R("[data-tilt]").forEach((card) => {
      const max = parseFloat(card.dataset.tilt || "6");
      const perspective = 900;
      card.style.transformStyle = "preserve-3d";
      card.style.transition = "transform .18s ease-out";
      const inner = card.querySelector("[data-tilt-inner]") || card;
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(${perspective}px) rotateX(${-dy * max}deg) rotateY(${dx * max}deg) translateZ(0)`;
        // shift inner content the opposite way for a parallax layer
        R("[data-tilt-shift]", card).forEach((sh) => {
          const f = parseFloat(sh.dataset.tiltShift || "8");
          sh.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
        });
        // spotlight position
        card.style.setProperty("--mx", `${(dx + 0.5) * 100}%`);
        card.style.setProperty("--my", `${(dy + 0.5) * 100}%`);
      };
      const onLeave = () => {
        card.style.transform = "";
        R("[data-tilt-shift]", card).forEach((sh) => (sh.style.transform = ""));
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }

  /* ---------- PARALLAX ---------- */
  if (!reduce) {
    const onScroll = () => {
      const y = window.scrollY;
      R("[data-parallax]").forEach((el) => {
        const sp = parseFloat(el.dataset.parallax || "0.2");
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * sp * -1}px)`;
      });
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- COUNTERS ---------- */
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dur = parseInt(el.dataset.countDur || "1400", 10);
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          const v = target * ease(p);
          el.textContent = Number.isInteger(target)
            ? Math.floor(v).toLocaleString()
            : v.toFixed(1);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = Number.isInteger(target)
            ? target.toLocaleString()
            : target.toFixed(1);
        };
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  R("[data-count]").forEach((el) => counterObs.observe(el));

  /* ---------- TYPEWRITER ---------- */
  if (!reduce) {
    R("[data-typewriter]").forEach((el) => {
      const full = el.textContent.trim();
      el.textContent = "";
      el.classList.add("pm-tw-cursor");
      const obs = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            let i = 0;
            const tick = () => {
              if (i <= full.length) {
                el.textContent = full.slice(0, i);
                i++;
                setTimeout(tick, 14 + Math.random() * 22);
              }
            };
            tick();
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
    });
  }

  /* ---------- SMOOTH ANCHOR SCROLL (respects reduced motion) ---------- */
  R('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      const top = tgt.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- ANIMATED GRID + ORBS (background life) ---------- */
  // Only inject once per page
  if (!ONE(".pm-bg")) {
    const bg = document.createElement("div");
    bg.className = "pm-bg";
    bg.innerHTML = `
      <div class="pm-grid"></div>
      <div class="pm-orb pm-orb-a"></div>
      <div class="pm-orb pm-orb-b"></div>
      <div class="pm-orb pm-orb-c"></div>
      <div class="pm-noise"></div>
    `;
    document.body.prepend(bg);
  }

  /* ---------- NAV: scroll state + active link on scroll ---------- */
  const nav = ONE(".topnav");
  if (nav) {
    const onScrollNav = () => {
      if (window.scrollY > 12) nav.classList.add("pm-nav-scrolled");
      else nav.classList.remove("pm-nav-scrolled");
    };
    document.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
  }

  /* ---------- MOON: orbit on hover ---------- */
  R(".logo .moon").forEach((m) => {
    if (reduce) return;
    m.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)";
    m.parentElement.addEventListener("mouseenter", () => {
      m.style.transform = "rotate(360deg) scale(1.12)";
    });
    m.parentElement.addEventListener("mouseleave", () => {
      m.style.transform = "";
    });
  });

  /* ---------- NAV cursor-track (liquid underline origin) ---------- */
  if (!reduce) {
    R(".topnav-links").forEach((nav) => {
      nav.addEventListener("mousemove", (e) => {
        const r = nav.getBoundingClientRect();
        nav.querySelectorAll("a").forEach((a) => {
          const ar = a.getBoundingClientRect();
          const x = ((e.clientX - ar.left) / ar.width) * 100;
          a.style.setProperty("--ux", `${Math.max(0, Math.min(100, x))}%`);
        });
      });
    });
  }

  /* ---------- LAVA ENGINE ---------- */
  (() => {
    if (reduce) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* --- Lava metaball canvas (background flow) --- */
    const lavaWrap = document.createElement("div");
    lavaWrap.className = "pm-lava";
    const cv = document.createElement("canvas");
    lavaWrap.appendChild(cv);
    document.body.prepend(lavaWrap);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0;
    const resize = () => {
      W = lavaWrap.clientWidth; H = lavaWrap.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // pointer position (eased) — lava blooms toward it
    const ptr = { x: -999, y: -999, tx: -999, ty: -999, active: false };
    window.addEventListener("pointermove", (e) => {
      ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.active = true;
    });
    window.addEventListener("pointerleave", () => (ptr.active = false));

    // base ambient blobs + a follower that chases the cursor
    const rnd = (a, b) => a + Math.random() * (b - a);
    const blobs = [];
    const COUNT = Math.max(5, Math.min(9, Math.floor((W * H) / 220000)));
    for (let i = 0; i < COUNT; i++) {
      blobs.push({
        x: rnd(0, W), y: rnd(0, H),
        vx: rnd(-0.18, 0.18), vy: rnd(-0.16, 0.16),
        r: rnd(90, 190),
        hue: rnd(255, 280),
        ph: rnd(0, 6.28),
      });
    }
    const follower = { x: W / 2, y: H / 2, r: 150 };

    let t = 0;
    const tick = () => {
      t += 0.012;
      // ease pointer
      if (ptr.active) {
        ptr.x += (ptr.tx - ptr.x) * 0.08;
        ptr.y += (ptr.ty - ptr.y) * 0.08;
        follower.x += (ptr.x - follower.x) * 0.06;
        follower.y += (ptr.y - follower.y) * 0.06;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      // ambient blobs drift
      for (const b of blobs) {
        b.x += b.vx + Math.sin(t + b.ph) * 0.25;
        b.y += b.vy + Math.cos(t * 0.8 + b.ph) * 0.22;
        if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
        const rr = b.r * (1 + Math.sin(t * 1.3 + b.ph) * 0.12);
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rr);
        g.addColorStop(0, `hsla(${b.hue},85%,62%,0.42)`);
        g.addColorStop(0.5, `hsla(${b.hue},80%,55%,0.16)`);
        g.addColorStop(1, "hsla(270,80%,50%,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, rr, 0, 6.2832); ctx.fill();
      }
      // cursor follower bloom (brighter, larger)
      if (ptr.active) {
        const g = ctx.createRadialGradient(follower.x, follower.y, 0, follower.x, follower.y, follower.r);
        g.addColorStop(0, "hsla(265,95%,70%,0.55)");
        g.addColorStop(0.5, "hsla(262,85%,58%,0.2)");
        g.addColorStop(1, "hsla(262,85%,58%,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(follower.x, follower.y, follower.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    /* --- Ember sparks (rising particles) --- */
    const emberWrap = document.createElement("div");
    emberWrap.className = "pm-embers";
    document.body.prepend(emberWrap);
    const spawn = () => {
      if (emberWrap.childElementCount > 26) return;
      const e = document.createElement("span");
      e.className = "pm-ember";
      const s = rnd(2, 5);
      e.style.width = e.style.height = s + "px";
      e.style.left = rnd(0, 100) + "vw";
      e.style.setProperty("--ex", rnd(-40, 40) + "px");
      e.style.animationDuration = rnd(7, 14) + "s";
      emberWrap.appendChild(e);
      setTimeout(() => e.remove(), 15000);
    };
    setInterval(spawn, 520);
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 200);

    /* --- Molten hero blobs (per hero section) --- */
    R(".hero").forEach((hero) => {
      if (hero.querySelector(".pm-herolava")) return;
      const lava = document.createElement("div");
      lava.className = "pm-herolava";
      lava.innerHTML = `<span class="h1"></span><span class="h2"></span><span class="h3"></span>`;
      hero.insertBefore(lava, hero.firstChild);
    });
  })();

  /* ---------- OS-AWARE DOWNLOAD (existing) ---------- */
  const dl = ONE("#download-btn");
  const lbl = ONE("#os-name");
  if (dl && lbl) {
    const ua = navigator.userAgent;
    if (/Mac|iPhone|iPad/i.test(ua)) {
      dl.href = "https://github.com/Tayyaba22/poormad-agent/releases/download/v0.18.0-mac-arm64.dmg";
      lbl.textContent = "for macOS";
    } else if (/Win/i.test(ua)) {
      dl.href = "https://github.com/Tayyaba22/poormad-agent/releases/download/v0.18.0/PoorMad-0.18.0-win-x64.exe";
      lbl.textContent = "for Windows";
    } else if (/Linux/i.test(ua)) {
      dl.href = "https://github.com/Tayyaba22/poormad-agent/releases/tag/v0.18.0";
      lbl.textContent = "· Linux";
    }
  }

  /* ---------- LIVE INDICATOR PULSE (the .d dot in the badge) ---------- */
  // already CSS-animated; nothing else needed

  /* ---------- LOG A NICE CONSOLE EASTER EGG ---------- */
  if (!reduce) {
    console.log(
      "%c· PoorMad · when the light is blocked, the stars align ·",
      "color:#a78bfa;font-family:monospace;padding:6px 0;font-weight:600"
    );
  }
})();
