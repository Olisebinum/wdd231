// Footer year + "last updated" date — shared across all pages.
export function initFooterMeta() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Genuinely reflects this file's last edit, via document.lastModified
    // (built into every browser) rather than a hardcoded date.
    const lastModEl = document.getElementById("last-modified");
    if (lastModEl) {
        lastModEl.textContent = new Date(document.lastModified).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    }
}