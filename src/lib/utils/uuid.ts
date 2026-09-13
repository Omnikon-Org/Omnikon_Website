import crypto from 'crypto';

/**
 * Converts any arbitrary string (such as Firebase UID `K6GYlrz4a4eAvJWGJWmtZ7Dqwng1`)
 * into a valid RFC 4122 v4 formatted UUID (e.g. `1eb35cc1-0e65-5b7f-be85-b7aa65c66c90`).
 */
export function stringToUuid(str: string): string {
  // If already a valid UUID string, return as is
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str.toLowerCase();
  }

  const hash = crypto.createHash('sha256').update(str).digest('hex');

  // Format hash into UUID 8-4-4-4-12 pattern
  const part1 = hash.substring(0, 8);
  const part2 = hash.substring(8, 12);
  const part3 = `4${hash.substring(13, 16)}`; // UUID v4 version
  const part4 = `8${hash.substring(17, 20)}`; // UUID v4 variant
  const part5 = hash.substring(20, 32);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
}
