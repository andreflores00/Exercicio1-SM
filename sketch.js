// Constantes de Estados do Jogo
const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;

let estadoAtual = ESTADO_INICIO;

// Variáveis de Jogo
let pontuacao = 0;
let vidas = 3;
let tempoRestante = 60; // em segundos
let timerInterval = null;

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(135, 206, 235); // Céu / Azul base

  switch (estadoAtual) {
    case ESTADO_INICIO:
      desenharEcraInicio();
      break;
    case ESTADO_JOGO:
      desenharEcraJogo();
      break;
    case ESTADO_FIM:
      desenharEcraFim();
      break;
  }

  // Nome do tema em inglês no canto inferior esquerdo (Requisito obrigatório)
  desenharRodapeTema();
}

// --- ECRÃ INICIAL ---
function desenharEcraInicio() {
  fill(20);
  textSize(24);
  textStyle(BOLD);
  text("PESCA SUSTENTÁVEL E REDUÇÃO\nDE CAPTURAS ACIDENTAIS", width / 2, 100);

  textStyle(NORMAL);
  textSize(14);
  text("Controlo: Rato/Voz para disparar e mover", width / 2, 180);

  // Botão Iniciar / Jogar
  fill(255);
  stroke(0);
  strokeWeight(2);
  rectMode(CENTER);
  rect(width / 2, 300, 200, 50, 10);

  fill(0);
  noStroke();
  textSize(18);
  text("INICIAR / JOGAR", width / 2, 300);
}

// --- ECRÃ DE JOGO ---
function desenharEcraJogo() {
  // Linha da água
  stroke(0, 100, 200);
  fill(30, 144, 255, 180);
  rectMode(CORNER);
  rect(0, 200, width, height - 200);

  // Desenhar HUD (Tempo, Pontos, Vidas)
  desenharHUD();
}

// --- ECRÃ DE FIM DE JOGO ---
function desenharEcraFim() {
  fill(20);
  textSize(32);
  textStyle(BOLD);
  text("FIM DE JOGO", width / 2, 150);

  textSize(20);
  textStyle(NORMAL);
  text(`Pontuação Final: ${pontuacao}`, width / 2, 230);

  // Botão Reiniciar
  fill(255);
  stroke(0);
  rectMode(CENTER);
  rect(width / 2, 320, 200, 50, 10);

  fill(0);
  noStroke();
  textSize(18);
  text("REPETIR", width / 2, 320);
}

// --- HUD (INTERFACE DO JOGO) ---
function desenharHUD() {
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  
  text(`Tempo: ${tempoRestante}s`, 30, 30);
  text(`Pontos: ${nf(pontuacao, 3)}`, width / 2 - 40, 30);
  text(`Vidas: ${"♥ ".repeat(vidas)}`, width - 150, 30);
  
  textAlign(CENTER, CENTER); // Reset do alinhamento
}

// --- RÓTULO OBRIGATÓRIO EM INGLÊS ---
function desenharRodapeTema() {
  fill(50);
  noStroke();
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text("Sustainable Fishing and Bycatch Reduction", 15, height - 15);
  textAlign(CENTER, CENTER);
}

// --- INTERAÇÕES DE CLIQUE ---
function mousePressed() {
  if (estadoAtual === ESTADO_INICIO) {
    // Clique no botão INICIAR
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > 300 - 25 && mouseY < 300 + 25) {
      iniciarJogo();
    }
  } else if (estadoAtual === ESTADO_FIM) {
    // Clique no botão REPETIR
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > 320 - 25 && mouseY < 320 + 25) {
      iniciarJogo();
    }
  }
}

function iniciarJogo() {
  pontuacao = 0;
  vidas = 3;
  tempoRestante = 60;
  estadoAtual = ESTADO_JOGO;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (estadoAtual === ESTADO_JOGO) {
      tempoRestante--;
      if (tempoRestante <= 0) {
        finalizarJogo();
      }
    }
  }, 1000);
}

function finalizarJogo() {
  clearInterval(timerInterval);
  estadoAtual = ESTADO_FIM;
}