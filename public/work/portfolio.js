const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!reducedMotion.matches) {
        target.animate(
          [{ opacity: 0.72, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'ease-out' }
        );
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.contribution-grid li, .project-grid article, .skills-grid article')
    .forEach(card => observer.observe(card));
}

const timeline = document.querySelector('.timeline');
const roles = [...timeline.children];
let timelineFrame = 0;

function drawTimeline() {
  timelineFrame = 0;
  // Match the center of each timeline dot in the stylesheet.
  const markers = roles.map(role => role.getBoundingClientRect().top + 31);
  const start = markers[0];
  const length = markers.at(-1) - start;
  const readingPoint = window.innerHeight * 0.65;
  const progress = Math.max(0, Math.min(length, readingPoint - start));
  const current = markers.findLastIndex(marker => marker <= readingPoint);

  timeline.style.setProperty('--timeline-length', length + 'px');
  timeline.style.setProperty('--timeline-progress', progress + 'px');
  roles.forEach((role, index) => {
    role.classList.toggle('is-reached', index <= current);
    role.classList.toggle('is-current', index === current);
  });
}

function scheduleTimeline() {
  if (!timelineFrame) timelineFrame = requestAnimationFrame(drawTimeline);
}

function configureTimeline() {
  timeline.classList.toggle('is-scroll-linked', !reducedMotion.matches);
  if (reducedMotion.matches) {
    window.removeEventListener('scroll', scheduleTimeline);
    window.removeEventListener('resize', scheduleTimeline);
    timeline.removeEventListener('toggle', scheduleTimeline, true);
    cancelAnimationFrame(timelineFrame);
    timelineFrame = 0;
    return;
  }
  window.addEventListener('scroll', scheduleTimeline, { passive: true });
  window.addEventListener('resize', scheduleTimeline);
  timeline.addEventListener('toggle', scheduleTimeline, true);
  scheduleTimeline();
}

reducedMotion.addEventListener('change', configureTimeline);
configureTimeline();
