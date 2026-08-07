/* ==========================================================================
   SEÇÃO "QUAL SITUAÇÃO MAIS PARECE COM A SUA"
   Sequência: cards em cascata (80ms entre eles) → seta se desenha →
   post-it desliza e assenta → botão aparece com fade. Dispara uma única
   vez, quando a seção entra na tela (não é replay a cada scroll), e
   respeita prefers-reduced-motion — sem JS ou com movimento reduzido,
   tudo já nasce visível.
   ========================================================================== */

(() => {

   const section = document.querySelector('.situacao');
   if (!section) return;

   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
   const sessionKey = 'joseane-situacao-animation-seen';

   const cards = section.querySelectorAll('.situation-card');
   const arrowPath = section.querySelector('.situation-arrow__path');
   const postIt = section.querySelector('.post-it');
   const cta = section.querySelector('.situacao__cta');

   const isMobile = window.matchMedia('(max-width: 720px)').matches;
   if (isMobile) {
      cards.forEach((card) => card.removeAttribute('open'));
   }

   // Durações batem com as definidas em section-situacao.css / componentes:
   // cards 300ms (último começa em 240ms) → seta 300ms → post-it 300ms → cta 200ms.
   const CARD_ANIM_END = 240 + 300; // 540ms: quando o último card termina
   const ARROW_ANIM = 300;
   const POSTIT_ANIM = 300;

   /**
    * Roda a sequência completa uma única vez.
    */
   function playSequence() {
      section.classList.add('situacao--animating');

      cards.forEach((card) => card.classList.add('is-in-view'));

      window.setTimeout(() => {
         if (arrowPath) arrowPath.classList.add('is-drawn');
      }, CARD_ANIM_END);

      window.setTimeout(() => {
         if (postIt) postIt.classList.add('is-placed');
      }, CARD_ANIM_END + ARROW_ANIM);

      window.setTimeout(() => {
         if (cta) cta.classList.add('is-visible');
      }, CARD_ANIM_END + ARROW_ANIM + POSTIT_ANIM);

      // Remove a classe de orquestração depois que tudo termina, para não
      // interferir em outras interações (ex.: :hover do post-it) por CSS
      // que dependa apenas do estado padrão do componente.
      window.setTimeout(() => {
         section.classList.remove('situacao--animating');
      }, CARD_ANIM_END + ARROW_ANIM + POSTIT_ANIM + 300);
   }

   // Quem prefere menos movimento vê a seção completa, sem cascata.
   if (reduceMotion.matches) return;

   // Mesmo padrão do hero: cada sessão do visitante só vê a animação uma vez.
   try {
      if (sessionStorage.getItem(sessionKey)) return;
   } catch {
      // Se o storage estiver bloqueado, a seção segue funcional e anima
      // toda vez que entra na tela — pior caso é repetir, não travar.
   }

   const observer = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            playSequence();

            try {
               sessionStorage.setItem(sessionKey, 'true');
            } catch {
               // Sem storage disponível: apenas segue sem persistir o estado.
            }

            observer.disconnect();
         });
      },
      { threshold: 0.35 }
   );

   observer.observe(section);
})();
