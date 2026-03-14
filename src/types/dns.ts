export type DNSHeader = {
  id: number
  qr: number
  opcode: number
  aa: number
  tc: number
  rd: number
  ra: number
  rcode: number
  qdcount: number
  ancount: number
  nscount: number
  arcount: number
}

export type DNSQuestion = {
  domain: string
  type: number
  qclass: number
}