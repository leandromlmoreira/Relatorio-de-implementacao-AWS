export type GlyphName = 'user' | 'dns' | 'edge' | 'balancer' | 'compute' | 'database' | 'bucket' | 'monitor'

const glyphs: Record<GlyphName, string> = {
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2c.6-3.8 3.5-6.4 7.2-6.4s6.6 2.6 7.2 6.4"/>',
  dns: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.5 2.4 3.7 5.3 3.7 8.6s-1.2 6.2-3.7 8.6c-2.5-2.4-3.7-5.3-3.7-8.6S9.5 5.8 12 3.4z"/>',
  edge: '<circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="3.4" r="1.5" class="glyph-fill"/><circle cx="19.4" cy="16.3" r="1.5" class="glyph-fill"/><circle cx="4.6" cy="16.3" r="1.5" class="glyph-fill"/>',
  balancer: '<path d="M3 12h5.5M8.5 12c3.2 0 3.8-6 7.4-6H21M8.5 12H21M8.5 12c3.2 0 3.8 6 7.4 6H21"/><circle cx="8.5" cy="12" r="1.7" class="glyph-fill"/>',
  compute: '<rect x="6" y="6" width="12" height="12" rx="2.4"/><rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1"/><path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  bucket: '<ellipse cx="12" cy="6.4" rx="8" ry="2.4"/><path d="M4 6.4l1.9 12.1c.2 1.2 2.9 2.1 6.1 2.1s5.9-.9 6.1-2.1L20 6.4"/>',
  monitor: '<rect x="3" y="4.2" width="18" height="15.6" rx="3.2"/><path d="M6.2 13h2.9l2-4.2 2.6 7.2 1.9-3H18"/>',
}

export function glyph(name: GlyphName, size: number, x: number, y: number): string {
  const scale = size / 24
  return `<g class="glyph" transform="translate(${x} ${y}) scale(${scale})">${glyphs[name]}</g>`
}
