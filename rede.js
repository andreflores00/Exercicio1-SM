class Rede {
  constructor(x, y, alvoX, alvoY, img = null) {
    this.x = x;
    this.y = y;
    this.alvoX = alvoX;
    this.alvoY = alvoY;
    this.img = img;

    this.raio = 22;
    this.ativa = true;

    let angulo = atan2(alvoY - y, alvoX - x);
    let velocidade = 5;
    this.vx = cos(angulo) * velocidade;
    this.vy = sin(angulo) * velocidade;
    this.forcaCorrente = random(-1.5, 1.5);
  }

  atualizar() {
    if (!this.ativa) return;

    this.x += this.vx;
    this.y += this.vy;

    if (this.y > 185) {
      this.x += this.forcaCorrente;
    }

    if (this.y > height || this.x > width || this.x < 0) {
      this.ativa = false;
    }
  }

  desenhar() {
    if (!this.ativa) return;

    push();
    if (this.img && this.img.width > 0) {
      imageMode(CENTER);
      image(this.img, this.x, this.y, this.raio * 2.5, this.raio * 2.5);
    } else {
      stroke(50);
      strokeWeight(1.5);
      fill(200, 200, 200, 100);
      ellipse(this.x, this.y, this.raio * 2);
    }
    pop();
  }
}