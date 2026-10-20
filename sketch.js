const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;

let estadoAtual = ESTADO_INICIO;

let pontuacao = 0;
let vidas = 3;
let tempoRestante = 60;
let timerInterval = null;

// Instâncias de objetos
let barco;
let redes = [];

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  // Criar barco no nível da água (y = 170)
  barco = new Barco(100, 170, 'padrao');
}

function draw() {
  background(135, 206, 235);

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

  desenharRodapeTema();
}

function desenharEcraInicio() {
  fill(20);
  textSize(24);
  textStyle(BOLD);
  text("PESCA SUSTENTÁVEL E REDUÇÃO\nDE CAPTURAS ACIDENTAIS", width / 2, 100);

  textStyle(NORMAL);
  textSize(14);
  text("Usa as setas para mover o barco\nClica na água para lançar redes", width / 2, 180);

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

function desenharEcraJogo() {
  // Linha de água
  stroke(0, 100, 200);
  fill(30, 144, 255, 180);
  rectMode(CORNER);
  rect(0, 200, width, height - 200);

  // Atualizar e desenhar Barco
  barco.atualizar();
  barco.desenhar();

  // Atualizar e desenhar Redes
  for (let i = redes.length - 1; i >= 0; i--) {
    redes[i].atualizar();
    redes[i].desenhar();

    // Limpar redes inativas da memória
    if (!redes[i].ativa) {
      redes.splice(i, 1);
    }
  }

  desenharHUD();
}

function desenharEcraFim() {
  fill(20);
  textSize(32);
  textStyle(BOLD);
  text("FIM DE JOGO", width / 2, 150);

  textSize(20);
  textStyle(NORMAL);
  text(`Pontuação Final: ${pontuacao}`, width / 2, 230);

  fill(255);
  stroke(0);
  rectMode(CENTER);
  rect(width / 2, 320, 200, 50, 10);

  fill(0);
  noStroke();
  textSize(18);
  text("REPETIR", width / 2, 320);
}

function desenharHUD() {
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  
  text(`Tempo: ${tempoRestante}s`, 30, 30);
  text(`Pontos: ${nf(pontuacao, 3)}`, width / 2 - 40, 30);
  text(`Vidas: ${"♥ ".repeat(vidas)}`, width - 150, 30);
  
  textAlign(CENTER, CENTER);
}

function desenharRodapeTema() {
  fill(50);
  noStroke();
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text("Sustainable Fishing and Bycatch Reduction", 15, height - 15);
  textAlign(CENTER, CENTER);
}

function mousePressed() {
  if (estadoAtual === ESTADO_INICIO) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > 300 - 25 && mouseY < 300 + 25) {
      iniciarJogo();
    }
  } else if (estadoAtual === ESTADO_JOGO) {
    // Só dispara se clicar abaixo da linha de água
    if (mouseY > 200) {
      let ptCanhao = barco.getPosicaoCanhao();
      redes.push(new Rede(ptCanhao.x, ptCanhao.y, mouseX, mouseY));
    }
  } else if (estadoAtual === ESTADO_FIM) {
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
  redes = [];
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