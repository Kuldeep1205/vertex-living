import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP ScrollTrigger — scroll-based storytelling animations.
 * Runs once after mount; cleans up on unmount.
 */
export default function useGSAPScrollAnimations() {
  useEffect(() => {
    // Small delay so Framer Motion page-in finishes first
    const timer = setTimeout(() => {

      const ctx = gsap.context(() => {

        // ── 1. Hero parallax — subtle drift, not too aggressive ──
        gsap.to('.hero-content', {
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
          y: 60,
          opacity: 0.6,
          ease: 'none',
        });

        // Hero video subtle zoom scrub
        gsap.to('.hero-video-background', {
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
          scale: 1.12,
          ease: 'none',
        });

        // ── 2. Section titles — clip-path reveal on scroll ──
        document.querySelectorAll('.section-title:not(.gsap-animated)').forEach(el => {
          el.classList.add('gsap-animated');
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
            clipPath: 'inset(0 100% 0 0)',
            opacity: 0,
            duration: 0.85,
            ease: 'power4.out',
          });
        });

        // ── 3. Stats — elastic pop-in with stagger ──
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
          gsap.from('.stat-item', {
            scrollTrigger: {
              trigger: statsSection,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
            y: 50,
            scale: 0.65,
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'elastic.out(1, 0.6)',
          });
        }

        // ── 4. Feature cards — alternate left/right on scroll ──
        document.querySelectorAll('.feature-card:not(.gsap-animated)').forEach((card, i) => {
          card.classList.add('gsap-animated');
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.7,
            delay: (i % 3) * 0.1,
            ease: 'power3.out',
          });
        });

        // ── 5. Property cards (HoverCard / featured grid) ──
        const attachCardAnimations = () => {
          document.querySelectorAll('.hc-card:not(.gsap-animated)').forEach((card, i) => {
            card.classList.add('gsap-animated');
            gsap.from(card, {
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                toggleActions: 'play none none reverse',
              },
              y: 70,
              opacity: 0,
              rotateY: 6,
              scale: 0.94,
              duration: 0.7,
              delay: (i % 4) * 0.1,
              ease: 'back.out(1.3)',
            });
          });
        };
        attachCardAnimations();

        // Re-attach when mood filter adds new cards
        const mo = new MutationObserver(attachCardAnimations);
        const featured = document.querySelector('.featured-section');
        if (featured) mo.observe(featured, { childList: true, subtree: true });

        // ── 6. AI Recommendation cards — stagger on scroll ──
        document.querySelectorAll('.ai-property-card:not(.gsap-animated)').forEach((card, i) => {
          card.classList.add('gsap-animated');
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            scale: 0.92,
            duration: 0.65,
            delay: (i % 3) * 0.12,
            ease: 'back.out(1.2)',
          });
        });

        // ── 7. Agent cards — fan in ──
        document.querySelectorAll('.agent-card:not(.gsap-animated)').forEach((card, i) => {
          card.classList.add('gsap-animated');
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            y: 80,
            opacity: 0,
            rotation: i % 2 === 0 ? -4 : 4,
            duration: 0.75,
            delay: i * 0.1,
            ease: 'back.out(1.4)',
          });
        });

        // ── 8. About section — left/right split ──
        const aboutContent = document.querySelector('.about-content');
        const aboutImg = document.querySelector('.about-image-wrap, .about-image');
        if (aboutContent) {
          gsap.from(aboutContent, {
            scrollTrigger: { trigger: aboutContent, start: 'top 82%', toggleActions: 'play none none reverse' },
            x: -80,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
          });
        }
        if (aboutImg) {
          gsap.from(aboutImg, {
            scrollTrigger: { trigger: aboutImg, start: 'top 82%', toggleActions: 'play none none reverse' },
            x: 80,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
          });
        }

        // ── 9. Map section — scale reveal ──
        const mapSection = document.querySelector('#map-section');
        if (mapSection) {
          gsap.from(mapSection, {
            scrollTrigger: {
              trigger: mapSection,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
            scale: 0.9,
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power2.out',
          });
        }

        // ── 10. AI picks grid — pin + stagger ──
        const aiGrid = document.querySelector('.ai-picks-grid');
        if (aiGrid) {
          const cards = aiGrid.querySelectorAll('.ai-pick-card:not(.gsap-animated)');
          cards.forEach((card, i) => {
            card.classList.add('gsap-animated');
            gsap.from(card, {
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
              y: 80,
              opacity: 0,
              scale: 0.88,
              duration: 0.75,
              delay: (i % 3) * 0.13,
              ease: 'back.out(1.5)',
            });
          });
        }

        // ── 11. Section subtitles — fade up ──
        document.querySelectorAll('.section-subtitle:not(.gsap-animated)').forEach(el => {
          el.classList.add('gsap-animated');
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
            y: 24,
            opacity: 0,
            duration: 0.65,
            delay: 0.15,
            ease: 'power2.out',
          });
        });

        // ── 12. Contact section — dramatic entrance ──
        const contact = document.querySelector('.contact-section, #contact');
        if (contact) {
          gsap.from(contact, {
            scrollTrigger: {
              trigger: contact,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            y: 60,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
          });
        }

      });

      return () => {
        ctx.revert();
      };
    }, 400);

    return () => clearTimeout(timer);
  }, []);
}
