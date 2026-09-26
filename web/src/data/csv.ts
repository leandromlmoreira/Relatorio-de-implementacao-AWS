export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"'
        index++
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell.trim())
      cell = ''
    } else if (char === '\n') {
      row.push(cell.trim())
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') cell += char
  }

  if (cell || row.length) {
    row.push(cell.trim())
    rows.push(row)
  }
  return rows
}

export function parseMoney(value: string | undefined): number {
  const digits = (value ?? '').replace(/[^0-9.-]/g, '')
  return digits ? Number(digits) : 0
}

export function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}
