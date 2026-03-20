import { ROOT_SERVERS } from "./rootHints"
import { buildQuery } from "../protocol/packet"
import { queryDNS } from "../network/dnsClient"
import { parseHeader } from "../protocol/header"
import { extractNextServer } from "./extractNextServer"
import { log } from "node:console"

import { dnsCache } from "../cache/dnsCache"
import { extractMinTTL } from "../utils/extractTTL"

export async function resolve(domain: string, qtype: number, headerId: number): Promise<Buffer> {
  const cachedBuffer = dnsCache.get(domain, qtype);
  
  if (cachedBuffer) {
    log(`CACHE HIT ${domain} (Type ${qtype}) served from memory.`);
    
    const responseCopy = Buffer.from(cachedBuffer);
    responseCopy.writeUInt16BE(headerId, 0); 
    
    return responseCopy;
  }

  log(`CACHE MISS Starting resolution for ${domain} (Type ${qtype}) with header ID ${headerId}`);

  const randomIndex = Math.floor(Math.random() * ROOT_SERVERS.length);
  let nameserver = ROOT_SERVERS[randomIndex];
  
  const packet = buildQuery(domain, qtype, headerId);

  while (true) {
    const response = await queryDNS(nameserver, packet);
    const header = parseHeader(response);

    if (header.rcode !== 0) {
      log(`Upstream returned RCODE ${header.rcode} for ${domain}. Forwarding & Caching.`);
      dnsCache.set(domain, qtype, response, 60);
      return response;
    }

    if (header.ancount > 0) {
      const ttl = extractMinTTL(response);
      log(`Successfully resolved ${domain}. Caching for ${ttl} seconds.`);
      
      dnsCache.set(domain, qtype, response, ttl);
      
      return response;
    }

    const nextServer = extractNextServer(response);

    if (!nextServer) {
      throw new Error(`Resolution failed: Dead end reached for ${domain}`);
    }

    nameserver = nextServer;
  }
}