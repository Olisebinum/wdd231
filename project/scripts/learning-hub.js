import { fetchJSON } from "./modules/fetch-json.js";

let certifications = [];
let resources = [];
let certCategory = "all";
let resourceCategory = "all";

const certGrid = document.getElementById("cert-grid");
const certFiltersEl = document.getElementById("cert-filters");
const resourceGrid = document.getElementById("resource-grid");
const resourceFiltersEl = document.getElementById("resource-filters");

function categorySlug(category) {
    return "cat-" + category.toLowerCase().replace(/\s+/g, "-");
}

function buildChips(container, categories, onSelect) {
    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset.category = cat;
        btn.textContent = cat;
        container.appendChild(btn);
    });

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        onSelect(btn.dataset.category);
    });
}

function renderSkeletons(container, count) {
    container.innerHTML = Array.from({ length: count }).map(() => `
        <div class="cert-card skeleton-card" aria-hidden="true">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-text short"></div>
        </div>
    `).join("");
}

renderSkeletons(certGrid, 6);
renderSkeletons(resourceGrid, 6);

// ---------- Certifications ----------

async function loadCertifications() {
    try {
        const data = await fetchJSON("data/certifications.json");
        certifications = data;
        buildChips(certFiltersEl, [...new Set(data.map((c) => c.category))], (cat) => {
            certCategory = cat;
            renderCerts();
        });
        renderCerts();
    } catch (err) {
        console.error("Could not load certifications:", err);
        certGrid.innerHTML = "<p class='no-results'>Certifications couldn't be loaded right now.</p>";
    }
}

loadCertifications();

function renderCerts() {
    const filtered = certCategory === "all" ? certifications : certifications.filter((c) => c.category === certCategory);
    certGrid.innerHTML = filtered.map((cert) => `
        <article class="cert-card ${categorySlug(cert.category)}">
            <p class="card-category">${cert.category}</p>
            <h3>${cert.name}</h3>
            <p class="cert-provider">${cert.provider}</p>
            <p class="cert-description">${cert.description}</p>
            <div class="cert-meta">
                <span class="difficulty-badge ${difficultyClass(cert.level)}">${cert.level}</span>
                <span class="cert-format">${cert.format}</span>
            </div>
            <a href="${cert.url}" class="resource-link" target="_blank" rel="noopener noreferrer">Visit site &#8599;</a>
        </article>
    `).join("");
}

function difficultyClass(level) {
    return "difficulty-" + level.toLowerCase();
}

// ---------- Resources ----------

async function loadResources() {
    try {
        const data = await fetchJSON("data/resources.json");
        resources = data;
        buildChips(resourceFiltersEl, [...new Set(data.map((r) => r.category))], (cat) => {
            resourceCategory = cat;
            renderResources();
        });
        renderResources();
    } catch (err) {
        console.error("Could not load resources:", err);
        resourceGrid.innerHTML = "<p class='no-results'>Resources couldn't be loaded right now.</p>";
    }
}

loadResources();

function renderResources() {
    const filtered = resourceCategory === "all" ? resources : resources.filter((r) => r.category === resourceCategory);
    resourceGrid.innerHTML = filtered.map((res) => `
        <article class="resource-card ${categorySlug(res.category)}">
            <div class="resource-top-row">
                <span class="resource-type">${res.type}</span>
                <span class="resource-cost">${res.cost}</span>
            </div>
            <h3>${res.title}</h3>
            <p class="cert-provider">${res.provider}</p>
            <p class="cert-description">${res.description}</p>
            <span class="difficulty-badge ${difficultyClass(res.difficulty)}">${res.difficulty}</span>
            <a href="${res.url}" class="resource-link" target="_blank" rel="noopener noreferrer">Visit site &#8599;</a>
        </article>
    `).join("");
}

// ---------- Contact form validation ----------

const form = document.getElementById("contact-form");
const nameInput = document.getElementById("contact-name");
const emailInput = document.getElementById("contact-email");
const messageInput = document.getElementById("contact-message");

function showError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateName() {
    if (nameInput.value.trim().length < 2) {
        showError(nameInput, "name-error", "Enter your name (at least 2 characters).");
        return false;
    }
    showError(nameInput, "name-error", "");
    return true;
}

function validateEmail() {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(emailInput.value.trim())) {
        showError(emailInput, "email-error", "Enter a valid email address.");
        return false;
    }
    showError(emailInput, "email-error", "");
    return true;
}

function validateMessage() {
    if (messageInput.value.trim().length < 10) {
        showError(messageInput, "message-error", "Message should be at least 10 characters.");
        return false;
    }
    showError(messageInput, "message-error", "");
    return true;
}

nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
messageInput.addEventListener("blur", validateMessage);

form.addEventListener("submit", (e) => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
        e.preventDefault();
    }
    // If all fields are valid, the form submits normally (GET) and the
    // browser navigates to form-action.html with the data as query params.
});