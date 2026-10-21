const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;
const ESTADO_TRANSICAO = 3; // Novo estado para pausa entre níveis

let estadoAtual = ESTADO_INICIO;

let pontuacao = 0;
let vidas = 3;
let tempoRestante = 60;
let timerInterval = null;
let nivelAtual = 1;

let barco;
let redes = [];
let criaturas = [];

// Variáveis de Disparo (Limite de redes)
let ultimoDisparo = 0;
let tempoRecarga = 800; // Demora 0.8 segundos entre cada lançamento

// Imagens
let imgBarco, imgRede, imgFundoMar;
let imgsCriaturas = {};

// Texto temporário da transição
let transicaoTitulo = "";
let transicaoTexto = "";

// Áudio e Calibração
let mic;
let limiarMinimo = 0.035; 
let limiarMaximo = 0.30;  

function carregarImagemOpcional(caminho) {
  return loadImage(caminho, undefined, erro => {
    console.warn(`Imagem indisponível: ${caminho}. Será usada a alternativa.`, erro);
  });
}

function preload() {
  imgBarco = carregarImagemOpcional('sprites/barco.png');
  imgRede = carregarImagemOpcional('sprites/rede.png');
  imgFundoMar = carregarImagemOpcional('sprites/fundo_mar.png');

  imgsCriaturas['sardinha'] = carregarImagemOpcional('sprites/sardinha.png');
  imgsCriaturas['dourada'] = carregarImagemOpcional('sprites/dourada.png');
  imgsCriaturas['atum'] = carregarImagemOpcional('sprites/atum.png');
  imgsCriaturas['tartaruga'] = carregarImagemOpcional('sprites/tartaruga.png');
  imgsCriaturas['cavalo_marinho'] = carregarImagemOpcional('sprites/cavalo_marinho.png');
  imgsCriaturas['golfinho'] = carregarImagemOpcional('sprites/golfinho.png');
}

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  // Barco posicionado mais abaixo na água (y = 270)
  barco = new Barco(100, 270, 'padrao', imgBarco);
}

function draw() {
  // Reset de cursor global (a mira desativa o cursor normal no jogo)
  cursor(ARROW);

  switch (estadoAtual) {
    case ESTADO_INICIO:
      background(135, 206, 235);
      desenharEcraInicio();
      break;
    case ESTADO_JOGO:
      desenharEcraJogo();
      break;
    case ESTADO_TRANSICAO:
      desenharEcraJogo(false); // Desenha o jogo congelado por trás
      desenharEcraTransicao();
      break;
    case ESTADO_FIM:
      background(135, 206, 235);
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
  text("Ganha pontos para subir de Nível e descobrir novos peixes!", width / 2 - 180, 260);

  textStyle(BOLD);
  text("Controlos:", width / 2 - 180, 295);
  textStyle(NORMAL);
  text("•  Direção: Teclas A / D ou Setas", width / 2 - 180, 320);
  text("•  Acelerar: Falar ao microfone", width / 2 - 180, 345);
  text("•  Disparar: Clicar com o rato na água (Tem limite de velocidade)", width / 2 - 180, 370);
  
  textAlign(CENTER, CENTER);

  let hoverBtn = mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
                 mouseY > 430 - 25 && mouseY < 430 + 25;
  
  if (hoverBtn) {
    fill(0, 120, 210); 
    cursor(HAND);
  } else {
    fill(0, 100, 180); 
  }

  rectMode(CENTER);
  rect(width / 2, 430, 200, 50, 4); 

  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("INICIAR JOGO", width / 2, 430);
  textStyle(NORMAL);
}

// Parâmetro atualizarLógica permite desenhar o jogo congelado durante as pausas
function desenharEcraJogo(atualizarLogica = true) {
  // Desenho correto do fundo à escala total
  if (imgFundoMar && imgFundoMar.width > 0) {
    imageMode(CORNER);
    image(imgFundoMar, 0, 0, width, height); 
  } else {
    background(135, 206, 235);
    noStroke();
    fill(20, 100, 180, 220);
    rectMode(CORNER);
    rect(0, 300, width, height - 300);
  }

  let nivelAudio = mic ? mic.getLevel() : 0;
  
  if (atualizarLogica) {
    // Verificar Subida de Nível e Pausar o Jogo
    if (pontuacao >= 75 && nivelAtual === 1) {
      nivelAtual = 2;
      ativarPausaNivel("NÍVEL 2 DESBLOQUEADO!", "Novas Espécies no Mar:\n\n🐟 Dourada (+15 pts)\n🐴 Cavalo-Marinho (-15 pts)");
      return; 
    } else if (pontuacao >= 200 && nivelAtual === 2) {
      nivelAtual = 3;
      ativarPausaNivel("NÍVEL 3 DESBLOQUEADO!", "Novas Espécies no Mar:\n\n🐟 Atum (+25 pts)\n🐬 Golfinho (-30 pts)");
      return;
    }

    let fatorAudio = 0;
    if (nivelAudio > limiarMinimo) {
      fatorAudio = map(nivelAudio, limiarMinimo, limiarMaximo, 1, 3.5);
      fatorAudio = constrain(fatorAudio, 1, 3.5);
    }
    barco.atualizar(fatorAudio);

    if (frameCount % 60 === 0) gerarCriatura();
    verificarColisoes();
  }

  barco.desenhar();

  for (let i = criaturas.length - 1; i >= 0; i--) {
    if (atualizarLogica) criaturas[i].atualizar();
    criaturas[i].desenhar();
    if (!criaturas[i].ativa) criaturas.splice(i, 1);
  }

  for (let i = redes.length - 1; i >= 0; i--) {
    if (atualizarLogica) redes[i].atualizar();
    redes[i].desenhar();
    if (!redes[i].ativa) redes.splice(i, 1);
  }

  desenharHUD(nivelAudio);

  if (atualizarLogica) {
    desenharMira();
  }
}

function ativarPausaNivel(titulo, texto) {
  transicaoTitulo = titulo;
  transicaoTexto = texto;
  clearInterval(timerInterval); // Pára o relógio
  estadoAtual = ESTADO_TRANSICAO;
}

function desenharEcraTransicao() {
  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(255, 255, 255, 245);
  stroke(200);
  strokeWeight(2);
  rect(width / 2, height / 2, 450, 250, 12);

  noStroke();
  fill(0, 120, 210);
  textSize(24);
  textStyle(BOLD);
  text(transicaoTitulo, width / 2, height / 2 - 70);

  fill(50);
  textSize(16);
  textStyle(NORMAL);
  text(transicaoTexto, width / 2, height / 2 - 10);

  let hoverBtn = mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
                 mouseY > (height / 2 + 70) - 25 && mouseY < (height / 2 + 70) + 25;
  
  if (hoverBtn) {
    fill(0, 150, 230);
    cursor(HAND);
  } else {
    fill(0, 120, 210);
  }

  rectMode(CENTER);
  rect(width / 2, height / 2 + 70, 200, 50, 6);

  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("CONTINUAR", width / 2, height / 2 + 70);
  textStyle(NORMAL);
}

function desenharMira() {
  noCursor(); // Esconde o rato
  let podeDisparar = (millis() - ultimoDisparo) > tempoRecarga;
  
  push();
  translate(mouseX, mouseY);
  strokeWeight(2.5);
  
  if (podeDisparar) {
    stroke(0, 255, 0); // Verde - Pronto
  } else {
    stroke(255, 0, 0); // Vermelho - A recarregar
    
    // Pequeno arco à volta da mira para mostrar o tempo de recarga
    noFill();
    let progresso = constrain((millis() - ultimoDisparo) / tempoRecarga, 0, 1);
    arc(0, 0, 30, 30, -HALF_PI, -HALF_PI + (TWO_PI * progresso));
  }

  // Desenho da cruz da mira
  line(-12, 0, -4, 0);
  line(12, 0, 4, 0);
  line(0, -12, 0, -4);
  line(0, 12, 0, 4);
  
  // Ponto central
  strokeWeight(4);
  point(0, 0);
  pop();
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
          pontuacao += c.pontos;
          vidas -= 1;
          
          if (vidas <= 0) finalizarJogo();
        }
      }
    }
  }
}

function gerarCriatura() {
  // Peixes nascem na zona mais profunda da água (y: 340 a 550)
  let ySorteado = random(340, 550);
  let tipoSorteado;

  if (nivelAtual === 1) {
    if (random() < 0.75) tipoSorteado = 'sardinha';
    else tipoSorteado = 'tartaruga';
  } else if (nivelAtual === 2) {
    if (random() < 0.70) tipoSorteado = random(['sardinha', 'dourada']);
    else tipoSorteado = random(['tartaruga', 'cavalo_marinho']);
  } else {
    if (random() < 0.65) tipoSorteado = random(['sardinha', 'dourada', 'atum']);
    else tipoSorteado = random(['tartaruga', 'cavalo_marinho', 'golfinho']);
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
  
  fill(255, 215, 0); 
  textStyle(BOLD);
  text(`Nível ${nivelAtual}`, 20, 20);

  fill(255);
  text(`Tempo:`, 95, 20);
  textStyle(NORMAL);
  text(`${tempoRestante}s`, 160, 20);

  textStyle(BOLD);
  text(`Pontos:`, 220, 20);
  textStyle(NORMAL);
  text(`${pontuacao}`, 285, 20);

  textStyle(BOLD);
  text(`Vidas:`, 350, 20);
  fill(255, 80, 80); 
  text(`${"♥ ".repeat(vidas)}`, 405, 18);

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
  } 
  else if (estadoAtual === ESTADO_JOGO) {
    // Só permite disparar na água (Y > 300) e se o tempo de recarga tiver passado
    if (mouseY > 300) {
      if (millis() - ultimoDisparo > tempoRecarga) {
        let ptCanhao = barco.getPosicaoCanhao();
        redes.push(new Rede(ptCanhao.x, ptCanhao.y, mouseX, mouseY, imgRede));
        ultimoDisparo = millis(); // Regista a hora do disparo
      }
    }
  }
  else if (estadoAtual === ESTADO_TRANSICAO) {
    // Clique no botão Continuar
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > (height / 2 + 70) - 25 && mouseY < (height / 2 + 70) + 25) {
      
      estadoAtual = ESTADO_JOGO; // Retoma o jogo
      
      // Retoma o relógio
      timerInterval = setInterval(() => {
        if (estadoAtual === ESTADO_JOGO) {
          tempoRestante--;
          if (tempoRestante <= 0) finalizarJogo();
        }
      }, 1000);
    }
  }
  else if (estadoAtual === ESTADO_FIM) {
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
  nivelAtual = 1;
  redes = [];
  criaturas = [];
  estadoAtual = ESTADO_JOGO;
  ultimoDisparo = millis();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (estadoAtual === ESTADO_JOGO) {
      tempoRestante--;
      if (tempoRestante <= 0) finalizarJogo();
    }
  }, 1000);
}

function finalizarJogo() {
  clearInterval(timerInterval);
  estadoAtual = ESTADO_FIM;
}