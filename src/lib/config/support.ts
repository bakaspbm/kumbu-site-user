export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "apoio@kumbu.ao";
}
