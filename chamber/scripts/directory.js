/* =========================================
   Abuja Chamber of Commerce — directory.js
   ========================================= */

const url = "data/members.json";
const directory = document.querySelector("#directory");
const memberCount = document.querySelector("#member-count");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const gridBtn = document.querySelector("#grid-btn");
const listBtn = document.querySelector("#list-btn");

let allMembers = [];

async function getMemberData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        // console.table(data.members); // temporary testing of data response
        allMembers = data.members;
        populateCategoryFilter(allMembers);
        renderMembers(allMembers);
    } catch (error) {
        console.error("Unable to load member data:", error);
        directory.innerHTML = "<p>Sorry, member information could not be loaded right now.</p>";
    }
}

const badgeLabel = (level) => {
    if (level === 3) return { text: "Gold", class: "gold" };
    if (level === 2) return { text: "Silver", class: "silver" };
    return { text: "Member", class: "member" };
};

const renderMembers = (members) => {
    directory.innerHTML = "";

    memberCount.textContent = `${members.length} registered business${members.length === 1 ? "" : "es"}`;

    members.forEach((member) => {
        const badge = badgeLabel(member.membershipLevel);

        const card = document.createElement("section");
        card.classList.add("member-card");

        card.innerHTML = `
            <div class="member-card-header">
                <div class="member-card-heading">
                    <h3>${member.name}</h3>
                    <span class="category-chip">${member.category}</span>
                </div>
                <p class="tagline">${member.tagline}</p>
            </div>
            <img src="images/${member.image}" alt="${member.name}" loading="lazy" width="260" height="140">
            <div class="member-card-body">
                <p>${member.address}</p>
                <p>${member.phone}</p>
                <p><a href="${member.url}" target="_blank" rel="noopener">${member.url.replace(/^https?:\/\//, "")}</a></p>
            </div>
            <div class="member-card-footer">
                <span class="badge ${badge.class}">${badge.text}</span>
                <a class="details-link" href="${member.url}" target="_blank" rel="noopener">View details</a>
            </div>
        `;

        directory.appendChild(card);
    });
};

const populateCategoryFilter = (members) => {
    const categories = [...new Set(members.map((member) => member.category))].sort();

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
};

const applyFilters = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = allMembers.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "all" || member.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderMembers(filtered);
};

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

gridBtn.addEventListener("click", () => {
    directory.classList.remove("list-view");
    directory.classList.add("grid-view");
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
    gridBtn.setAttribute("aria-pressed", "true");
    listBtn.setAttribute("aria-pressed", "false");
});

listBtn.addEventListener("click", () => {
    directory.classList.remove("grid-view");
    directory.classList.add("list-view");
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
    listBtn.setAttribute("aria-pressed", "true");
    gridBtn.setAttribute("aria-pressed", "false");
});

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

/* ===== Footer: copyright year + last modified ===== */
document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = `Last Modification: ${document.lastModified}`;

getMemberData();