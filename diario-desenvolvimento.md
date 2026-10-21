# Diário de Desenvolvimento — EcoMar: Pesca Sustentável

## Segunda-feira, 12 de outubro de 2026

**Objetivo:** Ler o enunciado, compreender o tema e planear os objetivos pedagógicos e técnicos do trabalho.

**O que fiz:**
* Li a proposta sobre pesca sustentável e redução de capturas acidentais (*bycatch*).
* Identifiquei a importância de distinguir espécies permitidas (comerciais) de espécies protegidas.
* Defini uma abordagem educativa para o jogo: recompensar boas práticas (ganhar pontos/tempo) e penalizar más práticas (perda de vidas/pontos).

**Desafios e Soluções:**
* **Desafio:** Criar mecânicas de jogo que exigissem estratégia em vez de cliques aleatórios. 
* **Solução:** Introdução de um sistema de controlo híbrido (direção no teclado + aceleração por voz), obrigando o jogador a planear o lançamento da rede.

**Utilização de IA:**
* Funcionei com a IA como parceira de *brainstorming* inicial.
* Pedi sugestões de mecânicas 2D para traduzir o conceito de "pesca sustentável" para videojogo.
* Utilizei as respostas para definir a arquitetura base do projeto (divisão em classes principais: `Barco`, `Rede`, `Criatura`).

---

## Terça-feira, 13 de outubro de 2026

**Objetivo:** Preparar o ambiente de desenvolvimento, recolher recursos visuais e definir a estrutura do código.

**O que fiz:**
* Organizei o repositório e criei os ficheiros estruturais (`index.html`, `sketch.js` e as classes).
* Preparei a lógica inicial de níveis.
* Reuni os recursos visuais (sprites PNG para fundo, barco, redes e criaturas marinhas).
* Configurei a importação das bibliotecas `p5.js` e `p5.sound` para a captura de áudio.

**Desafios e Soluções:**
* **Desafio:** Problemas de MIME type e falhas no carregamento de ficheiros locais.
* **Solução:** Estruturação correta da pasta `/sprites` e atualização dos *paths* no HTML para as bibliotecas via CDN.

**Utilização de IA:**
* Geração da estrutura base do `index.html` (boilerplate) com os links corretos das bibliotecas.
* Aconselhamento sobre como organizar o código em Programação Orientada a Objetos (POO) no ecossistema p5.js, resultando na modularização do código.

---

## Terça-feira, 20 de outubro de 2026

**Objetivo:** Implementar o "Core Loop" e as mecânicas principais do jogo.

**O que fiz:**
* Implementei a máquina de estados para navegação de menus (`ESTADO_INICIO`, `ESTADO_JOGO`, `ESTADO_FIM`).
* Criei a física de movimento do barco (direção pelas setas e aceleração pelo volume do microfone).
* Desenvolvi o sistema de instanciamento de redes (com clique do rato, cálculo de trajetória e detonação) e de criaturas.

**Desafios e Soluções:**
* **Desafio:** Navegadores a bloquear a captura do microfone devido a políticas de reprodução automática.
* **Solução:** Implementação de `userStartAudio()` e `getAudioContext().resume()` ativados apenas no clique do botão "INICIAR".
* **Desafio:** Barco a tremer ou mover-se sozinho com o ruído ambiente.
* **Solução:** Adição de um sistema de histerese (limiar mínimo e máximo de áudio) para filtrar o ruído de fundo.

**Utilização de IA:**
* Escrita da lógica matemática para a deteção de colisões baseada em raios (`dist()`) entre as redes e as *hitboxes* dos peixes.
* Otimização da função de mapeamento de áudio (`map()` e `constrain()`) para converter o volume numa velocidade fluida.
* Programação do efeito visual simulado de correnteza a afetar a trajetória da rede na água.

---

## Quarta-feira, 21 de outubro de 2026

**Objetivo:** Refinamento visual, progressão de níveis, persistência de dados e correção de bugs.

**O que fiz:**
* Resolvi problemas de carregamento de imagens (erros 404), garantindo nomes e caminhos exatos dos PNGs.
* Ajustei a física do jogo para a linha da água visual (`Y = 185`) coincidir com a área de colisão do barco e das redes.
* Criei o sistema de progressão por níveis (1 a 3), desbloqueando novas espécies conforme a pontuação.
* Adicionei um ecrã de pausa/transição entre níveis (com restauro de vidas).
* Implementei um *cooldown* visual (mira dinâmica com tempo de recarga) no lançamento das redes.
* Criei o menu "Frota" com navegação entre ecrãs e uso de `localStorage` para persistência dos barcos desbloqueados.
* Introduzi feedback positivo (+10s de bónus de tempo na captura correta).

**Desafios e Soluções:**
* **Desafio:** Desalinhamento entre *sprites* visuais e a física do jogo (o barco parecia "voar").
* **Solução:** Afinação iterativa das coordenadas Y base do barco, *spawns* de criaturas e início da correnteza de água.
* **Desafio:** Risco de bloqueio do jogo ao ler/escrever dados locais no browser.
* **Solução:** Tratamento de erros com blocos `try/catch` na gestão do `localStorage`.

**Utilização de IA:**
* **Debugging:** Análise de erros de consola reportados e correção de caminhos de ficheiros mal mapeados.
* **Refactoring UX/UI:** Redesenho completo da interface (HUD e Menus) para um aspeto mais polido, legível e responsivo.
* **Mecânicas:** Implementação do algoritmo de *cooldown* de disparo baseado em relógio (`millis()`).
* **Sistemas de Dados:** Criação dos scripts seguros de integração do `localStorage` para gravar permanentemente o progresso do jogador.