// O juiz inteiro: a busca sobre textos (uns 3 milhoes no Map) e a distancia de
// cada estado comparada com a tabela, mais as 90 antipodas pelo IDA*. Uns dois
// minutos e bastante memoria: roda UMA vez, no job das tabelas.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { confrontoJuiz } from '../js/medidas.js'
import { larguraJ, paraNucleo } from '../js/juiz.js'
import { ADESIVOS, resolve, preparaResolvedor, gira, resolvido } from '../js/skewb.js'

const T = { timeout: 1800000 }

test('o juiz concorda com a tabela em cada um dos 3.149.280 estados', T, () => {
  const c = confrontoJuiz()
  assert.equal(c.total, 3149280)
  assert.equal(c.dif, 0)
})

test('o IDA* resolve as 90 antipodas em 11 giros', T, () => {
  const r = preparaResolvedor()
  const j = larguraJ()
  let n = 0
  for (const [txt, d] of j.visto) {
    if (d !== 11) continue
    const e = paraNucleo(txt, ADESIVOS)
    const s = resolve(e, r)
    let f = e
    for (const g of s.giros) f = gira(f, g)
    assert.ok(resolvido(f))
    assert.equal(s.giros.length, 11)
    n++
  }
  assert.equal(n, 90)
})
