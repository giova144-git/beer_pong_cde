import QRCode from 'qrcode'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

const URL    = 'https://giova144-git.github.io/Meet_And_Greet_Codea-/'
const GREEN  = '#3D5E3A'
const CELL   = 18   // INTEGER pixels per module — guarantees pixel-perfect boundaries

// ── 1. Get QR module matrix (sync) ────────────────────────────────
const qrData = QRCode.create(URL, { errorCorrectionLevel: 'H' })
const N      = qrData.modules.size   // e.g. 41 modules
const data   = qrData.modules.data
const MARGIN = 3                     // modules of white border
const TOTAL  = (N + MARGIN * 2) * CELL   // exact integer total px

// Every module boundary = integer multiple of CELL — no sub-pixel drift

// ── 2. Build QR stroke path in pixel coords ───────────────────────
// Use horizontal line segments (same approach as qrcode's SVG output)
// Each dark module row becomes H lines at y = (row + MARGIN) * CELL + CELL/2
// stroke-width = CELL, so one stroke covers the full module height
let pathParts = []
for (let row = 0; row < N; row++) {
  const y = (row + MARGIN) * CELL + CELL / 2
  let seg = ''
  let start = -1
  for (let col = 0; col <= N; col++) {
    const dark = col < N && data[row * N + col]
    if (dark && start < 0) {
      start = col
    } else if (!dark && start >= 0) {
      const x0 = (start + MARGIN) * CELL
      const x1 = (col  + MARGIN) * CELL
      seg += `M${x0} ${y}H${x1}`
      start = -1
    }
  }
  if (seg) pathParts.push(seg)
}
const strokeD = pathParts.join('')

// ── 3. Center layout (all in pixels, snapped to CELL grid) ────────
const cx = TOTAL / 2
const cy = TOTAL / 2

// logo height = 8 modules in px
const logoModules = 8
const logoH_px = logoModules * CELL
const logoW_px = logoH_px

const sepPx  = 3 * CELL        // × gap (3 modules — more breathing room)
const padPx  = 2 * CELL        // symmetric padding (2 modules each side)

const rowPx  = logoW_px + sepPx + logoW_px

// Snap rect to CELL-aligned pixel boundaries
const rectX  = Math.round(cx - rowPx / 2 - padPx)
const rectY  = Math.round(cy - logoH_px / 2 - padPx)
const rectX2 = Math.round(cx + rowPx / 2 + padPx)
const rectY2 = Math.round(cy + logoH_px / 2 + padPx)

// Snap to nearest CELL multiple for perfect grid alignment
const snapX  = Math.floor(rectX / CELL) * CELL
const snapY  = Math.floor(rectY / CELL) * CELL
const snapX2 = Math.ceil (rectX2 / CELL) * CELL
const snapY2 = Math.ceil (rectY2 / CELL) * CELL
const rectW  = snapX2 - snapX
const rectH  = snapY2 - snapY

// Logo positions inside snapped rect
const clubX_px  = snapX + padPx
const codeaX_px = snapX2 - padPx - logoW_px
const logoY_px  = snapY + (rectH - logoH_px) / 2
const sepX_px   = cx

// ── 4. Base QR SVG in pixel coords (no viewBox scaling issues) ────
const baseSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${TOTAL}" height="${TOTAL}" viewBox="0 0 ${TOTAL} ${TOTAL}">
  <rect width="${TOTAL}" height="${TOTAL}" fill="white"/>
  <path stroke="${GREEN}" stroke-width="${CELL}" d="${strokeD}" shape-rendering="crispEdges"/>
  <rect x="${snapX}" y="${snapY}" width="${rectW}" height="${rectH}" fill="white"/>
  <text x="${sepX_px}" y="${cy}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="${CELL * 5}" font-weight="300"
        fill="${GREEN}" opacity="0.40">×</text>
</svg>`

// ── 5. Render QR base PNG ─────────────────────────────────────────
const qrBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()

// ── 6. Club SVG logo → green → PNG buffer ─────────────────────────
const clubSvgRaw   = readFileSync('./src/assets/logo_club.svg', 'utf-8')
const clubSvgGreen = clubSvgRaw.replace(/fill:#000000/g, `fill:${GREEN}`)

const clubBuf = await sharp(Buffer.from(clubSvgGreen))
  .resize(logoW_px, logoH_px, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer()

// ── 7. Codea PNG logo → resize ────────────────────────────────────
const codeaBuf = await sharp('./src/assets/codea.png')
  .resize(logoW_px, logoH_px, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer()

// ── 8. Composite ──────────────────────────────────────────────────
await sharp(qrBuf)
  .composite([
    { input: clubBuf,  left: Math.round(clubX_px),  top: Math.round(logoY_px) },
    { input: codeaBuf, left: Math.round(codeaX_px), top: Math.round(logoY_px) + 6 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('./qr-registro.png')

writeFileSync('./qr-registro.svg', baseSvg)
console.log(`QR generado: qr-registro.png  (${TOTAL}×${TOTAL}px, ${CELL}px/módulo)`)
