const menuButton = document.getElementById('hamburger');
const navigation = document.getElementById('navLinks');
const scrollTopButton = document.getElementById('scrollTop');

function setMenuOpen(open) {
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
}

menuButton.addEventListener('click', () => setMenuOpen(!navigation.classList.contains('open')));
navigation.addEventListener('click', event => {
  if (event.target.closest('a') && navigation.classList.contains('open')) {
    setMenuOpen(false);
    if (!event.target.closest('a').hash) menuButton.focus();
  }
});
document.getElementById('navbar').addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

function updateScrollButton() {
  scrollTopButton.classList.toggle('visible', scrollY > 400);
}

window.addEventListener('scroll', updateScrollButton, {passive: true});
updateScrollButton();

scrollTopButton.addEventListener('click', () => {
  document.querySelector('.skip-link').focus({preventScroll: true});
  window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
