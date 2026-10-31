import { IdentityProvider, ServiceProvider, setSchemaValidator } from "samlify";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

setSchemaValidator({
  validate: async () => undefined,
});

const REDIRECT = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";
const POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

export type SamlMetadata = {
  protocol?: string;
  entryPoint?: string;
  issuer?: string;
  cert?: string;
};

export async function samlPair(slug: string) {
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  const meta = workspace?.ssoMetadata as SamlMetadata | null;
  if (!workspace || meta?.protocol !== "saml" || !meta.entryPoint || !meta.issuer || !meta.cert) {
    return null;
  }
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const sp = ServiceProvider({
    entityID: `${base}/api/auth/saml/${slug}`,
    wantAssertionsSigned: true,
    authnRequestsSigned: false,
    assertionConsumerService: [
      { Binding: POST, Location: `${base}/api/auth/saml/${slug}/acs` },
    ],
  });
  const idp = IdentityProvider({
    entityID: meta.issuer,
    signingCert: meta.cert,
    singleSignOnService: [{ Binding: REDIRECT, Location: meta.entryPoint }],
  });
  return { workspace, sp, idp };
}
