// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const primaryNav = document.getElementById("primary-nav");

navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
});

// Stat counters on Home — real counts pulled from actual data files, not fabricated
const statCareers = document.getElementById("stat-careers");
if (statCareers) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animateCount(el, target) {
        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }
        const duration = 900;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(progress * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    Promise.all([
        fetch("data/careers.json").then((r) => r.json()),
        fetch("data/certifications.json").then((r) => r.json()),
        fetch("data/resources.json").then((r) => r.json())
    ]).then(([careers, certs, resources]) => {
        animateCount(document.getElementById("stat-careers"), careers.length);
        animateCount(document.getElementById("stat-certs"), certs.length);
        animateCount(document.getElementById("stat-resources"), resources.length);
    }).catch(() => {
        // If data can't load, leave the counters at 0 rather than showing a wrong number
    });
}

// Scroll-reveal: fade sections in as they enter the viewport.
// Skipped entirely under reduced-motion — content just shows normally.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll(".section, .journey-section, .stats-band");
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((el) => {
        el.classList.add("reveal");
        revealObserver.observe(el);
    });
}

// Footer year
const yearEl = document.getElementById("current-year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Footer "last modified" — genuinely reflects this file's last edit,
// via document.lastModified (built into every browser).
const lastModEl = document.getElementById("last-modified");
if (lastModEl) {
    lastModEl.textContent = new Date(document.lastModified).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
    });
}

// Generate the compass rose tick marks (36 ticks, every 10 degrees)
const ticksGroup = document.getElementById("ticks");
if (ticksGroup) {
    const cx = 140, cy = 140, outerR = 116, innerRShort = 108, innerRLong = 100;
    let svgMarkup = "";
    for (let deg = 0; deg < 360; deg += 10) {
        const isMajor = deg % 90 === 0;
        const innerR = isMajor ? innerRLong : innerRShort;
        const rad = (deg - 90) * (Math.PI / 180);
        const x1 = cx + outerR * Math.cos(rad);
        const y1 = cy + outerR * Math.sin(rad);
        const x2 = cx + innerR * Math.cos(rad);
        const y2 = cy + innerR * Math.sin(rad);
        svgMarkup += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="compass-tick"></line>`;
    }
    ticksGroup.innerHTML = svgMarkup;
}