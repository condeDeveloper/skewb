// A pagina: so desenho e clique. Os giros e o resolvedor vem de skewb.js, o
// mesmo arquivo que os testes varrem.

import { ADESIVOS, RESOLVIDO, gira, resolvido, resolve, preparaResolvedor } from './skewb.js'

const SVG = 'http://www.w3.org/2000/svg'
const elTab = document.getElementById('cubo')
const elEstado = document.getElementById('estado')
const PALETA = ['#d4536f', '#e8914a', '#4ec9a8', '#6c8cff', '#ece7f5', '#e0b64a']

// A planificacao em cruz: cada face com o vetor que aponta para a direita e o
// que aponta para cima na tela, vista de fora.
const FACES = [
  { n: [0, 0, 1], dir: [0, 1, 0], cima: [-1, 0, 0], col: 1, lin: 0 },
  { n: [0, -1, 0], dir: [1, 0, 0], cima: [0, 0, 1], col: 0, lin: 1 },
  { n: [1, 0, 0], dir: [0, 1, 0], cima: [0, 0, 1], col: 1, lin: 1 },
  { n: [0, 1, 0], dir: [-1, 0, 0], cima: [0, 0, 1], col: 2, lin: 1 },
  { n: [-1, 0, 0], dir: [0, -1, 0], cima: [0, 0, 1], col: 3, lin: 1 },
  { n: [0, 0, -1], dir: [0, 1, 0], cima: [1, 0, 0], col: 1, lin: 2 }
]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const igual = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

let estado = RESOLVIDO
let resolvedor = null
let animando = false

function desenha () {
  const T = 64
  elTab.innerHTML = ''
  const s = document.createElementNS(SVG, 'svg')
  s.setAttribute('viewBox', `-4 -4 ${4 * T + 8} ${3 * T + 8}`)
  s.setAttribute('role', 'img')
  s.setAttribute('aria-label', 'Skewb planificado')
  const poli = (pts, cor) => {
    const p = document.createElementNS(SVG, 'polygon')
    p.setAttribute('points', pts.map((q) => q.join(',')).join(' '))
    p.setAttribute('fill', PALETA[cor])
    p.setAttribute('stroke', '#0f0b17')
    p.setAttribute('stroke-width', 3)
    p.setAttribute('stroke-linejoin', 'round')
    s.appendChild(p)
  }
  for (const f of FACES) {
    const x0 = f.col * T
    const y0 = f.lin * T
    const meio = [[x0 + T / 2, y0], [x0 + T, y0 + T / 2], [x0 + T / 2, y0 + T], [x0, y0 + T / 2]]
    ADESIVOS.forEach((st, i) => {
      if (!igual(st.normal, f.n)) return
      if (igual(st.pos, f.n)) { poli(meio, estado[i]); return }
      const dx = dot(st.pos, f.dir) > 0 ? 1 : 0
      const dy = dot(st.pos, f.cima) > 0 ? 0 : 1
      const canto = [x0 + dx * T, y0 + dy * T]
      const a = [x0 + T / 2, y0 + dy * T]
      const b = [x0 + dx * T, y0 + T / 2]
      poli([canto, a, b], estado[i])
    })
  }
  elTab.appendChild(s)
}

function mostraDistancia () {
  if (resolvido(estado)) { elEstado.innerHTML = '<span class="ok">Resolvido.</span>'; return }
  if (!resolvedor) resolvedor = preparaResolvedor()
  const r = resolve(estado, resolvedor)
  elEstado.textContent = `Daqui, o caminho mais curto tem ${r.giros.length} ${r.giros.length === 1 ? 'giro' : 'giros'}.`
}

function aplica (g) {
  if (animando) return
  estado = gira(estado, g)
  desenha()
  mostraDistancia()
}

document.querySelectorAll('[data-giro]').forEach((b) => b.addEventListener('click', () => aplica(Number(b.dataset.giro))))
document.getElementById('embaralhar').addEventListener('click', () => {
  if (animando) return
  for (let k = 0; k < 25; k++) estado = gira(estado, Math.floor(Math.random() * 8))
  desenha()
  mostraDistancia()
})
document.getElementById('reiniciar').addEventListener('click', () => {
  if (animando) return
  estado = RESOLVIDO
  desenha()
  mostraDistancia()
})
document.getElementById('resolver').addEventListener('click', () => {
  if (animando || resolvido(estado)) return
  if (!resolvedor) resolvedor = preparaResolvedor()
  const giros = resolve(estado, resolvedor).giros
  animando = true
  let k = 0
  const passo = () => {
    if (k === giros.length) { animando = false; mostraDistancia(); return }
    estado = gira(estado, giros[k++])
    desenha()
    elEstado.textContent = `Resolvendo: giro ${k} de ${giros.length}.`
    setTimeout(passo, 420)
  }
  passo()
})

desenha()
mostraDistancia()
