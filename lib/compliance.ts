import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { env } from "@/lib/env";
import { verifyAuditChain } from "@/lib/audit";

export async function complianceEvidence() {
  const chain = await verifyAuditChain();
  let vpcSha256 = "";
  try {
    const compose = readFileSync(path.join(process.cwd(), "deploy/vpc/docker-compose.yml"));
    vpcSha256 = createHash("sha256").update(compose).digest("hex");
  } catch {
    vpcSha256 = "";
  }

  return {
    generatedAt: new Date().toISOString(),
    kind: "control-evidence",
    attestation: "This packet is evidence of controls in the software. It is not a SOC 2 report and not a signed BAA.",
    controls: [
      {
        id: "CC6.1",
        name: "Logical access",
        evidence: "Workspace roles block viewers from chat and members from upload. API keys authenticate embed.",
      },
      {
        id: "CC6.7",
        name: "Encryption",
        evidence: env.ENCRYPTION_KEY
          ? "Document.content uses AES-256-GCM with ENCRYPTION_KEY. Chunk text stays plaintext for retrieval."
          : "Document.content uses AES-256-GCM with AUTH_SECRET. Set ENCRYPTION_KEY to separate the data key.",
      },
      {
        id: "CC7.2",
        name: "Audit",
        evidence: chain.ok
          ? "The audit hash chain verifies."
          : `The audit hash chain failed at ${chain.badId || "unknown"}.`,
      },
      {
        id: "CC6.6",
        name: "Network isolation",
        evidence: vpcSha256
          ? `deploy/vpc/docker-compose.yml sha256 ${vpcSha256}. Postgres has no published port.`
          : "The VPC compose file was not readable.",
      },
      {
        id: "A1.2",
        name: "Archive",
        evidence: env.AUDIT_ARCHIVE_URL
          ? "The daily job PUTs the hash chain and this packet to AUDIT_ARCHIVE_URL."
          : "AUDIT_ARCHIVE_URL is unset, so the archive job records nothing.",
      },
    ],
    baaWorksheet: {
      title: "Business associate agreement worksheet",
      status: "unsigned",
      safeguards: ["AES-256-GCM for document content", "Hash-chained audit log", "Private VPC compose", "Role and API-key access"],
      parties: { coveredEntity: "", businessAssociate: "Quill operator" },
    },
    auditChainOk: chain.ok,
    vpcComposeSha256: vpcSha256,
  };
}
