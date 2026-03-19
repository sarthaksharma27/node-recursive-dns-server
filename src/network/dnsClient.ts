import dgram from "node:dgram"

export function queryDNS(
  server: string,
  packet: Buffer,
  timeoutMs: number = 3000 
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4")

    // 1. Plant the time bomb
    const timer = setTimeout(() => {
      socket.close()
      reject(new Error(`DNS query to ${server} timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // 2. Fire the packet
    socket.send(packet, 53, server, (err) => {
      if (err) {
        clearTimeout(timer)
        socket.close()
        reject(err)
      }
    })

    // 3. Listen for the response
    socket.once("message", (msg) => {
      clearTimeout(timer) // Defuse the bomb!
      socket.close()
      resolve(msg)
    })

    socket.once("error", (err) => {
      clearTimeout(timer)
      socket.close()
      reject(err)
    })
  })
}