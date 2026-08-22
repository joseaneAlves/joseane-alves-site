/**
 * ============================================================
 * SIMULADOR DE PROJETO
 * ============================================================
 *
 * O simulador possui dois caminhos:
 *
 * 1. Cliente já sabe o que precisa:
 *    escolhe um ou mais projetos na seção e inicia o diagnóstico.
 *
 * 2. Cliente ainda tem dúvidas:
 *    inicia o diagnóstico diretamente pelo botão "Começar
 *    simulação", informa público e objetivo e recebe sugestões
 *    de projetos.
 *
 * As respostas são armazenadas em objetos para facilitar
 * posteriormente o envio para uma API ou banco de dados.
 * ============================================================
 */


// ============================================================
// VARIÁVEIS
// ============================================================

let etapa = 1;

let projeto = [];
let objetivo = "";
let publico = [];

let indiceProjeto = 0;

let projetoAtual = "";
let respostasProjetos = [];
let respostasProjetoAtual = {};

let modoSimulador = "";


// ============================================================
// ELEMENTOS
// ============================================================

const modalSimulador =
    document.querySelector("#modalSimulador");

const abrirSimulador =
    document.querySelector("#abrirSimulador");

const fecharSimulador =
    document.querySelector("#fecharSimulador");

const proximoProjeto =
    document.querySelector("#proximoProjeto");

const voltarProjeto =
    document.querySelector("#voltarProjeto");

const formSimulador =
    document.querySelector("#formSimulador");

const numeroEtapa =
    document.querySelector("#numeroEtapa");

const resultadoFinal =
    document.querySelector("#resultadoFinal");


// ============================================================
// ABRIR MODAL
// ============================================================

/**
 * Abre o modal e inicia o fluxo correspondente ao caminho
 * escolhido pelo cliente.
 */
function abrirModal() {

    modalSimulador.classList.add("ativo");

    modalSimulador.setAttribute(
        "aria-hidden",
        "false"
    );

    mostrarEtapa(etapa);
}


// ============================================================
// FECHAR MODAL
// ============================================================

/**
 * Fecha o modal do simulador.
 */
function fecharModal() {

    modalSimulador.classList.remove("ativo");

    modalSimulador.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ============================================================
// COLETAR PROJETOS DOS CARDS
// ============================================================

/**
 * Coleta os cards selecionados na seção inicial
 * e armazena seus values no array projeto.
 */
function coletarProjetos() {

    const projetosSelecionados =
        document.querySelectorAll(
            'input[name="projeto"]:checked'
        );

    projeto = [];

    projetosSelecionados.forEach(function (opcao) {

        projeto.push(opcao.value);

    });

    return projeto;
}


// ============================================================
// INICIAR PELOS CARDS
// ============================================================

/**
 * Inicia o diagnóstico quando o cliente já escolheu
 * quais projetos deseja desenvolver.
 */
function iniciarComProjetos() {

    coletarProjetos();

    if (projeto.length === 0) {

        alert(
            "Escolha pelo menos um tipo de projeto."
        );

        return;
    }

    modoSimulador = "projeto";

    etapa = 1;

    abrirModal();
}


// ============================================================
// INICIAR SIMULAÇÃO
// ============================================================

/**
 * Inicia o diagnóstico sem exigir que o cliente escolha
 * previamente um tipo de projeto.
 */
function iniciarDescoberta() {

    modoSimulador = "descoberta";

    projeto = [];

    publico = [];

    objetivo = "";

    etapa = 1;

    abrirModal();
}


// ============================================================
// MOSTRAR ETAPA
// ============================================================

/**
 * Oculta todas as etapas e mostra somente a etapa atual.
 */
function mostrarEtapa(numero) {

    const etapas =
        document.querySelectorAll(".etapa");

    etapas.forEach(function (etapaElemento) {

        etapaElemento.style.display = "none";

    });

    const etapaSelecionada =
        document.querySelector(`#etapa${numero}`);

    if (etapaSelecionada) {

        etapaSelecionada.style.display = "block";

    }

    numeroEtapa.textContent =
        String(numero).padStart(2, "0");

}


// ============================================================
// COLETAR PÚBLICO
// ============================================================

/**
 * Coleta o público selecionado pelo cliente.
 */
function coletarPublico() {

    const opcoes =
        document.querySelectorAll(
            'input[name="publico"]:checked'
        );

    publico = [];

    opcoes.forEach(function (opcao) {

        publico.push(opcao.value);

    });

    return publico;
}


// ============================================================
// COLETAR OBJETIVO
// ============================================================

/**
 * Coleta o objetivo principal escolhido pelo cliente.
 */
function coletarObjetivo() {

    const opcao =
        document.querySelector(
            'input[name="objetivo"]:checked'
        );

    if (!opcao) {

        return false;

    }

    objetivo = opcao.value;

    return true;
}


// ============================================================
// SUGERIR PROJETOS
// ============================================================

/**
 * Analisa público e objetivo e cria uma sugestão inicial
 * de projetos para clientes que ainda não sabem o que precisam.
 */
function sugerirProjetos() {

    projeto = [];

    if (
        objetivo === "apresentar" ||
        objetivo === "atrair-clientes"
    ) {

        projeto.push("site");

    }

    if (
        objetivo === "vender"
    ) {

        projeto.push("landing-page");

    }

    if (
        objetivo === "agendamento" ||
        objetivo === "automatizar"
    ) {

        projeto.push("sistema");

    }

    if (
        publico.includes("clientes-atuais") &&
        objetivo === "automatizar"
    ) {

        projeto.push("pwa");

    }

    if (projeto.length === 0) {

        projeto.push("site");

    }

    projeto = [...new Set(projeto)];
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

/**
 * Exibe o resultado final e as soluções sugeridas.
 */
function mostrarResultadoFinal() {

    formSimulador.style.display = "none";

    resultadoFinal.style.display = "block";

    if (modoSimulador === "descoberta") {

        sugerirProjetos();

    }

    const projetosSugeridos =
        document.querySelector("#projetosSugeridos");

    projetosSugeridos.innerHTML = "";

    projeto.forEach(function (item) {

        const elemento =
            document.createElement("span");

        elemento.textContent =
            item;

        projetosSugeridos.appendChild(elemento);

    });
}


// ============================================================
// AVANÇAR ETAPA
// ============================================================

/**
 * Controla o avanço entre as etapas do diagnóstico.
 */
function avancarEtapa() {

    if (etapa === 1) {

        const publicoSelecionado =
            coletarPublico();

        if (publicoSelecionado.length === 0) {

            alert(
                "Escolha pelo menos uma opção."
            );

            return;
        }

        etapa++;

        mostrarEtapa(etapa);

        return;
    }


    if (etapa === 2) {

        if (!coletarObjetivo()) {

            alert(
                "Escolha uma opção."
            );

            return;
        }

        if (modoSimulador === "descoberta") {

            mostrarResultadoFinal();

            return;
        }

        etapa++;

        mostrarEtapa(etapa);

        return;
    }


    if (etapa === 3) {

        mostrarResultadoFinal();

    }

}


// ============================================================
// EVENTOS
// ============================================================

/**
 * Abre o diagnóstico quando o cliente já escolheu
 * seus projetos.
 */
proximoProjeto.addEventListener(
    "click",
    function () {

        iniciarComProjetos();

    }
);


/**
 * Abre o diagnóstico pelo caminho de descoberta.
 */
abrirSimulador.addEventListener(
    "click",
    function () {

        iniciarDescoberta();

    }
);


/**
 * Fecha o modal.
 */
fecharSimulador.addEventListener(
    "click",
    function () {

        fecharModal();

    }
);


/**
 * Avança o diagnóstico ao clicar em Próximo.
 */
formSimulador.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        avancarEtapa();

    }
);


/**
 * Permite voltar para a etapa anterior.
 */
voltarProjeto.addEventListener(
    "click",
    function () {

        if (etapa > 1) {

            etapa--;

            mostrarEtapa(etapa);

        }

    }
);