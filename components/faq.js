/**
 * Seção FAQ
 * - Accordion independente por lista (main / partner), um item aberto por vez
 * - "Ver todas as perguntas" revela itens extras com stagger animado
 * - Painel de agências/parceiros alterna com o bloco principal
 * - Entrada da seção animada via IntersectionObserver (classe escopada .faq--animating)
 */

(function () {
  const section = document.querySelector('[data-faq-section]');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Accordion ---------------- */

  function closeItem(item) {
    const trigger = item.querySelector('[data-faq-trigger]');
    item.dataset.open = 'false';
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openItem(item) {
    const trigger = item.querySelector('[data-faq-trigger]');
    item.dataset.open = 'true';
    trigger.setAttribute('aria-expanded', 'true');
  }

  function setupAccordion(list) {
    const items = Array.from(list.querySelectorAll('[data-faq-item]'));

    items.forEach((item) => {
      const trigger = item.querySelector('[data-faq-trigger]');

      trigger.addEventListener('click', () => {
        const isOpen = item.dataset.open === 'true';

        // Fecha os outros itens da mesma lista (accordion de item único)
        items.forEach((other) => {
          if (other !== item) closeItem(other);
        });

        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });
  }

  document.querySelectorAll('[data-faq-list]').forEach(setupAccordion);

  /* ---------------- Ver todas as perguntas ---------------- */

  const toggleAllBtn = section.querySelector('[data-faq-toggle-all]');
  const toggleLabel = section.querySelector('[data-faq-toggle-label]');
  const extraItems = Array.from(section.querySelectorAll('[data-faq-extra]'));

  let extrasVisible = false;

  if (toggleAllBtn && extraItems.length) {
    toggleAllBtn.addEventListener('click', () => {
      extrasVisible = !extrasVisible;
      toggleAllBtn.setAttribute('aria-expanded', String(extrasVisible));
      toggleLabel.textContent = extrasVisible
        ? 'Ver menos perguntas'
        : 'Ver todas as perguntas';

      if (extrasVisible) {
        extraItems.forEach((item, index) => {
          item.hidden = false;
          item.style.setProperty('--faq-delay', prefersReducedMotion ? '0ms' : `${index * 70}ms`);
          // força reflow para garantir que a animação reinicie ao reabrir
          void item.offsetWidth;
          item.dataset.revealed = 'true';
        });
      } else {
        extraItems.forEach((item) => {
          item.hidden = true;
          item.dataset.revealed = 'false';
          closeItem(item);
        });
      }
    });
  }

  /* ---------------- Painel de agências/parceiros ---------------- */

  const partnerOpenBtn = section.querySelector('[data-faq-partner-open]');
  const partnerCloseBtn = section.querySelector('[data-faq-partner-close]');
  const partnerPanel = section.querySelector('[data-faq-partner-panel]');

  if (partnerOpenBtn && partnerPanel) {
    partnerOpenBtn.addEventListener('click', () => {
      partnerPanel.hidden = false;
      // força reflow antes de ativar a transição de opacidade/translate
      void partnerPanel.offsetWidth;
      partnerPanel.dataset.active = 'true';

      const firstTrigger = partnerPanel.querySelector('[data-faq-trigger]');
      if (firstTrigger) firstTrigger.focus({ preventScroll: true });
    });
  }

  if (partnerCloseBtn && partnerPanel) {
    partnerCloseBtn.addEventListener('click', () => {
      partnerPanel.dataset.active = 'false';

      const finish = () => {
        partnerPanel.hidden = true;
        partnerOpenBtn && partnerOpenBtn.focus({ preventScroll: true });
      };

      if (prefersReducedMotion) {
        finish();
      } else {
        partnerPanel.addEventListener('transitionend', finish, { once: true });
      }
    });
  }

  /* ---------------- Animação de entrada (IntersectionObserver) ---------------- */

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('faq--animating');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
  } else {
    section.classList.add('faq--animating');
  }
})();
