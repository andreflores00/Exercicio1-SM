# EcoMar — Pesca Sustentável e Redução de Capturas Acidentais

> **Projeto educativo desenvolvido em p5.js** com controlo híbrido pelo rato e voz (microfone), focado na sensibilização para a sustentabilidade marinha e redução de capturas acidentais (*bycatch*).

---

## 🐟 Sobre o Projeto

O **EcoMar** é um jogo 2D interativo onde o jogador assume o comando de um barco de pesca. O objetivo principal é capturar espécies comerciais permitidas (como sardinhas, douradas e atuns) enquanto evita ativamente espécies marinhas protegidas (como tartarugas, cavalos-marinhos e golfinhos).

O jogo introduz mecânicas inovadoras de interação, como a **aceleração controlada por voz** (através do microfone do computador) e **correntes marítimas dinâmicas** que afetam a trajetória das redes de pesca.

---

## 🎮 Mecânicas Principais

* **Controlo de Movimento Híbrido:** 
  * **Rato:** O barco aponta e navega horizontalmente na direção do cursor.
  * **Voz (Microfone):** Antes de cada partida, o microfone mede o ruído ambiente durante 3 segundos em silêncio e ajusta os limiares de ativação e intensidade da voz. Depois, o volume da voz determina a aceleração e velocidade do barco.
* **Lançamento de Redes com Mira:** Clique do rato na zona da água para disparar redes. Inclui um sistema de *cooldown* visual (recarga) para evitar disparos em cadeia.
* **Sistema de Níveis Progressivo:** 
  * *Nível 1:* Sardinhas e Tartarugas.
  * *Nível 2:* Desbloqueio de Douradas e Cavalos-marinhos (com restauro de vidas).
  * *Nível 3:* Desbloqueio de Atuns e Golfinhos.
* **Frota Desbloqueável:** O progresso do jogador (barcos especiais) é guardado automaticamente no navegador através de `localStorage`.
* **Correntes Marítimas:** As redes sofrem desvios laterais aleatórios debaixo de água, simulando a corrente oceânica.
* **Bónus de Tempo:** Cada captura correta concede um bónus de segundos extra no relógio.

---

## 🛠️ Tecnologias Utilizadas

* **[p5.js](https://p5js.org/)** (v1.11.10) — Biblioteca JavaScript para animação e renderização gráfica 2D.
* **[p5.sound](https://p5js.org/reference/#/p5.SoundFile)** — Módulo de áudio para captação de som em tempo real (`p5.AudioIn`).
* **JavaScript (ES6+)** — Programação Orientada a Objetos (POO) estruturada em classes (`Barco`, `Rede`, `Criatura`).
* **HTML5 & CSS3** — Estrutura e estilização da página.

---

## 🚀 Como Executar o Projeto Localmente

Como o projeto utiliza carregamento assíncrono de imagens (`loadImage`) e microfone, é recomendado executá-lo através de um servidor local (como a extensão **Live Server** no Visual Studio Code) para evitar restrições de segurança do browser (*CORS*).

1. Clona este repositório ou descarrega-o em formato ZIP:
   ```bash
   git clone https://github.com/andreflores00/Exercicio1-SM.git
   ```
2. Abre a pasta do projeto no teu editor de código (por exemplo, **VS Code**).
3. Inicia um servidor local (clica em **"Go Live"** no canto inferior direito do VS Code).
4. Permite o acesso ao microfone quando solicitado pelo navegador e diverte-te!

---

## 📁 Estrutura de Ficheiros

```text
Exercicio1-SM/
├── index.html              # Ficheiro principal HTML
├── sketch.js               # Gestão de estados, HUD, níveis e ciclos do jogo
├── barco.js                # Classe do Barco (física, balanço e partículas de água)
├── rede.js                 # Classe da Rede (trajetória e correntes marítimas)
├── criatura.js             # Classe das Criaturas (espécies, pontuações e colisões)
├── diario-desenvolvimento.md # Registo diário do progresso e uso de IA
└── sprites/                # Pasta com todos os recursos gráficos (PNGs)
    ├── barco.png
    ├── rede.png
    ├── fundo_mar.png
    ├── sardinha.png
    ├── dourada.png
    ├── atum.png
    ├── tartaruga.png
    ├── cavalo_marinho.png
    └── golfinho.png
```

---

## 🤖 Utilização de Inteligência Artificial

Durante o desenvolvimento deste projeto, a Inteligência Artificial foi utilizada como ferramenta de apoio pedagógico e técnico nas seguintes vertentes:
* **Arquitetura e Modularização:** Sugestão de divisão do código em Programação Orientada a Objetos.
* **Matemática e Física:** Formulação dos cálculos de deteção de colisão por raios, histerese de áudio para o microfone e efeito de correnteza.
* **Interface e UX/UI:** Redesenho de ecrãs de menu, barras de progresso dinâmicas e indicadores visuais de recarga.
* **Resolução de Erros (*Debugging*):** Identificação e correção de conflitos de carregamento de recursos e escopo do p5.js.

---

## 📄 Licença

Desenvolvido no âmbito da unidade curricular de **Sistemas Multimédia**.
