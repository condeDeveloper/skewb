#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js              as tabelas rapidas
//   node ferramentas/medidor.js distancias   quantos estados em cada distancia
//   node ferramentas/medidor.js pedacos      cada pedaco sozinho e os tres juntos
//   node ferramentas/medidor.js resolvedor   o IDA* da pagina contra a tabela
//   node ferramentas/medidor.js juiz         a busca sobre textos, estado por estado (uns 2 min)

import { distancias, pedacos, confrontoResolvedor, confrontoJuiz } from '../js/medidas.js'

const n = (x) => x.toLocaleString('pt-BR')
const pc = (a, b) => (100 * a / b).toFixed(2).replace('.', ',') + '%'

function tDistancias () {
  const d = distancias()
  console.log('\n== o Skewb inteiro, giros de 120 graus ==')
  d.porDistancia.forEach((x, i) => console.log(`  ${String(i).padStart(2)}  ${n(x).padStart(10)}  ${pc(x, d.total)}`))
  console.log(`  total ${n(d.total)}; numero de Deus ${d.deus}; ${d.antipodas} posicoes na distancia maxima`)
}

function tPedacos () {
  const p = pedacos()
  console.log('\n== cada pedaco sozinho ==')
  console.log(`  centros: ${p.centros} arranjos | cantos que so giram: ${p.giram} | cantos que andam: ${p.andam}`)
  console.log(`  produto ${n(p.produto)}, e o Skewb tem ${n(distancias().total)}: ${p.produto / distancias().total} vezes menos`)
  console.log(`  com os cantos no lugar, os centros ainda tem ${p.soCentros} arranjos; resolver so eles pede ate ${p.maxSoCentros} giros`)
  console.log(`  com os centros no lugar, os cantos tem ${n(p.soCantos)} arranjos; resolver so eles pede ate ${p.maxSoCantos} giros`)
}

function tResolvedor () {
  const c = confrontoResolvedor(300)
  console.log(`\n== o IDA* da pagina: ${c.feitos} embaralhados, ${c.dif} diferencas da tabela, ${n(c.nos)} nos ==`)
}

function tJuiz () {
  const c = confrontoJuiz()
  console.log(`\n== o juiz (Rodrigues + textos): ${n(c.total)} estados, ${c.dif} com distancia diferente ==`)
  console.log(`  ${c.porDistancia.join(' ')}`)
}

const tabelas = { distancias: tDistancias, pedacos: tPedacos, resolvedor: tResolvedor, juiz: tJuiz }
const pedidas = process.argv.slice(2)
for (const k of pedidas.length ? pedidas : ['distancias', 'pedacos', 'resolvedor']) {
  if (!tabelas[k]) { console.error('tabela desconhecida: ' + k); process.exit(1) }
  tabelas[k]()
}
