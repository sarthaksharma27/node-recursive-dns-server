const BUFFER_SIZE = 512

const pool: Buffer[] = []

export function acquireBuffer(): Buffer {

  if (pool.length > 0) {
    return pool.pop()!
  }

  return Buffer.allocUnsafe(BUFFER_SIZE)
}

export function releaseBuffer(buf: Buffer) {
  pool.push(buf)
}