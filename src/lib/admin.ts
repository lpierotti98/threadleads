export const ADMIN_EMAILS = ['pm.marine@admasol.com'];

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
