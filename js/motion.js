import { waapi } from 'animejs/waapi';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entrances = [];

function enter(target, options) {
  entrances.push(waapi.animate(target, options));
}

function playEntrance() {
  if (reducedMotion.matches) return;
  const titleLines = document.querySelectorAll('.hero__title span');
  if (titleLines.length) {
    enter(titleLines, {
      opacity: [0.92, 1],
      translate: ['0 12px', '0 0px'],
      delay: (_, index) => 100 + index * 110,
      duration: 620,
      ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });
    const rail = document.querySelector('.hero__scan');
    if (rail) {
      enter(rail, {
        transform: ['scaleX(0)', 'scaleX(1)'],
        opacity: [0.2, 0.85],
        duration: 900,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
    const proof = document.querySelector('.hero__index');
    if (proof) {
      enter(proof, {
        opacity: [0.9, 1],
        translate: ['0 8px', '0 0px'],
        delay: 230,
        duration: 660,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
  } else {
    const title = document.querySelector('.case-hero__title, .project-hero h1');
    if (title) {
      enter(title, {
        opacity: [0.92, 1],
        translate: ['0 10px', '0 0px'],
        duration: 560,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
  }

  // Some browsers pause Web Animations when their window is backgrounded. Do
  // not leave the first screen dimmed or displaced if its entrance stalls.
  if (entrances.length) {
    window.setTimeout(() => {
      entrances.forEach(animation => animation.complete().cancel());
      const rail = document.querySelector('.hero__scan');
      if (rail) {
        rail.style.transform = 'scaleX(1)';
        rail.style.opacity = '0.85';
      }
    }, 1250);
  }
}

playEntrance();
