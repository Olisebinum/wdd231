const menuToggle = document.querySelector('#menu-toggle');
const primaryNav = document.querySelector('#primary-nav');

menuToggle.addEventListener('click', () => {
  primaryNav.classList.toggle('open');
  const isOpen = primaryNav.classList.contains('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.classList.toggle('open');
});