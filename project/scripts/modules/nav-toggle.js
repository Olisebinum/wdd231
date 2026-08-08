// Mobile nav toggle — shared across all pages.
export function initNavToggle() {
    const navToggle = document.getElementById("nav-toggle");
    const primaryNav = document.getElementById("primary-nav");
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener("click", () => {
        const isOpen = primaryNav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });
}