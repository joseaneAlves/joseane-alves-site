/*
  Cases — animação de entrada
  Mesmo padrão do situation-card: a seção ganha .cases--animating (liga o
  sistema de animação via CSS), e cada card é observado individualmente —
  ganha .is-in-view no momento em que ele mesmo entra na tela, não quando
  a seção inteira aparece. Isso faz a entrada acompanhar o scroll real,
  em vez de disparar tudo de uma vez.
*/

(function () {
  const section = document.querySelector('[data-cases-section]');
  if (!section) return;

  const cards = section.querySelectorAll('[data-cases-card]');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Sem observer: o CSS já cobre o estado final via media query,
    // então não é preciso ligar a classe de animação nem observar nada.
    return;
  }

  // Liga o "modo animado" da seção — sem isso, os cards ficam com
  // opacity:1 fixo (ver base rule em cases.css) e nascem visíveis.
  section.classList.add('cases--animating');

  const cardObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => cardObserver.observe(card));

  // Hook preservado para integração futura (ex: abrir página/lista completa
  // de cases). Mantido como stub para não quebrar o link no HTML.
  const verTodosBtn = document.getElementById('verTodosCases');
  if (verTodosBtn) {
    verTodosBtn.addEventListener('click', (event) => {
      // TODO: substituir por navegação real quando a página de cases
      // completa existir (ex: window.location.href = '/cases.html').
      if (verTodosBtn.getAttribute('href') === '#') {
        event.preventDefault();
      }
    });
  }
})();
