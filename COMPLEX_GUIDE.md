# Guia de Números Complexos — MathSimulator

O MathSimulator suporta números complexos nativamente usando a unidade imaginária **`i`** ($i^2 = -1$) e combina **dois modos visuais** no mesmo plano, detectados automaticamente pela notação da fórmula.

---

## Modo 1 — Funções `y = f(x)` com saída complexa (`f(x) → ℂ`)

Use `y = ...` (ou escreva a expressão direto) quando quiser ver como uma função real se comporta ao gerar valores complexos:

- **Linha contínua**: parte **Real** `Re(f(x))`
- **Linha pontilhada**: parte **Imaginária** `Im(f(x))`
- **Inspetor (hover)**: exibe `Re ± Im·i`, o módulo `|z|` e o ângulo `θ` em graus.

### Exemplos para testar
- `y = √(x)` — para `x ≥ 0` aparece a curva real contínua; para `x < 0` surge a curva imaginária pontilhada!
- `y = e^(i * x)` — identidade de Euler ($e^{ix} = \cos x + i\sin x$): mostra o cosseno contínuo e o seno pontilhado ao mesmo tempo.
- `y = log(x)` — logaritmo no lado negativo com parte imaginária constante igual a `π`.

---

## Modo 2 — Plano Complexo / Argand-Gauss (`z = ...` ou `z(t) = ...`)

Comece a fórmula com **`z =`** ou **`z(t) =`** para plotar diretamente no plano complexo (**eixo horizontal = `Re`**, **eixo vertical = `Im`**):

- **Número fixo ou com sliders** (sem `t`): desenha o **vetor (fasor)** da origem até `(Re, Im)` com projeções nos eixos.
  - Ex: `z = a + b * i`
  - Ex: `z = r * e^(i * θ)` (cria sliders para `r` e `θ`)
- **Trajetória animada** (com `t`): desenha o **rastro da curva** no plano complexo **e** o vetor girando em tempo real na posição `z(t)`.
  - Ex: `z = e^(i * t)` (círculo unitário)
  - Ex: `z = e^(i * t) + 0.5 * e^(3 * i * t)` (epiciclo / soma de fasores)
  - Ex: `z = (0.3 * t) * e^(i * 2 * t)` (espiral)

---

## Funções úteis para complexos

- `re(z)` — parte real
- `im(z)` — parte imaginária
- `abs(z)` — módulo $|z|$
- `arg(z)` — argumento (ângulo em radianos)
- `conj(z)` — conjugado complexo $\bar{z}$
