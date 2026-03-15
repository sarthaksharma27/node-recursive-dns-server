export function skipRecord(buf: Buffer, offset: number): number {
  // 1. Dynamically skip the variable-length Name
  offset = skipName(buf, offset)

  // 2. Skip Type (2 bytes), Class (2 bytes), and TTL (4 bytes)
  offset += 8

  // 3. Read the Data Length (RDLENGTH)
  const rdlength = buf.readUInt16BE(offset)
  offset += 2

  // 4. Skip the actual Data (RDATA)
  offset += rdlength

  return offset
}

export function skipName(buf: Buffer, offset: number): number {
  while (true) {
    const length = buf.readUInt8(offset);

    // 1. Reached the null terminator (end of uncompressed name)
    if (length === 0) {
      return offset + 1;
    }

    // 2. Reached a compression pointer (first two bits are 11, so >= 0xC0)
    if ((length & 0xc0) === 0xc0) {
      // A pointer is always exactly 2 bytes, and it always terminates the name.
      return offset + 2; 
    }

    // 3. Normal label: skip the length byte AND the label text
    offset += length + 1;
  }
}