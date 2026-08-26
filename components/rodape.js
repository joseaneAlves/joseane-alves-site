/* ===================================================
   SEÇÃO: Rodapé
   Comportamento: atualiza o ano automaticamente e
   trata o clique de "voltar ao topo"
=================================================== */

(function () {
  const anoEl = document.getElementById('anoAtual');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  const botaoTopo = document.getElementById('rodapeVoltarTopo');
  if (botaoTopo) {
    botaoTopo.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
