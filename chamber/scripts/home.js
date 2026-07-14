/* =========================================
   Abuja Chamber of Commerce — home.js
   ========================================= */

/* ============================
   Weather — OpenWeatherMap API
   ============================ */

const lat = 9.08;
const lon = 7.40;
const apiKey = "25e7fb511a2d75191f654680f77122e9";

const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

const currentTempEl = document.querySelector("#current-temp");
const currentDescEl = document.querySelector("#current-desc");
const weatherIconEl = document.querySelector("#weather-icon");
const forecastEl = document.querySelector("#forecast");
const weatherSkeletonEl = document.querySelector("#weather-skeleton");
const weatherContentEl = document.querySelector("#weather-content");
const feelsLikeEl = document.querySelector("#weather-feelslike");
const humidityEl = document.querySelector("#weather-humidity");
const windEl = document.querySelector("#weather-wind");
const pressureEl = document.querySelector("#weather-pressure");

function showWeatherContent() {
    if (weatherSkeletonEl) weatherSkeletonEl.hidden = true;
    if (weatherContentEl) weatherContentEl.hidden = false;
}

async function getCurrentWeather() {
    try {
        const response = await fetch(currentUrl);
        if (response.ok) {
            const data = await response.json();
            displayCurrentWeather(data);
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        console.error("Unable to load current weather:", error);
        currentDescEl.textContent = "Weather data unavailable.";
        showWeatherContent();
    }
}

function displayCurrentWeather(data) {
    currentTempEl.textContent = `${Math.round(data.main.temp)}\u00B0C`;
    currentDescEl.textContent = data.weather[0].description;

    const iconSrc = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    weatherIconEl.setAttribute("src", iconSrc);
    weatherIconEl.setAttribute("alt", data.weather[0].description);

    if (feelsLikeEl) feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}\u00B0C`;
    if (humidityEl) humidityEl.textContent = `${data.main.humidity}%`;
    if (windEl) windEl.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    if (pressureEl) pressureEl.textContent = `${data.main.pressure} hPa`;

    showWeatherContent();
}

async function getForecast() {
    try {
        const response = await fetch(forecastUrl);
        if (response.ok) {
            const data = await response.json();
            displayForecast(data);
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        console.error("Unable to load forecast:", error);
        forecastEl.innerHTML = "<p>Forecast unavailable.</p>";
    }
}

function displayForecast(data) {
    // The 5 day / 3 hour forecast returns 40 entries (8 per day).
    // Grab the entry closest to midday for each of the next 3 days.
    const middayForecasts = data.list.filter((entry) => entry.dt_txt.includes("12:00:00")).slice(0, 3);

    forecastEl.innerHTML = "";

    middayForecasts.forEach((entry) => {
        const date = new Date(entry.dt_txt);
        const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

        const dayCard = document.createElement("div");
        dayCard.classList.add("forecast-day");
        dayCard.innerHTML = `
            <p class="forecast-label">${dayLabel}</p>
            <img src="https://openweathermap.org/img/w/${entry.weather[0].icon}.png" alt="${entry.weather[0].description}" class="forecast-icon" width="34" height="34">
            <p class="forecast-temp">${Math.round(entry.main.temp)}\u00B0C</p>
        `;
        forecastEl.appendChild(dayCard);
    });
}

/* ============================
   Member Spotlights
   ============================ */

const spotlightsEl = document.querySelector("#spotlights");
const membersUrl = "data/members.json";

async function getSpotlights() {
    try {
        const response = await fetch(membersUrl);
        const data = await response.json();
        displaySpotlights(data.members);
    } catch (error) {
        console.error("Unable to load member spotlights:", error);
        spotlightsEl.innerHTML = "<p>Spotlights unavailable right now.</p>";
    }
}

function displaySpotlights(members) {
    // Only gold (3) and silver (2) members are eligible for spotlights.
    const eligible = members.filter((member) => member.membershipLevel === 3 || member.membershipLevel === 2);

    // Shuffle and pick 2-3 members randomly.
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 2 : 3;
    const selected = shuffled.slice(0, count);

    spotlightsEl.innerHTML = "";

    selected.forEach((member) => {
        const badge = member.membershipLevel === 3 ? { text: "Gold", class: "gold" } : { text: "Silver", class: "silver" };

        const card = document.createElement("section");
        card.classList.add("spotlight-card");
        card.innerHTML = `
            <img src="images/${member.image}" alt="${member.name} logo" loading="lazy" width="260" height="140">
            <div class="spotlight-body">
                <div class="spotlight-heading">
                    <h3>${member.name}</h3>
                    <span class="badge ${badge.class}">${badge.text}</span>
                </div>
                <p>${member.address}</p>
                <p>${member.phone}</p>
                <p><a href="${member.url}" target="_blank" rel="noopener">${member.url.replace(/^https?:\/\//, "")}</a></p>
            </div>
        `;
        spotlightsEl.appendChild(card);
    });
}

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

/* ===== Entrance animations on scroll ===== */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
} else {
    // Fallback: show everything immediately if IntersectionObserver isn't supported
    revealElements.forEach((el) => el.classList.add("is-visible"));
}

/* ===== Initialize ===== */
getCurrentWeather();
getForecast();
getSpotlights();