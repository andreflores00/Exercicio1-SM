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

// Ficheiros de Imagem
let imgBarco, imgRede, imgFundoMar;
let imgsCriaturas = {};

// Variáveis de Áudio e Calibração
let mic;
let limiarMinimo = 0.035; 
let limiarMaximo = 0.30;  

function carregarImagemOpcional(caminho, aoCarregar) {
  loadImage(caminho, aoCarregar, erro => {
    console.warn(`Imagem opcional indisponível: ${caminho}. Será usado o desenho alternativo.`, erro);
  });
}

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);

  carregarImagemOpcional('sprites/barco.png', imagem => {
    imgBarco = imagem;
    if (barco) barco.img = imagem;
  });
  carregarImagemOpcional('sprites/rede.png', imagem => {
    imgRede = imagem;
  });
  carregarImagemOpcional('sprites/fundo_mar.png', imagem => {
    imgFundoMar = imagem;
  });

  for (const especie of ['sardinha', 'dourada', 'atum', 'tartaruga', 'cavalo_marinho', 'golfinho']) {
    carregarImagemOpcional(`sprites/${especie}.png`, imagem => {
      imgsCriaturas[especie] = imagem;
    });
  }

  barco = new Barco(100, 160, 'padrao', imgBarco);
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
  noStroke();
  fill(30, 144, 255, 120);
  rectMode(CORNER);
  rect(0, height / 2 + 50, width, height / 2);
  fill(20, 100, 180, 180);
  rect(0, height / 2 + 100, width, height / 2);

  rectMode(CENTER);
  fill(255, 255, 255, 240);
  stroke(200);
  strokeWeight(1);
  rect(width / 2, height / 2, 500, 380, 8);

  noStroke();
  fill(20);
  textSize(26);
  textStyle(BOLD);
  text("PESCA SUSTENTÁVEL", width / 2, 160);
  
  fill(80);
  textSize(14);
  textStyle(NORMAL);
  text("REDUÇÃO DE CAPTURAS ACIDENTAIS", width / 2, 190);

  stroke(220);
  strokeWeight(1);
  line(width / 2 - 200, 215, width / 2 + 200, 215);
  noStroke();

  textAlign(LEFT, CENTER);
  
  fill(40);
  textSize(14);
  textStyle(BOLD);
  text("Objetivo:", width / 2 - 180, 240);
  textStyle(NORMAL);
  text("Capturar peixes permitidos e evitar espécies protegidas.", width / 2 - 180, 260);

  textStyle(BOLD);
  text("Controlos:", width / 2 - 180, 295);
  textStyle(NORMAL);
  text("•  Direção: Teclas A / D ou Setas", width / 2 - 180, 320);
  text("•  Acelerar: Falar ao microfone", width / 2 - 180, 345);
  text("•  Disparar: Clicar com o rato na água", width / 2 - 180, 370);
  
  textAlign(CENTER, CENTER);

  let hoverBtn = mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
                 mouseY > 430 - 25 && mouseY < 430 + 25;
  
  if (hoverBtn) {
    fill(0, 120, 210); 
    cursor(HAND);
  } else {
    fill(0, 100, 180); 
    cursor(ARROW);
  }

  rectMode(CENTER);
  rect(width / 2, 430, 200, 50, 4); 

  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("INICIAR JOGO", width / 2, 430);
  textStyle(NORMAL);
}

function desenharEcraJogo() {
  cursor(CROSS); 

  // Fundo do Mar
  if (imgFundoMar) {
    imageMode(CORNER);
    image(imgFundoMar, 0, 200, width, height - 200);
  } else {
    noStroke();
    fill(20, 100, 180, 220);
    rectMode(CORNER);
    rect(0, 200, width, height - 200);
  }

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

  if (frameCount % 60 === 0) {
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

        if (c.categoria === 'permitida') {
          pontuacao += c.pontos;
        } else if (c.categoria === 'protegida') {
          pontuacao += c.pontos; // Subtrai os pontos
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
  
  // 70% hipótese de peixe comercial, 30% hipótese de espécie protegida
  let tipoSorteado;
  if (random() < 0.70) {
    let opcoesComerciais = ['sardinha', 'dourada', 'atum'];
    tipoSorteado = random(opcoesComerciais);
  } else {
    let opcoesProtegidas = ['tartaruga', 'cavalo_marinho', 'golfinho'];
    tipoSorteado = random(opcoesProtegidas);
  }

  criaturas.push(new Criatura(null, ySorteado, tipoSorteado, imgsCriaturas[tipoSorteado]));
}

function desenharEcraFim() {
  fill(0, 0, 0, 150);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(255, 255, 255, 240);
  stroke(200);
  strokeWeight(1);
  rect(width / 2, height / 2, 400, 260, 8);

  noStroke();
  fill(20);
  textSize(28);
  textStyle(BOLD);
  text("FIM DE JOGO", width / 2, 210);

  fill(80);
  textSize(16);
  textStyle(NORMAL);
  text("Pontuação Final:", width / 2, 250);

  fill(0, 100, 180);
  textSize(36);
  textStyle(BOLD);
  text(pontuacao, width / 2, 290);

  let hoverBtn = mouseX > width / 2 - 80 && mouseX < width / 2 + 80 &&
                 mouseY > 360 - 20 && mouseY < 360 + 20;
                 
  if (hoverBtn) {
    fill(0, 120, 210);
    cursor(HAND);
  } else {
    fill(0, 100, 180);
    cursor(ARROW);
  }

  rectMode(CENTER);
  rect(width / 2, 360, 160, 40, 4);

  fill(255);
  noStroke();
  textSize(14);
  textStyle(BOLD);
  text("REPETIR", width / 2, 360);
  textStyle(NORMAL);
}

function desenharHUD(nivelAudio = 0) {
  fill(0, 0, 0, 180);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 40);

  textAlign(LEFT, CENTER);
  textSize(16);
  
  fill(255);
  textStyle(BOLD);
  text(`Tempo:`, 20, 20);
  textStyle(NORMAL);
  text(`${tempoRestante}s`, 85, 20);

  textStyle(BOLD);
  text(`Pontos:`, 150, 20);
  textStyle(NORMAL);
  text(`${pontuacao}`, 215, 20);

  textStyle(BOLD);
  text(`Vidas:`, 280, 20);
  fill(255, 80, 80); 
  text(`${"♥ ".repeat(vidas)}`, 335, 18);

  let dirTexto = barco.direcaoAtual === 1 ? "Direita →" : "← Esquerda";
  fill(255);
  textSize(14);
  textAlign(RIGHT, CENTER);
  text(`Sentido: ${dirTexto}`, width - 20, 20);

  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(width - 150, 50, 130, 50, 4);
  
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Volume (Voz)", width - 85, 65);

  fill(50);
  rect(width - 140, 78, 110, 10, 2);
  
  let corR = map(nivelAudio, limiarMinimo, limiarMaximo, 0, 255);
  let corG = map(nivelAudio, limiarMinimo, limiarMaximo, 255, 100);
  fill(corR, corG, 0); 
  
  let barraLargura = map(nivelAudio, 0, limiarMaximo, 0, 110);
  barraLargura = constrain(barraLargura, 0, 110);
  rect(width - 140, 78, barraLargura, 10, 2);

  stroke(255);
  strokeWeight(2);
  let xLimiar = map(limiarMinimo, 0, limiarMaximo, 0, 110);
  line(width - 140 + xLimiar, 76, width - 140 + xLimiar, 90);
  noStroke();
  
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
        mouseY > 430 - 25 && mouseY < 430 + 25) {
      iniciarJogo();
    }
  } else if (estadoAtual === ESTADO_JOGO) {
    if (mouseY > 200) {
      let ptCanhao = barco.getPosicaoCanhao();
      redes.push(new Rede(ptCanhao.x, ptCanhao.y, mouseX, mouseY, imgRede));
    }
  } else if (estadoAtual === ESTADO_FIM) {
    if (mouseX > width / 2 - 80 && mouseX < width / 2 + 80 &&
        mouseY > 360 - 20 && mouseY < 360 + 20) {
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