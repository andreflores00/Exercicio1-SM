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
let criaturas = [];

// Variáveis de Áudio
let mic;
let limiarMinimo = 0.02; // Histerese inferior (ignora ruído de fundo)
let limiarMaximo = 0.3;  // Histerese superior (atinge a velocidade máxima)

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  // Exige clique para iniciar áudio nos browsers modernos
  userStartAudio(); 
  
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
  text("Usa as SETAS para apontar a direção e a TUA VOZ para acelerar\nClica na água para lançar redes", width / 2, 180);

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

  // --- PROCESSAMENTO DE ÁUDIO ---
  let nivelAudio = mic ? mic.getLevel() : 0;
  let fatorAudio = 0;
  
  if (nivelAudio > limiarMinimo) {
    // Mapeia o volume: do limite mínimo ao máximo para gerar um multiplicador de velocidade (1x até 4x)
    fatorAudio = map(nivelAudio, limiarMinimo, limiarMaximo, 1, 4);
    fatorAudio = constrain(fatorAudio, 1, 4); // Garante que não passa de 4x a velocidade
  }

  // Atualizar barco com o fator áudio
  barco.atualizar(fatorAudio);
  barco.desenhar();

  // Gerar novas criaturas
  if (frameCount % 70 === 0) {
    gerarCriatura();
  }

  // Atualizar e desenhar Criaturas
  for (let i = criaturas.length - 1; i >= 0; i--) {
    criaturas[i].atualizar();
    criaturas[i].desenhar();

    if (!criaturas[i].ativa) {
      criaturas.splice(i, 1);
    }
  }

  // Atualizar e desenhar Redes
  for (let i = redes.length - 1; i >= 0; i--) {
    redes[i].atualizar();
    redes[i].desenhar();

    if (!redes[i].ativa) {
      redes.splice(i, 1);
    }
  }

  desenharHUD(nivelAudio);
}

function gerarCriatura() {
  let ySorteado = random(260, 540);
  let tipoSorteado = random() < 0.75 ? 'peixe' : 'tartaruga';
  criaturas.push(new Criatura(null, ySorteado, tipoSorteado));
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

function desenharHUD(nivelAudio = 0) {
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  
  text(`Tempo: ${tempoRestante}s`, 30, 30);
  text(`Pontos: ${nf(pontuacao, 3)}`, width / 2 - 40, 30);
  text(`Vidas: ${"♥ ".repeat(vidas)}`, width - 150, 30);
  
  // Medidor de Feedback Visual do Áudio (Calibração)
  textSize(12);
  text("Volume:", width - 150, 60);
  stroke(0);
  fill(200);
  rectMode(CORNER);
  rect(width - 150, 75, 100, 10);
  
  noStroke();
  fill(0, 255, 0); // Barra verde dinâmica
  let barraLargura = map(nivelAudio, 0, limiarMaximo, 0, 100);
  barraLargura = constrain(barraLargura, 0, 100);
  rect(width - 150, 75, barraLargura, 10);

  // Linha vermelha para mostrar onde está o limite mínimo de histerese
  stroke(255, 0, 0);
  let xLimiar = map(limiarMinimo, 0, limiarMaximo, 0, 100);
  line(width - 150 + xLimiar, 70, width - 150 + xLimiar, 90);
  
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
  // Iniciar o microfone na transição (após o clique do utilizador)
  if (!mic) {
    mic = new p5.AudioIn();
    mic.start();
  }

  pontuacao = 0;
  vidas = 3;
  tempoRestante = 60;
  redes = [];
  criaturas = [];
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