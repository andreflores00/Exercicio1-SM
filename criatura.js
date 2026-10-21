class Criatura {
  constructor(x, y, tipo = 'sardinha', img = null) {
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    this.img = img;
    this.ativa = true;

    this.configurarCriatura();
  }

  configurarCriatura() {
    // 1: Esquerda para Direita | -1: Direita para Esquerda
    this.direcao = random() > 0.5 ? 1 : -1;

    switch (this.tipo) {
      // --- ESPÉCIES COMERCIAIS PERMITIDAS (DÃO PONTOS) ---
      case 'sardinha':
        this.categoria = 'permitida';
        this.velocidade = random(3, 5);
        this.pontos = 10;
        this.largura = 40;
        this.altura = 20;
        break;
      case 'dourada':
        this.categoria = 'permitida';
        this.velocidade = random(2.5, 4);
        this.pontos = 15;
        this.largura = 50;
        this.altura = 28;
        break;
      case 'atum':
        this.categoria = 'permitida';
        this.velocidade = random(4, 5.5);
        this.pontos = 25;
        this.largura = 65;
        this.altura = 32;
        break;

      // --- ESPÉCIES PROTEGIDAS (TIRAM PONTOS E VIDAS) ---
      case 'tartaruga':
        this.categoria = 'protegida';
        this.velocidade = random(1.5, 2.5);
        this.pontos = -20;
        this.largura = 50;
        this.altura = 35;
        break;
      case 'cavalo_marinho':
        this.categoria = 'protegida';
        this.velocidade = random(1, 2);
        this.pontos = -15;
        this.largura = 28;
        this.altura = 42;
        break;
      case 'golfinho':
        this.categoria = 'protegida';
        this.velocidade = random(3.5, 5);
        this.pontos = -30;
        this.largura = 80;
        this.altura = 38;
        break;
    }

    // Posição inicial fora do ecrã
    if (this.x === undefined || this.x === null) {
      this.x = this.direcao === 1 ? -this.largura : width + this.largura;
    }
  }

  atualizar() {
    if (!this.ativa) return;

    this.x += this.velocidade * this.direcao;

    // Desativar se sair completamente do ecrã
    if ((this.direcao === 1 && this.x > width + 60) || 
        (this.direcao === -1 && this.x < -60)) {
      this.ativa = false;
    }
  }

  desenhar() {
    if (!this.ativa) return;

    push();
    translate(this.x, this.y);

    // Inverter a imagem horizontalmente se nadar para a esquerda
    if (this.direcao === -1) {
      scale(-1, 1);
    }

    imageMode(CENTER);
    // Desenha a imagem se ela existir e tiver carregado bem
    if (this.img && this.img.width > 0) {
      image(this.img, 0, 0, this.largura, this.altura);
    } else {
      // Desenho de recurso (fallback) caso a imagem falhe
      if (this.categoria === 'permitida') fill(255, 140, 0); // Laranja
      else fill(34, 139, 34); // Verde
      
      ellipse(0, 0, this.largura, this.altura);
    }
    
    pop();
  }
}