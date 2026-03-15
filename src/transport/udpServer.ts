import dgram from "node:dgram"
import { parseHeader } from "../protocol/header"
import { parseQuestion } from "../protocol/question"

const server = dgram.createSocket("udp4")

export function startUDPServer() {

  server.on("message", (msg, rinfo) => {
    const header = parseHeader(msg)
    const question = parseQuestion(msg, 12)

    console.log("Query from", rinfo.address)

    console.log(header)
    console.log(question)

  })

  server.bind(53, () => {
    console.log("DNS server listening on port 53")
  })
}