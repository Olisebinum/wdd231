import { initFooterMeta } from "./modules/footer-meta.js";

initFooterMeta();

const params = new URLSearchParams(window.location.search);

const nameEl = document.getElementById("output-name");
const emailEl = document.getElementById("output-email");
const messageEl = document.getElementById("output-message");
const headingEl = document.getElementById("confirmation-heading");

const name = params.get("name");
const email = params.get("email");
const message = params.get("message");

if (!name && !email && !message) {
    // Reached directly, without submitting the form.
    headingEl.textContent = "No message data found";
    nameEl.textContent = "—";
    emailEl.textContent = "—";
    messageEl.textContent = "Submit the contact form on the Learning Hub page to see your message details here.";
} else {
    // textContent (not innerHTML) so submitted values can never be
    // interpreted as markup.
    nameEl.textContent = name || "—";
    emailEl.textContent = email || "—";
    messageEl.textContent = message || "—";
}