import { DNSHeader } from "../types/dns"

export function parseHeader(buffer: Buffer): DNSHeader {
  const id = buffer.readUInt16BE(0)

  const flags = buffer.readUInt16BE(2)

  return {  
    id,

    qr: (flags >> 15) & 1,
    opcode: (flags >> 11) & 0xf,
    aa: (flags >> 10) & 1,
    tc: (flags >> 9) & 1,
    rd: (flags >> 8) & 1,
    ra: (flags >> 7) & 1,
    rcode: flags & 0xf,

    qdcount: buffer.readUInt16BE(4),
    ancount: buffer.readUInt16BE(6),
    nscount: buffer.readUInt16BE(8),
    arcount: buffer.readUInt16BE(10)
  }
}