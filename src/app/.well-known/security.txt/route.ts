const SECURITY_TXT = `# Kumbú Marketplace — reporte de segurança
Contact: mailto:suporte@kumbu-market.com
Contact: mailto:support@kumbu-market.com
Contact: https://www.kumbu-market.com/support
Expires: 2027-07-27T00:00:00.000Z
Preferred-Languages: pt, en, fr
Canonical: https://www.kumbu-market.com/.well-known/security.txt
Policy: https://www.kumbu-market.com/privacidade
`;

export function GET() {
  return new Response(SECURITY_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
