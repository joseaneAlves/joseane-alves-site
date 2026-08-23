// components/section-como-funciona.js
// Dispara a animação de entrada da seção "Como eu trabalho" só quando ela
// entra na viewport, usando uma classe ESCOPADA na própria section
// (.como-funciona--animating), não a global html.is-animating — mesma
// decisão tomada na seção Situação, pra não reacionar a animação da Hero.
//
// Atenção à temporal dead zone: as declarações const abaixo precisam vir
// ANTES de qualquer bloco que as use. Se este script for movido pra cima
// do HTML da seção (ou antes da declaração de `secao`), o
// IntersectionObserver quebra o script inteiro com
// "Cannot access 'secao' before initialization".

const secao = document.querySelector('#como-funciona');
const prefereMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (secao) {
  if (prefereMovimentoReduzido) {
    // Sem observer: a seção já entra visível (o CSS de reduced-motion
    // cuida do estado final via opacity:1 / stroke-dashoffset:0).
    secao.classList.add('como-funciona--animating');
  } else {
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          secao.classList.add('como-funciona--animating');
          observer.unobserve(secao);
        }
      });
    }, {
      threshold: 0.25,
    });

    observer.observe(secao);
  }
}
