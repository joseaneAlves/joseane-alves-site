/* ==========================================================================
   SEÇÃO: Quem sou eu (#sobre)
   Dispara a animação de entrada apenas quando a seção entra na viewport,
   usando uma classe escopada (.sobre--animar) — não a global html.is-animating
   — para não reacionar as animações da Hero ao rolar a página.
   ========================================================================== */

(function () {
   var secao = document.getElementById("sobre");
   if (!secao) return;

   // Sem IntersectionObserver (navegadores muito antigos): mostra tudo direto.
   if (!("IntersectionObserver" in window)) {
      secao.classList.add("sobre--animar");
      return;
   }

   var observador = new IntersectionObserver(
      function (entradas) {
         entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
               secao.classList.add("sobre--animar");
               observador.unobserve(secao);
            }
         });
      },
      { threshold: 0.2 }
   );

   observador.observe(secao);
})();
