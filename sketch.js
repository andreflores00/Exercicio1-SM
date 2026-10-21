const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;
const ESTADO_TRANSICAO = 3; 
const LINHA_AGUA = 185;
const CHAVE_PROGRESSO = 'ecoMarProgresso';
const BARCOS = [
  {
    id: 'padrao',
    nome: 'Barco de Pesca',
    imagem: 'barco.png',
    objetivo: 'Disponível desde o início.',
    pontos: 0
  },
  {
    id: 'investigacao',
    nome: 'Barco de Investigação',
    imagem: 'barco_investigacao.png',
    objetivo: 'Atinge 75 pontos numa partida.',
    pontos: 75
  },
  {
    id: 'limpeza',
    nome: 'Barco de Limpeza',
    imagem: 'barco_limpeza.png',
    objetivo: 'Atinge 200 pontos numa partida.',
    pontos: 200
  },
  {
    id: 'cerco',
    nome: 'Traineira de Cerco',
    imagem: 'barco_traineira_cerco.png',
    objetivo: 'Atinge 350 pontos numa partida.',
    pontos: 350
  }
];
const NIVEIS = [
  {
    titulo: 'Nível 1 · Exploração',
    pontos: '0–74 pontos',
    especies: 'Sardinha: +10 pontos\nTartaruga: −20 e perde 1 vida',
    objetivo: 'Chega aos 75 pontos para avançar.'
  },
  {
    titulo: 'Nível 2 · Investigação',
    pontos: '75–199 pontos',
    especies: 'Sardinha: +10 · Dourada: +15\nTartaruga: −20 · Cavalo-marinho: −15',
    objetivo: 'Chega aos 200 pontos para avançar.'
  },
  {
    titulo: 'Nível 3 · Conservação',
    pontos: '200 ou mais pontos',
    especies: 'Sardinha: +10 · Dourada: +15 · Atum: +25\nEspécies protegidas: pontos negativos e −1 vida',
    objetivo: 'Evita capturas acidentais e faz a melhor pontuação.'
  }
];

let estadoAtual = ESTADO_INICIO;
let paginaInicio = 'barcos';
let barcoSelecionado = 'padrao';
let barcosDesbloqueados = ['padrao'];
let mensagemFrota = '';
let mensagemDesbloqueio = '';
let mostrarDesbloqueioAte = 0;

let pontuacao = 0;
let vidas = 3;
let tempoRestante = 60;
let timerInterval = null;
let nivelAtual = 1;

let barco;
let redes = [];
let criaturas = [];

let ultimoDisparo = 0;
let tempoRecarga = 800; 

let imgBarco, imgRede, imgFundoMar;
let imgsBarcos = {};
let imgsCriaturas = {};

let transicaoTitulo = "";
let transicaoTexto = "";

let mic;
let limiarMinimo = 0.035; 
let limiarMaximo = 0.30;  

function carregarImagemOpcional(caminho) {
  return loadImage(caminho, undefined, erro => {
    console.warn(`Imagem indisponível: ${caminho}. Será usada a alternativa.`, erro);
  });
}

function preload() {
  for (const barcoConfig of BARCOS) {
    imgsBarcos[barcoConfig.id] = carregarImagemOpcional(`sprites/${barcoConfig.imagem}`);
  }
  imgBarco = imgsBarcos.padrao;
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
  carregarProgresso();
  imgBarco = imgsBarcos[barcoSelecionado];
  barco = new Barco(100, 145, 'padrao', imgBarco);
}

function draw() {
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
      desenharEcraJogo(false); 
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
  if (imgFundoMar && imgFundoMar.width > 0) {
    imageMode(CORNER);
    image(imgFundoMar, 0, 0, width, height);
  } else {
    background(135, 206, 235);
  }

  noStroke();
  fill(8, 35, 55, 125);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(248, 253, 255, 247);
  rect(width / 2, height / 2, 760, 550, 18);

  fill(14, 65, 85);
  textAlign(CENTER, CENTER);
  textSize(29);
  textStyle(BOLD);
  text('PESCA SUSTENTÁVEL', width / 2, 66);
  fill(60, 100, 115);
  textSize(13);
  textStyle(NORMAL);
  text('Protege o oceano. Aprende. Desbloqueia novos barcos.', width / 2, 94);

  desenharBotao(310, 137, 170, 38, 'FROTA', paginaInicio === 'barcos');
  desenharBotao(490, 137, 170, 38, 'NÍVEIS', paginaInicio === 'niveis');

  if (paginaInicio === 'barcos') {
    desenharPaginaFrota();
  } else {
    desenharPaginaNiveis();
  }

  desenharBotao(width / 2, 535, 250, 48, 'INICIAR JOGO', true);
  fill(60, 100, 115);
  textSize(11);
  text('A / D ou setas: direção · Fala: acelerar · Clique na água: lançar rede', width / 2, 574);
  textStyle(NORMAL);
}

function desenharPaginaFrota() {
  const posicoes = [
    { x: 210, y: 250 },
    { x: 590, y: 250 },
    { x: 210, y: 380 },
    { x: 590, y: 380 }
  ];

  BARCOS.forEach((barcoConfig, indice) => {
    const { x, y } = posicoes[indice];
    const desbloqueado = barcosDesbloqueados.includes(barcoConfig.id);
    const selecionado = barcoSelecionado === barcoConfig.id;
    const hover = mouseX > x - 175 && mouseX < x + 175 &&
      mouseY > y - 54 && mouseY < y + 54;

    rectMode(CENTER);
    stroke(selecionado ? color(0, 135, 160) : color(205, 222, 228));
    strokeWeight(selecionado ? 3 : 1);
    fill(selecionado ? color(225, 247, 247) : color(255));
    rect(x, y, 350, 108, 12);
    noStroke();

    const imagem = imgsBarcos[barcoConfig.id];
    if (imagem && imagem.width > 0) {
      imageMode(CENTER);
      if (!desbloqueado) tint(130, 150);
      image(imagem, x - 112, y, 105, 70);
      noTint();
    }

    textAlign(LEFT, CENTER);
    fill(20, 65, 80);
    textStyle(BOLD);
    textSize(14);
    text(barcoConfig.nome, x - 55, y - 28);
    fill(desbloqueado ? color(25, 125, 95) : color(115, 105, 75));
    textSize(11);
    textStyle(BOLD);
    text(desbloqueado ? (selecionado ? 'SELECIONADO' : 'DESBLOQUEADO') : 'BLOQUEADO', x - 55, y - 7);
    fill(70, 90, 100);
    textStyle(NORMAL);
    textSize(10);
    text(barcoConfig.objetivo, x - 55, y + 18);
    textAlign(CENTER, CENTER);

    if (hover) cursor(HAND);
  });

  fill(50, 85, 100);
  textSize(12);
  text(mensagemFrota || 'Desbloqueia barcos ao atingir objetivos de pontuação.', width / 2, 464);
}

function desenharPaginaNiveis() {
  const centros = [145, 400, 655];
  NIVEIS.forEach((nivel, indice) => {
    const x = centros[indice];
    const y = 305;
    rectMode(CENTER);
    stroke(190, 215, 222);
    strokeWeight(1);
    fill(255);
    rect(x, y, 230, 268, 12);
    noStroke();

    fill(0, 120, 145);
    textStyle(BOLD);
    textSize(16);
    text(nivel.titulo, x, y - 103);
    fill(80, 105, 115);
    textSize(12);
    textStyle(NORMAL);
    text(nivel.pontos, x, y - 76);
    stroke(220, 232, 235);
    line(x - 88, y - 58, x + 88, y - 58);
    noStroke();
    fill(35, 70, 80);
    textSize(12);
    text(nivel.especies, x, y - 15, 205, 82);
    fill(0, 115, 135);
    textStyle(BOLD);
    textSize(11);
    text(nivel.objetivo, x, y + 88, 205, 42);
    textStyle(NORMAL);
  });
}

function desenharBotao(x, y, largura, altura, rotulo, ativo = false) {
  const hover = mouseX > x - largura / 2 && mouseX < x + largura / 2 &&
    mouseY > y - altura / 2 && mouseY < y + altura / 2;
  rectMode(CENTER);
  noStroke();
  fill(hover ? color(0, 145, 165) : (ativo ? color(0, 120, 145) : color(50, 105, 120)));
  rect(x, y, largura, altura, 9);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  text(rotulo, x, y);
  textStyle(NORMAL);
  if (hover) cursor(HAND);
}

function carregarProgresso() {
  try {
    const dados = localStorage.getItem(CHAVE_PROGRESSO);
    if (!dados) return;

    const progresso = JSON.parse(dados);
    if (!progresso || !Array.isArray(progresso.barcosDesbloqueados)) {
      throw new Error('Formato de progresso inválido.');
    }

    barcosDesbloqueados = [...new Set(['padrao', ...progresso.barcosDesbloqueados])]
      .filter(id => BARCOS.some(barcoConfig => barcoConfig.id === id));
    if (BARCOS.some(barcoConfig => barcoConfig.id === progresso.barcoSelecionado &&
      barcosDesbloqueados.includes(barcoConfig.id))) {
      barcoSelecionado = progresso.barcoSelecionado;
    }
  } catch (erro) {
    console.warn('Não foi possível carregar o progresso dos barcos.', erro);
  }
}

function guardarProgresso() {
  try {
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify({
      barcosDesbloqueados,
      barcoSelecionado
    }));
  } catch (erro) {
    console.warn('Não foi possível guardar o progresso dos barcos.', erro);
  }
}

function atualizarDesbloqueios() {
  const novosBarcos = BARCOS.filter(barcoConfig =>
    barcoConfig.pontos > 0 &&
    pontuacao >= barcoConfig.pontos &&
    !barcosDesbloqueados.includes(barcoConfig.id)
  );

  if (novosBarcos.length === 0) return;

  barcosDesbloqueados.push(...novosBarcos.map(barcoConfig => barcoConfig.id));
  guardarProgresso();
  mensagemDesbloqueio = novosBarcos.map(barcoConfig => barcoConfig.nome).join(', ') + ' desbloqueado!';
  mostrarDesbloqueioAte = millis() + 4000;
}

function desenharEcraJogo(atualizarLogica = true) {
  if (imgFundoMar && imgFundoMar.width > 0) {
    imageMode(CORNER);
    image(imgFundoMar, 0, 35, width, height);
  } else {
    background(135, 206, 235);
    noStroke();
    fill(20, 100, 180, 220);
    rectMode(CORNER);
    rect(0, LINHA_AGUA, width, height - LINHA_AGUA);
  }

  let nivelAudio = mic ? mic.getLevel() : 0;
  
  if (atualizarLogica) {
    if (pontuacao >= 75 && nivelAtual === 1) {
      nivelAtual = 2;
      vidas = 3; 
      ativarPausaNivel();
      return; 
    } else if (pontuacao >= 200 && nivelAtual === 2) {
      nivelAtual = 3;
      vidas = 3; 
      ativarPausaNivel();
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

function ativarPausaNivel() {
  transicaoTitulo = `NÍVEL ${nivelAtual} · ${NIVEIS[nivelAtual - 1].titulo.split('· ')[1]}`;
  transicaoTexto = NIVEIS[nivelAtual - 1].especies;
  clearInterval(timerInterval); 
  estadoAtual = ESTADO_TRANSICAO;
}

function desenharEcraTransicao() {
  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(248, 253, 255, 250);
  noStroke();
  rect(width / 2, height / 2, 520, 370, 18);

  fill(0, 125, 145);
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(BOLD);
  text('NÍVEL DESBLOQUEADO', width / 2, 165);
  fill(15, 55, 70);
  textSize(27);
  text(transicaoTitulo, width / 2, 205);
  fill(90, 115, 125);
  textSize(13);
  text(NIVEIS[nivelAtual - 1].pontos, width / 2, 237);

  rectMode(CENTER);
  fill(230, 245, 247);
  rect(width / 2, 330, 440, 115, 12);
  fill(25, 65, 75);
  textSize(14);
  textStyle(NORMAL);
  text('Novas espécies e pontuação:', width / 2, 294);
  fill(30, 75, 85);
  textSize(13);
  text(transicaoTexto, width / 2, 337, 420, 80);
  noStroke();
  fill(30, 125, 95);
  textSize(12);
  text('As tuas vidas foram restauradas.', width / 2, 410);
  desenharBotao(width / 2, 466, 210, 48, 'CONTINUAR', true);
}

function desenharMira() {
  noCursor(); 
  let podeDisparar = (millis() - ultimoDisparo) > tempoRecarga;
  
  push();
  translate(mouseX, mouseY);
  strokeWeight(2.5);
  
  if (podeDisparar) {
    stroke(0, 255, 0); 
  } else {
    stroke(255, 0, 0); 
    
    noFill();
    let progresso = constrain((millis() - ultimoDisparo) / tempoRecarga, 0, 1);
    arc(0, 0, 30, 30, -HALF_PI, -HALF_PI + (TWO_PI * progresso));
  }

  line(-12, 0, -4, 0);
  line(12, 0, 4, 0);
  line(0, -12, 0, -4);
  line(0, 12, 0, 4);
  
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
          atualizarDesbloqueios();
        } else if (c.categoria === 'protegida') {
          pontuacao += c.pontos;
          atualizarDesbloqueios();
          vidas -= 1;
          
          if (vidas <= 0) finalizarJogo();
        }
      }
    }
  }
}

function gerarCriatura() {
  // Peixes nascem mais abaixo (a partir do Y = 280)
  let ySorteado = random(280, 540);
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
  rect(width / 2, height / 2, 470, 350, 16);

  noStroke();
  fill(20);
  textSize(28);
  textStyle(BOLD);
  text("FIM DE JOGO", width / 2, 170);

  fill(80);
  textSize(16);
  textStyle(NORMAL);
  text("Pontuação Final:", width / 2, 220);

  fill(0, 100, 180);
  textSize(36);
  textStyle(BOLD);
  text(pontuacao, width / 2, 260);

  fill(55, 90, 105);
  textSize(13);
  textStyle(NORMAL);
  text('Os barcos que desbloqueaste ficam guardados.', width / 2, 305);
  desenharBotao(width / 2 - 125, 375, 200, 46, 'JOGAR DE NOVO', true);
  desenharBotao(width / 2 + 125, 375, 200, 46, 'VOLTAR À FROTA');
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

  if (millis() < mostrarDesbloqueioAte) {
    rectMode(CENTER);
    fill(15, 100, 85, 225);
    rect(width / 2, 66, 360, 34, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(13);
    text(mensagemDesbloqueio, width / 2, 66);
  }
  
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
    if (mouseY > 118 && mouseY < 156 && mouseX > 225 && mouseX < 395) {
      paginaInicio = 'barcos';
      return;
    }
    if (mouseY > 118 && mouseY < 156 && mouseX > 405 && mouseX < 575) {
      paginaInicio = 'niveis';
      return;
    }
    if (paginaInicio === 'barcos') {
      const indiceColuna = mouseX > 35 && mouseX < 385 ? 0 :
        (mouseX > 415 && mouseX < 765 ? 1 : -1);
      const indiceLinha = mouseY > 196 && mouseY < 304 ? 0 :
        (mouseY > 326 && mouseY < 434 ? 1 : -1);
      if (indiceColuna !== -1 && indiceLinha !== -1) {
        const barcoConfig = BARCOS[indiceLinha * 2 + indiceColuna];
        if (barcosDesbloqueados.includes(barcoConfig.id)) {
          barcoSelecionado = barcoConfig.id;
          imgBarco = imgsBarcos[barcoSelecionado];
          barco.img = imgBarco;
          mensagemFrota = `${barcoConfig.nome} selecionado.`;
          guardarProgresso();
        } else {
          mensagemFrota = `Objetivo: ${barcoConfig.objetivo}`;
        }
        return;
      }
    }
    if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 &&
        mouseY > 511 && mouseY < 559) {
      iniciarJogo();
    }
  } 
  else if (estadoAtual === ESTADO_JOGO) {
    if (mouseY > LINHA_AGUA) {
      if (millis() - ultimoDisparo > tempoRecarga) {
        let ptCanhao = barco.getPosicaoCanhao();
        redes.push(new Rede(ptCanhao.x, ptCanhao.y, mouseX, mouseY, imgRede));
        ultimoDisparo = millis(); 
      }
    }
  }
  else if (estadoAtual === ESTADO_TRANSICAO) {
    if (mouseX > width / 2 - 105 && mouseX < width / 2 + 105 &&
        mouseY > 442 && mouseY < 490) {
      
      estadoAtual = ESTADO_JOGO; 
      
      timerInterval = setInterval(() => {
        if (estadoAtual === ESTADO_JOGO) {
          tempoRestante--;
          if (tempoRestante <= 0) finalizarJogo();
        }
      }, 1000);
    }
  }
  else if (estadoAtual === ESTADO_FIM) {
    if (mouseX > width / 2 - 225 && mouseX < width / 2 - 25 &&
        mouseY > 352 && mouseY < 398) {
      iniciarJogo();
    } else if (mouseX > width / 2 + 25 && mouseX < width / 2 + 225 &&
        mouseY > 352 && mouseY < 398) {
      estadoAtual = ESTADO_INICIO;
      paginaInicio = 'barcos';
      mensagemFrota = '';
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

  barco.img = imgsBarcos[barcoSelecionado];
  barco.x = 100;
  barco.yBase = 145;
  barco.y = 145;
  barco.direcaoAtual = 1;
  barco.particulasAgua = [];
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
  atualizarDesbloqueios();
  clearInterval(timerInterval);
  estadoAtual = ESTADO_FIM;
}