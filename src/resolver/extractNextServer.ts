import { skipName, skipRecord } from "../utils/skipRecords"

export function extractNextServer(buf: Buffer): string | null {
  const qdcount = buf.readUInt16BE(4)
  const ancount = buf.readUInt16BE(6)
  const nscount = buf.readUInt16BE(8)
  const arcount = buf.readUInt16BE(10)

  let offset = 12

  // 1. Safely skip ALL questions
  for (let i = 0; i < qdcount; i++) {
    offset = skipName(buf, offset)
    offset += 4 // Skip QTYPE (2) and QCLASS (2)
  }

  // 2. Safely skip Answer records
  for (let i = 0; i < ancount; i++) {
    offset = skipRecord(buf, offset)
  }

  // 3. Safely skip Authority records
  for (let i = 0; i < nscount; i++) {
    offset = skipRecord(buf, offset)
  }

  // 4. Parse Additional records looking for an IPv4 address (A Record / Type 1)
  for (let i = 0; i < arcount; i++) {
    
    // NO MORE HARDCODED offset += 2! Safely skip the name:
    offset = skipName(buf, offset) 

    const type = buf.readUInt16BE(offset)
    offset += 2

    const clazz = buf.readUInt16BE(offset)
    offset += 2

    offset += 4 // Skip TTL

    const rdlength = buf.readUInt16BE(offset)
    offset += 2

    // If it's an A record (Type 1), IN class (Class 1), and data is 4 bytes (IPv4)
    if (type === 1 && clazz === 1 && rdlength === 4) {
      const ip = [
        buf[offset],
        buf[offset + 1],
        buf[offset + 2],
        buf[offset + 3]
      ].join(".")

      return ip
    }

    // Otherwise, skip this record's data and check the next one
    offset += rdlength
  }

  return null
}