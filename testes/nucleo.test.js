import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ADESIVOS, GIROS, RESOLVIDO, gira, resolvido, coordenadas, tabelas, TAM, resolve, preparaResolvedor, EIXOS } from '../js/skewb.js'
import { GIROS_J, ADESIVOS_J } from '../js/juiz.js'

test('30 adesivos: 24 de canto e 6 de centro, e o resolvido tem 5 de cada cor', () => {
  assert.equal(ADESIVOS.length, 30)
  for (let c = 0; c < 6; c++) assert.equal(RESOLVIDO.filter((x) => x === c).length, 5)
})

test('cada giro mexe 15 adesivos (4 cantos e 3 centros) e tem ordem 3', () => {
  for (let g = 0; g < 8; g++) {
    assert.equal(GIROS[g].para.filter((p, i) => p !== i).length, 15)
    let e = RESOLVIDO
    for (let k = 0; k < 3; k++) e = gira(e, g)
    assert.ok(resolvido(e))
    assert.ok(!resolvido(gira(RESOLVIDO, g)))
  }
})

test('os dois sentidos do mesmo eixo sao inversos', () => {
  for (let e = 0; e < 4; e++) assert.ok(resolvido(gira(gira(RESOLVIDO, 2 * e), 2 * e + 1)))
})

test('o canto do eixo fica no lugar: so os adesivos dele trocam entre si', () => {
  for (let e = 0; e < 4; e++) {
    const c = ADESIVOS.findIndex((s) => s.pos.join() === EIXOS[e].join())
    const deles = [c, c + 1, c + 2]
    for (const i of deles) assert.ok(deles.includes(GIROS[2 * e].para[i]))
  }
})

test('os giros do nucleo e os do juiz (Rodrigues) sao as mesmas permutacoes da geometria', () => {
  const k = (s) => s.pos.join(',') + '|' + s.normal.join(',')
  const doNucleo = GIROS.map((g) => ADESIVOS.map((s, i) => k(s) + '>' + k(ADESIVOS[g.para[i]])).sort().join(';')).sort()
  const doJuiz = GIROS_J.map((p) => ADESIVOS_J.map((s, i) => k(s) + '>' + k(ADESIVOS_J[p[i]])).sort().join(';')).sort()
  assert.deepEqual(doNucleo, doJuiz)
})

test('as coordenadas do resolvido e de um giro sao diferentes, e cada uma cabe no seu tamanho', () => {
  const a = coordenadas(RESOLVIDO)
  for (let g = 0; g < 8; g++) {
    const b = coordenadas(gira(RESOLVIDO, g))
    assert.notDeepEqual(a, b)
    for (const nome of Object.keys(TAM)) assert.ok(b[nome] >= 0 && b[nome] < TAM[nome])
  }
})

test('as tabelas de transicao concordam com girar os adesivos', () => {
  const tab = tabelas()
  let e = RESOLVIDO
  for (let k = 0; k < 40; k++) {
    const g = (k * 5 + 3) % 8
    const antes = coordenadas(e)
    e = gira(e, g)
    const depois = coordenadas(e)
    for (const nome of Object.keys(TAM)) assert.equal(tab[nome].t[antes[nome] * 8 + g], depois[nome])
  }
})

test('o resolvedor devolve uma sequencia que resolve de verdade', () => {
  const r = preparaResolvedor()
  let e = RESOLVIDO
  for (const g of [0, 3, 5, 6, 1, 2, 7, 4, 0, 5]) e = gira(e, g)
  const s = resolve(e, r)
  let f = e
  for (const g of s.giros) f = gira(f, g)
  assert.ok(resolvido(f))
  assert.ok(s.giros.length <= 10)
})
