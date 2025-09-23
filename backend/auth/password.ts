import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// Simple password hashing using Node.js crypto (production should use bcrypt)
export function hashPassword(password: string): string {
  const salt = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const testHash = createHash('sha256').update(password + salt).digest('hex');
    
    // Use timing-safe comparison
    const hashBuffer = Buffer.from(hash, 'hex');
    const testHashBuffer = Buffer.from(testHash, 'hex');
    
    return hashBuffer.length === testHashBuffer.length && 
           timingSafeEqual(hashBuffer, testHashBuffer);
  } catch (error) {
    return false;
  }
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}