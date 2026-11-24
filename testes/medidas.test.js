// Os numeros do README presos. Se o codigo mudar e um numero mudar, quebra.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { distancias, pedacos, confrontoResolvedor } from '../js/medidas.js'

test('3.149.280 estados, numero de Deus 11, 90 antipodas', () => {
  const d = distancias()
  assert.equal(d.total, 3149280)
  assert.equal(d.deus, 11)
  assert.equal(d.antipodas, 90)
  assert.deepEqual(d.porDistancia, [1, 8, 48, 288, 1728, 10248, 59304, 315198, 1225483, 1455856, 81028, 90])
})

test('ate 4 giros nenhuma posicao se repete: 8 x 6^(d-1); no 5 faltam 120', () => {
  const d = distancias().porDistancia
  for (let k = 1; k <= 4; k++) assert.equal(d[k], 8 * 6 ** (k - 1))
  assert.equal(8 * 6 ** 4 - d[5], 120)
})

test('cada pedaco sozinho: 360 x 81 x 324, tres vezes o Skewb', () => {
  const p = pedacos()
  assert.equal(p.centros, 360)
  assert.equal(p.giram, 81)
  assert.equal(p.andam, 324)
  assert.equal(p.produto, 3 * 3149280)
})

test('centros livres: com os cantos no lugar sobram os 360; so os cantos, 8.748', () => {
  const p = pedacos()
  assert.equal(p.soCentros, 360)
  assert.equal(p.maxSoCentros, 10)
  assert.equal(p.soCantos, 8748)
  assert.equal(p.maxSoCantos, 11)
})

test('o IDA* da pagina acha o otimo em 300 embaralhados', () => {
  const c = confrontoResolvedor(300)
  assert.equal(c.feitos, 300)
  assert.equal(c.dif, 0)
})
