import { useEffect } from 'react';

/**
 * Global animation effects:
 *  - Spotlight: mouse-position radial glow on .spotlight-card
 *  - 3D Tilt: perspective tilt on .tilt-card
 *  - Ripple: click ripple on .ripple
 *  - Magnetic: subtle magnetic pull on .btn-magnetic
 */
export default function useAnimationEffects() {
  useEffect(() => {
    // ── Spotlight (CSS custom properties) ──
    function onSpotlightMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }

    // ── 3D Tilt ──
    function onTiltMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = dy * -8;
      const rotY = dx *  8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    }
    function onTiltLeave(e) {
      e.currentTarget.style.transform = '';
    }

    // ── Ripple ──
    function onRippleClick(e) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top:  ${e.clientY - rect.top  - size / 2}px;
      `;
      btn.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    }

    // ── Magnetic button ──
    function onMagneticMove(e) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2))  * 0.25;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    function onMagneticLeave(e) {
      e.currentTarget.style.transform = '';
    }

    function attach() {
      document.querySelectorAll('.spotlight-card:not([data-anim])').forEach(el => {
        el.setAttribute('data-anim', '1');
        el.addEventListener('mousemove', onSpotlightMove);
      });
      document.querySelectorAll('.tilt-card:not([data-anim])').forEach(el => {
        el.setAttribute('data-anim', '1');
        el.addEventListener('mousemove', onTiltMove);
        el.addEventListener('mouseleave', onTiltLeave);
      });
      document.querySelectorAll('.ripple:not([data-anim])').forEach(el => {
        el.setAttribute('data-anim', '1');
        el.addEventListener('click', onRippleClick);
      });
      document.querySelectorAll('.btn-magnetic:not([data-anim])').forEach(el => {
        el.setAttribute('data-anim', '1');
        el.addEventListener('mousemove', onMagneticMove);
        el.addEventListener('mouseleave', onMagneticLeave);
      });
    }

    attach();

    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);
}
