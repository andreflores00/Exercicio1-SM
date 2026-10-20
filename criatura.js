class Criatura {
  constructor(x, y, tipo = 'peixe') {
    this.x = x;
    this.y = y;
    this.tipo = tipo; // 'peixe' ou 'tartaruga'
    this.ativa = true;

    this.configurarCriatura();
  }

  configurarCriatura() {
    // Definir direção aleatória (-1: Direita -> Esquerda, 1: Esquerda -> Direita)
    this.direcao = random() > 0.5 ? 1 : -1;

    if (this.tipo === 'tartaruga') {
      this.velocidade = random(1, 2.5);
      this.pontos = -20; // Penalização ao capturar
      this.largura = 45;
      this.altura = 30;
      this.cor = color(34, 139, 34); // Verde
    } else {
      // 'peixe' (espécie comercial permitida)
      this.velocidade = random(2.5, 4.5);
      this.pontos = 10; // Recompensa
      this.largura = 32;
      this.altura = 18;
      this.cor = color(255, 140, 0); // Laranja
    }

    // Posição inicial fora do ecrã dependendo da direção
    if (this.x === undefined || this.x === null) {
      this.x = this.direcao === 1 ? -30 : width + 30;
    }
  }

  atualizar() {
    if (!this.ativa) return;

    // Movimento horizontal
    this.x += this.velocidade * this.direcao;

    // Desativar quando sair completamente dos limites do ecrã
    if ((this.direcao === 1 && this.x > width + 50) || 
        (this.direcao === -1 && this.x < -50)) {
      this.ativa = false;
    }
  }

  desenhar() {
    if (!this.ativa) return;

    push();
    translate(this.x, this.y);

    // Inverter visualmente se nadar para a esquerda
    if (this.direcao === -1) {
      scale(-1, 1);
    }

    if (this.tipo === 'tartaruga') {
      // Desenho simples de Tartaruga
      fill(this.cor);
      stroke(0);
      strokeWeight(1.5);
      ellipse(0, 0, this.largura, this.altura); // Casco

      fill(50, 160, 50);
      ellipse(18, 0, 14, 10); // Cabeça

      // Patas
      ellipse(-10, -12, 10, 6);
      ellipse(10, -12, 10, 6);
      ellipse(-10, 12, 10, 6);
      ellipse(10, 12, 10, 6);
    } else {
      // Desenho simples de Peixe
      fill(this.cor);
      stroke(0);
      strokeWeight(1.5);
      ellipse(0, 0, this.largura, this.altura); // Corpo

      // Cauda
      triangle(-this.largura / 2, 0, -this.largura / 2 - 10, -8, -this.largura / 2 - 10, 8);

      // Olho
      fill(0);
      ellipse(this.largura / 4, -3, 3, 3);
    }

    pop();
  }
}