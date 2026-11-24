// As tabelas do README, uma funcao por tabela. O medidor imprime, os testes
// prendem.

import { tabelas, largura, TAM, preparaResolvedor, resolve, RESOLVIDO, gira } from './skewb.js'
import { larguraJ, paraNucleo } from './juiz.js'
import { ADESIVOS } from './skewb.js'

let cache = null
function tudo () {
  if (!cache) {
    const tab = tabelas()
    cache = { tab, L: largura(tab) }
  }
  return cache
}

// A distribuicao das distancias e o numero de Deus.
export function distancias () {
  const { L } = tudo()
  const total = L.porDistancia.reduce((a, b) => a + b, 0)
  return { total, porDistancia: L.porDistancia, deus: L.porDistancia.length - 1, antipodas: L.porDistancia[L.porDistancia.length - 1] }
}

// Cada pedaco sozinho, e os tres juntos.
export function pedacos () {
  const { tab, L } = tudo()
  const NA = TAM.andam
  const NG = TAM.giram
  // quantos valores de cada pedaco aparecem, e quantos estados tem os cantos
  // todos no lugar (so os centros fora) ou os centros no lugar (so cantos fora)
  let soCentros = 0
  let soCantos = 0
  const c0 = { a: L.indice(RESOLVIDO) % NA, g: Math.floor(L.indice(RESOLVIDO) / NA) % NG, c: Math.floor(L.indice(RESOLVIDO) / (NA * NG)) }
  let maxSoCentros = 0
  let maxSoCantos = 0
  for (let k = 0; k < L.dist.length; k++) {
    const d = L.dist[k]
    if (d === 255) continue
    const a = k % NA
    const g = Math.floor(k / NA) % NG
    const c = Math.floor(k / (NA * NG))
    if (a === c0.a && g === c0.g) { soCentros++; if (d > maxSoCentros) maxSoCentros = d }
    if (c === c0.c) { soCantos++; if (d > maxSoCantos) maxSoCantos = d }
  }
  return {
    centros: tab.centros.alcancados,
    giram: tab.giram.alcancados,
    andam: tab.andam.alcancados,
    produto: tab.centros.alcancados * tab.giram.alcancados * tab.andam.alcancados,
    soCentros,
    maxSoCentros,
    soCantos,
    maxSoCantos
  }
}

// O IDA* da pagina contra a tabela, numa amostra deterministica que inclui
// todas as antipodas.
export function confrontoResolvedor (quantos = 300) {
  const { tab, L } = tudo()
  const r = preparaResolvedor(tab)
  let s = 12345
  const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296 }
  let dif = 0
  let nos = 0
  let feitos = 0
  for (let i = 0; i < quantos; i++) {
    let e = RESOLVIDO
    const giros = 8 + Math.floor(rnd() * 30)
    for (let k = 0; k < giros; k++) e = gira(e, Math.floor(rnd() * 8))
    const sol = resolve(e, r)
    let f = e
    for (const m of sol.giros) f = gira(f, m)
    const certo = f.every((c, j) => c === RESOLVIDO[j])
    if (!certo || sol.giros.length !== L.dist[L.indice(e)]) dif++
    nos += sol.nos
    feitos++
  }
  return { feitos, dif, nos }
}

// O juiz inteiro: a busca sobre textos, e a distancia de CADA estado dele
// comparada com a da tabela.
export function confrontoJuiz () {
  const { L } = tudo()
  const j = larguraJ()
  let dif = 0
  for (const [txt, d] of j.visto) if (L.dist[L.indice(paraNucleo(txt, ADESIVOS))] !== d) dif++
  return { total: j.visto.size, porDistancia: j.porDistancia, dif }
}
