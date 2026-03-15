export function buildQuery(domain: string, qtype: number, id: number): Buffer {

  const labels = domain.split(".")

  const parts: number[] = []

  for (const label of labels) {
    parts.push(label.length)
    for (const c of label) {
      parts.push(c.charCodeAt(0))
    }
  }

  parts.push(0)

  const question = Buffer.from(parts)

  const buf = Buffer.alloc(12 + question.length + 4)

  buf.writeUInt16BE(id, 0)

  buf.writeUInt16BE(0x0000, 2) // recursion desired

  buf.writeUInt16BE(1, 4)

  buf.writeUInt16BE(0, 6)
  buf.writeUInt16BE(0, 8)
  buf.writeUInt16BE(0, 10)

  question.copy(buf, 12)

  const offset = 12 + question.length

  buf.writeUInt16BE(qtype, offset) 
  buf.writeUInt16BE(1, offset + 2)

  return buf
}