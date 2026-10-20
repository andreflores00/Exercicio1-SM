class Rede {
  constructor(x, y, alvoX, alvoY) {
    this.x = x;
    this.y = y;
    this.alvoX = alvoX;
    this.alvoY = alvoY;
    
    this.raio = 25;
    this.ativa = true;

    // Calcular vetor de velocidade inicial em direção ao alvo
    let angulo = atan2(alvoY - y, alvoX - x);
    let velocidade = 5;
    this.vx = cos(angulo) * velocidade;
    this.vy = sin(angulo) * velocidade;

    // Funcionalidade Original: Corrente marítima aleatória
    // A rede vai desviar ligeiramente para a esquerda ou direita debaixo de água
    this.forcaCorrente = random(-1.5, 1.5); 
  }

  atualizar() {
    if (!this.ativa) return;

    this.x += this.vx;
    this.y += this.vy;

    // Efeito da corrente marítima apenas debaixo de água (y > 200)
    if (this.y > 200) {
      this.x += this.forcaCorrente;
    }

    // Se a rede sair dos limites do ecrã, desativa-a
    if (this.y > height || this.x > width || this.x < 0) {
      this.ativa = false;
    }
  }

  desenhar() {
    if (!this.ativa) return;

    push();
    stroke(50);
    strokeWeight(1.5);
    fill(200, 200, 200, 100);

    // Desenha a rede
    ellipse(this.x, this.y, this.raio * 2);
    line(this.x - this.raio, this.y, this.x + this.raio, this.y);
    line(this.x, this.y - this.raio, this.x, this.y + this.raio);
    pop();
  }
}