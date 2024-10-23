import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HelperHashService {
  private readonly saltRounds = 10;

  // Asynchronous method to hash a password
  async createHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Synchronous method to hash a password
  createHashSync(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  // Asynchronous method to compare a hash and a password
  match(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Synchronous method to compare a hash and a password
  matchSync(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
