/* ===================================================
   COMPONENTE: Botão Flutuante WhatsApp
   Comportamento: exibe o botão só depois de a pessoa
   rolar um pouco a página (evita poluir a Hero).
=================================================== */

(function () {
  const botao = document.getElementById('whatsFlutuante');
  if (!botao) return;

  const LIMIAR_SCROLL = 320; // px rolados antes de mostrar o botão
  let visivel = false;

  function atualizarVisibilidade() {
    const deveMostrar = window.scrollY > LIMIAR_SCROLL;

    if (deveMostrar && !visivel) {
      botao.classList.add('whats-flutuante--visivel');
      visivel = true;
    } else if (!deveMostrar && visivel) {
      botao.classList.remove('whats-flutuante--visivel');
      visivel = false;
    }
  }

  // Checagem inicial (caso a página já carregue rolada)
  atualizarVisibilidade();

  window.addEventListener('scroll', atualizarVisibilidade, { passive: true });
})();
