// O juiz. Nao importa nada do nucleo.
//
// A geometria vem de outra conta: a rotacao de 120 graus em volta da diagonal
// sai da formula de Rodrigues, em ponto flutuante, com cosseno e seno de
// verdade, e o resultado e arredondado. O nucleo usa matrizes de sinal e
// permutacao inteiras; se uma das duas contas estivesse errada, os giros nao
// bateriam.
//
// E a busca e a burra: o estado e o texto das 30 cores, e as distancias ficam
// num Map de textos. Cerca de 3 milhoes de textos: memoria e tempo de sobra
// para um juiz, nenhum para um nucleo.

function rodrigues (eixo, angulo, v) {
  const n = Math.hypot(...eixo)
  const k = eixo.map((x) => x / n)
  const c = Math.cos(angulo)
  const s = Math.sin(angulo)
  const kv = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]
  const cruz = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]]
  return [0, 1, 2].map((i) => Math.round(v[i] * c + cruz[i] * s + k[i] * kv * (1 - c)))
}

function adesivos () {
  const r = []
  // os centros primeiro, e os cantos em outra ordem que a do nucleo: a
  // conversao entre os dois e pela posicao e normal, nunca pelo indice
  for (const eixo of [0, 1, 2]) {
    for (const sinal of [1, -1]) {
      const n = [0, 0, 0]
      n[eixo] = sinal
      r.push({ pos: n, normal: n })
    }
  }
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      for (const z of [-1, 1]) {
        const p = [x, y, z]
        for (let k = 2; k >= 0; k--) {
          const n = [0, 0, 0]
          n[k] = p[k]
          r.push({ pos: p, normal: n })
        }
      }
    }
  }
  return r
}

export const ADESIVOS_J = adesivos()
const chave = (p, n) => p.join(',') + '|' + n.join(',')
const IDX = new Map(ADESIVOS_J.map((s, i) => [chave(s.pos, s.normal), i]))

// Os eixos do juiz: os 4 cantos com produto das coordenadas igual a +1.
const EIXOS_J = []
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) if (x * y * z === 1) EIXOS_J.push([x, y, z])

export const GIROS_J = []
for (const e of EIXOS_J) {
  for (const ang of [2 * Math.PI / 3, -2 * Math.PI / 3]) {
    GIROS_J.push(ADESIVOS_J.map((s, i) => {
      if (s.pos[0] * e[0] + s.pos[1] * e[1] + s.pos[2] * e[2] <= 0) return i
      return IDX.get(chave(rodrigues(e, ang, s.pos), rodrigues(e, ang, s.normal)))
    }))
  }
}

const COR = 'abcdef'
const corDe = (s) => { const k = s.normal.findIndex((x) => x !== 0); return COR[2 * k + (s.normal[k] < 0 ? 1 : 0)] }
export const RESOLVIDO_J = ADESIVOS_J.map(corDe).join('')

export function giraJ (txt, g) {
  const r = new Array(30)
  const para = GIROS_J[g]
  for (let i = 0; i < 30; i++) r[para[i]] = txt[i]
  return r.join('')
}

// A busca em largura sobre textos. Devolve quantos estados em cada distancia.
export function larguraJ () {
  const visto = new Map([[RESOLVIDO_J, 0]])
  let fila = [RESOLVIDO_J]
  const por = [1]
  for (let d = 1; fila.length; d++) {
    const prox = []
    for (const e of fila) {
      for (let g = 0; g < GIROS_J.length; g++) {
        const f = giraJ(e, g)
        if (!visto.has(f)) { visto.set(f, d); prox.push(f) }
      }
    }
    if (prox.length) por.push(prox.length)
    fila = prox
  }
  return { porDistancia: por, visto }
}

// Converte um estado do juiz (texto) para o formato do nucleo (vetor de cores
// 0..5 na ordem dos adesivos do nucleo), pela posicao e normal de cada casa.
export function paraNucleo (txt, adesivosNucleo) {
  return adesivosNucleo.map((s) => COR.indexOf(txt[IDX.get(chave(s.pos, s.normal))]))
}
