// O nucleo do Skewb. ESM puro, sem DOM.
//
// O Skewb e um cubo cortado por quatro planos que passam pelo centro, cada um
// perpendicular a uma diagonal. Cada giro roda METADE do cubo 120 graus em
// volta de uma diagonal: um canto, os tres cantos vizinhos dele e os tres
// centros das faces que encostam nele.
//
// A geometria aqui e a de verdade, com vetores. Os cantos sao os 8 vertices
// (+-1, +-1, +-1); os centros sao as 6 normais das faces. Cada adesivo e um
// par (posicao da peca, normal do adesivo): 8 cantos x 3 adesivos + 6 centros
// = 30 adesivos. Um giro em volta do canto a leva os adesivos com posicao . a
// > 0 pela rotacao R_a = D P D, onde D = diag(a) e P roda as coordenadas
// (x, y, z) -> (z, x, y). R_a fixa a, tem determinante 1 e ordem 3.
//
// Os giros sao em volta dos quatro cantos do tetraedro com numero par de
// sinais negativos. Girar em volta do canto oposto e o mesmo que girar este e
// rodar o cubo inteiro, entao com o cubo parado no espaco quatro eixos bastam.

export const EIXOS = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]
export const CORES = ['+x', '-x', '+y', '-y', '+z', '-z']

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

// Os 30 adesivos, na ordem: 24 de canto (canto c, eixo k) e 6 de centro.
export const ADESIVOS = (() => {
  const r = []
  for (let c = 0; c < 8; c++) {
    const v = [c & 1 ? -1 : 1, c & 2 ? -1 : 1, c & 4 ? -1 : 1]
    for (let k = 0; k < 3; k++) {
      const n = [0, 0, 0]
      n[k] = v[k]
      r.push({ pos: v, normal: n })
    }
  }
  for (let f = 0; f < 6; f++) {
    const n = [0, 0, 0]
    n[f >> 1] = f & 1 ? -1 : 1
    r.push({ pos: n, normal: n })
  }
  return r
})()

const chave = (p, n) => p.join(',') + '|' + n.join(',')
const INDICE = new Map(ADESIVOS.map((s, i) => [chave(s.pos, s.normal), i]))

// A cor de um adesivo no cubo resolvido: a face para onde a normal aponta.
export const corResolvida = (s) => {
  const k = s.normal.findIndex((x) => x !== 0)
  return 2 * k + (s.normal[k] < 0 ? 1 : 0)
}
export const RESOLVIDO = ADESIVOS.map(corResolvida)

function rodar (a, p, vezes) {
  let q = p
  for (let t = 0; t < vezes; t++) {
    const d = [a[0] * q[0], a[1] * q[1], a[2] * q[2]]
    const r = [d[2], d[0], d[1]]
    q = [a[0] * r[0], a[1] * r[1], a[2] * r[2]]
  }
  return q
}

// Os 8 giros: eixo e (0..3), sentido s (1 ou 2 tercos de volta). Cada giro e
// uma permutacao dos 30 adesivos: para[i] = onde vai parar o adesivo i.
export const GIROS = []
for (let e = 0; e < 4; e++) {
  for (const s of [1, 2]) {
    const para = ADESIVOS.map((st, i) => {
      if (dot(st.pos, EIXOS[e]) <= 0) return i
      return INDICE.get(chave(rodar(EIXOS[e], st.pos, s), rodar(EIXOS[e], st.normal, s)))
    })
    GIROS.push({ eixo: e, sentido: s, para })
  }
}

// Aplica um giro a um estado (estado[i] = cor do adesivo na casa i).
export function gira (estado, g) {
  const r = new Array(estado.length)
  const para = GIROS[g].para
  for (let i = 0; i < estado.length; i++) r[para[i]] = estado[i]
  return r
}

export const resolvido = (estado) => estado.every((c, i) => c === RESOLVIDO[i])

// ---------------------------------------------------------------------------
// As coordenadas. Tres pedacos que se movem sem se misturar:
//
//   centros   qual centro esta em cada face: uma permutacao de 6 (720)
//   giram     os 4 cantos do tetraedro dos eixos: nunca saem do lugar, so
//             torcem, e cada um so e torcido pelo giro em volta dele (81)
//   andam     os outros 4 cantos: trocam de lugar e torcem (24 x 81)
//
// A torcao de um canto e o eixo (0, 1 ou 2) da casa onde esta o adesivo da
// peca que tem cor de face x. Toda peca de canto tem exatamente um.

const CANTOS_EIXO = [0, 3, 5, 6] // indices dos vertices com numero par de negativos
const CANTOS_ANDAM = [1, 2, 4, 7]
const corDeX = (c) => c < 2

function rankPerm (p) {
  let r = 0
  const n = p.length
  for (let i = 0; i < n; i++) {
    let menores = 0
    for (let j = i + 1; j < n; j++) if (p[j] < p[i]) menores++
    r = r * (n - i) + menores
  }
  return r
}

// A peca de canto pela cor: o conjunto das 3 cores, como numero.
const assinatura = (cs) => cs.slice().sort().join('')
const PECA = new Map()
for (let c = 0; c < 8; c++) PECA.set(assinatura([0, 1, 2].map((k) => RESOLVIDO[3 * c + k])), c)

export function coordenadas (estado) {
  const centros = []
  for (let f = 0; f < 6; f++) centros.push(estado[24 + f])
  let gTorcao = 0
  for (const c of CANTOS_EIXO) {
    const cs = [0, 1, 2].map((k) => estado[3 * c + k])
    gTorcao = gTorcao * 3 + cs.findIndex(corDeX)
  }
  const perm = []
  let aTorcao = 0
  for (const c of CANTOS_ANDAM) {
    const cs = [0, 1, 2].map((k) => estado[3 * c + k])
    perm.push(CANTOS_ANDAM.indexOf(PECA.get(assinatura(cs))))
    aTorcao = aTorcao * 3 + cs.findIndex(corDeX)
  }
  return { centros: rankPerm(centros), giram: gTorcao, andam: rankPerm(perm) * 81 + aTorcao }
}

export const TAM = { centros: 720, giram: 81, andam: 24 * 81 }

// As tabelas de transicao de cada coordenada: tab[valor * 8 + giro]. Saem de
// uma busca sobre adesivos, guardando um estado de exemplo para cada valor
// novo de cada coordenada. Os pedacos nao se misturam, entao o valor da
// coordenada depois do giro so depende do valor antes.
export function tabelas () {
  const tab = {}
  for (const nome of Object.keys(TAM)) {
    const t = new Int32Array(TAM[nome] * 8).fill(-1)
    const exemplo = new Map([[coordenadas(RESOLVIDO)[nome], RESOLVIDO]])
    let fila = [RESOLVIDO]
    while (fila.length) {
      const prox = []
      for (const e of fila) {
        const v = coordenadas(e)[nome]
        for (let g = 0; g < 8; g++) {
          const f = gira(e, g)
          const w = coordenadas(f)[nome]
          t[v * 8 + g] = w
          if (!exemplo.has(w)) { exemplo.set(w, f); prox.push(f) }
        }
      }
      fila = prox
    }
    tab[nome] = { t, alcancados: exemplo.size }
  }
  return tab
}

// A busca em largura do Skewb inteiro, sobre as tres coordenadas juntas. O
// indice e centros * (81 * 1944) + giram * 1944 + andam: 113.374.080 casas
// num Uint8Array, das quais a busca acha as que existem.
export function largura (tab = tabelas()) {
  const NA = TAM.andam
  const NG = TAM.giram
  const total = TAM.centros * NG * NA
  const dist = new Uint8Array(total).fill(255)
  const c0 = coordenadas(RESOLVIDO)
  const ini = (c0.centros * NG + c0.giram) * NA + c0.andam
  dist[ini] = 0
  let fila = new Uint32Array([ini])
  const porDistancia = [1]
  for (let d = 1; fila.length; d++) {
    const prox = []
    for (const k of fila) {
      const a = k % NA
      const g = Math.floor(k / NA) % NG
      const c = Math.floor(k / (NA * NG))
      for (let m = 0; m < 8; m++) {
        const n = (tab.centros.t[c * 8 + m] * NG + tab.giram.t[g * 8 + m]) * NA + tab.andam.t[a * 8 + m]
        if (dist[n] === 255) { dist[n] = d; prox.push(n) }
      }
    }
    if (prox.length) porDistancia.push(prox.length)
    fila = Uint32Array.from(prox)
  }
  return { dist, porDistancia, indice: (e) => { const q = coordenadas(e); return (q.centros * NG + q.giram) * NA + q.andam } }
}

// ---------------------------------------------------------------------------
// O resolvedor da pagina. A tabela de 113 milhoes de bytes nao cabe bem num
// navegador, entao a pagina resolve por IDA*: busca em profundidade com teto
// crescente, podada por duas tabelas pequenas, cada uma a distancia exata de
// um pedaco sozinho (os centros: 720 casas; os cantos juntos: 81 x 1944). Um
// pedaco nunca se resolve em menos giros que o cubo inteiro, entao o maior dos
// dois e um limite de baixo honesto, e o IDA* devolve um caminho otimo.

function bfsPedaco (n, prox, ini) {
  const d = new Uint8Array(n).fill(255)
  d[ini] = 0
  let fila = [ini]
  for (let k = 1; fila.length; k++) {
    const p = []
    for (const v of fila) for (let m = 0; m < 8; m++) { const w = prox(v, m); if (d[w] === 255) { d[w] = k; p.push(w) } }
    fila = p
  }
  return d
}

export function preparaResolvedor (tab = tabelas()) {
  const c0 = coordenadas(RESOLVIDO)
  const NA = TAM.andam
  const hC = bfsPedaco(TAM.centros, (v, m) => tab.centros.t[v * 8 + m], c0.centros)
  const hK = bfsPedaco(TAM.giram * NA, (v, m) => tab.giram.t[Math.floor(v / NA) * 8 + m] * NA + tab.andam.t[(v % NA) * 8 + m], c0.giram * NA + c0.andam)
  return { tab, hC, hK, c0 }
}

export function resolve (estado, r = preparaResolvedor()) {
  const { tab, hC, hK, c0 } = r
  const NA = TAM.andam
  const q = coordenadas(estado)
  const caminho = []
  let nos = 0
  const h = (c, g, a) => Math.max(hC[c], hK[g * NA + a])
  function vai (c, g, a, prof, teto, ultimoEixo) {
    nos++
    if (c === c0.centros && g === c0.giram && a === c0.andam) return true
    if (prof + h(c, g, a) > teto) return false
    for (let m = 0; m < 8; m++) {
      if ((m >> 1) === ultimoEixo) continue // dois giros seguidos no mesmo eixo sao um so
      caminho.push(m)
      if (vai(tab.centros.t[c * 8 + m], tab.giram.t[g * 8 + m], tab.andam.t[a * 8 + m], prof + 1, teto, m >> 1)) return true
      caminho.pop()
    }
    return false
  }
  for (let teto = h(q.centros, q.giram, q.andam); teto <= 20; teto++) {
    if (vai(q.centros, q.giram, q.andam, 0, teto, -1)) return { giros: caminho.slice(), nos }
  }
  return null
}
