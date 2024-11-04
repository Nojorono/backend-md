import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY; // Must be 32 characters (256 bits)
const iv = process.env.ENCRYPTION_IV; // Must be 16 characters (128 bits)

/**
 * Encrypt the text using AES-256-CBC encryption algorithm
 * @param text - The text to encrypt
 * @returns The encrypted string in hex format
 */
export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(encryptionKey),
    Buffer.from(iv),
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt the encrypted text using AES-256-CBC decryption algorithm
 * @param encryptedText - The encrypted string in hex format
 * @returns The decrypted text in utf8 format
 */
export function decrypt(encryptedText: string): number {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(encryptionKey),
    Buffer.from(iv),
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return parseInt(decrypted);
}

export function buildSearchQuery(searchTerm: string, searchColumns: string[]) {
  if (!searchTerm) return null;

  // Create search conditions for each column
  const searchConditions = searchColumns.map((column) => {
    return sql`${sql.raw(column)} ILIKE ${`%${searchTerm}%`}`;
  });

  // Combine conditions using OR
  const combinedConditions = sql.join(searchConditions, sql` OR `);

  // Return the complete search condition wrapped in parentheses
  return sql`(${combinedConditions})`;
}

export function buildSearchORM(
  searchTerm: string,
  searchColumns: string[] = [],
) {
  if (
    !searchTerm ||
    !Array.isArray(searchColumns) ||
    searchColumns.length === 0
  ) {
    return null; // Return null if searchTerm is empty or searchColumns is invalid
  }

  console.log(searchColumns, searchTerm);

  const searchCondition = searchColumns?.map((column) => {
    return sql`${sql.identifier(column)} ILIKE ${`%${searchTerm}%`}`;
  });

  return sql.join(searchCondition, sql` OR `);
}

// pagination.helper.ts
export function paginate(totalRecords: number, page: number, limit: number) {
  const totalPages = Math.ceil(totalRecords / limit);
  const offset = (page - 1) * limit;

  return {
    totalRecords,
    totalPages,
    currentPage: page,
    limit,
    offset,
  };
}
export function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function generateCode(prefix = '', sequence) {
  if (sequence === null || sequence === undefined) {
    throw new Error('Sequence is required');
  }

  // Generate date-based portion
  const date = new Date();
  const yearPart = date.getFullYear().toString().slice(-2);
  const monthPart = (date.getMonth() + 1).toString().padStart(2, '0'); // 2-digit month
  const dayPart = date.getDate().toString().padStart(2, '0'); // 2-digit day

  // Pad sequence to ensure a uniform length (e.g., 4 digits)
  const sequencePart = sequence.toString().padStart(4, '0');

  // Concatenate parts into the final code
  return `${prefix}${yearPart}${monthPart}${dayPart}${sequencePart}`;
}
