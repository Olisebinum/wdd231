import { initNavToggle } from "./modules/nav-toggle.js";
import { initFooterMeta } from "./modules/footer-meta.js";
import { renderCompassTicks } from "./modules/compass-ticks.js";
import { fetchJSON } from "./modules/fetch-json.js";

initNavToggle();
initFooterMeta();
renderCompassTicks();

// ---------- Stat counters on Home ----------
// Real counts pulled from actual data files, not fabricated.

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

    async function loadStats() {
        try {
            const [careers, certs, resources] = await Promise.all([
                fetchJSON("data/careers.json"),
                fetchJSON("data/certifications.json"),
                fetchJSON("data/resources.json")
            ]);
            animateCount(document.getElementById("stat-careers"), careers.length);
            animateCount(document.getElementById("stat-certs"), certs.length);
            animateCount(document.getElementById("stat-resources"), resources.length);
        } catch (err) {
            // If data can't load, leave the counters at 0 rather than showing a wrong number.
            console.error("Could not load stats:", err);
        }
    }

    loadStats();
}

// ---------- Scroll-reveal ----------
// Fade sections in as they enter the viewport.
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