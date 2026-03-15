import { DNSQuestion } from "../types/dns"

export function parseQuestion(buffer: Buffer, offset: number): DNSQuestion {

  const labels: string[] = []

  let len = buffer[offset]

  while (len !== 0) {

    const label = buffer.slice(offset + 1, offset + 1 + len)

    labels.push(label.toString())

    offset += len + 1
    len = buffer[offset]
  }

  const domain = labels.join(".")

  offset += 1

  const type = buffer.readUInt16BE(offset)
  const qclass = buffer.readUInt16BE(offset + 2)

  return {
    domain,
    type,
    qclass
  }
}