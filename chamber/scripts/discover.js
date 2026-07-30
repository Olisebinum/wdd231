/* =========================================
   Abuja Chamber of Commerce — discover.js
   ========================================= */

const url = "data/discover.json";
const grid = document.querySelector("#discover-grid");
const dialog = document.querySelector("#discover-dialog");
const filterContainer = document.querySelector(".discover-filters");
const resultsCount = document.querySelector("#results-count");

const pinIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>`;

let allAttractions = [];
let activeCategory = "All";

async function getAttractionData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        allAttractions = data.attractions;
        buildFilters(allAttractions);
        renderAttractions(allAttractions);
    } catch (error) {
        console.error("Unable to load discover data:", error);
        grid.innerHTML = "<p>Sorry, attraction information could not be loaded right now.</p>";
    }
}

const buildFilters = (attractions) => {
    const categories = ["All", ...new Set(attractions.map((a) => a.category))];

    filterContainer.innerHTML = categories.map((cat) => `
        <button class="filter-chip" type="button" data-category="${cat}" aria-pressed="${cat === "All"}">${cat}</button>
    `).join("");

    filterContainer.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            activeCategory = chip.dataset.category;
            filterContainer.querySelectorAll(".filter-chip").forEach((c) =>
                c.setAttribute("aria-pressed", c === chip)
            );
            applyFilter();
        });
    });
};

const applyFilter = () => {
    const cards = grid.querySelectorAll(".discover-card");
    let visibleCount = 0;

    cards.forEach((card) => {
        const match = activeCategory === "All" || card.dataset.category === activeCategory;
        card.classList.toggle("is-hidden", !match);
        if (match) visibleCount++;
    });

    resultsCount.textContent = `Showing ${visibleCount} of ${allAttractions.length} places`;
};

const renderAttractions = (attractions) => {
    grid.innerHTML = "";

    attractions.forEach((place, index) => {
        const card = document.createElement("article");
        card.classList.add("discover-card");
        card.dataset.category = place.category;

        card.innerHTML = `
            <div class="discover-card-figure">
                <img src="images/${place.image}" alt="${place.name}" ${index < 2 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} width="400" height="260">
                <div class="discover-card-scrim">
                    <span class="category-chip">${place.category}</span>
                    <h2>${place.name}</h2>
                </div>
            </div>
            <div class="discover-card-body">
                <p class="discover-card-address">${pinIcon}<span>${place.address}</span></p>
                <p class="discover-card-description">${place.description}</p>
                <button class="learn-more-btn" type="button" data-index="${index}">Learn More</button>
            </div>
        `;

        grid.appendChild(card);
    });

    grid.querySelectorAll(".learn-more-btn").forEach((btn) => {
        btn.addEventListener("click", () => openDetails(attractions[btn.dataset.index]));
    });

    applyFilter();
    observeCards();
};

const openDetails = (place) => {
    const mapsQuery = encodeURIComponent(`${place.name}, ${place.address}`);
    dialog.innerHTML = `
        <div class="discover-dialog-figure">
            <img src="images/${place.image}" alt="${place.name}">
            <span class="category-chip">${place.category}</span>
        </div>
        <div class="discover-dialog-body">
            <h2>${place.name}</h2>
            <p class="discover-card-address">${pinIcon}<span>${place.address}</span></p>
            <p>${place.description}</p>
            <div class="discover-dialog-actions">
                <a href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noopener">Get directions</a>
                <button class="discover-dialog-close" type="button">Close</button>
            </div>
        </div>
    `;
    dialog.querySelector(".discover-dialog-close").addEventListener("click", () => dialog.close());
    dialog.showModal();
};

dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog = rect.top <= event.clientY && event.clientY <= rect.bottom &&
                      rect.left <= event.clientX && event.clientX <= rect.right;
    if (!inDialog) dialog.close();
});

/* ===== Scroll-reveal for cards (respects prefers-reduced-motion via CSS) ===== */
const observeCards = () => {
    const cards = grid.querySelectorAll(".discover-card");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach((card) => observer.observe(card));
};

/* ===== Last-visit message via localStorage ===== */
const visitMessage = document.querySelector("#visit-message");
const lastVisit = localStorage.getItem("discoverLastVisit");
const now = Date.now();

if (!lastVisit) {
    visitMessage.textContent = "Welcome! Take a look around and discover what Abuja has to offer.";
} else {
    const daysSince = Math.round((now - Number(lastVisit)) / (1000 * 60 * 60 * 24));
    if (daysSince < 1) {
        visitMessage.textContent = "Back so soon! Thanks for stopping by again today.";
    } else if (daysSince === 1) {
        visitMessage.textContent = "You last visited 1 day ago.";
    } else {
        visitMessage.textContent = `You last visited ${daysSince} days ago.`;
    }
}

localStorage.setItem("discoverLastVisit", String(now));

/* ===== Hamburger nav toggle ===== */
const menuToggle = document.querySelector("#menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
});

/* ===== Dark / light theme toggle ===== */
const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
});

/* ===== Sticky header scroll effect ===== */
const siteHeader = document.querySelector("header");
let scrollTicking = false;

function updateHeaderState() {
    siteHeader.classList.toggle("scrolled", window.scrollY > 40);
    scrollTicking = false;
}

function handleHeaderScroll() {
    if (!scrollTicking) {
        requestAnimationFrame(updateHeaderState);
        scrollTicking = true;
    }
}

window.addEventListener("scroll", handleHeaderScroll, { passive: true });
updateHeaderState();

/* ===== Footer: copyright year + last modified ===== */
document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = `Last Modification: ${document.lastModified}`;

getAttractionData();