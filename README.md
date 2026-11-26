<div align="center">

# ∫ MathSimulator

**Simulador interativo de Matemática Pura e Laboratório de Física (1º, 2º e 3º Ano)**  
*Construído sobre uma única engine matemática 100% client-side com renderização HiDPI em 60fps.*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=0b1120)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![mathjs](https://img.shields.io/badge/mathjs-13-10B981?style=flat-square)
![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX-38BDF8?style=flat-square)

</div>

---

## ✨ Visão Geral

O **MathSimulator** une um plotter interativo estilo Desmos com um **Laboratório de Física separado por série escolar**, garantindo progressão didática adequada para cada etapa — tudo alimentado pela mesma engine matemática (`src/engine/`).

- **Tela Inicial Modular**: escolha entre **Matemática Pura** (exploração livre) ou **Laboratório de Física** dividido em **1º Ano**, **2º Ano** e **3º Ano**.
- **Engine Matemática Unificada**: `mathjs` compilado + preview em **KaTeX**, detecção automática de parâmetros/sliders, controle global de tempo `t`, variáveis auxiliares encadeadas e suporte nativo a números complexos (`ℂ`).
- **Teoria Viva**: cada experimento de Física traz abas **`Simulação`** e **`Teoria & Cenários`**, com equações, unidades no SI, pegadinhas comuns e **botões de 1 clique** que configuram os sliders automaticamente.

---

## 🧮 Frente 1 — Matemática Pura

| Recurso | Exemplos de Sintaxe |
| :--- | :--- |
| **Funções 2D & Tempo `t`** | `y = a * sin(b * x - t)` |
| **Desigualdades & Áreas** | `y >= sin(x)`, `y < -0.3*x^2 + 3`, `x > 2` (fronteira tracejada/contínua) |
| **Complexos — Modo 1 (`f(x) → ℂ`)** | `y = √(x)`, `y = e^(i * x)` (`Re` contínua + `Im` pontilhada) |
| **Complexos — Modo 2 (Argand-Gauss)** | `z = a + b*i`, `z(t) = r * e^(i * w * t)` (fasores e trajetórias) |
| **Curvas Paramétricas 2D** | `p(t) = (v0 * cos(ang) * t, v0 * sin(ang) * t - 0.5 * g * t^2)` |
| **Variáveis Auxiliares Encadeadas** | `Z = R + i * (w * L - 1 / (w * C))` (com telemetria ao vivo) |
| **Teclado Rápido & Compartilhamento** | `π`, `e`, `i`, `τ`, `φ`, `√`, `∛`, `<`, `>`, `≤`, `≥`, `localStorage` e link via URL |

> 📘 Veja o guia completo de complexos em [COMPLEX_GUIDE.md](./COMPLEX_GUIDE.md).

---

## ⚛️ Frente 2 — Laboratório de Física (19 Experimentos)

### 1º Ano — Mecânica Clássica
- **MU & MUV**: `s(t)` e `v(t)` sincronizados com partícula no instante `t`.
- **Lançamento Oblíquo (Projétil 2D)**: canhão inclinado, vetor velocidade, $H_{\max}$ e alcance $R$.
- **Movimento Rotacional (MCU / MCUV)**: disco giratório, arco $\theta(t)$, velocidade tangencial $\vec{v}$ e centrípeta $\vec{a}_c$.
- **Plano Inclinado & Atrito**: bloco deslizando fisicamente na rampa com forças $\vec{P}$, $\vec{N}$ e $\vec{f}_{at}$.
- **Conservação de Energia Mecânica**: poço parabólico com barras ao vivo de $E_c$, $E_p$ e $E_m$.
- **Hidrostática (Stevin & Empuxo Dinâmico)**: queda/oscilação amortecida no tanque, nível d'água dinâmico e vetores $\vec{P}$ e $\vec{E}$.
- **Órbitas de Kepler**: Sol no foco, periélio/afélio e transição círculo → elipse → parábola → hipérbole.

### 2º Ano — Termologia, Óptica & Ondulatória
- **Gases Ideais & Ciclo de Carnot**: pistão térmico animado com partículas de gás sincronizado ao diagrama $P \times V$ e rendimento $\eta = 1 - T_F/T_Q$.
- **Lei de Snell & Reflexão Total**: arraste o laser direto no Canvas (Cima→Baixo ou Baixo→Cima) com pulsos luminosos ($c/n$) e cone crítico $\theta_L$.
- **Lentes Esféricas (Gauss & Modo Lupa)**: arraste o objeto direto no Canvas para ver raios reais/virtuais e aumento $A$.
- **Ondulatória & Efeito Doppler**: frentes de onda circulares animadas e **Cone de Mach** supersônico.

### 3º Ano — Eletromagnetismo & Física Moderna
- **Lei de Coulomb & Potencial Elétrico**: curva $1/r^2$ + diagrama dinâmico de atração/repulsão.
- **Circuito DC (RC)**: esquema SVG animado com capacitor carregando e marcação de $\tau = RC$.
- **Circuito AC (RLC)**: impedância complexa $Z$, esquema SVG (Indutivo / Capacitivo / Ressonância), fasores e senoides defasadas.
- **Força de Lorentz**: campo `⊗` e órbita ciclotrônica que inverte sentido conforme o sinal de $q$.
- **Indução de Faraday-Lenz**: $\Phi(t)$ e $\varepsilon(t)$ + gerador animado com espira 2.5D e lâmpada pulsando.
- **Efeito Fotoelétrico**: fótons coloridos conforme a frequência $f$ e emissão de elétrons acima de $f_0$.
- **Decaimento Radioativo (Meia-Vida)** & **Relatividade Restrita ($\gamma(v/c)$)**.

> 📋 Lista detalhada de recursos e roadmap (Fase 3: EDOs/RK4, Campos Vetoriais e Domain Coloring) em [FEATURES.md](./FEATURES.md).

---

## 🏗️ Arquitetura do Projeto

```text
src/
├── engine/                       # Engine matemática única (parser, evaluator, viewport)
├── components/                   # GraphCanvas, HomePage, FormulaSidebar, Sliders, TimeControls
├── modules/
│   ├── math/                     # Frente 1: Matemática Pura & Complexos
│   └── physics/                  # Frente 2: Laboratório de Física
│       ├── curriculum/           # year1.ts, year2.ts, year3.ts
│       ├── components/           # TheoryPanel.tsx (teoria viva + cenários)
│       └── visuals/              # canvasOverlays.ts, CircuitSchematic.tsx, PhysicsVisualCard.tsx
└── state/                        # Persistência em localStorage e URL hash
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** 18+ e **npm**

### Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/maripagan/math-simm.git
cd math-simm

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra o endereço exibido pelo Vite no navegador (geralmente `http://localhost:5173`).

### Build de Produção

```bash
npm run build
npm run preview
```
