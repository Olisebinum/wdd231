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

document.querySelector('#timestamp').value = new Date().toISOString();

const cardLinks = document.querySelectorAll('.card-link');

cardLinks.forEach(link => {
  link.addEventListener('click', () => {
    const modalId = link.dataset.modal;
    const modal = document.querySelector(`#${modalId}`);
    modal.showModal();
  });
});

const modals = document.querySelectorAll('.membership-modal');

modals.forEach(modal => {
  const closeButton = modal.querySelector('.modal-close');

  closeButton.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!clickedInside) {
      modal.close();
    }
  });
});

document.querySelector('#currentyear').textContent = new Date().getFullYear();

const lastModified = document.querySelector('#lastModified');
lastModified.textContent = `Last Modified: ${document.lastModified}`;