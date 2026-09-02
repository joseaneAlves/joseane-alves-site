/**
 * ============================================================
 * SIMULADOR DE PROJETO
 * ============================================================
 *
 * Três caminhos possíveis:
 *
 * 1. "Já sei o que preciso": cliente escolhe um ou mais tipos de
 *    projeto nos cards da seção e clica em avançar.
 *
 * 2. "Não sei por onde começar": cliente responde público e
 *    objetivo, e o sistema sugere o(s) tipo(s) de projeto.
 *
 * 3. "Já tenho, preciso de ajuste": caminho de manutenção — não
 *    tenta estimar preço/prazo (depende do que já existe), só
 *    coleta o motivo do ajuste e direciona pro WhatsApp.
 *
 * Os caminhos 1 e 2 convergem na Etapa 3, que pergunta detalhes
 * de complexidade específicos dos tipos envolvidos e alimenta o
 * cálculo de prazo e investimento do resultado final.
 * ============================================================
 */


// ============================================================
// TABELAS DE PREÇO E PRAZO
// ============================================================

const PRECO_BASE = {
   'landing-page': 1000,
   'site': 1200,
   'blog-simples': 1500,
   'blog-painel': 1800,
   'sistema': 2500,
   'loja-virtual': 2800,
   'gmn': 400,
   'bio': 500,
};

const LABELS = {
   'site': 'Site institucional',
   'landing-page': 'Landing Page',
   'blog-simples': 'Blog de conteúdo',
   'blog-painel': 'Blog com painel próprio',
   'sistema': 'Sistema administrativo',
   'loja-virtual': 'Loja virtual',
   'pwa-basico': 'PWA básico',
   'pwa-offline': 'PWA com funcionamento offline',
   'pwa-offline-push': 'PWA offline + notificações push',
   'gmn': 'Google Meu Negócio',
   'bio': 'Link da Bio',
};

// Combos fechados — quando a combinação selecionada bate exatamente
// com uma dessas chaves, usamos o valor combinado em vez de somar
// os tipos individualmente.
const COMBOS = {};

function registrarCombo(tokens, preco) {
   COMBOS[[...tokens].sort().join('+')] = preco;
}

registrarCombo(['landing-page', 'site'], 2000);
registrarCombo(['blog-simples', 'site'], 2500);
registrarCombo(['blog-painel', 'site'], 3000);
registrarCombo(['pwa-basico', 'site', 'sistema'], 4000);
registrarCombo(['pwa-offline', 'site', 'sistema'], 4400);
registrarCombo(['pwa-offline-push', 'site', 'sistema'], 5000);
registrarCombo(['pwa-basico', 'landing-page', 'sistema'], 3800);
registrarCombo(['pwa-offline', 'landing-page', 'sistema'], 4100);
registrarCombo(['pwa-offline-push', 'landing-page', 'sistema'], 4900);
registrarCombo(['pwa-offline-push', 'landing-page', 'site', 'sistema'], 6000);
registrarCombo(['gmn', 'bio'], 800);


// ============================================================
// VARIÁVEIS DE ESTADO
// ============================================================

let etapa = 1;
let modoSimulador = ""; // "descoberta" | "projeto" | "manutencao"

let projeto = [];
let objetivos = [];
let publico = [];
let complexidade = {};
let ultimoResultado = null; // { familia, prazo, preco, notas } — usado para montar a mensagem do WhatsApp


// ============================================================
// ELEMENTOS
// ============================================================

const modalSimulador = document.querySelector("#modalSimulador");
const abrirSimuladorBtn = document.querySelector("#abrirSimulador");
const fecharSimuladorBtn = document.querySelector("#fecharSimulador");
const proximoProjetoBtn = document.querySelector("#proximoProjeto");
const voltarProjetoBtn = document.querySelector("#voltarProjeto");
const formSimulador = document.querySelector("#formSimulador");
const numeroEtapa = document.querySelector("#numeroEtapa");
const resultadoFinal = document.querySelector("#resultadoFinal");
const refazerSimuladorBtn = document.querySelector("#refazerSimulador");

const modoManutencaoDiv = document.querySelector("#modoManutencao");
const manutencaoDetalhes = document.querySelector("#manutencaoDetalhes");

const perguntasProjetoDiv = document.querySelector("#perguntasProjeto");
const resultadoListaDiv = document.querySelector("#resultadoLista");
const resultadoPrazoEl = document.querySelector("#resultadoPrazo");
const resultadoValorEl = document.querySelector("#resultadoValor");
const resultadoNotasEl = document.querySelector("#resultadoNotas");


// ============================================================
// ABRIR / FECHAR MODAL
// ============================================================

function abrirModal() {

   modalSimulador.classList.remove("modo-manutencao-ativo");
   modoManutencaoDiv.classList.remove("ativo");

   formSimulador.style.display = "";
   resultadoFinal.style.display = "none";

   modalSimulador.classList.add("ativo");
   modalSimulador.setAttribute("aria-hidden", "false");

   mostrarEtapa(etapa);
}

function abrirModalManutencao() {

   modalSimulador.classList.add("ativo", "modo-manutencao-ativo");
   modalSimulador.setAttribute("aria-hidden", "false");

   formSimulador.style.display = "none";
   resultadoFinal.style.display = "none";
   modoManutencaoDiv.classList.add("ativo");
}

function fecharModal() {

   modalSimulador.classList.remove("ativo", "modo-manutencao-ativo");
   modalSimulador.setAttribute("aria-hidden", "true");

   // Cada visita ao simulador começa do zero — evita que o cliente
   // reabra e encontre uma resposta antiga ou uma etapa travada.
   resetarSimulador();
}


// ============================================================
// RESET COMPLETO
// ============================================================

function resetarSimulador() {

   etapa = 1;
   projeto = [];
   objetivos = [];
   publico = [];
   complexidade = {};
   modoSimulador = "";

   document.querySelectorAll('input[name="projeto"]').forEach((input) => {
      input.checked = false;
      input.disabled = false;
      input.closest(".opcao-projeto").classList.remove("opcao-projeto--disabled");
   });

   document.querySelectorAll('input[name="publico"]').forEach((input) => {
      input.checked = false;
   });

   document.querySelectorAll('input[name="objetivo"]').forEach((input) => {
      input.checked = false;
   });

   document.querySelectorAll('input[name="manutencao-motivo"]').forEach((input) => {
      input.checked = false;
   });

   if (manutencaoDetalhes) manutencaoDetalhes.value = "";

   perguntasProjetoDiv.innerHTML = "";

   formSimulador.style.display = "";
   resultadoFinal.style.display = "none";
   modoManutencaoDiv.classList.remove("ativo");
   modalSimulador.classList.remove("modo-manutencao-ativo");

   mostrarEtapa(1);
}


// ============================================================
// SELEÇÃO NO PICKER — MANUTENÇÃO É EXCLUSIVA
// ============================================================

document.querySelectorAll('input[name="projeto"]').forEach((input) => {

   input.addEventListener("change", () => {

      const outros = [...document.querySelectorAll('input[name="projeto"]')]
         .filter((i) => i.value !== "manutencao");

      if (input.value === "manutencao") {

         outros.forEach((i) => {
            i.checked = false;
            i.disabled = input.checked;
            i.closest(".opcao-projeto").classList.toggle("opcao-projeto--disabled", input.checked);
         });

      } else {

         const manutencaoInput = document.querySelector('input[name="projeto"][value="manutencao"]');
         if (manutencaoInput) manutencaoInput.checked = false;
      }
   });
});


// ============================================================
// COLETA DE RESPOSTAS
// ============================================================

function coletarProjetos() {

   const selecionados = document.querySelectorAll('input[name="projeto"]:checked');
   projeto = [...selecionados].map((opcao) => opcao.value);
   return projeto;
}

function coletarPublico() {

   const opcoes = document.querySelectorAll('input[name="publico"]:checked');
   publico = [...opcoes].map((opcao) => opcao.value);
   return publico;
}

function coletarObjetivos() {

   const opcoes = document.querySelectorAll('input[name="objetivo"]:checked');
   objetivos = [...opcoes].map((opcao) => opcao.value);
   return objetivos;
}

function coletarComplexidade() {

   const nomes = new Set(
      [...perguntasProjetoDiv.querySelectorAll("[name]")].map((el) => el.name)
   );

   const respostas = {};

   nomes.forEach((nome) => {
      const marcado = perguntasProjetoDiv.querySelector(`input[name="${nome}"]:checked`);
      respostas[nome] = marcado ? marcado.value : null;
   });

   complexidade = respostas;
   return respostas;
}

function etapa3Completa() {

   const nomes = new Set(
      [...perguntasProjetoDiv.querySelectorAll("[name]")].map((el) => el.name)
   );

   for (const nome of nomes) {
      if (!perguntasProjetoDiv.querySelector(`input[name="${nome}"]:checked`)) {
         return false;
      }
   }

   return true;
}


// ============================================================
// SUGESTÃO DE PROJETO (caminho guiado)
// ============================================================

function sugerirProjetos() {

   projeto = [];

   objetivos.forEach((obj) => {

      if (obj === "presenca-simples") {
         projeto.push("gmn", "bio");
      } else if (obj === "apresentar" || obj === "atrair-clientes") {
         projeto.push("site");
      } else if (obj === "vender") {
         projeto.push("landing-page");
      } else if (obj === "agendamento" || obj === "automatizar") {
         projeto.push("sistema");
      }
   });

   if (publico.includes("clientes-atuais") && objetivos.includes("automatizar")) {
      projeto.push("pwa");
   }

   if (projeto.length === 0) projeto.push("site");

   projeto = [...new Set(projeto)];
}


// ============================================================
// ETAPA 3 — PERGUNTAS DE COMPLEXIDADE (dinâmicas)
// ============================================================

function perguntaHTML(nome, titulo, opcoes) {

   const inputs = opcoes
      .map(([valor, label]) => `
         <label class="opcao-radio">
            <input type="radio" name="${nome}" value="${valor}">
            ${label}
         </label>
      `)
      .join("");

   return `
      <div class="pergunta-complexidade" data-campo="${nome}">
         <h4>${titulo}</h4>
         <div class="opcoes">${inputs}</div>
      </div>
   `;
}

function renderPerguntasEtapa3(tipos) {

   const somenteDigital = tipos.length > 0 && tipos.every((t) => t === "gmn" || t === "bio");

   if (somenteDigital) {
      perguntasProjetoDiv.innerHTML =
         "<p>Perfeito — para esse tipo de entrega não precisamos de mais detalhes. Clique em avançar para ver prazo e investimento.</p>";
      return;
   }

   const temBlog = tipos.includes("blog");
   const temLeve = tipos.includes("site") || tipos.includes("landing-page") || temBlog;
   const temPesado = tipos.includes("sistema") || tipos.includes("loja-virtual");
   const temLoja = tipos.includes("loja-virtual");
   const temPwa = tipos.includes("pwa");

   let html = "";

   if (temBlog) {
      html += perguntaHTML("tipoBlog", "Como você imagina publicar o conteúdo do blog?", [
         ["simples", "Poucos posts, publicados esporadicamente"],
         ["painel", "Quero publicar com frequência e gerenciar sozinho(a), com painel próprio"],
      ]);
   }

   if (temLeve) {
      html += perguntaHTML("layoutPronto", "Você já tem o layout/protótipo pronto (ex: um arquivo do Figma)?", [
         ["sim", "Sim, já tenho"],
         ["nao", "Não, preciso que seja criado"],
      ]);

      html += perguntaHTML("qtdPaginas", "Quantas páginas ou seções você imagina?", [
         ["1-3", "1 a 3"],
         ["4-6", "4 a 6"],
         ["7+", "7 ou mais"],
      ]);

      html += perguntaHTML("identidadeVisual", "Você já tem identidade visual definida (logo, cores, fontes)?", [
         ["sim", "Sim, já tenho"],
         ["nao", "Não, preciso criar"],
      ]);
   }

   if (temPesado) {
      html += perguntaHTML("qtdModulos", "Quantas áreas ou módulos você imagina (ex: clientes, serviços, financeiro, relatórios)?", [
         ["1-2", "1 a 2"],
         ["3-4", "3 a 4"],
         ["5+", "5 ou mais"],
      ]);

      html += perguntaHTML("integracoes", "Precisa de integração com pagamento, bancos, sistemas do governo ou WhatsApp (Meta API)?", [
         ["sim", "Sim"],
         ["nao", "Não"],
      ]);
   }

   if (temLoja) {
      html += perguntaHTML("qtdProdutos", "Quantos produtos você imagina cadastrar inicialmente?", [
         ["ate-20", "Até 20"],
         ["21-100", "De 21 a 100"],
         ["100+", "Mais de 100"],
      ]);
   }

   if (temPwa) {
      html += perguntaHTML("nivelPwa", "Qual nível de aplicativo (PWA) você precisa?", [
         ["basico", "Básico"],
         ["offline", "Com funcionamento offline"],
         ["offline-push", "Offline + notificações push"],
      ]);
   }

   perguntasProjetoDiv.innerHTML = html;
}


// ============================================================
// RESOLUÇÃO DE FAMÍLIA (blog/pwa viram tokens específicos)
// ============================================================

function resolverFamilia(tipos, respostas) {

   const resolvidos = [];

   tipos.forEach((t) => {

      if (t === "blog") {
         resolvidos.push(respostas.tipoBlog === "painel" ? "blog-painel" : "blog-simples");
      } else if (t === "pwa") {
         resolvidos.push("pwa-" + (respostas.nivelPwa || "basico"));
      } else if (t !== "manutencao") {
         resolvidos.push(t);
      }
   });

   return [...new Set(resolvidos)];
}


// ============================================================
// CÁLCULO DE INVESTIMENTO
// ============================================================

function calcularOrcamento(familia, respostas) {

   const notas = [];
   const chave = [...familia].sort().join("+");

   let preco;

   if (COMBOS[chave] !== undefined) {

      preco = COMBOS[chave];

   } else {

      let soma = 0;

      familia.forEach((f) => {

         if (f.startsWith("pwa-")) {

            soma += f === "pwa-basico" ? 300 : 550;
            if (!familia.includes("sistema")) soma += PRECO_BASE.sistema;

         } else {

            soma += PRECO_BASE[f] || 0;
         }
      });

      preco = familia.length > 1 ? Math.round((soma * 0.9) / 50) * 50 : soma;

      if (familia.length > 1) {
         notas.push("Essa combinação ainda não está na tabela padrão de combos — o valor abaixo é aproximado.");
      }
   }

   if (respostas.qtdPaginas === "7+") preco += 300;
   else if (respostas.qtdPaginas === "4-6") preco += 100;

   if (respostas.identidadeVisual === "nao") {
      preco += 300;
      notas.push("Inclui a criação de identidade visual (logo, cores e fontes).");
   }

   if (respostas.qtdModulos === "5+") preco += 500;
   else if (respostas.qtdModulos === "3-4") preco += 200;

   if (respostas.integracoes === "sim") {
      preco += 400;
      notas.push("Inclui integração externa (pagamento, bancos, governo ou WhatsApp/Meta API) — pode variar conforme a API utilizada.");
   }

   if (respostas.qtdProdutos === "100+") preco += 400;
   else if (respostas.qtdProdutos === "21-100") preco += 150;

   if (familia.includes("pwa-offline-push")) {
      notas.push("Notificações push dependem de integração externa (Firebase) e são refinadas na reunião de briefing.");
   }

   return { precoMin: Math.max(preco, 0), notas };
}


// ============================================================
// CÁLCULO DE PRAZO
// ============================================================

function calcularPrazo(tipos, respostas, familia) {

   const somenteDigital = tipos.length > 0 && tipos.every((t) => t === "gmn" || t === "bio");

   if (somenteDigital) {

      if (tipos.includes("gmn") && tipos.includes("bio")) return "4 dias úteis";
      if (tipos.includes("gmn")) return "até 3 dias úteis";
      return "1 dia útil";
   }

   const pesados = ["sistema", "loja-virtual", "blog-painel"];
   const temPwa = familia.some((f) => f.startsWith("pwa-"));
   const ehPesado = familia.some((f) => pesados.includes(f)) || temPwa;

   if (!ehPesado) {

      if (respostas.layoutPronto === "sim") return "7 dias úteis";
      if (respostas.qtdPaginas === "7+") return "5 a 6 semanas";
      return "4 a 5 semanas";
   }

   const quantidadeTipos = familia.filter((f) => f !== "gmn" && f !== "bio").length;

   if (quantidadeTipos >= 4 || respostas.integracoes === "sim") return "4 a 6 meses";
   if (quantidadeTipos >= 3) return "3 a 5 meses";
   return "a partir de 3 meses";
}


// ============================================================
// EXIBIR ETAPA
// ============================================================

function mostrarEtapa(numero) {

   document.querySelectorAll(".etapa").forEach((etapaElemento) => {
      etapaElemento.style.display = "none";
   });

   const etapaSelecionada = document.querySelector(`#etapa${numero}`);
   if (etapaSelecionada) etapaSelecionada.style.display = "block";

   numeroEtapa.textContent = String(numero).padStart(2, "0");

   document.querySelectorAll("#modalEtapasLista li").forEach((li, indice) => {
      li.classList.toggle("ativa", indice === numero - 1);
   });
}


// ============================================================
// RESULTADO FINAL
// ============================================================

function mostrarResultadoFinal() {

   const respostas = coletarComplexidade();
   let familia = resolverFamilia(projeto, respostas);

   // Rede de segurança: nunca deveria chegar vazio até aqui, mas se
   // chegar, cai pro tipo mais simples em vez de mostrar R$ 0.
   if (familia.length === 0) familia = ["site"];

   const { precoMin, notas } = calcularOrcamento(familia, respostas);
   const prazo = calcularPrazo(projeto, respostas, familia);

   ultimoResultado = { familia, prazo, preco: precoMin, notas };

   formSimulador.style.display = "none";
   resultadoFinal.style.display = "block";

   resultadoListaDiv.innerHTML = "";
   familia.forEach((f) => {
      const span = document.createElement("span");
      span.textContent = LABELS[f] || f;
      resultadoListaDiv.appendChild(span);
   });

   resultadoPrazoEl.textContent = prazo;
   resultadoValorEl.textContent = `A partir de R$ ${precoMin.toLocaleString("pt-BR")}`;

   const todasAsNotas = [
      ...notas,
      "Valor final definido em reunião de briefing e no fechamento do contrato.",
   ];

   resultadoNotasEl.textContent = todasAsNotas.join(" ");
}


// ============================================================
// FLUXO — INICIAR
// ============================================================

function iniciarComProjetos() {

   coletarProjetos();

   if (projeto.length === 0) {
      alert("Escolha pelo menos um tipo de projeto.");
      return;
   }

   if (projeto.includes("manutencao")) {
      modoSimulador = "manutencao";
      abrirModalManutencao();
      return;
   }

   modoSimulador = "projeto";
   etapa = 1;
   abrirModal();
}

function iniciarDescoberta() {

   modoSimulador = "descoberta";
   projeto = [];
   publico = [];
   objetivos = [];
   etapa = 1;
   abrirModal();
}


// ============================================================
// FLUXO — AVANÇAR ETAPA
// ============================================================

function avancarEtapa() {

   if (etapa === 1) {

      if (coletarPublico().length === 0) {
         alert("Escolha pelo menos uma opção.");
         return;
      }

      etapa = 2;
      mostrarEtapa(etapa);
      return;
   }

   if (etapa === 2) {

      if (coletarObjetivos().length === 0) {
         alert("Escolha pelo menos uma opção.");
         return;
      }

      if (modoSimulador === "descoberta") sugerirProjetos();

      renderPerguntasEtapa3(projeto);
      etapa = 3;
      mostrarEtapa(etapa);
      return;
   }

   if (etapa === 3) {

      if (!etapa3Completa()) {
         alert("Responda as perguntas para ver o resultado.");
         return;
      }

      mostrarResultadoFinal();
   }
}


// ============================================================
// EVENTOS
// ============================================================

proximoProjetoBtn.addEventListener("click", iniciarComProjetos);

abrirSimuladorBtn.addEventListener("click", iniciarDescoberta);

fecharSimuladorBtn.addEventListener("click", fecharModal);

formSimulador.addEventListener("submit", (event) => {
   event.preventDefault();
   avancarEtapa();
});

voltarProjetoBtn.addEventListener("click", () => {
   if (etapa > 1) {
      etapa--;
      mostrarEtapa(etapa);
   }
});

if (refazerSimuladorBtn) {
   refazerSimuladorBtn.addEventListener("click", resetarSimulador);
}


// ============================================================
// MENSAGENS DE WHATSAPP COM AS RESPOSTAS DO CLIENTE
// ============================================================
//
// Sem isso, a Joseane recebia só "Agendar conversa" sem saber o que
// o cliente respondeu no simulador. Os dois CTAs abaixo montam a
// mensagem com público, objetivo(s), projeto(s) e estimativa antes
// de abrir o WhatsApp.

const LABELS_PUBLICO = {
   "consumidores": "Pessoas/consumidores",
   "empresas": "Empresas",
   "profissionais": "Profissionais/prestadores",
   "clientes-atuais": "Clientes atuais",
   "novos-clientes": "Novos clientes",
};

const LABELS_OBJETIVO = {
   "apresentar": "Apresentar melhor a empresa",
   "atrair-clientes": "Atrair novos clientes",
   "vender": "Vender produtos/serviços",
   "agendamento": "Receber mais agendamentos",
   "automatizar": "Automatizar processos",
   "presenca-simples": "Presença simples no Google/redes",
};

function montarMensagemResultado() {

   const listaProjetos = (ultimoResultado ? ultimoResultado.familia : projeto)
      .map((f) => LABELS[f] || f)
      .join(", ");

   const listaPublico = publico.map((p) => LABELS_PUBLICO[p] || p).join(", ") || "-";
   const listaObjetivos = objetivos.map((o) => LABELS_OBJETIVO[o] || o).join(", ") || "-";

   const linhas = [
      "Olá, Joseane! Fiz a simulação no site e quero conversar sobre o meu projeto.",
      `Público: ${listaPublico}`,
      `Objetivo: ${listaObjetivos}`,
      `Projeto(s): ${listaProjetos}`,
   ];

   if (ultimoResultado) {
      linhas.push(`Prazo estimado: ${ultimoResultado.prazo}`);
      linhas.push(`Investimento estimado: A partir de R$ ${ultimoResultado.preco.toLocaleString("pt-BR")}`);
   }

   return linhas.join("\n");
}

function montarMensagemManutencao() {

   const motivos = [...document.querySelectorAll('input[name="manutencao-motivo"]:checked')]
      .map((i) => i.parentElement.textContent.trim());

   const detalhes = manutencaoDetalhes ? manutencaoDetalhes.value.trim() : "";

   const linhas = [
      "Olá, Joseane! Já tenho um projeto e preciso de um ajuste.",
      `Motivo: ${motivos.length ? motivos.join(", ") : "não especificado"}`,
   ];

   if (detalhes) linhas.push(`Detalhes: ${detalhes}`);

   return linhas.join("\n");
}

const ctaAgendarConversa = document.querySelector("#ctaAgendarConversa");
const ctaFalarManutencao = document.querySelector("#ctaFalarManutencao");

if (ctaAgendarConversa) {

   ctaAgendarConversa.addEventListener("click", (event) => {

      event.preventDefault();

      const link = `${ctaAgendarConversa.href.split("?")[0]}?text=${encodeURIComponent(montarMensagemResultado())}`;
      window.open(link, "_blank", "noopener");
   });
}

if (ctaFalarManutencao) {

   ctaFalarManutencao.addEventListener("click", (event) => {

      event.preventDefault();

      const link = `${ctaFalarManutencao.href.split("?")[0]}?text=${encodeURIComponent(montarMensagemManutencao())}`;
      window.open(link, "_blank", "noopener");
   });
}


// ============================================================
// MODAL AGÊNCIA — fluxo totalmente separado do simulador de
// cliente final. Não usa etapas, preço ou prazo: só coleta os
// dados do formulário e monta uma mensagem de WhatsApp.
// ============================================================

const modalAgencia = document.querySelector("#modalAgencia");
const abrirModalAgenciaBtn = document.querySelector("#abrirModalAgencia");
const fecharModalAgenciaBtn = document.querySelector("#fecharModalAgencia");
const formAgencia = document.querySelector("#formAgencia");

const NUMERO_WHATSAPP = "55SEUNUMEROAQUI"; // troque pelo seu número real

function abrirModalAgenciaFn() {
   if (!modalAgencia) return;
   modalAgencia.classList.add("ativo");
   modalAgencia.setAttribute("aria-hidden", "false");
}

function fecharModalAgenciaFn() {
   if (!modalAgencia) return;
   modalAgencia.classList.remove("ativo");
   modalAgencia.setAttribute("aria-hidden", "true");
   if (formAgencia) formAgencia.reset();
}

if (abrirModalAgenciaBtn) {
   abrirModalAgenciaBtn.addEventListener("click", abrirModalAgenciaFn);
}

if (fecharModalAgenciaBtn) {
   fecharModalAgenciaBtn.addEventListener("click", fecharModalAgenciaFn);
}

if (formAgencia) {

   formAgencia.addEventListener("submit", async (event) => {

      event.preventDefault();

      const dados = new FormData(formAgencia);

      const botaoEnviar = formAgencia.querySelector('button[type="submit"]');
      const textoOriginalBotao = botaoEnviar ? botaoEnviar.innerHTML : "";
      if (botaoEnviar) {
         botaoEnviar.disabled = true;
         botaoEnviar.textContent = "Enviando...";
      }

      // 1) Envia por e-mail via Web3Forms — não bloqueia o WhatsApp caso falhe,
      // já que o WhatsApp é o canal mais confiável no dia a dia.
      try {
         await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: dados,
            headers: { Accept: "application/json" },
         });
      } catch (erro) {
         console.error("Falha ao enviar o e-mail via Web3Forms:", erro);
      }

      // 2) Abre o WhatsApp com a mensagem já preenchida
      const tipoLabel = {
         "white-label": "Terceirização / white-label",
         "indicacao": "Indicação de projetos",
         "outro": "Outro",
      };

      const mensagem = [
         "Olá, Joseane! Sou de uma agência/parceria e gostaria de conversar.",
         `Nome: ${dados.get("agenciaNome") || "-"}`,
         `Empresa: ${dados.get("agenciaEmpresa") || "-"}`,
         `WhatsApp: ${dados.get("agenciaWhatsapp") || "-"}`,
         `E-mail: ${dados.get("email") || "-"}`,
         `Tipo de parceria: ${tipoLabel[dados.get("agenciaTipo")] || "-"}`,
         `Mensagem: ${dados.get("agenciaMensagem") || "-"}`,
      ].join("\n");

      const link = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

      window.open(link, "_blank", "noopener");

      if (botaoEnviar) {
         botaoEnviar.disabled = false;
         botaoEnviar.innerHTML = textoOriginalBotao;
      }

      fecharModalAgenciaFn();
   });
}
