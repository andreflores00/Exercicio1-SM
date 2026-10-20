const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;

let estadoAtual = ESTADO_INICIO;

let pontuacao = 0;
let vidas = 3;
let tempoRestante = 60;
let timerInterval = null;

let barco;
let redes = [];
let criaturas = [];

// Variáveis de Áudio e Calibração
let mic;
let limiarMinimo = 0.035; 
let limiarMaximo = 0.30;  

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  barco = new Barco(100, 170, 'padrao');
}

function draw() {
  background(135, 206, 235); // Céu

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
  text("Pressiona A (Esquerda) ou D/W (Direita) para escolher o sentido.\nFALA para o barco andar!\nClica na água para lançar redes.", width / 2, 180);

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
  // --- Oceano Melhorado ---
  noStroke();
  // Camada profunda
  fill(20, 100, 180, 220);
  rectMode(CORNER);
  rect(0, 200, width, height - 200);
  // Camada superficial (brilho/rasa)
  fill(30, 144, 255, 150);
  rect(0, 200, width, 20);

  let nivelAudio = 0;
  if (mic) {
    nivelAudio = mic.getLevel();
  }

  let fatorAudio = 0;
  if (nivelAudio > limiarMinimo) {
    fatorAudio = map(nivelAudio, limiarMinimo, limiarMaximo, 1, 3.5);
    fatorAudio = constrain(fatorAudio, 1, 3.5);
  }

  barco.atualizar(fatorAudio);
  barco.desenhar();

  if (frameCount % 70 === 0) {
    gerarCriatura();
  }

  for (let i = criaturas.length - 1; i >= 0; i--) {
    criaturas[i].atualizar();
    criaturas[i].desenhar();

    if (!criaturas[i].ativa) criaturas.splice(i, 1);
  }

  for (let i = redes.length - 1; i >= 0; i--) {
    redes[i].atualizar();
    redes[i].desenhar();

    if (!redes[i].ativa) redes.splice(i, 1);
  }

  verificarColisoes();
  desenharHUD(nivelAudio);
}

function keyPressed() {
  if (estadoAtual === ESTADO_JOGO && barco) {
    if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
      barco.definirDirecao(-1);
    } 
    else if (key === 'd' || key === 'D' || key === 'w' || key === 'W' || keyCode === RIGHT_ARROW) {
      barco.definirDirecao(1);
    }
  }
}

function verificarColisoes() {
  for (let r of redes) {
    if (!r.ativa) continue;

    for (let c of criaturas) {
      if (!c.ativa) continue;

      let d = dist(r.x, r.y, c.x, c.y);
      let zonaColisao = r.raio + (c.largura / 2);

      if (d < zonaColisao) {
        r.ativa = false;
        c.ativa = false;

        if (c.tipo === 'peixe') {
          pontuacao += c.pontos;
        } else if (c.tipo === 'tartaruga') {
          pontuacao += c.pontos;
          vidas -= 1;
          
          if (vidas <= 0) {
            finalizarJogo();
          }
        }
      }
    }
  }
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

// --- INTERFACE (HUD) MELHORADA ---
function desenharHUD(nivelAudio = 0) {
  // Barra de fundo superior escurecida
  fill(0, 0, 0, 120);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 45);

  // Configuração de texto base
  textAlign(LEFT, CENTER);
  textSize(18);
  
  // 1. Tempo
  fill(255);
  textStyle(BOLD);
  text(`⏱ Tempo:`, 20, 22);
  fill(255, 215, 0); // Amarelo
  text(`${tempoRestante}s`, 105, 22);

  // 2. Pontos
  fill(255);
  text(`⭐ Pontos:`, 180, 22);
  fill(255, 215, 0); // Amarelo
  text(`${pontuacao}`, 275, 22);

  // 3. Vidas
  fill(255);
  text(`❤️ Vidas:`, 350, 22);
  fill(255, 50, 50); // Vermelho
  text(`${"♥ ".repeat(vidas)}`, 435, 20);

  // 4. Sentido / Direção
  let dirTexto = barco.direcaoAtual === 1 ? "Direita ➡️" : "⬅️ Esquerda";
  fill(255);
  textSize(16);
  textAlign(RIGHT, CENTER);
  text(`Sentido: ${dirTexto}`, width - 20, 22);

  textStyle(NORMAL); // Reset ao estilo

  // --- Painel do Microfone ---
  // Caixa de fundo para o mic
  fill(0, 0, 0, 150);
  rectMode(CORNER);
  rect(width - 160, 55, 140, 55, 10);
  
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("🎙️ Voz (Motor)", width - 90, 70);

  // Fundo da barra de volume
  fill(50);
  rect(width - 150, 85, 120, 12, 6);
  
  // Cor dinâmica da barra (verde até laranja/vermelho)
  let corR = map(nivelAudio, limiarMinimo, limiarMaximo, 0, 255);
  let corG = map(nivelAudio, limiarMinimo, limiarMaximo, 255, 100);
  fill(corR, corG, 0); 
  
  let barraLargura = map(nivelAudio, 0, limiarMaximo, 0, 120);
  barraLargura = constrain(barraLargura, 0, 120);
  rect(width - 150, 85, barraLargura, 12, 6);

  // Linha branca de ativação (Histerese mínima)
  stroke(255);
  strokeWeight(2);
  let xLimiar = map(limiarMinimo, 0, limiarMaximo, 0, 120);
  line(width - 150 + xLimiar, 83, width - 150 + xLimiar, 99);
  noStroke();
  
  textAlign(CENTER, CENTER); // Reset
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
  userStartAudio();
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

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