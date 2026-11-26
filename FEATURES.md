# MathSimulator — Documentação de Features

O **MathSimulator** é uma plataforma educacional e interativa 100% client-side (React + TypeScript + Vite + HTML5 Canvas 2D + `mathjs` + KaTeX) construída sobre uma **engine matemática unificada** que alimenta duas frentes separadas: **Matemática Pura** e **Laboratório de Física (1º, 2º e 3º Ano)**.

---

## 1. Arquitetura & Engine Matemática Unificada (`src/engine/`)

Toda fórmula — seja na Matemática Pura ou nos experimentos de Física — passa pela mesma engine:

- **Parser & Compilador (`parser.ts`)**:
  - Suporte a `y = f(x)`, `f(x, t)`, retas/semiplanos verticais `x = ...`, desigualdades `<`, `>`, `<=`, `>=` (`≤`, `≥`), curvas paramétricas 2D `p(t) = (x(t), y(t))`, plano complexo `z = ...` / `z(t) = ...` e **variáveis auxiliares encadeadas** (ex: `Z = R + i*(w*L - 1/(w*C))`, `tauRC = R * C`, `p = a * abs(1 - ecc^2)`).
  - Normalização automática de símbolos Unicode (`π`, `τ`, `φ`, `√`, `∛`, `²`, `³`, `×`, `÷`) com multiplicação implícita (ex: `2π`, `πx`).
  - Renderização matemática em tempo real via **KaTeX**.
  - Extração automática de parâmetros livres para gerar sliders dinâmicos (`min`, `max`, `step` e botão Play/Pause por parâmetro).
- **Canvas 2D HiDPI (`GraphCanvas.tsx`)**:
  - Pan, zoom centrado no cursor, grid adaptativo (`1, 2, 5 × 10ⁿ`), quebra automática de assíntotas/descontinuidades.
  - **Inspetor de coordenadas (hover)** com snap inteligente para curvas, raízes (`f(x) = 0`), interseções, fasores complexos e partículas paramétricas.
  - **Manipulação direta (Drag-to-Interact)** opcional via `onDragWorld` (usada para apontar o laser na Lei de Snell e arrastar o objeto nas Lentes Esféricas).
  - Suporte a overlays visuais modulares (`renderOverlay`).
- **Controle Global de Tempo `t` (`TimeControls.tsx`)**:
  - Play/Pause, Reset (`t = 0`) e seletor de velocidade (`0.25x` a `4x`) em loop `requestAnimationFrame` a 60fps.

---

## 2. Tela Inicial & Progressão Modular (`HomePage.tsx`)

- Direciona claramente entre:
  - **Simulador de Fórmulas Matemáticas** (ambiente livre).
  - **Laboratório de Física** dividido estritamente em **1º Ano**, **2º Ano** e **3º Ano**, garantindo que cada estudante visualize apenas os conteúdos compatíveis com sua etapa.
- Links compartilhados via URL (`#scene=...`) abrem automaticamente no Simulador Matemático preservando a cena.

---

## 3. Frente 1 — Matemática Pura (`src/modules/math/`)

- **Funções 2D & Desigualdades**:
  - Fronteira tracejada para `<` e `>`, contínua para `<=` e `>=`, com preenchimento translúcido de áreas.
- **Números Complexos (`ℂ`) em Dois Modos Integrados** (ver [COMPLEX_GUIDE.md](./COMPLEX_GUIDE.md)):
  - **Modo 1 (`y = f(x) → ℂ`)**: `Re(f(x))` em linha contínua + `Im(f(x))` em linha pontilhada + leitura `a + bi`, `|z|` e `θ` no inspetor.
  - **Modo 2 (`z = ...` / `z(t) = ...`)**: Plano de Argand-Gauss (`Re × Im`) com vetores, projeções, trajetórias e fasores animados.
- **Teclado Matemático Rápido**: inserção no cursor (e envolvimento de seleção) para `π`, `e`, `i`, `τ`, `φ`, `<`, `>`, `≤`, `≥`, `√`, `∛`, `x²`, `xⁿ`, `|x|`, `sin`, `cos`, `tan`, `log`, `exp`.
- **Persistência & Compartilhamento**: salvamento automático em `localStorage`, compartilhamento via URL e galeria de presets de Matemática & Complexos.

---

## 4. Frente 2 — Laboratório de Física (`src/modules/physics/`)

Cada experimento combina **Simulação** (sliders + fórmulas editáveis + telemetria ao vivo + visuais) com **Teoria & Cenários** (`TheoryPanel.tsx`): conceito/intuição, equações em KaTeX, tabela de variáveis no SI, observações guiadas, pontos de atenção e **botões "Testar Cenário"** de 1 clique.

### 1º Ano — Mecânica Clássica (7 experimentos)
1. **MU & MUV**: `s(t)` e `v(t)` sincronizados com partícula acompanhando o instante `t`.
2. **Lançamento Oblíquo (Projétil 2D)**: canhão inclinado na origem, loop automático de lançamento, marcação de $H_{\max}$, Alcance $R$ e vetor velocidade tangente.
3. **Movimento Rotacional (MCU / MCUV)**: disco giratório de raio $R$, arco do ângulo $\theta(t)$, velocidade tangencial $\vec{v}$ e aceleração centrípeta $\vec{a}_c$.
4. **Plano Inclinado & Atrito**: bloco deslizando fisicamente ao longo da rampa com $s(t) = \frac{1}{2}a_{\text{net}}t^2$ e vetores de Peso $\vec{P}$, Normal $\vec{N}$ e Atrito $\vec{f}_{at}$ ao vivo.
5. **Conservação da Energia Mecânica**: partícula oscilando em pista parabólica com barras ao vivo de $E_c$, $E_p$ e $E_m$.
6. **Hidrostática (Stevin & Empuxo Dinâmico)**: curva de pressão $P(h)$ + tanque animado onde o bloco cai, oscila com amortecimento até a fração submersa $\rho_c/\rho_f$ (ou afunda), elevando o nível d'água dinamicamente com vetores $\vec{P}$ e $\vec{E}$.
7. **Gravitação Universal (Órbitas de Kepler)**: Sol no foco $(0,0)$, periélio/afélio e transição contínua entre círculo, elipse, parábola e hipérbole pela excentricidade $\varepsilon$.

### 2º Ano — Termologia, Óptica & Ondulatória (4 experimentos)
8. **Gases Ideais & Ciclo de Carnot**: diagrama $P \times V$ com contorno fechado das 4 etapas do ciclo + **Pistão Térmico Animado** com partículas de gás mudando de cor ($T_Q \leftrightarrow T_F$), base alternando entre Fonte Quente / Isolante / Fonte Fria e cálculo de $\eta = 1 - T_F/T_Q$.
9. **Óptica — Lei de Snell & Reflexão Total**: **arraste o laser direto no Canvas** para variar o ângulo $\theta_1$ e inverter a direção (**Cima → Baixo** ou **Baixo → Cima**), com **pulsos de luz** mudando de velocidade ($c/n$) e **cone crítico ($\theta_L$)** visual.
10. **Óptica — Lentes Esféricas (Gauss)**: **arraste o objeto direto no Canvas** para mover $p$ e $h_{\text{obj}}$, com focos $F/F'$, raios notáveis e formação instantânea de imagem real/virtual e aumento $A$.
11. **Ondulatória — Efeito Doppler**: fonte sonora móvel emitindo frentes de onda circulares em tempo real, leitura de $f_{\text{aprox}}$ / $f_{\text{afast}}$ e formação do **Cone de Mach** supersônico ($v_s \ge v$).

### 3º Ano — Eletromagnetismo & Física Moderna (8 experimentos)
12. **Lei de Coulomb & Potencial Elétrico**: curva $1/r^2$ + card dinâmico de cargas $q_1, q_2$ alternando entre atração e repulsão.
13. **Circuito DC (RC)**: curva $V_C(x)$, $I(x)$ e $\tau = RC$ sincronizadas com esquema SVG animado do capacitor carregando.
14. **Circuito AC (RLC)**: impedância complexa $Z = R + i(\omega L - 1/\omega C)$, esquema SVG indicando regime (Indutivo / Capacitivo / Ressonância), fasores girando (`zV`, `zI`) e senoides defasadas sincronizadas.
15. **Magnetismo — Força de Lorentz**: grade de campo `⊗`, órbita ciclotrônica $z(t) = R_c e^{i\omega_c t}$ invertendo sentido conforme o sinal da carga $q$.
16. **Indução Eletromagnética (Faraday-Lenz)**: curvas $\Phi(t)$ e $\varepsilon(t)$ defasadas em 90° + gerador animado com ímã `N — S`, espira girando em 2.5D e lâmpada pulsando conforme $|\varepsilon(t)|$.
17. **Efeito Fotoelétrico**: curva $E_c(f)$ com corte $f_0$ + câmara animada com fótons cuja cor varia com a frequência $f$ e elétrons ejetados quando $f > f_0$.
18. **Decaimento Radioativo (Meia-Vida)**: curva $N(t) = N_0 \cdot 2^{-t/T_{1/2}}$ com marcação de $T_{1/2}$ e $N_0/2$.
19. **Relatividade Restrita (Fator de Lorentz)**: curva $\gamma(v/c) = 1/\sqrt{1 - \beta^2}$ com assíntota em $c$ e telemetria de dilatação temporal.

---

## 5. Próxima Etapa (Fase 3 — Roadmap Futuro)

- **Solver Numérico de EDOs (Runge-Kutta 4ª ordem — RK4)**: pêndulo não-linear, oscilador forçado/caótico, Lotka-Volterra, atrator de Lorenz e problema gravitacional de N-corpos.
- **Campos Vetoriais & Espaço de Fase**: grade de vetores de gradiente/velocidade e múltiplas partículas soltas por clique.
- **Domain Coloring (`f(z)`)**: mapa de cores 2D em alta performance para funções complexas.
