import dgram from "node:dgram";
import { parseHeader } from "../protocol/header";
import { parseQuestion } from "../protocol/question";
import { resolve } from "../resolver/iterativeResolver";

const server = dgram.createSocket("udp4");

export function startUDPServer() {
  server.on("message", async (msg, rinfo) => {
    try {
      const header = parseHeader(msg);
      const question = parseQuestion(msg, 12);
      console.log(`Received query for: ${question.domain}`);
      
      const response = await resolve(question.domain, question.type, header.id);
      
      server.send(response, rinfo.port, rinfo.address);
      console.log(`Sent response for: ${question.domain} to ${rinfo.address}:${rinfo.port}`);

    } catch (error) {
      console.error("Critial resolution error:", error);
    }
  });

  server.bind(53, () => {
    console.log("DNS server listening on port 53");
  });
}