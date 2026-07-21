const menuToggle = document.querySelector('#menu-toggle');
const nav = document.querySelector('#primary-nav');
const header = document.querySelector('header');
const themeToggle = document.querySelector('#theme-toggle');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.setAttribute('aria-pressed', !isDark);
});

const params = new URLSearchParams(window.location.search);
const summary = document.querySelector('#submission-summary');

const fields = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobilePhone', label: 'Mobile Number' },
  { key: 'businessName', label: 'Business Name' },
  { key: 'timestamp', label: 'Submitted' }
];

fields.forEach(field => {
  const value = params.get(field.key);
  if (value) {
    const dt = document.createElement('dt');
    dt.textContent = field.label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    summary.appendChild(dt);
    summary.appendChild(dd);
  }
});

document.querySelector('#currentyear').textContent = new Date().getFullYear();
document.querySelector('#lastModified').textContent = `Last Modified: ${document.lastModified}`;