import { useEffect } from 'react';

/**
 * Scroll-reveal hook — adds `.is-visible` class to elements
 * that have `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`
 * as they enter the viewport.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .stagger-children';
    const elements = document.querySelectorAll(selectors);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Don't unobserve — keeps animation if element leaves and re-enters
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    // Re-scan for dynamically added elements
    const mutationObserver = new MutationObserver(() => {
      const newEls = document.querySelectorAll(
        `${selectors}:not([data-observed])`
      );
      newEls.forEach((el) => {
        el.setAttribute('data-observed', '1');
        observer.observe(el);
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
