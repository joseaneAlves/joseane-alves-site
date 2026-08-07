/* ========================================================================== 
   MENU MÓVEL
   O estado visual, o atributo aria-expanded e hidden são atualizados juntos.
   ========================================================================== */
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Abre ou fecha o menu móvel e mantém o texto acessível do botão atualizado.
 * @param {boolean} isOpen - true para abrir; false para fechar.
 */
function setMenuState(isOpen) {
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
  mobileMenu.hidden = !isOpen;
}

// Ao abrir, o foco vai para o primeiro link; isso favorece teclado e leitor de tela.
menuButton.addEventListener('click', () => {
  const isOpening = menuButton.getAttribute('aria-expanded') !== 'true';
  setMenuState(isOpening);
  if (isOpening) mobileMenu.querySelector('a').focus();
});

// Um link selecionado sempre fecha o menu antes de levar o visitante ao destino.
mobileMenu.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuState(false);
});

// Escape fecha o menu e devolve o foco ao botão que o abriu.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuState(false);
    menuButton.focus();
  }
});

// Um clique fora da área do menu é outro caminho intuitivo para fechá-lo.
document.addEventListener('click', (event) => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) setMenuState(false);
});

/* ========================================================================== 
   ANIMAÇÃO DA HERO
   sessionStorage marca esta sessão, portanto a sequência não se repete ao
   navegar de volta à página. Sem JavaScript, nenhum conteúdo fica oculto.
   ========================================================================== */
function runHeroAnimation() {
  const animationKey = 'joseane-hero-animation-seen';

  // Quem prefere menos movimento vê a Hero completa imediatamente.
  if (reduceMotion.matches) return;

  try {
    if (sessionStorage.getItem(animationKey)) return;
    sessionStorage.setItem(animationKey, 'true');
  } catch {
    // Se o navegador bloquear storage, a página segue funcional e anima por carregamento.
  }

  const isDesktop = window.matchMedia("(min-width:1051px)").matches;

  if (isDesktop) {

    document.documentElement.classList.add('is-animating');
    // O CSS termina as entradas em ~1,8s; removemos a classe após margem de segurança.
    window.setTimeout(() => document.documentElement.classList.remove('is-animating'), 2100);

  } else {

    document.documentElement.classList.add("is-mobile-hero");

  }


}

runHeroAnimation();
