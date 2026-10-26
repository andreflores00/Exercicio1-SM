const ESTADO_INICIO = 0;
const ESTADO_JOGO = 1;
const ESTADO_FIM = 2;
const ESTADO_TRANSICAO = 3; 
const ESTADO_CALIBRACAO = 4;
const LINHA_AGUA = 185;
const DURACAO_CALIBRACAO = 3000;
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
    explicacao: [
      'PODE APANHAR',
      'Sardinha: +10 pontos',
      '',
      'EVITA APANHAR',
      'Tartaruga: −20 pontos e 1 vida'
    ],
    objetivo: 'Chega aos 75 pontos para avançar.'
  },
  {
    titulo: 'Nível 2 · Investigação',
    pontos: '75–199 pontos',
    explicacao: [
      'PODE APANHAR',
      'Sardinha: +10 · Dourada: +15',
      '',
      'EVITA APANHAR',
      'Tartaruga: −20 · Cavalo-marinho: −15',
      'Cada captura protegida tira 1 vida.'
    ],
    objetivo: 'Chega aos 200 pontos para avançar.'
  },
  {
    titulo: 'Nível 3 · Conservação',
    pontos: '200 ou mais pontos',
    explicacao: [
      'PODE APANHAR',
      'Sardinha: +10 · Dourada: +15',
      'Atum: +25 pontos',
      '',
      'ESPÉCIES PROTEGIDAS',
      'Tartaruga: −20 · Cavalo-marinho: −15',
      'Golfinho: −30 pontos',
      'Cada captura protegida tira 1 vida.'
    ],
    objetivo: 'Evita capturas acidentais e faz a melhor pontuação.'
  }
];

let estadoAtual = ESTADO_INICIO;
let paginaInicio = 'inicio';
let barcoSelecionado = 'padrao';
let barcosDesbloqueados = ['padrao'];
let mensagemFrota = '';
let mensagemDesbloqueio = '';
let mostrarDesbloqueioAte = 0;
let mostrarBonusTempoAte = 0;

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
let sons = {};
let somAmbiente;

let transicaoTitulo = "";
let transicaoTexto = "";

let mic;
let limiarMinimo = 0.035; 
let limiarMaximo = 0.30;  
let sensibilidadeMicrofone = 1;
let arrastandoSensibilidade = false;
let calibracaoIniciada = null;
let calibracaoSoma = 0;
let calibracaoAmostras = 0;
let calibracaoErro = '';

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

  const ficheirosSom = {
    ambiente: { caminho: 'audio/ambiente_mar.wav', volume: 0.08 },
    calibracao: { caminho: 'audio/calibracao_concluida.wav', volume: 0.3 },
    clique: { caminho: 'audio/clique_botao.wav', volume: 0.25 },
    rede: { caminho: 'audio/lancar_rede.wav', volume: 0.3 },
    capturaCorreta: { caminho: 'audio/captura_correta.wav', volume: 0.35 },
    capturaAcidental: { caminho: 'audio/captura_acidental.wav', volume: 0.35 },
    nivelNovo: { caminho: 'audio/nivel_novo.wav', volume: 0.35 },
    desbloqueio: { caminho: 'audio/desbloqueio_barco.wav', volume: 0.35 },
    fimJogo: { caminho: 'audio/fim_jogo.wav', volume: 0.35 }
  };

  for (const [nome, ficheiro] of Object.entries(ficheirosSom)) {
    sons[nome] = loadSound(ficheiro.caminho, () => {
      sons[nome].setVolume(ficheiro.volume);
    }, erro => {
      console.error(`Não foi possível carregar o som: ${ficheiro.caminho}`, erro);
    });
  }
  somAmbiente = sons.ambiente;
}

function reproduzirSom(nome) {
  const som = sons[nome];
  if (som && som.isLoaded()) {
    userStartAudio();
    som.play();
  }
}

function iniciarSomAmbiente() {
  if (somAmbiente && somAmbiente.isLoaded() && !somAmbiente.isPlaying()) {
    somAmbiente.loop();
  }
}

function pararSomAmbiente() {
  if (somAmbiente && somAmbiente.isLoaded() && somAmbiente.isPlaying()) {
    somAmbiente.stop();
  }
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
    case ESTADO_CALIBRACAO:
      desenharEcraCalibracao();
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

  if (paginaInicio === 'inicio') {
    desenharEcraPrincipal();
    return;
  }

  noStroke();
  fill(8, 35, 55, 65);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(248, 253, 255, 190);
  rect(width / 2, height / 2, 760, 550, 18);

  fill(14, 65, 85);
  textAlign(CENTER, CENTER);
  textSize(26);
  textStyle(BOLD);
  text('GUIA DO JOGO', width / 2, 56);
  fill(60, 100, 115);
  textSize(13);
  textStyle(NORMAL);
  desenharBotao(100, 58, 110, 34, 'VOLTAR');
  desenharBotao(310, 112, 170, 38, 'NÍVEIS', paginaInicio === 'niveis');
  desenharBotao(490, 112, 170, 38, 'FROTA', paginaInicio === 'barcos');

  if (paginaInicio === 'niveis') {
    desenharPaginaNiveis();
  } else {
    desenharPaginaFrota();
  }

  desenharBotao(width / 2, 535, 250, 48, 'INICIAR JOGO', true);
}

function desenharEcraPrincipal() {
  fill(14, 65, 85);
  textAlign(CENTER, CENTER);
  textSize(31);
  textStyle(BOLD);
  text('PESCA SUSTENTÁVEL', width / 2, 135);
  fill(60, 100, 115);
  textSize(15);
  textStyle(NORMAL);
  text('Protege o oceano e evita capturas acidentais.', width / 2, 170);

  const imagemBarco = imgsBarcos[barcoSelecionado];
  if (imagemBarco && imagemBarco.width > 0) {
    imageMode(CENTER);
    image(imagemBarco, width / 2, 300, 240, 160);
  }

  fill(25, 85, 100);
  textSize(14);
  text(`Barco selecionado: ${BARCOS.find(barcoConfig => barcoConfig.id === barcoSelecionado).nome}`, width / 2, 400);
  desenharSensibilidadeInicio();
  desenharBotao(width / 2, 455, 250, 52, 'INICIAR JOGO', true);
  desenharBotao(width / 2, 520, 290, 42, 'NÍVEIS E FROTA');
  textStyle(NORMAL);
}

function desenharSensibilidadeInicio() {
  rectMode(CENTER);
  noStroke();
  fill(248, 253, 255, 225);
  rect(640, 314, 190, 100, 12);

  fill(14, 65, 85);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(12);
  text('SENSIBILIDADE DO MICROFONE', 640, 286);
  textStyle(NORMAL);
  textSize(13);
  text(`${sensibilidadeMicrofone.toFixed(1)}x`, 640, 310);
  desenharBarraSensibilidade(590, 335, 100);

  fill(65, 95, 105);
  textSize(10);
  text('Menor = acelera menos', 640, 356);
  textStyle(NORMAL);
}

function desenharBarraSensibilidade(x, y, largura) {
  rectMode(CORNER);
  noStroke();
  fill(50);
  rect(x, y, largura, 6, 3);
  fill(0, 160, 185);
  rect(x, y, largura * (sensibilidadeMicrofone - 0.5) / 2, 6, 3);
  fill(255);
  stroke(0, 100, 120);
  strokeWeight(1);
  circle(map(sensibilidadeMicrofone, 0.5, 2.5, x, x + largura), y + 3, 12);
  noStroke();
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
    textAlign(CENTER, CENTER);
    textSize(10);
    let textoY = y - 43;
    nivel.explicacao.forEach((linha, indiceLinha) => {
      if (!linha) {
        textoY += 8;
        return;
      }

      const eTitulo = indiceLinha === 0 || linha === 'EVITA APANHAR' || linha === 'ESPÉCIES PROTEGIDAS';
      fill(eTitulo ? color(0, 120, 135) : color(35, 70, 80));
      textStyle(eTitulo ? BOLD : NORMAL);
      text(linha, x, textoY);
      textoY += 18;
    });

    fill(0, 115, 135);
    textStyle(BOLD);
    textSize(11);
    text(nivel.objetivo, x, y + 100, 205, 34);
    textStyle(NORMAL);
  });
  fill(55, 85, 95);
  textSize(11);
  text('Rato: direção · Fala: acelerar · Clica na água para lançar a rede.', width / 2, 466);
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
  reproduzirSom('desbloqueio');
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

    const centroBarco = barco.x + barco.largura / 2;
    if (mouseX !== centroBarco) {
      barco.definirDirecao(mouseX > centroBarco ? 1 : -1);
    }

    const limiarAtivacao = limiarMinimo / sensibilidadeMicrofone;
    const limiarIntensidade = limiarMaximo / sensibilidadeMicrofone;
    let fatorAudio = 0;
    if (nivelAudio > limiarAtivacao) {
      fatorAudio = map(nivelAudio, limiarAtivacao, limiarIntensidade, 1, 3.5);
      fatorAudio = 1 + (constrain(fatorAudio, 1, 3.5) - 1) * sensibilidadeMicrofone;
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

function desenharEcraCalibracao() {
  if (imgFundoMar && imgFundoMar.width > 0) {
    imageMode(CORNER);
    image(imgFundoMar, 0, 0, width, height);
  } else {
    background(135, 206, 235);
  }

  noStroke();
  fill(248, 253, 255, 235);
  rectMode(CENTER);
  rect(width / 2, height / 2, 540, 250, 18);
  textAlign(CENTER, CENTER);

  if (calibracaoErro) {
    fill(14, 65, 85);
    textSize(24);
    textStyle(BOLD);
    text('NÃO FOI POSSÍVEL ACEDER AO MICROFONE', width / 2, 250, 480, 60);
    fill(55, 85, 95);
    textSize(15);
    textStyle(NORMAL);
    text(calibracaoErro, width / 2, 320, 440, 55);
    desenharBotao(width / 2, 390, 190, 46, 'VOLTAR');
    return;
  }

  fill(14, 65, 85);
  textSize(26);
  textStyle(BOLD);
  text('A CALIBRAR O MICROFONE...', width / 2, 250);
  fill(55, 85, 95);
  textSize(15);
  textStyle(NORMAL);

  if (calibracaoIniciada === null) {
    text('A aguardar acesso ao microfone. Permite a utilização quando solicitado.', width / 2, 300, 460, 50);
    return;
  }

  const tempoDecorrido = millis() - calibracaoIniciada;
  const progresso = constrain(tempoDecorrido / DURACAO_CALIBRACAO, 0, 1);
  calibracaoSoma += mic.getLevel();
  calibracaoAmostras++;

  text('Mantém silêncio para medir o ruído ambiente.', width / 2, 300);
  rectMode(CORNER);
  fill(205, 225, 230);
  rect(width / 2 - 180, 345, 360, 14, 7);
  fill(0, 135, 155);
  rect(width / 2 - 180, 345, 360 * progresso, 14, 7);
  text(`${Math.max(0, Math.ceil((DURACAO_CALIBRACAO - tempoDecorrido) / 1000))}s`, width / 2, 380);

  if (tempoDecorrido >= DURACAO_CALIBRACAO) {
    const ruidoMedio = calibracaoSoma / calibracaoAmostras;
    limiarMinimo = Math.max(0.015, ruidoMedio * 2 + 0.01);
    limiarMaximo = Math.max(limiarMinimo + 0.08, ruidoMedio * 6 + 0.04);
    calibracaoIniciada = null;
    estadoAtual = ESTADO_JOGO;
    reproduzirSom('calibracao');
    iniciarSomAmbiente();
    iniciarCronometro();
  }
}

function ativarPausaNivel() {
  transicaoTitulo = `NÍVEL ${nivelAtual} · ${NIVEIS[nivelAtual - 1].titulo.split('· ')[1]}`;
  transicaoTexto = NIVEIS[nivelAtual - 1].explicacao.filter(Boolean).join('\n');
  clearInterval(timerInterval); 
  estadoAtual = ESTADO_TRANSICAO;
  reproduzirSom('nivelNovo');
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
  rect(width / 2, 348, 440, 128, 12);
  fill(25, 65, 75);
  textSize(14);
  textStyle(NORMAL);
  text('Novas espécies e pontuação:', width / 2, 273);
  fill(30, 75, 85);
  textSize(13);
  textLeading(19);
  text(transicaoTexto, width / 2, 350, 420, 112);
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
          reproduzirSom('capturaCorreta');
          tempoRestante += 10;
          mostrarBonusTempoAte = millis() + 1500;
          pontuacao += c.pontos;
          atualizarDesbloqueios();
        } else if (c.categoria === 'protegida') {
          reproduzirSom('capturaAcidental');
          pontuacao += c.pontos;
          atualizarDesbloqueios();
          vidas -= 1;
          
          if (vidas <= 0) finalizarJogo();
        }
        break;
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
  rect(width - 150, 50, 130, 100, 4);
  
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Volume (Voz)", width - 85, 65);

  fill(50);
  rect(width - 140, 78, 110, 10, 2);
  
  const nivelAudioSensivel = nivelAudio * sensibilidadeMicrofone;
  let corR = map(nivelAudioSensivel, limiarMinimo, limiarMaximo, 0, 255);
  let corG = map(nivelAudioSensivel, limiarMinimo, limiarMaximo, 255, 100);
  fill(corR, corG, 0); 
  
  let barraLargura = map(nivelAudioSensivel, 0, limiarMaximo, 0, 110);
  barraLargura = constrain(barraLargura, 0, 110);
  rect(width - 140, 78, barraLargura, 10, 2);

  stroke(255);
  strokeWeight(2);
  const limiarAtivacao = limiarMinimo / sensibilidadeMicrofone;
  const limiarIntensidade = limiarMaximo / sensibilidadeMicrofone;
  let xLimiar = map(limiarAtivacao, 0, limiarIntensidade, 0, 110);
  line(width - 140 + xLimiar, 76, width - 140 + xLimiar, 90);
  noStroke();

  fill(255);
  textSize(10);
  textAlign(CENTER, CENTER);
  text(`Sensibilidade: ${sensibilidadeMicrofone.toFixed(1)}x`, width - 85, 105);
  desenharBarraSensibilidade(width - 140, 120, 110);

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

  if (millis() < mostrarBonusTempoAte) {
    rectMode(CENTER);
    fill(15, 100, 85, 225);
    rect(width / 2, 108, 150, 34, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14);
    text('+10 SEGUNDOS', width / 2, 108);
  }
  
  textAlign(CENTER, CENTER); 
}

function desenharRodapeTema() {
  fill(50);
  noStroke();
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text("Sustainable Fishing and Bycatch Reduction", 15, height - 15);
  
  // Adiciona o teu número de aluno aqui!
  textAlign(RIGHT, BOTTOM);
  text("André Flores, 33117, ECGM", width - 15, height - 15); 
  
  textAlign(CENTER, CENTER);
}

function mousePressed() {
  if (estadoAtual === ESTADO_INICIO) {
    if (paginaInicio === 'inicio') {
      if (mouseX >= 585 && mouseX <= 695 && mouseY >= 329 && mouseY <= 347) {
        arrastandoSensibilidade = true;
        atualizarSensibilidade(mouseX, 590, 100);
      } else if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 &&
          mouseY > 429 && mouseY < 481) {
        reproduzirSom('clique');
        iniciarJogo();
      } else if (mouseX > width / 2 - 145 && mouseX < width / 2 + 145 &&
          mouseY > 499 && mouseY < 541) {
        reproduzirSom('clique');
        paginaInicio = 'niveis';
      }
      return;
    }

    if (mouseX > 45 && mouseX < 155 && mouseY > 41 && mouseY < 75) {
      reproduzirSom('clique');
      paginaInicio = 'inicio';
      return;
    }
    if (mouseY > 93 && mouseY < 131 && mouseX > 225 && mouseX < 395) {
      reproduzirSom('clique');
      paginaInicio = 'niveis';
      return;
    }
    if (mouseY > 93 && mouseY < 131 && mouseX > 405 && mouseX < 575) {
      reproduzirSom('clique');
      paginaInicio = 'barcos';
      return;
    }
    if (paginaInicio === 'barcos') {
      const indiceColuna = mouseX > 35 && mouseX < 385 ? 0 :
        (mouseX > 415 && mouseX < 765 ? 1 : -1);
      const indiceLinha = mouseY > 196 && mouseY < 304 ? 0 :
        (mouseY > 326 && mouseY < 434 ? 1 : -1);
      if (indiceColuna !== -1 && indiceLinha !== -1) {
        reproduzirSom('clique');
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
      reproduzirSom('clique');
      iniciarJogo();
    }
  } 
  else if (estadoAtual === ESTADO_JOGO) {
    if (mouseX >= width - 145 && mouseX <= width - 25 &&
        mouseY >= 112 && mouseY <= 138) {
      arrastandoSensibilidade = true;
      atualizarSensibilidade(mouseX, width - 140, 110);
      return;
    }

    if (mouseY > LINHA_AGUA) {
      if (millis() - ultimoDisparo > tempoRecarga) {
        let ptCanhao = barco.getPosicaoCanhao();
        redes.push(new Rede(ptCanhao.x, ptCanhao.y, mouseX, mouseY, imgRede));
        ultimoDisparo = millis(); 
        reproduzirSom('rede');
      }
    }
  }
  else if (estadoAtual === ESTADO_CALIBRACAO && calibracaoErro) {
    if (mouseX > width / 2 - 95 && mouseX < width / 2 + 95 &&
        mouseY > 367 && mouseY < 413) {
      reproduzirSom('clique');
      estadoAtual = ESTADO_INICIO;
      calibracaoErro = '';
    }
  }
  else if (estadoAtual === ESTADO_TRANSICAO) {
    if (mouseX > width / 2 - 105 && mouseX < width / 2 + 105 &&
        mouseY > 442 && mouseY < 490) {
      reproduzirSom('clique');
      
      estadoAtual = ESTADO_JOGO; 
      iniciarCronometro();
    }
  }
  else if (estadoAtual === ESTADO_FIM) {
    if (mouseX > width / 2 - 225 && mouseX < width / 2 - 25 &&
        mouseY > 352 && mouseY < 398) {
      reproduzirSom('clique');
      iniciarJogo();
    } else if (mouseX > width / 2 + 25 && mouseX < width / 2 + 225 &&
        mouseY > 352 && mouseY < 398) {
      reproduzirSom('clique');
      estadoAtual = ESTADO_INICIO;
      paginaInicio = 'inicio';
      mensagemFrota = '';
    }
  }
}

function mouseDragged() {
  if (arrastandoSensibilidade && estadoAtual === ESTADO_JOGO) {
    atualizarSensibilidade(mouseX, width - 140, 110);
  } else if (arrastandoSensibilidade && estadoAtual === ESTADO_INICIO &&
      paginaInicio === 'inicio') {
    atualizarSensibilidade(mouseX, 590, 100);
  }
}

function mouseReleased() {
  arrastandoSensibilidade = false;
}

function atualizarSensibilidade(posicaoX, inicio, largura) {
  sensibilidadeMicrofone = map(
    constrain(posicaoX, inicio, inicio + largura),
    inicio,
    inicio + largura,
    0.5,
    2.5
  );
}

function iniciarJogo() {
  userStartAudio();
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (!mic) {
    mic = new p5.AudioIn();
  }

  if (timerInterval) clearInterval(timerInterval);
  pararSomAmbiente();
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
  calibracaoIniciada = null;
  calibracaoSoma = 0;
  calibracaoAmostras = 0;
  calibracaoErro = '';
  estadoAtual = ESTADO_CALIBRACAO;
  ultimoDisparo = millis();

  try {
    mic.start(() => {
      calibracaoIniciada = millis();
    }, erro => {
      console.error('Não foi possível calibrar o microfone.', erro);
      calibracaoErro = 'Verifica a permissão de acesso e tenta novamente.';
    });
  } catch (erro) {
    console.error('Não foi possível iniciar o microfone.', erro);
    calibracaoErro = 'Verifica a permissão de acesso e tenta novamente.';
  }
}

function iniciarCronometro() {
  timerInterval = setInterval(() => {
    if (estadoAtual === ESTADO_JOGO) {
      tempoRestante--;
      if (tempoRestante <= 0) finalizarJogo();
    }
  }, 1000);
}

function finalizarJogo() {
  if (estadoAtual === ESTADO_FIM) return;
  atualizarDesbloqueios();
  clearInterval(timerInterval);
  pararSomAmbiente();
  reproduzirSom('fimJogo');
  estadoAtual = ESTADO_FIM;
}