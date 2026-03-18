import { skipName } from "./skipRecords";

export function extractMinTTL(buf: Buffer): number {
  const qdcount = buf.readUInt16BE(4);
  const ancount = buf.readUInt16BE(6);

  if (ancount === 0) return 60; 

  let offset = 12;

  for (let i = 0; i < qdcount; i++) {
    offset = skipName(buf, offset);
    offset += 4;
  }
  offset = skipName(buf, offset);
  offset += 4;

  const ttl = buf.readUInt32BE(offset);
  
  return ttl;
}