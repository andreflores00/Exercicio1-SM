class Rede {
  constructor(x, y, alvoX, alvoY) {
    this.x = x;
    this.y = y;
    this.alvoX = alvoX;
    this.alvoY = alvoY;
    
    this.raio = 25;
    this.ativa = true;

    // Calcular vetor de velocidade em direção ao alvo
    let angulo = atan2(alvoY - y, alvoX - x);
    let velocidade = 5;
    this.vx = cos(angulo) * velocidade;
    this.vy = sin(angulo) * velocidade;
  }

  atualizar() {
    if (!this.ativa) return;

    // Movimento inicial até à água
    this.x += this.vx;
    this.y += this.vy;

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

    // Desenha a rede como um círculo pontilhado/em grelha
    ellipse(this.x, this.y, this.raio * 2);
    line(this.x - this.raio, this.y, this.x + this.raio, this.y);
    line(this.x, this.y - this.raio, this.x, this.y + this.raio);
    pop();
  }
}