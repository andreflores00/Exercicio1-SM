class Barco {
  constructor(x, y, tipo = 'padrao') {
    this.x = x;
    this.y = y;
    this.largura = 120;
    this.altura = 60;
    this.tipo = tipo;
    
    // Configurar propriedades consoante o tipo de barco
    this.configurarBarco();
  }

  configurarBarco() {
    switch (this.tipo) {
      case 'rapido':
        this.velocidadeBase = 6;
        this.cor = color(220, 50, 50); // Vermelho
        break;
      case 'pesado':
        this.velocidadeBase = 2.5;
        this.cor = color(50, 100, 50); // Verde escuro
        break;
      case 'padrao':
      default:
        this.velocidadeBase = 4;
        this.cor = color(200, 200, 200); // Cinzento base
        break;
    }
  }

  atualizar(fatorAudio) {
    let direcao = 0;
    
    // O teclado apenas define a direção pretendida
    if (keyIsDown(LEFT_ARROW)) {
      direcao = -1;
    } else if (keyIsDown(RIGHT_ARROW)) {
      direcao = 1;
    }

    // O barco só se move se houver intenção (direção) E som acima do limiar
    // Quanto maior o fatorAudio, mais rápido se move!
    if (direcao !== 0 && fatorAudio > 0) {
      this.mover(direcao, fatorAudio);
    }

    // Restringir o barco aos limites do ecrã
    this.x = constrain(this.x, 10, width - this.largura - 10);
  }

  mover(direcao, fatorIntensidade = 1) {
    // fatorIntensidade será útil mais tarde quando usarmos o volume da voz
    this.x += direcao * this.velocidadeBase * fatorIntensidade;
  }

  // Devolve o ponto exato de onde a rede sai (o canhão na proa)
  getPosicaoCanhao() {
    return {
      x: this.x + this.largura - 15,
      y: this.y + 10
    };
  }

  desenhar() {
    push();
    translate(this.x, this.y);

    // Casco do barco
    fill(this.cor);
    stroke(0);
    strokeWeight(2);
    rect(0, 20, this.largura, 30, 5, 5, 20, 20);

    // Cabine
    fill(240);
    rect(20, 0, 40, 20, 3);

    // Canhão de redes (na proa/frente do barco)
    fill(80);
    rect(this.largura - 25, 5, 20, 10, 2);

    pop();
  }
}