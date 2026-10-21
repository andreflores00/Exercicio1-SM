class Barco {
  constructor(x, y, tipo = 'padrao', img = null) {
    this.x = x;
    this.yBase = y;
    this.y = y;
    this.largura = 130;
    this.altura = 65;
    this.tipo = tipo;
    this.img = img;

    this.direcaoAtual = 1;
    this.anguloBalanço = 0;
    this.particulasAgua = [];
    this.velocidadeBase = 4;
  }

  definirDirecao(novaDirecao) {
    this.direcaoAtual = novaDirecao;
  }

  atualizar(fatorAudio) {
    if (this.direcaoAtual !== 0 && fatorAudio > 0) {
      this.mover(this.direcaoAtual, fatorAudio);
      
      let posXAgua = this.direcaoAtual === 1 ? this.x : this.x + this.largura;
      this.particulasAgua.push({
        x: posXAgua,
        y: this.y + 40,
        raio: random(4, 8),
        opacidade: 255,
        vx: -this.direcaoAtual * random(1, 3)
      });
    }

    this.y = this.yBase + sin(frameCount * 0.05) * 3;
    this.anguloBalanço = sin(frameCount * 0.03) * 0.03;
    this.x = constrain(this.x, 10, width - this.largura - 10);

    for (let i = this.particulasAgua.length - 1; i >= 0; i--) {
      let p = this.particulasAgua[i];
      p.x += p.vx;
      p.opacidade -= 8;
      if (p.opacidade <= 0) {
        this.particulasAgua.splice(i, 1);
      }
    }
  }

  mover(direcao, fatorIntensidade = 1) {
    this.x += direcao * this.velocidadeBase * fatorIntensidade;
  }

  getPosicaoCanhao() {
    return {
      x: this.direcaoAtual === 1 ? this.x + this.largura - 15 : this.x + 15,
      y: this.y + 15
    };
  }

  desenhar() {
    noStroke();
    for (let p of this.particulasAgua) {
      fill(255, 255, 255, p.opacidade);
      ellipse(p.x, p.y, p.raio);
    }

    push();
    translate(this.x + this.largura / 2, this.y + this.altura / 2);
    rotate(this.anguloBalanço);

    if (this.direcaoAtual === -1) {
      scale(-1, 1);
    }

    if (this.img && this.img.width > 0) {
      imageMode(CENTER);
      image(this.img, 0, 0, this.largura, this.altura);
    } else {
      fill(180);
      rect(-this.largura/2, -this.altura/2, this.largura, this.altura);
    }

    pop();
  }
}