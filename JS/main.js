// Import all modules
import { initHeroAnimations } from './hero-animations.js';
import { initUI } from './ui.js';
import { initObservers } from './observers.js';
import { initPortfolio } from './portfolio.js';
import { initContactForm } from './contact-form.js';

// Run all initialization functions when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimations();
  initUI();
  initObservers();
  initPortfolio();
  initContactForm();
});