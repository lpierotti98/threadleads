import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return 'tl_live_' + randomBytes(16).toString('hex');
}
