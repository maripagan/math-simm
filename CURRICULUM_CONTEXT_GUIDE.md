# Guia de Contexto Curricular & Roteiros — MathSimulator

Este documento centraliza o **contexto pedagógico, histórico, interdisciplinar e técnico** de todas as **24 matérias/módulos mapeados** no MathSimulator (19 experimentos de Física + 5 presets de Matemática Pura) e dos **3 itens de Backlog de Matemática**.

O objetivo é servir como **fonte de verdade** para:
- Criar os roteiros de aula pendentes em `src/data/modules/*.ts` seguindo o contrato `ClassroomModuleSchema` (`src/classroom/schemas.ts`);
- Alimentar prompts de geração de aulas via IA (V2) respeitando rigorosamente os parâmetros e limites reais de `src/data/engines_registry.json`;
- Estruturar **Trilhas Interdisciplinares (Playlists V2)** conectando múltiplos módulos por `themeTags`.

> **Nota:** Este arquivo é estritamente um guia de referência. Nenhuma alteração de código foi feita ainda.

---

## Notas Técnicas Prévias (para quando iniciar a implementação dos roteiros)

1. **Expansão de `ModuleCategorySchema` (`src/classroom/schemas.ts`)**:
   - Hoje o enum aceita apenas: `'Mecânica' | 'Termodinâmica' | 'Óptica' | 'Eletromagnetismo' | 'Química'`.
   - Para cadastrar todos os módulos abaixo, será necessário incluir: `'Ondulatória'`, `'Física Moderna'` e `'Matemática'`.
2. **Parâmetro fixo em `photoelectric`**:
   - Em `engines_registry.json`, `h` tem `min: 4.14, max: 4.14` (constante de Planck em `eV·fs`). Presets devem manter `h: 4.14` fixo e variar apenas `phi` e `fLight`.
3. **Preset sem sliders em `inequality-region`**:
   - Atualmente `inequality-region` tem `parameters: {}` em `engines_registry.json`. Para suportar `enginePresetBefore/After` e `collectiveChallenge` no Modo Sala de Aula, será preciso parametrizar os coeficientes das inequações (ex.: `a`, `b`, `c`) ou habilitar troca de fórmulas via preset.
4. **Suporte do `useSimulationBridge` para Matemática**:
   - Os 5 presets de Matemática Pura estão em `src/modules/math/mathPresets.ts` (e já catalogados no `engines_registry.json`). Ao criar seus roteiros de aula, verificar se a ponte do Modo Sala de Aula carrega presets de `MATH_PRESETS` além de `PHYSICS_EXPERIMENTS`.

---

## A. Física — 1º Ano: Mecânica Clássica (7 engines)

### 1. Lançamento Oblíquo (Projétil) — `projectile`
- **Status:** Incluído no MVP V1 (`src/data/modules/projectile.ts`, id: `projetil-01`).
- **Parâmetros da engine:** `v0` (`3..35 m/s`), `ang` (`0.15..1.45 rad`), `g` (`1.6..20 m/s²`).
- **Fórmula central:** $x(t) = v_0\cos(\theta)t \;\mid\; y(t) = v_0\sin(\theta)t - \frac{1}{2}gt^2$
- **Gancho histórico:** 1608 — Galileu Galilei demonstrou a independência dos movimentos (horizontal uniforme + queda livre vertical) formando uma parábola.
- **Pergunta de abertura / Armadilha comum:** "Se eu atirar uma bola para frente e soltar outra da mesma altura, qual cai primeiro?" / Alunos acham que velocidade horizontal atrasa a queda ou que no ponto mais alto a velocidade total é zero.
- **Mito quebrado & Insight "Aha!":** Atirar mais forte na horizontal não muda o tempo de queda; sem arrasto, o alcance máximo ocorre em $45^\circ$ e ângulos complementares ($30^\circ$ e $60^\circ$) geram o mesmo alcance.
- **Cotidiano:** Basquete, faltas no futebol, jatos d'água, balística.
- **Pontes interdisciplinares (`themeTags`):** `segunda-guerra`, `renascimento`, `balistica`, `computacao`.
  - *História:* Tabelas balísticas na 2ª Guerra motivaram a criação do ENIAC (1945).
  - *Química:* Combustão exotérmica do propelente determina $v_0$.
  - *Matemática:* Conexão direta com `parabola-tangent` (função quadrática, vértice = $H_{\max}$, raízes = alcance $R$).
- **Dinâmica em sala (já implementada):** Quizzes sobre $v_y = 0$ no topo e ângulos complementares; desafio de acertar alvo a ~80 m passando por cima de um muro de 15 m.

---

### 2. Gravitação Universal — Órbitas de Kepler — `kepler`
- **Status:** Incluído no MVP V1 (`src/data/modules/kepler.ts`, id: `kepler-01`).
- **Parâmetros da engine:** `a` (`1.2..6 UA`), `ecc` (`0..1.35`).
- **Fórmula central:** $F = G\frac{Mm}{d^2} \;\mid\; r(\theta) = \frac{a(1 - \varepsilon^2)}{1 + \varepsilon\cos\theta}$
- **Gancho histórico:** 1687 — Isaac Newton unificou a queda da maçã e o movimento da Lua sob a mesma lei gravitacional, explicando as órbitas elípticas descobertas por Johannes Kepler (1609).
- **Pergunta de abertura / Armadilha comum:** "Se a Terra puxa a Lua o tempo todo, por que ela não cai em cima de nós?" / Achar que não existe gravidade na Estação Espacial Internacional.
- **Mito quebrado & Insight "Aha!":** Astronautas não estão "sem gravidade", estão em queda livre contínua em torno da Terra; `ecc` controla a transição contínua de círculo ($0$) → elipse ($0 < \varepsilon < 1$) → parábola ($1$) → hipérbole de escape ($> 1$).
- **Cotidiano:** Satélites de GPS, previsão meteorológica, internet via satélite, marés.
- **Pontes interdisciplinares (`themeTags`):** `corrida-espacial`, `guerra-fria`, `astronomia`.
  - *História:* Sputnik 1 (1957) e Apollo 11 (1969) na Guerra Fria.
  - *Geografia:* Satélites geoestacionários e monitoramento ambiental/cartográfico.
  - *Física 3º Ano:* Ponte com `coulomb-electrostatics` (mesma lei do inverso do quadrado $1/d^2$) e `relativity-lorentz` (correção relativística do GPS).
- **Dinâmica em sala (já implementada):** Quizzes sobre imponderabilidade orbital e lei $1/d^2$; desafio de estabilizar satélite em órbita circular (`ecc === 0`).

---

### 3. Movimento Retilíneo (MU & MUV) — `mruv`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/mruv.ts`).
- **Parâmetros da engine:** `s0` (`-5..5 m`), `v0` (`-6..10 m/s`), `a` (`-5..5 m/s²`).
- **Fórmula central:** $s(t) = s_0 + v_0 t + \frac{1}{2}at^2 \;\mid\; v(t) = v_0 + at$
- **Gancho histórico:** 1638 — Galileu Galilei usou planos inclinados suaves e clepsidras (relógios d'água) para provar que a distância percorrida na queda livre cresce com o quadrado do tempo ($t^2$), e não linearmente.
- **Pergunta de abertura:** "Se um carro dobra sua velocidade de 40 km/h para 80 km/h, a distância que ele precisa para frear também dobra?"
- **Armadilha comum:** Confundir aceleração negativa ($a < 0$) automaticamente com "frear". Se $v_0 < 0$ e $a < 0$, o corpo está acelerando no sentido retrógrado; só freia quando $v$ e $a$ têm sinais opostos.
- **Mito quebrado & Insight "Aha!":** Dobrar a velocidade quadruplica a distância de frenagem (pois $\Delta s \propto v_0^2$). No gráfico $s(t)$, a inclinação da reta tangente é a velocidade $v(t)$ — quando $v(t)$ cruza o zero, $s(t)$ inverte o sentido (vértice da parábola).
- **Cotidiano:** Distância de frenagem no trânsito, radares de velocidade média, decolagem de aviões em pistas, elevadores.
- **Pontes interdisciplinares (`themeTags`):** `seguranca-viaria`, `transporte`, `cinematica`, `calculo-basico`.
  - *Matemática:* Ponte direta com `parabola-tangent` ($s(t)$ é função quadrática e $v(t)$ é sua derivada/reta tangente).
  - *Biologia:* Tempo de reação humano (~0,7 s em MU antes de começar o MUV da frenagem) sob efeito de sono/álcool.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Comparar $a = 0$ (MU, reta) vs. $a \ne 0$ (MUV, parábola) e o momento exato em que um carro freando inverte a marcha se a aceleração negativa continuar atuando.
  - *Quiz Previsão:* Preset antes (`s0: 0, v0: 4, a: -2`) vs. depois (`s0: 0, v0: 8, a: -2`) — mostrar que a posição máxima quadriplica (de 4 m para 16 m).
  - *Desafio Coletivo:* "Parar o trem exatamente na estação (em $s = 10$ m, partindo de $s_0 = 0$ com $v_0 = 6$ m/s) escolhendo a desaceleração $a$ correta" (`a = -1.8` m/s²).

---

### 4. Movimento Rotacional (MCU & MCUV) — `rotational`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/rotational.ts`).
- **Parâmetros da engine:** `R` (`0.8..5 m`), `w0` (`0..5 rad/s`), `alpha` (`-1.5..1.5 rad/s²`).
- **Fórmula central:** $\theta(t) = \omega_0 t + \frac{1}{2}\alpha t^2 \;\mid\; v = \omega R \;\mid\; a_c = \omega^2 R = \frac{v^2}{R}$
- **Gancho histórico:** 1673 — Christiaan Huygens formulou matematicamente a aceleração centrípeta estudando relógios de pêndulo e estilingues, desvendando por que corpos em movimento circular exigem uma força constante apontando para o centro.
- **Pergunta de abertura:** "Se um carro faz uma curva com o velocímetro cravado em 60 km/h, ele está acelerando?"
- **Armadilha comum:** Achar que velocidade constante em módulo significa aceleração zero, ou confundir "força centrífuga" (efeito inercial) com uma força real que puxa o corpo para fora da curva.
- **Mito quebrado & Insight "Aha!":** Mesmo com velocidade escalar constante ($\alpha = 0$), existe aceleração centrípeta ($\vec{a}_c$) porque o *vetor* velocidade muda de direção o tempo todo. Se a corda arrebentar, o corpo sai pela tangente, nunca radialmente para fora.
- **Cotidiano:** Curvas em rodovias, centrífuga da máquina de lavar, engrenagens de bicicleta, gravidade artificial em estações espaciais (ficção científica vs. engenharia).
- **Pontes interdisciplinares (`themeTags`):** `engenharia-mecanica`, `astronomia`, `esportes`, `trigonometria`.
  - *Matemática:* Ponte direta com `euler-phasor` (rotação no círculo unitário/complexo $z(t) = R e^{i\omega t}$) e `wave-beat` (projeção do MCU gera o MHS/senoide).
  - *Biologia:* Centrífugas de laboratório separando plasma e hemácias do sangue por diferença de densidade sob alta $a_c$.
  - *Geografia:* Rotação da Terra ($\omega$ constante, mas velocidade linear $v = \omega R$ é máxima no Equador — motivo pelo qual bases de lançamento de foguetes como Alcântara ficam perto do Equador).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Direção para onde a partícula escapa se a força centrípeta desaparecer subitamente (tangente ao círculo).
  - *Quiz Previsão:* Dobrar $\omega_0$ (de `1.5` para `3.0` rad/s mantendo `R = 2.0, alpha = 0`) quadruplica $a_c$.
  - *Desafio Coletivo:* "Simular a gravidade terrestre ($a_c \approx 9{,}8\text{ m/s}^2$) numa estação espacial giratória de raio $R$ sem girar rápido demais ($\omega_0 \le 2{,}0\text{ rad/s}$ para evitar tontura nos astronautas)" — exige escolher `R` maior (ex.: `R: 4.0, w0: 1.6, alpha: 0` → $a_c \approx 10{,}2\text{ m/s}^2$).

---

### 5. Plano Inclinado, Leis de Newton & Atrito — `inclined-plane`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/inclined-plane.ts`).
- **Parâmetros da engine:** `m` (`1..15 kg`), `ang` (`0.1..1.25 rad`), `mu` (`0..1.0`), `g` (`1.6..15 m/s²`).
- **Fórmula central:** $P_x = mg\sin\theta \;\mid\; N = mg\cos\theta \;\mid\; f_{at} = \mu N \;\mid\; a_{\text{net}} = g(\sin\theta - \mu\cos\theta)$
- **Gancho histórico:** 1586 / 1699 — Simon Stevin analisou o equilíbrio no plano inclinado (uma das seis máquinas simples clássicas, usada desde as pirâmides do Egito) e Guillaume Amontons formulou as leis clássicas do atrito seco, mostrando que $f_{at}$ depende da Normal e do material ($\mu$), e não da área de contato.
- **Pergunta de abertura:** "Se dobrarmos a massa de uma caixa numa rampa com atrito, ela desce mais rápido, mais devagar ou com a mesma aceleração?"
- **Armadilha comum:** Achar que a Força Normal é sempre igual ao Peso ($N = P$), esquecendo o fator $\cos\theta$; ou achar que objetos mais pesados sempre deslizam mais rápido na rampa.
- **Mito quebrado & Insight "Aha!":** A massa $m$ se cancela na aceleração de descida ($a = g(\sin\theta - \mu\cos\theta)$)! Além disso, quanto mais inclinada a rampa, *menor* fica a Normal ($mg\cos\theta$) e portanto *menor* o atrito. O bloco só começa a deslizar quando $\tan\theta > \mu$.
- **Cotidiano:** Rampas de acessibilidade (NBR 9050), freios ABS em ladeiras molhadas ($\mu$ cai), escorregadores, estradas de serra.
- **Pontes interdisciplinares (`themeTags`):** `arquitetura`, `engenharia-civil`, `antiguidade`, `seguranca-viaria`.
  - *História:* Construção das pirâmides do Egito e máquinas simples na Antiguidade.
  - *Química/Materiais:* Composição de pneus de borracha, lubrificantes e superfícies antiderrapantes alterando $\mu$.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* O que acontece com a aceleração ao dobrar `m` de `3 kg` para `12 kg` mantendo `ang` e `mu` fixos (não muda!).
  - *Quiz Previsão:* Com `mu = 0.5`, qual ângulo crítico $\theta_c = \arctan(0.5) \approx 26{,}6^\circ$ (`0.46 rad`) faz o bloco começar a escorregar?
  - *Desafio Coletivo:* "Projetar uma rampa segura onde o bloco fique travado pelo atrito ($a_{\text{net}} \le 0$) mesmo com chuva reduzindo $\mu$ para `0.35`" — exige escolher `ang` suficientemente baixo ($\tan(\text{ang}) \le 0.35$, ex.: `ang: 0.30`).

---

### 6. Conservação da Energia Mecânica — `energy-conservation`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/energy-conservation.ts`).
- **Parâmetros da engine:** `m` (`0.5..10 kg`), `A` (`0.8..5 m`), `k` (`0.1..1.0 1/m`), `w` (`0.4..4 rad/s`).
- **Fórmula central:** $E_m = E_c + E_p = \text{constante} \;\mid\; E_c = \frac{1}{2}mv^2 \;\mid\; E_p = mgh$
- **Gancho histórico:** 1840s — James Prescott Joule e Hermann von Helmholtz consolidaram o Princípio da Conservação da Energia, mostrando que a energia nunca é criada nem destruída, apenas transformada de uma forma em outra.
- **Pergunta de abertura:** "Por que o primeiro morro de uma montanha-russa é sempre o mais alto de todo o percurso?"
- **Armadilha comum:** Achar que no ponto mais baixo a energia "acabou" porque $h = 0$ ($E_p = 0$), ou que a massa altera a velocidade máxima no fundo de uma pista sem atrito.
- **Mito quebrado & Insight "Aha!":** A altura máxima de retorno nunca supera a altura inicial (sem motor), porque $E_m$ é um orçamento fixo. Enquanto $E_p$ desce, $E_c$ sobe exatamente na mesma proporção — a soma das barras permanece travada.
- **Cotidiano:** Montanhas-russas, pistas de skate (*half-pipe*), pêndulos, hidrelétricas (água alta → turbina girando), freios regenerativos de carros elétricos.
- **Pontes interdisciplinares (`themeTags`):** `energia`, `esportes`, `sustentabilidade`, `engenharia`.
  - *Geografia / Física 3º Ano:* Ponte direta com `faraday-induction` (energia potencial gravitacional da água em barragens → cinética na turbina → elétrica por indução).
  - *Biologia:* Conversão de energia química (ATP/alimentos) em energia mecânica na contração muscular.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Onde $E_c$ é máxima e onde $E_p$ é máxima na pista parabólica? (Fundo = $E_c$ máx, $E_p$ mín; extremos = $E_p$ máx, $E_c = 0$).
  - *Quiz Previsão:* Ao dobrar a amplitude `A` (de `1.5` para `3.0`), como muda a energia mecânica total? (Cresce quadraticamente com a altura $y = k A^2$, quadruplicando!).
  - *Desafio Coletivo:* "Ajustar a pista (`A`, `k`, `m`) para que o carrinho atinja um orçamento energético entre 40 J e 60 J sem ultrapassar o limite estrutural de altura $y_{\max} \le 4$ m."

---

### 7. Hidrostática (Stevin & Empuxo) — `hydrostatics`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/hydrostatics.ts`).
- **Parâmetros da engine:** `P0` (`80..120 kPa`), `rhoF` (`600..2000 kg/m³`), `rhoC` (`200..2200 kg/m³`), `h` (`0.5..15 m`), `g` (`1.6..15 m/s²`).
- **Fórmula central:** $P(h) = P_0 + \rho_f g h \;\mid\; E = \rho_f V_{\text{sub}} g \;\mid\; f_{\text{sub}} = \frac{\rho_c}{\rho_f}$
- **Gancho histórico:** ~250 a.C. / 1586 — Arquimedes de Siracusa descobriu o princípio do empuxo ("Eureka!") ao investigar se a coroa do rei Hierão II era de ouro puro; séculos depois, Simon Stevin formulou a lei da pressão hidrostática e o paradoxo hidrostático.
- **Pergunta de abertura:** "Se o aço é quase 8 vezes mais denso que a água, como um navio de aço de 100 mil toneladas consegue flutuar?"
- **Armadilha comum:** Achar que objetos mais pesados sempre afundam (confundindo massa com densidade média), ou que a pressão no fundo de um tanque depende da largura/formato do recipiente e não apenas da profundidade $h$.
- **Mito quebrado & Insight "Aha!":** Flutuar não depende do peso total, mas da razão de densidades $\rho_c/\rho_f$. Um navio de aço tem muito ar dentro do casco, deixando sua densidade *média* menor que a da água. E a cada 10 m de profundidade na água, a pressão sobe ~1 atm (~100 kPa).
- **Cotidiano:** Submarinos (tanques de lastro), mergulho autônomo (doença descompressiva), barragens mais grossas na base, flutuar facilmente no Mar Morto ($\rho_f$ alta por salinidade), icebergs (~90% submersos).
- **Pontes interdisciplinares (`themeTags`):** `oceanografia`, `biologia-marinha`, `navegacao`, `antiguidade`.
  - *Biologia:* Bexiga natatória dos peixes (controle de densidade média), adaptação de animais abissais a altas pressões, embolia em mergulhadores.
  - *Geografia:* Salinidade dos oceanos (Mar Morto vs. água doce) e derretimento de icebergs vs. geleiras continentais no nível do mar.
  - *Química:* Densidade de soluções salinas e separação de misturas por densidade.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Por que cerca de 90% de um iceberg fica escondido debaixo d'água? ($\rho_{\text{gelo}} \approx 917\text{ kg/m}^3$ vs. $\rho_{\text{mar}} \approx 1025\text{ kg/m}^3 \Rightarrow f_{\text{sub}} \approx 89\%$).
  - *Quiz Previsão:* Colocar `rhoC = 900` em óleo (`rhoF = 800`, afunda!) e depois trocar o fluido para água salgada (`rhoF = 1100`, flutua com 82% submerso).
  - *Desafio Coletivo:* "Calibrar o submarino (`rhoC`) em água do mar (`rhoF = 1050`) para que ele flutue parcialmente com exatamente ~50% a 70% do casco submerso, sem afundar" (ex.: `rhoC = 650`).

---

## B. Física — 2º Ano: Termologia, Óptica & Ondulatória (4 engines)

### 8. Gases Ideais & Ciclo de Carnot — `ideal-gas`
- **Status:** Incluído no MVP V1 (`src/data/modules/carnot.ts`, id: `carnot-01`).
- **Parâmetros da engine:** `n` (`0.5..6 mol`), `TQ` (`320..1000 K`), `TF` (`150..580 K`).
- **Fórmula central:** $PV = nRT \;\mid\; \eta_{\max} = 1 - \frac{T_F}{T_Q}$
- **Gancho histórico:** 1824 — Sadi Carnot estudou máquinas a vapor para otimizar o uso de carvão e descobriu o limite teórico de rendimento de qualquer máquina térmica (base da 2ª Lei da Termodinâmica).
- **Pergunta de abertura / Armadilha comum:** "Por que nenhum motor aproveita 100% do combustível?" / Tentar colocar $T_F = 0$ K ou usar °C na fórmula do rendimento.
- **Mito quebrado & Insight "Aha!":** Mesmo sem atrito, nenhum motor atinge 100% de eficiência; o rendimento depende apenas da razão $T_F/T_Q$ em Kelvin, e a área interna do diagrama $P \times V$ representa o trabalho líquido útil.
- **Cotidiano:** Motores a combustão, usinas termelétricas, geladeiras e ar-condicionado (ciclo reverso).
- **Pontes interdisciplinares (`themeTags`):** `revolucao-industrial`, `energia`, `sustentabilidade`, `termoquimica`.
  - *História:* Máquinas a vapor de James Watt, ferrovias e Revolução Industrial.
  - *Química:* Termoquímica e poder calorífico de combustíveis fósseis e biocombustíveis.
- **Dinâmica em sala (já implementada):** Quizzes sobre limite de 100% e efeito de aumentar $T_Q$ na área do ciclo; desafio de atingir $\eta > 60\%$ sem passar de $T_Q = 800$ K.

---

### 9. Óptica — Lei de Snell & Reflexão Total — `snell-optics`
- **Status:** Incluído no MVP V1 (`src/data/modules/snell.ts`, id: `snell-01`).
- **Parâmetros da engine:** `n1` (`1.0..2.4`), `n2` (`1.0..2.4`), `ang1` (`0.05..1.48 rad`), `dir` (`-1` ou `+1`).
- **Fórmula central:** $n_1\sin\theta_1 = n_2\sin\theta_2 \;\mid\; \theta_L = \arcsin(n_{\text{menor}}/n_{\text{maior}})$
- **Gancho histórico:** 1621 — Willebrord Snellius (e antes Ibn Sahl em 984) matematizou a refração da luz, princípio hoje essencial para a fibra óptica global.
- **Pergunta de abertura / Armadilha comum:** "Por que uma piscina parece mais rasa?" / Achar que o raio "sumiu" ao atingir o ângulo limite na Reflexão Interna Total (TIR).
- **Mito quebrado & Insight "Aha!":** A luz muda de velocidade ($v = c/n$) ao trocar de meio e desvia; acima do ângulo limite (sempre do meio mais refringente para o menos refringente), 100% da luz é refletida internamente.
- **Cotidiano:** Cabos de fibra óptica da internet, brilho do diamante, miragens no asfalto, endoscopia médica.
- **Pontes interdisciplinares (`themeTags`):** `telecomunicacoes`, `luz-e-visao`, `tecnologia`.
  - *Biologia:* Fisiologia da visão (córnea/cristalino e visão embaçada debaixo d'água).
  - *Geografia:* Cabos submarinos intercontinentais de fibra óptica que conectam a internet global.
- **Dinâmica em sala (já implementada):** Quizzes sobre ar→água e água vs. diamante; desafio de ativar TIR do vidro para o ar (`dir: -1`).

---

### 10. Óptica — Lentes Esféricas (Equação de Gauss) — `thin-lens`
- **Status:** Engine pronta (com drag direto do objeto no Canvas); **falta criar roteiro de aula** (`src/data/modules/thinLens.ts`).
- **Parâmetros da engine:** `f` (`-4.0..4.0 m`, positivo = convergente, negativo = divergente), `p` (`0.6..7.5 m`), `hObj` (`0.5..3.0 m`).
- **Fórmula central:** $\frac{1}{f} = \frac{1}{p} + \frac{1}{p'} \;\mid\; A = \frac{i}{o} = -\frac{p'}{p}$
- **Gancho histórico:** 1609 / 1841 — Galileu aperfeiçoou a luneta combinando lentes para observar as luas de Júpiter; mais tarde, Carl Friedrich Gauss formalizou a óptica paraxial das lentes delgadas usada em câmeras, microscópios e telescópios.
- **Pergunta de abertura:** "Se uma lupa amplia letras pequenas, por que às vezes, quando olhamos por ela para algo distante, o mundo aparece de cabeça para baixo?"
- **Armadilha comum:** Achar que lentes convergentes sempre aumentam e deixam a imagem direita, ou confundir imagem *real* (invertida, projetável numa tela) com imagem *virtual* (direita, vista olhando através da lente).
- **Mito quebrado & Insight "Aha!":** A mesma lente convergente gera comportamentos totalmente diferentes dependendo da posição do objeto em relação ao foco $F$: fora do foco ($p > f$) gera imagem real e invertida; dentro do foco ($p < f$) vira uma lupa (imagem virtual, direita e maior); exatamente no foco ($p = f$) os raios saem paralelos (imagem imprópria). Já a lente divergente ($f < 0$) sempre gera imagem virtual, direita e menor.
- **Cotidiano:** Óculos para miopia ($f < 0$) e hipermetropia ($f > 0$), câmeras de celular, projetores de cinema, lupas, microscópios.
- **Pontes interdisciplinares (`themeTags`):** `saude-visual`, `astronomia`, `fotografia`, `renascimento`.
  - *Biologia:* Anatomia do olho humano, miopia (imagem antes da retina → lente divergente) e hipermetropia (imagem depois da retina → lente convergente).
  - *História:* Revolução Científica — a luneta de Galileu e o microscópio de Robert Hooke/Leeuwenhoek (descoberta das células).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Onde colocar o objeto numa lente convergente ($f = 2\text{ m}$) para usá-la como lupa? (Entre a lente e o foco, $p < 2\text{ m}$).
  - *Quiz Previsão:* Mover `p` de `4.2` (imagem real invertida) para `1.2` mantendo `f = 2.0` (imagem salta para o mesmo lado, virtual, direita e ampliada).
  - *Desafio Coletivo:* "Projetar uma imagem real, invertida e ampliada ($|A| \ge 2$) numa tela de cinema usando lente convergente (`f = 2.0`)" — exige posicionar $p$ entre $f$ e $2f$ (ex.: `f: 2.0, p: 2.8, hObj: 1.2`).

---

### 11. Ondulatória — Efeito Doppler & Cone de Mach — `doppler-wave`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/doppler.ts`).
- **Parâmetros da engine:** `vWave` (`1.5..6.0 m/s`), `vSource` (`0..3.8 m/s`), `f0` (`0.5..4.0 Hz`).
- **Fórmula central:** $v = \lambda f \;\mid\; f_{\text{obs}} = f_0 \frac{v_{\text{onda}}}{v_{\text{onda}} \mp v_{\text{fonte}}} \;\mid\; M = \frac{v_{\text{fonte}}}{v_{\text{onda}}}$
- **Gancho histórico:** 1842 — Christian Doppler propôs o deslocamento de frequência para explicar a cor das estrelas binárias; em 1845, Buys Ballot testou a teoria com trompetistas tocando uma nota fixa em cima de um trem em movimento na Holanda.
- **Pergunta de abertura:** "Quando uma ambulância passa rápido por você, a sirene muda de volume ou muda de tom (mais agudo / mais grave)? Por quê?"
- **Armadilha comum:** Achar que o Efeito Doppler altera a *velocidade* da onda no meio, ou achar que o estrondo sônico só acontece uma única vez quando o avião "quebra" a barreira do som (na verdade o Cone de Mach arrasta o estrondo continuamente).
- **Mito quebrado & Insight "Aha!":** A velocidade da onda no meio (`vWave`) não muda! O que muda é o espaçamento entre as frentes de onda ($\lambda$): na frente da fonte elas se comprimem (frequência maior = som mais agudo), atrás se esticam (frequência menor = som mais grave). Quando $v_{\text{fonte}} \ge v_{\text{onda}}$ ($M \ge 1$), as frentes se empilham formando o **Cone de Mach** (onda de choque).
- **Cotidiano:** Sirenes de ambulância, carros de Fórmula 1, radares de velocidade da polícia, ultrassom Doppler médico (fluxo sanguíneo), *redshift* cosmológico.
- **Pontes interdisciplinares (`themeTags`):** `astronomia`, `medicina`, `aviacao`, `acustica`.
  - *Astronomia / História da Ciência:* Edwin Hubble (1929) usou o desvio para o vermelho (*redshift* — Doppler da luz) para provar que o Universo está em expansão (Big Bang).
  - *Biologia / Medicina:* Ecocardiograma e ultrassom Doppler medindo velocidade do sangue nas artérias e batimentos fetais.
  - *Matemática:* Ponte com `wave-beat` (conceito de frequência, comprimento de onda e velocidade de fase).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* O que acontece com a frequência percebida quando a fonte se aproxima? (Aumenta — som fica mais agudo porque $\lambda$ encurta).
  - *Quiz Previsão:* Subir `vSource` de `1.4` para `3.4` mantendo `vWave = 3.0` — a fonte ultrapassa a própria onda e gera o Cone de Mach ($M > 1$).
  - *Desafio Coletivo:* "Quebrar a barreira do som atingindo regime supersônico ($M > 1{,}2$) sem alterar a frequência da sirene (`f0 = 1.5`)" — escolher `vSource / vWave > 1.2` (ex.: `vWave: 2.4, vSource: 3.4, f0: 1.5`).

---

## C. Física — 3º Ano: Eletromagnetismo & Física Moderna (8 engines)

### 12. Indução Eletromagnética (Faraday-Lenz) — `faraday-induction`
- **Status:** Incluído no MVP V1 (`src/data/modules/faraday.ts`, id: `faraday-01`).
- **Parâmetros da engine:** `N` (`1..6 espiras`), `B` (`0.2..3 T`), `A` (`0.2..3 m²`), `w` (`0.4..4.5 rad/s`).
- **Fórmula central:** $\Phi(t) = BA\cos(\omega t) \;\mid\; \varepsilon(t) = -N\frac{d\Phi}{dt} = NBA\omega\sin(\omega t)$
- **Gancho histórico:** 1831 — Michael Faraday descobriu que apenas a *variação* do fluxo magnético induz corrente elétrica, abrindo caminho para todas as usinas geradoras modernas.
- **Pergunta de abertura / Armadilha comum:** "Um super ímã parado num fio gera energia?" / Achar que campo forte estático gera corrente.
- **Mito quebrado & Insight "Aha!":** Sem variação de fluxo ($\omega = 0$), a tensão é rigorosamente 0 V. A tensão induzida está defasada em $90^\circ$ do fluxo magnético e escala linearmente com $N$, $B$, $A$ e $\omega$.
- **Cotidiano:** Hidrelétricas, usinas eólicas, fogões de indução, carregadores sem fio, dínamos de bicicleta.
- **Pontes interdisciplinares (`themeTags`):** `matriz-energetica`, `segunda-revolucao-industrial`, `sustentabilidade`.
  - *Geografia:* Matriz elétrica brasileira (hidrelétrica/eólica/termelétrica usam Faraday; solar usa `photoelectric`).
  - *História:* 2ª Revolução Industrial e a "Guerra das Correntes" (Tesla/Westinghouse vs. Edison).
- **Dinâmica em sala (já implementada):** Quizzes sobre ímã parado e dobrar $N$; desafio de gerar pico $\varepsilon_{\max} > 12$ V.

---

### 13. Lei de Coulomb & Potencial Elétrico — `coulomb-electrostatics`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/coulomb.ts`).
- **Parâmetros da engine:** `q1` (`-5..5 μC`), `q2` (`-5..5 μC`), `d` (`0.8..6 m`).
- **Fórmula central:** $F = k_0 \frac{|q_1 q_2|}{d^2} \;\mid\; V = k_0 \frac{q}{d}$
- **Gancho histórico:** 1785 — Charles-Augustin de Coulomb usou uma balança de torção ultrassensível para medir a força entre esferas carregadas, revelando que a eletricidade obedece à mesma lei do inverso do quadrado ($1/d^2$) da gravitação de Newton, mas com atração *e* repulsão.
- **Pergunta de abertura:** "Por que, quando você encosta na maçaneta num dia seco, leva um choque, mas um ímã não atrai plástico nem papel picado?"
- **Armadilha comum:** Confundir o sinal do produto $q_1 \cdot q_2$ (negativo = atração; positivo = repulsão) com a intensidade da força, ou achar que dobrar a distância reduz a força apenas pela metade.
- **Mito quebrado & Insight "Aha!":** A força elétrica é absurdamente mais forte que a gravidade na escala atômica (cerca de $10^{39}$ vezes!), e cai rapidamente com $1/d^2$. O sinal das cargas decide se o sistema atrai (sinais opostos) ou repele (sinais iguais).
- **Cotidiano:** Eletricidade estática (choque no carro, cabelo arrepiado), impressoras a laser e fotocopiadoras, pintura eletrostática de carros, filtros precipitadores em chaminés industriais, raios.
- **Pontes interdisciplinares (`themeTags`):** `quimica-atomica`, `eletrostatica`, `industria`, `astronomia`.
  - *Química:* Ligações iônicas (atração $\text{Na}^+\text{Cl}^-$), estrutura do átomo e forças intermoleculares são pura Lei de Coulomb!
  - *Física 1º Ano:* Paralelo direto com `kepler` (ambas seguem $1/d^2$, mas massa só atrai enquanto carga atrai e repele).
  - *Biologia:* Potencial de membrana em neurônios (separação de íons $\text{Na}^+$ e $\text{K}^+$).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Se `q1 = -3 μC` e `q2 = -3 μC`, as cargas se atraem ou se repelem? (Repelem — sinais iguais).
  - *Quiz Previsão:* Reduzir `d` pela metade (de `4.0 m` para `2.0 m`) mantendo cargas fixas multiplica a força por 4.
  - *Desafio Coletivo:* "Criar uma força de **atração** forte sem encostar as cargas (`d >= 1.5 m`) que supere o limiar de intensidade alvo" — exige cargas de sinais opostos e alta magnitude (ex.: `q1: 5, q2: -5, d: 1.5`).

---

### 14. Circuito DC (Carga de Capacitor RC) — `dc-rc`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/dcRc.ts`).
- **Parâmetros da engine:** `V0` (`1..12 V`), `R` (`0.5..10 Ω`), `C` (`0.2..5 F`).
- **Fórmula central:** $\tau = R \cdot C \;\mid\; V_C(t) = V_0\left(1 - e^{-t/\tau}\right) \;\mid\; I(t) = \frac{V_0}{R}e^{-t/\tau}$
- **Gancho histórico:** 1745 — A Garrafa de Leyden (primeiro capacitor da história) permitiu armazenar carga elétrica pela primeira vez, dando origem à eletrônica moderna e aos circuitos temporizadores.
- **Pergunta de abertura:** "Como o flash de uma câmera ou um desfibrilador hospitalar consegue liberar uma descarga gigante de energia usando apenas pilhas comuns?"
- **Armadilha comum:** Achar que o capacitor carrega de forma linear (em linha reta) até $V_0$, ou que a corrente $I(t)$ aumenta conforme o capacitor fica cheio (na verdade $I(t)$ é máxima em $t = 0$ e cai a zero quando ele está carregado).
- **Mito quebrado & Insight "Aha!":** A carga do capacitor é exponencial assintótica: em $1\tau = RC$ ele atinge ~63,2% de $V_0$, e em $5\tau$ está praticamente 99% carregado. Aumentar $R$ ou $C$ deixa o carregamento mais lento; aumentar $V_0$ muda o teto de tensão, mas *não* altera o tempo característico $\tau$.
- **Cotidiano:** Flash fotográfico, desfibriladores cardíacos, telas touchscreen capacitivas, filtros de fonte de carregadores, temporizadores (pisca-alerta).
- **Pontes interdisciplinares (`themeTags`):** `eletronica`, `medicina`, `exponenciais`, `engenharia-eletrica`.
  - *Biologia / Medicina:* Desfibriladores cardíacos e modelo elétrico RC da membrana celular dos neurônios (constante de tempo neuronal).
  - *Matemática:* Curvas exponenciais $1 - e^{-t/\tau}$ e $e^{-t/\tau}$ (ponte com o Backlog de Funções Exponenciais/Logarítmicas e com `radioactive-decay`).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* No instante inicial ($t = 0$) com o capacitor descarregado, a corrente no circuito é máxima ou mínima? (Máxima, $I_0 = V_0/R$).
  - *Quiz Previsão:* Dobrar a resistência `R` (de `2 Ω` para `4 Ω`) mantendo `C` e `V0` dobra a constante de tempo $\tau$ e corta a corrente inicial pela metade.
  - *Desafio Coletivo:* "Calibrar um circuito temporizador de `V0 = 10 V` para carregar devagar com $\tau = 6\text{ s}$ mantendo a corrente inicial segura ($I_0 = V_0/R \le 2{,}5\text{ A}$)" — exige `R >= 4` e `R * C = 6` (ex.: `V0: 10, R: 4, C: 1.5`).

---

### 15. Circuito AC (RLC com Fasores) — `ac-rlc`
- **Status:** Engine pronta (impedância complexa + fasores + senoides); **falta criar roteiro de aula** (`src/data/modules/acRlc.ts`).
- **Parâmetros da engine:** `V0` (`0.5..6 V`), `R` (`0.2..5 Ω`), `L` (`0.1..5 H`), `C` (`0.1..3 F`), `w` (`0.3..5 rad/s`).
- **Fórmula central:** $Z = R + i\left(\omega L - \frac{1}{\omega C}\right) \;\mid\; \omega_0 = \frac{1}{\sqrt{LC}}$
- **Gancho histórico:** 1893 — Charles Proteus Steinmetz revolucionou a engenharia elétrica ao introduzir números complexos (fasores) para resolver circuitos de corrente alternada sem precisar resolver equações diferenciais a cada projeto.
- **Pergunta de abertura:** "Como o rádio do carro ou o Wi-Fi consegue sintonizar uma única estação/canal no meio de milhares de sinais eletromagnéticos passando pelo ar ao mesmo tempo?"
- **Armadilha comum:** Somar $R + X_L + X_C$ aritmeticamente em vez de vetorialmente (no plano complexo), ou achar que tensão e corrente estão sempre em fase em corrente alternada.
- **Mito quebrado & Insight "Aha!":** Indutores atrasam a corrente ($X_L = \omega L$) e capacitores adiantam a corrente ($X_C = 1/\omega C$). Na **frequência de ressonância** ($\omega_0 = 1/\sqrt{LC}$), as duas reatâncias se cancelam ($X_L = X_C$), a impedância cai ao mínimo ($Z = R$), tensão e corrente entram em fase e a corrente atinge o pico máximo!
- **Cotidiano:** Sintonia de rádio AM/FM, filtros de áudio (equalizadores de graves e agudos), carregadores por indução ressonante, redes de distribuição elétrica (correção de fator de potência).
- **Pontes interdisciplinares (`themeTags`):** `telecomunicacoes`, `eletronica`, `numeros-complexos`, `musica-audio`.
  - *Matemática:* Ponte direta e indispensável com `euler-phasor` (fasores $z(t) = r e^{i\omega t}$ no plano de Argand-Gauss) e `complex-sqrt`.
  - *Engenharia / Música:* Filtros passa-baixa / passa-alta em caixas de som (woofers e tweeters).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Quando $X_L = X_C$ (ressonância), a corrente no circuito RLC série é máxima ou mínima? (Máxima, pois $|Z|$ atinge o valor mínimo igual a $R$).
  - *Quiz Previsão:* Aumentar $\omega$ muito acima da ressonância faz qual componente dominar? (O indutor, pois $X_L = \omega L$ cresce enquanto $X_C = 1/\omega C$ diminui → regime indutivo).
  - *Desafio Coletivo:* "Sintonizar o rádio em ressonância exata ($\omega \approx 1/\sqrt{LC}$) para `L = 1.0 H` e `C = 0.25 F`" — exige escolher `w = 2.0 rad/s` (com `R` baixo para pico agudo).

---

### 16. Magnetismo — Força de Lorentz (Movimento Ciclotrônico) — `lorentz-magnetism`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/lorentz.ts`).
- **Parâmetros da engine:** `q` (`-3..3 C`), `m` (`0.5..5 kg`), `v` (`0.5..6 m/s`), `B` (`0.4..4 T`).
- **Fórmula central:** $\vec{F}_B = q(\vec{v} \times \vec{B}) \;\mid\; R_c = \frac{mv}{|q|B} \;\mid\; \omega_c = \frac{|q|B}{m}$
- **Gancho histórico:** 1895 / 1930 — Hendrik Lorentz consolidou a força eletromagnética sobre cargas em movimento; Ernest Lawrence usou esse princípio para inventar o cíclotron, inaugurando a era dos aceleradores de partículas.
- **Pergunta de abertura:** "Por que o campo magnético da Terra consegue desviar partículas mortais do vento solar e criar as Auroras Boreais nos polos?"
- **Armadilha comum:** Achar que o campo magnético acelera a partícula aumentando sua velocidade escalar (como faz o campo elétrico), ou esquecer que cargas de sinais opostos giram em sentidos opostos.
- **Mito quebrado & Insight "Aha!":** Como a Força Magnética é sempre perpendicular à velocidade ($\vec{F}_B \perp \vec{v}$), ela **não realiza trabalho** — nunca muda o módulo de $v$, apenas curva a trajetória num círculo de raio $R_c = mv/(|q|B)$! Inverter o sinal de `q` inverte o sentido da rotação.
- **Cotidiano:** Auroras Boreal e Austral, espectrômetros de massa (análise química/forense), aceleradores de partículas (LHC no CERN), reatores de fusão nuclear (Tokamak).
- **Pontes interdisciplinares (`themeTags`):** `fisica-de-particulas`, `geofisica`, `quimica-analitica`, `astronomia`.
  - *Química:* Espectrometria de massa separa isótopos (ex.: $^{12}\text{C}$ vs. $^{14}\text{C}$) pelo raio $R_c \propto m/|q|$.
  - *Geografia / Astronomia:* Magnetosfera terrestre protegendo a atmosfera do vento solar e gerando auroras polares.
  - *Física 1º Ano:* Ponte com `rotational` (Força de Lorentz atua como força centrípeta).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Se uma carga entra perpendicularmente a um campo magnético uniforme, sua energia cinética aumenta, diminui ou fica constante? (Fica constante — o campo só curva a trajetória).
  - *Quiz Previsão:* Inverter `q` de `+1` para `-1` mantém o mesmo raio, mas inverte o sentido de rotação; dobrar `B` corta o raio pela metade.
  - *Desafio Coletivo:* "Confinar o feixe de íons (`m = 2.0, v = 4.0, q = 2.0`) dentro de uma câmara magnética de raio máximo `R_c <= 1.5 m`" — exige aumentar `B` para pelo menos `2.7 T` (ex.: `B = 3.0 T` → $R_c = 1{,}33\text{ m}$).

---

### 17. Efeito Fotoelétrico (Einstein & Quanta de Luz) — `photoelectric`
- **Status:** Engine pronta (com câmara animada de fótons e elétrons); **falta criar roteiro de aula** (`src/data/modules/photoelectric.ts`).
- **Parâmetros da engine:** `h` (`4.14 eV·fs`, fixo), `phi` (`1.0..5.5 eV`), `fLight` (`0.2..2.0 ×10¹⁵ Hz`).
- **Fórmula central:** $E_{\text{fóton}} = hf \;\mid\; E_{c,\max} = hf - \phi \;\mid\; f_0 = \frac{\phi}{h}$
- **Gancho histórico:** 1905 — No seu *Annus Mirabilis*, Albert Einstein explicou o Efeito Fotoelétrico propondo que a luz viaja em pacotes discretos de energia (fótons), o que lhe rendeu o Prêmio Nobel de Física de 1921 (e não a Relatividade!).
- **Pergunta de abertura:** "Se uma luz vermelha fortíssima não consegue arrancar elétrons de uma placa de metal, aumentar ainda mais o brilho (intensidade) dela vai resolver?"
- **Armadilha comum:** Achar que mais brilho (intensidade) dá mais energia a cada elétron, quando na verdade intensidade aumenta apenas o *número* de fótons, enquanto a *cor/frequência* ($f$) define a energia de cada fóton.
- **Mito quebrado & Insight "Aha!":** Abaixo da frequência de corte $f_0 = \phi/h$, nenhum elétron é ejetado — não importa quão forte seja a luz! Acima de $f_0$, a ejeção é imediata e a energia cinética cresce linearmente com $f$.
- **Cotidiano:** Painéis solares fotovoltaicos, sensores de portas automáticas, câmeras digitais (sensores CMOS/CCD), postes de luz que acendem automaticamente ao anoitecer.
- **Pontes interdisciplinares (`themeTags`):** `energia-solar`, `fisica-quantica`, `sustentabilidade`, `quimica-quantica`.
  - *Geografia / Física 3º Ano:* Ponte direta com `faraday-induction` (matriz energética: geração solar fotovoltaica sem turbinas vs. hidrelétrica/eólica).
  - *Química:* Função trabalho ($\phi$) varia conforme o metal (Césio $\approx 2{,}1$ eV, Sódio $\approx 2{,}3$ eV, Cobre $\approx 4{,}7$ eV) e relação com energia de ionização e espectro eletromagnético.
  - *Biologia:* Por que radiação UV (alta frequência) causa danos ao DNA e queimaduras solares, enquanto ondas de rádio/Wi-Fi (baixa frequência) são não-ionizantes.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Por que a luz ultravioleta arranca elétrons do zinco enquanto uma lâmpada vermelha muito mais brilhante não arranca nenhum? (Energia por fóton depende de $f$, não da intensidade).
  - *Quiz Previsão:* Com Sódio (`phi = 2.3 eV`), comparar `fLight = 0.45` ($hf = 1{,}86\text{ eV} < \phi$, zero elétrons) vs. `fLight = 0.85` ($hf = 3{,}52\text{ eV} > \phi$, elétrons ejetados com $E_c = 1{,}22\text{ eV}$).
  - *Desafio Coletivo:* "Ativar uma célula fotoelétrica de placa de Cobre (`phi = 4.7 eV`) ejetando elétrons com energia cinética $E_c > 1{,}5\text{ eV}$" — exige frequência UV acima de $f = (4{,}7 + 1{,}5)/4{,}14 \approx 1{,}50$ (ex.: `h: 4.14, phi: 4.7, fLight: 1.75`).

---

### 18. Decaimento Radioativo & Meia-Vida — `radioactive-decay`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/radioactiveDecay.ts`).
- **Parâmetros da engine:** `N0` (`2..16 unid.`), `T12` (`0.4..6.0 t`).
- **Fórmula central:** $N(t) = N_0 \cdot 2^{-t / T_{1/2}} = N_0 e^{-\lambda t} \;\mid\; \lambda = \frac{\ln 2}{T_{1/2}}$
- **Gancho histórico:** 1898 / 1949 — Marie e Pierre Curie isolaram o Polônio e o Rádio inaugurando a radioatividade; décadas depois, Willard Libby desenvolveu a datação por Carbono-14 ($T_{1/2} \approx 5730$ anos), revolucionando a Arqueologia.
- **Pergunta de abertura:** "Se uma substância radioativa perde metade dos seus átomos em 2 horas, depois de mais 2 horas ela zera completamente?"
- **Armadilha comum:** Achar que após duas meias-vidas ($2 \cdot T_{1/2}$) resta 0% da amostra (pensamento linear), quando na verdade resta $1/4$ (25%), depois $1/8$ (12,5%), e assim por diante.
- **Mito quebrado & Insight "Aha!":** A meia-vida $T_{1/2}$ é uma constante estatística do isótopo que *não* depende da quantidade inicial $N_0$, nem de temperatura ou pressão. A cada intervalo $T_{1/2}$, a amostra cai sempre à metade do que havia antes.
- **Cotidiano:** Datação de fósseis e artefatos (Carbono-14), medicina nuclear (exames PET-Scan e radioterapia com Tecnécio-99m), gestão de rejeitos de usinas nucleares.
- **Pontes interdisciplinares (`themeTags`):** `arqueologia`, `medicina-nuclear`, `energia-nuclear`, `exponenciais`.
  - *História / Arqueologia:* Datação de pergaminhos, múmias e fósseis humanos via Carbono-14.
  - *Química:* Cinética química de 1ª ordem e radioquímica (isótopos estáveis vs. instáveis).
  - *Biologia / Farmacologia:* Meia-vida biológica de medicamentos no sangue (por que tomar remédio de 8 em 8 horas).
  - *Matemática:* Decaimento exponencial e logaritmos (ponte direta com Backlog Exponencial/Log e `dc-rc`).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Após 3 meias-vidas, qual fração da amostra original ainda permanece radioativa? ($1/2^3 = 1/8 = 12{,}5\%$).
  - *Quiz Previsão:* Dobrar `N0` (de `8` para `16`) mantendo `T12 = 2.0` muda o tempo necessário para a amostra cair à metade? (Não! Continua sendo `2.0`).
  - *Desafio Coletivo:* "Escolher o radioisótopo ideal para um exame médico (`N0 = 16`) que caia para no máximo `2` unidades em até `t = 6` horas (evitando radiação prolongada no paciente)" — exige 3 meias-vidas em 6 h, ou seja, `T12 <= 2.0` (ex.: `N0: 16, T12: 1.6`).

---

### 19. Relatividade Restrita (Fator de Lorentz) — `relativity-lorentz`
- **Status:** Engine pronta; **falta criar roteiro de aula** (`src/data/modules/relativity.ts`).
- **Parâmetros da engine:** `beta` (`0..0.99 v/c`).
- **Fórmula central:** $\gamma(\beta) = \frac{1}{\sqrt{1 - \beta^2}} \;\mid\; \Delta t = \gamma \Delta t_0 \;\mid\; L = \frac{L_0}{\gamma}$
- **Gancho histórico:** 1905 — Albert Einstein publicou a Teoria da Relatividade Restrita partindo de dois postulados simples (constância da velocidade da luz $c$ para todos os observadores), derrubando a ideia newtoniana de tempo e espaço absolutos.
- **Pergunta de abertura:** "Se um astronauta viajar muito perto da velocidade da luz e voltar para a Terra, por que ele estará mais jovem que seu irmão gêmeo?"
- **Armadilha comum:** Achar que os efeitos relativísticos crescem linearmente com a velocidade (na verdade, até $50\%$ da velocidade da luz, $\gamma$ é apenas $1{,}15$ — o salto explosivo acontece acima de $0{,}85c$).
- **Mito quebrado & Insight "Aha!":** O tempo não passa igual para todos os referenciais! A curva $\gamma(\beta)$ tem uma assíntota vertical em $\beta = 1$ ($v = c$): acelerar qualquer objeto com massa até $c$ exigiria energia infinita.
- **Cotidiano:** Correção relativística obrigatória nos satélites de GPS (sem ela o GPS acumularia erros de ~10 km por dia!), múons cósmicos atingindo a superfície da Terra, aceleradores de partículas (LHC).
- **Pontes interdisciplinares (`themeTags`):** `astronomia`, `tecnologia-gps`, `fisica-moderna`, `filosofia-ciencia`.
  - *Física 1º Ano / Geografia:* Ponte com `kepler` (satélites GPS precisam de mecânica orbital + correção relativística de tempo).
  - *Cinema / Cultura:* Viagem interestelar (*Interestelar*), Paradoxo dos Gêmeos.
  - *Matemática:* Assíntotas verticais, domínio de funções com raiz no denominador ($\sqrt{1 - x^2}$) e números complexos se $\beta > 1$ (ponte com `complex-sqrt`).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* A 50% da velocidade da luz (`beta = 0.5`), o tempo passa o dobro mais devagar ($\gamma = 2$)? (Não! $\gamma \approx 1{,}15$; para $\gamma = 2$ é preciso $\beta \approx 0{,}866$).
  - *Quiz Previsão:* Comparar `beta = 0.6` ($\gamma = 1{,}25$) vs. `beta = 0.99` ($\gamma \approx 7{,}09$) — ver o crescimento explosivo perto da assíntota.
  - *Desafio Coletivo:* "Escolher a fração da velocidade da luz `beta` para que 1 ano dentro da nave corresponda a pelo menos 3 anos na Terra ($\gamma \ge 3$)" — exige `beta >= 0.943` (ex.: `beta: 0.95` → $\gamma \approx 3{,}20$).

---

## D. Matemática Pura (5 presets prontos)

### 20. Onda Viajante & Envelope (Funções Trigonométricas) — `wave-beat`
- **Status:** Preset pronto em `mathPresets.ts`; **falta criar roteiro de aula** (`src/data/modules/waveBeat.ts`).
- **Fórmulas do preset:** `y = a * sin(b * x - t)` e `y = a * exp(-0.15 * x^2)`.
- **Parâmetros da engine:** `a` (`0.2..5`), `b` (`0.2..6`).
- **Fórmula central:** $y(x, t) = a\sin(bx - t) \;\mid\; \text{Amplitude} = |a| \;\mid\; \text{Período espacial } \lambda = \frac{2\pi}{b}$
- **Gancho histórico:** 1822 — Joseph Fourier mostrou que qualquer sinal periódico (da voz humana à música e ondas de rádio) pode ser decomposto em somas de senos e cossenos.
- **Pergunta de abertura:** "O que muda visualmente numa onda quando dobramos o número fora do seno ($a$) versus o número dentro do seno ($b$)?"
- **Armadilha comum:** Achar que aumentar `b` *alarga* o período da onda, quando na verdade `b` comprime a onda (mais oscilações no mesmo espaço, $\lambda = 2\pi/b$).
- **Mito quebrado & Insight "Aha!":** O parâmetro externo `a` escala verticalmente (amplitude/volume); o parâmetro interno `b` comprime horizontalmente (frequência espacial/tom); e o termo `- t` desloca a onda para a direita continuamente no tempo.
- **Cotidiano:** Ondas sonoras (volume = amplitude, grave/agudo = frequência), sinais de rádio AM/FM (envelope modulando uma onda portadora), eletrocardiograma, marés.
- **Pontes interdisciplinares (`themeTags`):** `acustica`, `musica-audio`, `telecomunicacoes`, `trigonometria`.
  - *Física 2º Ano:* Ponte direta com `doppler-wave` (ondas viajantes, frequência e comprimento de onda).
  - *Arte / Música:* Notas musicais, oitavas (dobrar $b$) e intensidade sonora (alterar $a$).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Se aumentarmos `b` de `1.0` para `3.0`, o número de cristas visíveis na tela aumenta ou diminui? (Aumenta — a onda fica mais "apertada").
  - *Quiz Previsão:* Zerar ou reduzir `a` encolhe simultaneamente a senoide e o envelope gaussiano.
  - *Desafio Coletivo:* "Calibrar um pulso de áudio que caiba dentro de um teto de volume `a <= 3.0` mas tenha alta frequência espacial ($\lambda \le 1{,}5$, ou seja, `b >= 4.2`)" — ex.: `a: 2.5, b: 4.5`.

---

### 21. Parábola & Reta Secante/Tangente (Quadrática / Intro a Derivada) — `parabola-tangent`
- **Status:** Preset pronto em `mathPresets.ts`; **falta criar roteiro de aula** (`src/data/modules/parabolaTangent.ts`).
- **Fórmulas do preset:** `y = a * x^2 + c` e `y = m * x + k`.
- **Parâmetros da engine:** `a` (`-2..2`), `c` (`-5..5`), `m` (`-4..4`), `k` (`-5..5`).
- **Fórmula central:** $f(x) = ax^2 + c \;\mid\; g(x) = mx + k \;\mid\; \Delta = m^2 - 4a(c - k)$
- **Gancho histórico:** ~1637 / 1670s — René Descartes uniu álgebra e geometria no plano cartesiano, e Newton & Leibniz transformaram o problema geométrico da reta tangente no Cálculo Diferencial (derivadas).
- **Pergunta de abertura:** "Como podemos saber, só olhando a parábola e a reta, se um sistema de equações tem 2 soluções, 1 solução ou nenhuma solução real?"
- **Armadilha comum:** Confundir o papel de `a` (concavidade/abertura) com `c` (deslocamento vertical), ou achar que uma reta tangente "cruza" a parábola em dois pontos muito próximos.
- **Mito quebrado & Insight "Aha!":** As soluções algébricas de $ax^2 + c = mx + k$ são exatamente os pontos de interseção visual! Quando $\Delta > 0$ a reta é **secante** (2 cruzamentos); quando $\Delta = 0$ a reta é **tangente** (toca em 1 único ponto — a inclinação $m$ iguala a derivada $2ax$); quando $\Delta < 0$ não há interseção real (raízes complexas).
- **Cotidiano:** Otimização de lucro/custo (ponto de máximo/mínimo), trajetórias parabólicas, antenas parabólicas, taxa de variação instantânea (velocímetro).
- **Pontes interdisciplinares (`themeTags`):** `geometria-analitica`, `calculo-basico`, `otimizacao`, `cinematica`.
  - *Física 1º Ano:* Ponte direta com `mruv` (posição quadrática + velocidade como reta tangente) e `projectile` (trajetória parabólica).
  - *Economia:* Ponto de equilíbrio (*break-even*) entre receita linear e custo quadrático.
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* O que acontece com a parábola quando `a` muda de `+0.5` para `-0.5`? (A concavidade inverte de cima para baixo).
  - *Quiz Previsão:* Para `a = 0.5, c = 0` ($y = 0{,}5x^2$) e `m = 2`, qual valor de `k` torna a reta exatamente tangente? ($\Delta = 2^2 - 4(0{,}5)(0 - k) = 0 \Rightarrow k = -2$).
  - *Desafio Coletivo:* "Tornar a reta $y = mx + k$ perfeitamente **tangente** à parábola $y = 0{,}5x^2 - 2$ usando inclinação `m = 2`" — exige `k = -4` ($\Delta = 0$, toca em $x = 2, y = 0$).

---

### 22. Região de Desigualdades (Inequações & Programação Linear) — `inequality-region`
- **Status:** Preset pronto em `mathPresets.ts`; **falta criar roteiro de aula** (`src/data/modules/inequalityRegion.ts`).
- **Fórmulas do preset:** `y <= -0.3 * x^2 + 3` e `y > sin(x)`.
- **Parâmetros da engine:** Atualmente `{}` em `engines_registry.json` *(nota técnica: parametrizar coeficientes ao criar o roteiro de aula se quiser sliders dinâmicos no desafio coletivo)*.
- **Fórmula central:** $y \le f(x)$ (fronteira contínua) $\cap\; y > g(x)$ (fronteira tracejada).
- **Gancho histórico:** 1947 — George Dantzig criou o método Simplex para Programação Linear, usando interseções de regiões de desigualdades (região viável) para otimizar logística aérea, rotas e alocação de recursos.
- **Pergunta de abertura:** "Na vida real, quando uma empresa decide quantos produtos fabricar com orçamento e estoque limitados, ela resolve uma igualdade ou um sistema de desigualdades?"
- **Armadilha comum:** Ignorar a diferença entre fronteira incluída (`<=`, `>=` — linha contínua) e fronteira excluída (`<`, `>` — linha tracejada), ou pintar o lado errado da curva.
- **Mito quebrado & Insight "Aha!":** Desigualdades não definem apenas curvas, mas **regiões inteiras de soluções válidas** no plano. A interseção (área sobreposta) é a *região viável* que satisfaz todas as restrições ao mesmo tempo.
- **Cotidiano:** Orçamento financeiro ("gastar no máximo X"), dieta nutricional (mínimo de proteínas e máximo de calorias), logística de entregas, zonas de cobertura de antenas/radares.
- **Pontes interdisciplinares (`themeTags`):** `otimizacao`, `economia`, `logistica`, `pesquisa-operacional`.
  - *Geografia / Economia:* Logística de transportes, alocação de recursos e planejamento urbano (zoneamento).
  - *Computação:* Colisão de hitboxes em jogos 2D e classificação em Machine Learning (hiperplanos separando regiões).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Um ponto exatamente em cima de uma linha **tracejada** (`y > sin(x)`) faz parte da solução? (Não — apenas desigualdades com `=` incluem a borda).
  - *Quiz Previsão:* Testar um ponto $(0, 2)$ no sistema atual ($2 \le 3$ verdadeiro e $2 > \sin(0) = 0$ verdadeiro → dentro da região viável!).
  - *Desafio Coletivo:* "Escolher o par de coordenadas $(x, y)$ (ou o conjunto de restrições) que cai estritamente dentro da região viável sem violar nenhuma fronteira."

---

### 23. Fórmula de Euler & Fasores em $\mathbb{C}$ — `euler-phasor`
- **Status:** Preset pronto em `mathPresets.ts`; **falta criar roteiro de aula** (`src/data/modules/eulerPhasor.ts`).
- **Fórmulas do preset:** `z(t) = r * e^(i * w * t)`, `z(t) = r * e^(i * w * t) + 0.6 * e^(i * 3 * w * t)` e `y = r * e^(i * x)`.
- **Parâmetros da engine:** `r` (`0.5..4`), `w` (`0.2..5 rad/s`).
- **Fórmula central:** $e^{i\theta} = \cos\theta + i\sin\theta \;\mid\; z(t) = r e^{i\omega t} \;\mid\; e^{i\pi} + 1 = 0$
- **Gancho histórico:** 1748 — Leonhard Euler publicou a fórmula que unifica exponenciais, trigonometria e números imaginários — frequentemente eleita a equação mais bela da matemática ($e^{i\pi} + 1 = 0$).
- **Pergunta de abertura:** "O que uma exponencial ($e^x$) tem a ver com um círculo girando e com ondas de rádio?"
- **Armadilha comum:** Achar que multiplicar por $e^{i\theta}$ "aumenta" o tamanho do número (como $e^x$ real), quando na verdade multiplicar por $e^{i\theta}$ realiza uma **rotação pura** de ângulo $\theta$ sem alterar o módulo!
- **Mito quebrado & Insight "Aha!":** O expoente imaginário não cresce ao infinito — ele gira em círculo no plano complexo! E somar fasores com frequências múltiplas ($\omega$ e $3\omega$) cria epiciclos (a base visual das Séries de Fourier).
- **Cotidiano:** Engenharia elétrica AC (fasores), processamento de sinais (MP3, JPEG, 5G — Transformada de Fourier), computação gráfica (rotações 2D), mecânica quântica (funções de onda).
- **Pontes interdisciplinares (`themeTags`):** `numeros-complexos`, `telecomunicacoes`, `sinais-e-sistemas`, `eletronica`.
  - *Física 3º Ano:* Ponte direta com `ac-rlc` (fasores de tensão e corrente em circuitos AC).
  - *Física 1º Ano:* Ponte com `rotational` (movimento circular uniforme descrito por $z(t) = r e^{i\omega t}$).
  - *Computação:* Compressão de áudio/imagem via FFT (Fast Fourier Transform).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Quando $\omega t = \pi$ ($180^\circ$), onde aponta o vetor $z(t) = 2 e^{i\pi}$ no plano de Argand-Gauss? (Em $-2$ no eixo Real, pois $e^{i\pi} = -1$).
  - *Quiz Previsão:* Dobrar `w` de `1.0` para `2.0` mantendo `r = 2.0` altera o raio do círculo? (Não — o círculo mantém raio 2, mas o fasor gira duas vezes mais rápido).
  - *Desafio Coletivo:* "Sincronizar o fasor para completar exatamente 1 volta a cada ~2 segundos ($\omega \approx \pi \approx 3{,}1\text{ rad/s}$) com módulo `r = 3.0`."

---

### 24. Raiz Complexa & Plano de Argand-Gauss — `complex-sqrt`
- **Status:** Preset pronto em `mathPresets.ts`; **falta criar roteiro de aula** (`src/data/modules/complexSqrt.ts`).
- **Fórmulas do preset:** `y = √(x)` e `z = a + b * i`.
- **Parâmetros da engine:** `a` (`-5..5 Re`), `b` (`-5..5 Im`).
- **Fórmula central:** $z = a + bi \;\mid\; |z| = \sqrt{a^2 + b^2} \;\mid\; \theta = \text{atan2}(b, a) \;\mid\; \sqrt{-k} = i\sqrt{k}$
- **Gancho histórico:** 1545 / 1799 — Rafael Bombelli e Gerolamo Cardano toparam com raízes de números negativos ao resolver equações cúbicas; mais tarde, Caspar Wessel, Jean-Robert Argand e Carl Friedrich Gauss deram aos complexos uma casa geométrica: o plano 2D ($\text{Re} \times \text{Im}$).
- **Pergunta de abertura:** "Se na escola nos disseram que 'não existe raiz quadrada de número negativo', por que o número $i$ é usado hoje em celulares, radares e mecânica quântica?"
- **Armadilha comum:** Achar que números "imaginários" não existem na realidade (o nome foi uma piada histórica de Descartes!), ou esquecer que multiplicar por $i$ equivale geometricamente a girar $90^\circ$ no sentido anti-horário.
- **Mito quebrado & Insight "Aha!":** A reta real é apenas 1D; ao adicionar o eixo imaginário perpendicular, ganhamos uma segunda dimensão onde $\sqrt{x}$ continua existindo perfeitamente para $x < 0$ (curva pontilhada $\text{Im}(\sqrt{x})$). O módulo $|z|$ é simplesmente a hipotenusa de Pitágoras no plano complexo!
- **Cotidiano:** Circuitos AC (`ac-rlc`), fractais (Conjunto de Mandelbrot), controle de drones e aviões (polos complexos de estabilidade), física quântica.
- **Pontes interdisciplinares (`themeTags`):** `numeros-complexos`, `geometria-analitica`, `eletronica`, `historia-matematica`.
  - *História da Matemática:* Os duelos públicos de equações cúbicas na Itália Renascentista (Tartaglia, Cardano, Bombelli).
  - *Física 3º Ano:* Ponte com `ac-rlc` (impedância $Z = R + iX$) e `relativity-lorentz` (o que ocorre matematicamente se $v > c$ dentro de $\sqrt{1 - \beta^2}$).
- **Ideias de Quiz & Desafio Coletivo:**
  - *Quiz Intuição:* Quanto vale $\sqrt{-9}$ no conjunto dos números complexos? ($3i$ — parte real $0$, parte imaginária $3$).
  - *Quiz Previsão:* Posicionar `a = 3, b = 4` gera um vetor no 1º quadrante com módulo exato $|z| = 5$ (triângulo pitagórico 3-4-5).
  - *Desafio Coletivo:* "Posicionar o vetor $z = a + bi$ no **2º quadrante** (`a < 0, b > 0`) com módulo exato $|z| = 5$" — exige `a = -3, b = 4` ou `a = -4, b = 3`.

---

## E. Backlog Matemática (3 novas engines/presets futuros)

### B1. Funções Exponenciais & Logarítmicas (Juros Compostos & Crescimento Populacional)
- **Id sugerido:** `exp-log-growth`
- **Parâmetros sugeridos:** `P0` (valor/população inicial), `r` (taxa de crescimento/juros), `K` (capacidade de suporte para curva logística, opcional).
- **Fórmulas:** $P(t) = P_0(1 + r)^t \;\mid\; P(t) = P_0 e^{rt} \;\mid\; t_{\text{dobra}} = \frac{\ln 2}{r}$
- **Contexto pedagógico:** Contrastar crescimento linear vs. exponencial ("efeito bola de neve" de juros compostos no cartão de crédito vs. investimentos de longo prazo; espalhamento de epidemias $R_0$; escala Richter e decibéis para logaritmos).
- **Pontes com o sistema atual:** Conexão direta com `radioactive-decay` (decaimento exponencial) e `dc-rc` (carga exponencial de capacitor).

### B2. Estatística, Regressão Linear & Correlação
- **Id sugerido:** `linear-regression`
- **Parâmetros sugeridos:** Pontos arrastáveis $(x_i, y_i)$ ou presets de dispersão + ruído `noise` + inclinação real `slope` + outlier toggle.
- **Fórmulas:** $\hat{y} = ax + b \;\mid\; r = \text{Correlação de Pearson} \;\mid\; R^2$
- **Contexto pedagógico:** Mostrar visualmente o método dos mínimos quadrados (quadrados dos resíduos), a sensibilidade da média e da reta a *outliers* e o clássico mito "correlação não implica causalidade".
- **Pontes interdisciplinares:** Ciência de Dados/IA, Economia, Biologia (crescimento vs. nutrientes) e Geografia (IDH vs. expectativa de vida).

### B3. Matrizes & Transformações Lineares 2D
- **Id sugerido:** `matrix-transform-2d`
- **Parâmetros sugeridos:** `a11`, `a12`, `a21`, `a22` (entradas da matriz $2 \times 2$ aplicadas sobre a grade e os vetores base $\hat{i}, \hat{j}$).
- **Fórmulas:** $T(\vec{v}) = \begin{pmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{pmatrix}\vec{v} \;\mid\; \det(A) = a_{11}a_{22} - a_{12}a_{21}$
- **Contexto pedagógico:** Dar significado geométrico a matrizes: rotação, escala, cisalhamento (*shear*), reflexão e o que significa $\det(A) = 0$ (colapso de área para uma reta) ou $\det(A) < 0$ (inversão de orientação).
- **Pontes interdisciplinares:** Computação gráfica (Motores 2D/3D, shaders), Robótica e ponte com `euler-phasor` (matriz de rotação vs. multiplicação por $e^{i\theta}$).

---

## F. Sugestões de Trilhas Interdisciplinares (Playlists V2)

Para aproveitar o `InterdisciplinaryPlaylistSchema` (`src/classroom/schemas.ts`), estas 5 trilhas conectam módulos já mapeados:

1. **Trilha "Da Terra às Estrelas" (Corrida Espacial & GPS):**
   `projectile` → `rotational` → `kepler` → `relativity-lorentz`
2. **Trilha "A Revolução da Energia" (Sustentabilidade & Matriz Elétrica):**
   `energy-conservation` → `ideal-gas` → `faraday-induction` → `photoelectric`
3. **Trilha "Luz, Som & Internet" (Ondas & Telecomunicações):**
   `wave-beat` → `doppler-wave` → `snell-optics` → `thin-lens`
4. **Trilha "A Matemática Secreta da Eletricidade" (Complexos & Circuitos):**
   `complex-sqrt` → `euler-phasor` → `dc-rc` → `ac-rlc`
5. **Trilha "Do Movimento ao Cálculo" (Cinemática & Funções):**
   `mruv` → `parabola-tangent` → `inclined-plane` → `energy-conservation`
