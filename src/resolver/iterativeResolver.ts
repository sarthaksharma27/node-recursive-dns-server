import { ROOT_SERVERS } from "./rootHints"
import { buildQuery } from "../protocol/packet"
import { queryDNS } from "../network/dnsClient"
import { parseHeader } from "../protocol/header"
import { extractNextServer } from "./extractNextServer"
import { log } from "node:console"

export async function resolve(domain: string, qtype: number, headerId: number): Promise<Buffer> {

  log(`Starting resolution for ${domain} with header ID ${headerId}`)

  const randomIndex = Math.floor(Math.random() * ROOT_SERVERS.length);
  let nameserver = ROOT_SERVERS[randomIndex];
  const packet = buildQuery(domain, qtype, headerId)
  console.log(packet);
  
  while (true) {

    const response = await queryDNS(nameserver, packet)
    console.log(response);
    
    const header = parseHeader(response)

    if (header.rcode !== 0) {
      log(`Upstream returned RCODE ${header.rcode} for ${domain}. Forwarding to client.`)
      return response
    }

    if (header.ancount > 0) {
      return response
    }

    const nextServer = extractNextServer(response)

    if (!nextServer) {
      throw new Error(`Resolution failed: Dead end reached for ${domain}`)
    }

    nameserver = nextServer
  }
}