# Skewb

O Skewb varrido inteiro, em JavaScript puro, sem dependência nenhuma.

Um cubo cortado por quatro planos que passam pelo centro, cada um perpendicular a uma diagonal. Cada giro roda metade do cubo 120 graus em volta de uma diagonal: um canto, os três cantos vizinhos dele e os três centros das faces que encostam nele.

**Página jogável:** <https://condedeveloper.github.io/skewb/>

---

## Os quatro achados

**1. Onze giros bastam, e só 90 posições precisam de onze.** A busca em largura passa pelas **3.149.280 posições** do Skewb. Nenhuma está a mais de **11 giros** do resolvido; **90** estão a exatamente 11; e quase metade, **46,23%**, está a 9.

**2. Os três pedaços sozinhos dão exatamente três vezes o Skewb.** Os seis centros chegam a **360** arranjos. Os quatro cantos dos eixos nunca saem do lugar, só torcem, e chegam às **81** torções. Os outros quatro cantos chegam a **324** combinações de lugar e torção. O produto é 9.447.840, **três vezes** o número de posições: uma regra de torção amarra os cantos que giram aos que andam. Os centros ficam de fora dela: com os cantos todos no lugar, eles ainda chegam aos 360 arranjos, e resolver só os centros pede até 10 giros. Com os centros no lugar, os cantos têm 8.748 arranjos e pedem até 11.

**3. Até quatro giros nada se repete; no quinto faltam 120.** Contando que dois giros seguidos no mesmo eixo são um só, há 8 × 6^(d−1) sequências de d giros. Até d = 4 cada uma dá uma posição diferente (8, 48, 288, 1.728). No quinto giro aparecem as primeiras coincidências: 10.248 posições em vez de 10.368.

**4. Duas geometrias e duas buscas concordam em cada uma das 3.149.280 posições.** O núcleo gira com matrizes inteiras de sinal e permutação e busca sobre coordenadas, num `Uint8Array` de 113 milhões de casas. O juiz tira a rotação da fórmula de Rodrigues, em ponto flutuante, e busca sobre o texto das 30 cores num `Map`. A distância de cada posição é a mesma nos dois. E o IDA* da página, que resolve sem a tabela grande, acha o ótimo nas 90 antípodas e em 300 embaralhados.

---

## As tabelas

Todos os números abaixo saem de `node ferramentas/medidor.js` e estão presos em `testes/`. Nenhum foi digitado à mão.

### Posições por distância

| giros | posições | fração |
| --- | --- | --- |
| 0 | 1 | |
| 1 | 8 | |
| 2 | 48 | |
| 3 | 288 | 0,01% |
| 4 | 1.728 | 0,05% |
| 5 | 10.248 | 0,33% |
| 6 | 59.304 | 1,88% |
| 7 | 315.198 | 10,01% |
| 8 | 1.225.483 | 38,91% |
| 9 | **1.455.856** | **46,23%** |
| 10 | 81.028 | 2,57% |
| 11 | **90** | |
| total | **3.149.280** | |

### Os pedaços

| pedaço | arranjos alcançados | de quantos possíveis na coordenada |
| --- | --- | --- |
| centros | 360 | 720 (as permutações de 6) |
| cantos dos eixos (só torcem) | 81 | 81 |
| os outros cantos (andam e torcem) | 324 | 1.944 (24 lugares × 81 torções) |
| produto | 9.447.840 | = 3 × 3.149.280 |

| com o resto no lugar | arranjos | pior caso |
| --- | --- | --- |
| só os centros fora | 360 | 10 giros |
| só os cantos fora | 8.748 | 11 giros |

---

## Como funciona

**A geometria** é a de verdade. Os cantos são os vértices (±1, ±1, ±1) e os centros as seis normais das faces; cada adesivo é um par (posição da peça, normal do adesivo), 24 de canto e 6 de centro. Um giro em volta do canto `a` leva os adesivos com `posição · a > 0` pela rotação `R = D P D`, com `D = diag(a)` e `P` rodando as coordenadas `(x, y, z) → (z, x, y)`. Os giros são em volta dos quatro cantos com número par de sinais negativos: girar o canto oposto é o mesmo que girar este e rodar o cubo inteiro, então, com o cubo parado no espaço, quatro eixos bastam.

**A busca** anda sobre três coordenadas que não se misturam: os centros, a torção dos cantos dos eixos e lugar e torção dos outros cantos. As tabelas de transição de cada uma saem de uma busca sobre adesivos, e a busca do cubo inteiro usa só as tabelas.

**O IDA* da página** poda com a distância exata de cada pedaço sozinho (os centros, 720 casas; os cantos juntos, 81 × 1.944). Um pedaço nunca se resolve em menos giros que o cubo inteiro, então o maior dos dois é um limite de baixo honesto, e o caminho que sai é ótimo.

---

## O que as medidas me corrigiram

Nada quebrou. As duas geometrias deram as mesmas oito permutações na primeira rodada, as duas buscas a mesma distribuição, e o IDA* bateu com a tabela em todos os casos conferidos.

---

## Como rodar

Precisa de Node 20 ou mais novo. Sem dependência nenhuma.

```bash
npm test                                  # a suíte inteira (o juiz leva uns minutos)
npm run medir                             # as tabelas rápidas
node --max-old-space-size=4096 ferramentas/medidor.js juiz   # o juiz posição por posição
```

## Licença

MIT
