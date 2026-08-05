const BOOKMARK_KEY = "cc-bookmarks";
const MAX_COMPARE = 3;

let careers = [];
let bookmarks = new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"));
let compareIds = new Set();
let activeCategory = "all";
let searchTerm = "";
let bookmarkedOnly = false;
let sortMode = "default";

const grid = document.getElementById("career-grid");
const noResults = document.getElementById("no-results");
const resultsCount = document.getElementById("results-count");
const categoryFiltersEl = document.getElementById("category-filters");
const searchInput = document.getElementById("career-search");
const bookmarkedOnlyInput = document.getElementById("bookmarked-only");

const compareBar = document.getElementById("compare-bar");
const compareCountEl = document.getElementById("compare-count");
const compareOpenBtn = document.getElementById("compare-open-btn");
const compareClearBtn = document.getElementById("compare-clear-btn");

const detailModal = document.getElementById("detail-modal");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");

const compareModal = document.getElementById("compare-modal");
const compareBody = document.getElementById("compare-body");
const compareCloseBtn = document.getElementById("compare-close-btn");

function demandClass(demand) {
    return "demand-" + demand.toLowerCase().replace(/\s+/g, "-");
}

function difficultyClass(difficulty) {
    return "difficulty-" + difficulty.toLowerCase();
}

function saveBookmarks() {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...bookmarks]));
}

// ---------- Load + init ----------

renderSkeletons(grid, 6);

fetch("data/careers.json")
    .then((res) => res.json())
    .then((data) => {
        careers = data;
        buildCategoryChips();
        renderGrid();
        renderSalaryChart();

        const params = new URLSearchParams(window.location.search);
        const openId = params.get("open");
        if (openId && careers.some((c) => c.id === openId)) {
            openDetailModal(openId);
        }
    })
    .catch(() => {
        grid.innerHTML = "<p class='no-results'>Careers couldn't be loaded right now. Try refreshing the page.</p>";
    });

function renderSalaryChart() {
    const chartEl = document.getElementById("salary-chart");
    const sorted = [...careers].sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
    const max = parseSalary(sorted[0].salary);

    chartEl.innerHTML = sorted.map((c) => {
        const value = parseSalary(c.salary);
        const pct = Math.round((value / max) * 100);
        return `
            <div class="chart-row ${categorySlug(c.category)}">
                <span class="chart-label">${c.title}</span>
                <span class="chart-track">
                    <span class="chart-fill" style="width: ${pct}%"></span>
                </span>
                <span class="chart-value">${c.salary}</span>
            </div>
        `;
    }).join("");
}

function renderSkeletons(container, count) {
    container.innerHTML = Array.from({ length: count }).map(() => `
        <div class="career-card skeleton-card" aria-hidden="true">
            <div class="skeleton-line skeleton-icon"></div>
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-text short"></div>
        </div>
    `).join("");
}

function buildCategoryChips() {
    const categories = [...new Set(careers.map((c) => c.category))];
    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset.category = cat;
        btn.textContent = cat;
        categoryFiltersEl.appendChild(btn);
    });
}

// ---------- Filtering + rendering ----------

function parseSalary(str) {
    return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

function parseGrowth(str) {
    return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

function getFilteredCareers() {
    const filtered = careers.filter((c) => {
        const matchesCategory = activeCategory === "all" || c.category === activeCategory;
        const matchesBookmark = !bookmarkedOnly || bookmarks.has(c.id);
        const haystack = (c.title + " " + c.skills.join(" ")).toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        return matchesCategory && matchesBookmark && matchesSearch;
    });

    switch (sortMode) {
        case "salary-desc":
            return filtered.sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
        case "salary-asc":
            return filtered.sort((a, b) => parseSalary(a.salary) - parseSalary(b.salary));
        case "growth-desc":
            return filtered.sort((a, b) => parseGrowth(b.growth) - parseGrowth(a.growth));
        case "az":
            return filtered.sort((a, b) => a.title.localeCompare(b.title));
        default:
            return filtered;
    }
}

function renderGrid() {
    const filtered = getFilteredCareers();
    grid.innerHTML = "";

    noResults.hidden = filtered.length !== 0;
    resultsCount.textContent = `Showing ${filtered.length} of ${careers.length} careers`;

    filtered.forEach((career) => {
        grid.appendChild(buildCard(career));
    });
}

function categorySlug(category) {
    return "cat-" + category.toLowerCase().replace(/\s+/g, "-");
}

function buildCard(career) {
    const card = document.createElement("article");
    card.className = "career-card " + categorySlug(career.category);

    const isBookmarked = bookmarks.has(career.id);
    const isCompared = compareIds.has(career.id);
    const isHighGrowth = parseInt(career.growth) >= 25;

    card.innerHTML = `
        <div class="card-banner">
            <div class="card-top-row">
                <div class="career-card-icon" aria-hidden="true">${career.icon}</div>
                <button type="button" class="bookmark-btn ${isBookmarked ? "active" : ""}" aria-pressed="${isBookmarked}" aria-label="Bookmark ${career.title}">
                    ${isBookmarked ? "&#9733;" : "&#9734;"}
                </button>
            </div>
            <p class="card-category">${career.category}${isHighGrowth ? ' <span class="growth-ribbon">&#128640; High Growth</span>' : ""}</p>
            <h3>${career.title}</h3>
        </div>
        <p>${career.summary}</p>
        <div class="career-tags">
            ${career.skills.slice(0, 2).map((s) => `<span class="tag">${s}</span>`).join("")}
        </div>
        <div class="card-lead-stat">
            <span class="value">${career.salary}</span>
            <span class="unit">avg. salary</span>
        </div>
        <div class="card-stats">
            <div>
                <span class="card-stat-label">Demand</span>
                <span class="card-stat-value"><span class="demand-badge ${demandClass(career.demand)}">${career.demand}</span></span>
            </div>
            <div>
                <span class="card-stat-label">Difficulty</span>
                <span class="card-stat-value"><span class="difficulty-badge ${difficultyClass(career.difficulty)}">${career.difficulty}</span></span>
            </div>
            <div>
                <span class="card-stat-label">Growth</span>
                <span class="card-stat-value">${career.growth}</span>
            </div>
            <div>
                <span class="card-stat-label">Time to Learn</span>
                <span class="card-stat-value">${career.timeToLearn}</span>
            </div>
        </div>
        <div class="card-actions">
            <label class="card-compare-label">
                <input type="checkbox" class="compare-checkbox" ${isCompared ? "checked" : ""}>
                Compare
            </label>
            <button type="button" class="view-details-btn">View Details &rarr;</button>
        </div>
    `;

    card.querySelector(".bookmark-btn").addEventListener("click", () => {
        toggleBookmark(career.id);
        renderGrid();
    });

    card.querySelector(".view-details-btn").addEventListener("click", () => openDetailModal(career.id));

    card.querySelector(".compare-checkbox").addEventListener("change", (e) => {
        toggleCompare(career.id, e.target.checked, e.target);
    });

    return card;
}

function toggleBookmark(id) {
    if (bookmarks.has(id)) {
        bookmarks.delete(id);
    } else {
        bookmarks.add(id);
    }
    saveBookmarks();
}

// ---------- Search / filter controls ----------

searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderGrid();
    renderSuggestions();
});

// ---------- Search autocomplete ----------

const suggestionsEl = document.getElementById("search-suggestions");
let activeSuggestionIndex = -1;

function renderSuggestions() {
    activeSuggestionIndex = -1;
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
        suggestionsEl.hidden = true;
        suggestionsEl.innerHTML = "";
        return;
    }
    const matches = careers.filter((c) => c.title.toLowerCase().includes(term)).slice(0, 5);
    if (!matches.length) {
        suggestionsEl.hidden = true;
        suggestionsEl.innerHTML = "";
        return;
    }
    suggestionsEl.innerHTML = matches.map((c, i) => `
        <li>
            <button type="button" class="suggestion-item" data-id="${c.id}" data-index="${i}">
                <span class="suggestion-icon ${categorySlug(c.category)}" aria-hidden="true">${c.icon}</span>
                ${c.title}
            </button>
        </li>
    `).join("");
    suggestionsEl.hidden = false;

    suggestionsEl.querySelectorAll(".suggestion-item").forEach((btn) => {
        btn.addEventListener("click", () => selectSuggestion(btn.dataset.id));
    });
}

function selectSuggestion(id) {
    const career = careers.find((c) => c.id === id);
    if (!career) return;
    searchInput.value = career.title;
    searchTerm = career.title;
    suggestionsEl.hidden = true;
    renderGrid();
    openDetailModal(id);
}

searchInput.addEventListener("keydown", (e) => {
    const items = suggestionsEl.querySelectorAll(".suggestion-item");
    if (suggestionsEl.hidden || !items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
        updateActiveSuggestion(items);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
        updateActiveSuggestion(items);
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(items[activeSuggestionIndex].dataset.id);
    } else if (e.key === "Escape") {
        suggestionsEl.hidden = true;
    }
});

function updateActiveSuggestion(items) {
    items.forEach((item, i) => item.classList.toggle("active", i === activeSuggestionIndex));
    items[activeSuggestionIndex].scrollIntoView({ block: "nearest" });
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
        suggestionsEl.hidden = true;
    }
});

categoryFiltersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    categoryFiltersEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderGrid();
});

bookmarkedOnlyInput.addEventListener("change", (e) => {
    bookmarkedOnly = e.target.checked;
    renderGrid();
});

document.getElementById("sort-select").addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderGrid();
});

// ---------- Compare ----------

function toggleCompare(id, checked, checkboxEl) {
    if (checked) {
        if (compareIds.size >= MAX_COMPARE) {
            checkboxEl.checked = false;
            alert(`You can compare up to ${MAX_COMPARE} careers at a time.`);
            return;
        }
        compareIds.add(id);
    } else {
        compareIds.delete(id);
    }
    updateCompareBar();
}

function updateCompareBar() {
    const count = compareIds.size;
    compareBar.hidden = count === 0;
    compareCountEl.textContent = `${count} selected for comparison`;
    compareOpenBtn.disabled = count < 2;
}

compareClearBtn.addEventListener("click", () => {
    compareIds.clear();
    updateCompareBar();
    renderGrid();
});

compareOpenBtn.addEventListener("click", openCompareModal);

function openCompareModal() {
    const selected = careers.filter((c) => compareIds.has(c.id));
    const rows = [
        { label: "Avg. Salary", get: (c) => c.salary },
        { label: "Demand", get: (c) => c.demand },
        { label: "Difficulty", get: (c) => c.difficulty },
        { label: "Growth", get: (c) => c.growth },
        { label: "Time to Learn", get: (c) => c.timeToLearn },
        { label: "Education", get: (c) => c.education },
        { label: "Key Skills", get: (c) => c.skills.join(", ") }
    ];

    let html = `<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th></th>`;
    selected.forEach((c) => (html += `<th>${c.title}</th>`));
    html += `</tr></thead><tbody>`;
    rows.forEach((row) => {
        html += `<tr><td>${row.label}</td>`;
        selected.forEach((c) => (html += `<td>${row.get(c)}</td>`));
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;

    compareBody.innerHTML = html;
    compareModal.hidden = false;
}

compareCloseBtn.addEventListener("click", () => (compareModal.hidden = true));
compareModal.addEventListener("click", (e) => {
    if (e.target === compareModal) compareModal.hidden = true;
});

// ---------- Detail modal ----------

function downloadRoadmap(career) {
    const lines = [
        `${career.title} — Learning Roadmap`,
        `Career Compass`,
        "",
        `Difficulty: ${career.difficulty}`,
        `Time to learn: ${career.timeToLearn}`,
        `Avg. salary: Junior ${career.salaryRange.junior} / Mid ${career.salaryRange.mid} / Senior ${career.salaryRange.senior}`,
        "",
        "ROADMAP",
        ...career.roadmap.map((step, i) => `${i + 1}. ${step.step} (${step.duration})`),
        "",
        "CERTIFICATIONS TO LOOK INTO",
        ...career.certifications.map((c) => `- ${c}`)
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${career.id}-roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function openDetailModal(id) {
    const career = careers.find((c) => c.id === id);
    if (!career) return;

    const relatedTitles = career.relatedCareers
        .map((rid) => careers.find((c) => c.id === rid))
        .filter(Boolean);

    modalBody.className = categorySlug(career.category);
    modalBody.innerHTML = `
        <div class="modal-title-row">
            <p class="modal-category">${career.category}</p>
            <h2 id="modal-title">${career.title}</h2>
        </div>

        <div class="modal-tabs" role="tablist" aria-label="Career details">
            <button type="button" class="modal-tab active" role="tab" aria-selected="true" data-tab="overview">Overview</button>
            <button type="button" class="modal-tab" role="tab" aria-selected="false" data-tab="roadmap">Roadmap</button>
            <button type="button" class="modal-tab" role="tab" aria-selected="false" data-tab="related">Related</button>
        </div>

        <div class="modal-tabpanel" id="tabpanel-overview" role="tabpanel">
            <p>${career.description}</p>

            <div class="modal-stats">
                <div><span class="card-stat-label">Demand</span><span class="card-stat-value"><span class="demand-badge ${demandClass(career.demand)}">${career.demand}</span></span></div>
                <div><span class="card-stat-label">Difficulty</span><span class="card-stat-value"><span class="difficulty-badge ${difficultyClass(career.difficulty)}">${career.difficulty}</span></span></div>
                <div><span class="card-stat-label">Growth</span><span class="card-stat-value">${career.growth}</span></div>
                <div><span class="card-stat-label">Time to Learn</span><span class="card-stat-value">${career.timeToLearn}</span></div>
            </div>

            <div class="modal-section">
                <h3>Salary by experience</h3>
                <div class="salary-progression">
                    <div class="salary-step">
                        <span class="salary-step-label">Junior</span>
                        <span class="salary-step-value">${career.salaryRange.junior}</span>
                        <span class="salary-bar" style="width: 55%"></span>
                    </div>
                    <div class="salary-step">
                        <span class="salary-step-label">Mid</span>
                        <span class="salary-step-value">${career.salaryRange.mid}</span>
                        <span class="salary-bar" style="width: 75%"></span>
                    </div>
                    <div class="salary-step">
                        <span class="salary-step-label">Senior</span>
                        <span class="salary-step-value">${career.salaryRange.senior}</span>
                        <span class="salary-bar" style="width: 100%"></span>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h3>A day in the life</h3>
                <p class="day-in-life">${career.dayInLife}</p>
            </div>

            <div class="modal-section">
                <h3>What you'd actually do</h3>
                <ul>${career.responsibilities.map((r) => `<li>${r}</li>`).join("")}</ul>
            </div>
        </div>

        <div class="modal-tabpanel" id="tabpanel-roadmap" role="tabpanel" hidden>
            <div class="roadmap-header">
                <h3>Learning roadmap</h3>
                <button type="button" class="download-roadmap-btn" id="download-roadmap-btn">&#8595; Download</button>
            </div>
            <ul class="roadmap-list">
                ${career.roadmap.map((step) => `
                    <li>
                        <span class="roadmap-step-title">${step.step}</span>
                        <span class="roadmap-step-duration">${step.duration}</span>
                    </li>
                `).join("")}
            </ul>
        </div>

        <div class="modal-tabpanel" id="tabpanel-related" role="tabpanel" hidden>
            <div class="modal-section">
                <h3>Worth looking into</h3>
                <p>${career.certifications.join(" &bull; ")}</p>
            </div>

            ${relatedTitles.length ? `
            <div class="modal-section">
                <h3>Related paths</h3>
                <div class="related-chips">
                    ${relatedTitles.map((r) => `<button type="button" class="related-chip" data-id="${r.id}">${r.title}</button>`).join("")}
                </div>
            </div>` : ""}
        </div>
    `;

    modalBody.querySelectorAll(".modal-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            modalBody.querySelectorAll(".modal-tab").forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            modalBody.querySelectorAll(".modal-tabpanel").forEach((p) => (p.hidden = true));
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            document.getElementById(`tabpanel-${tab.dataset.tab}`).hidden = false;
        });
    });

    modalBody.querySelector("#download-roadmap-btn").addEventListener("click", () => downloadRoadmap(career));

    modalBody.querySelectorAll(".related-chip").forEach((chip) => {
        chip.addEventListener("click", () => openDetailModal(chip.dataset.id));
    });

    detailModal.hidden = false;
    modalCloseBtn.focus();
}

modalCloseBtn.addEventListener("click", () => (detailModal.hidden = true));
detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.hidden = true;
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        detailModal.hidden = true;
        compareModal.hidden = true;
    }
});

// ---------- FAQ accordion ----------

document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen);
    });
});