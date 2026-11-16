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
  document.querySelectorAll('.timeline li, .contribution-grid li, .project-grid article, .skills-grid article')
    .forEach(card => observer.observe(card));
}
