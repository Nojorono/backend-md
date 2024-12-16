import { Injectable, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../schema'; // Import all schemas from index file
import { config } from 'dotenv';
config();

@Injectable()
export class DrizzleService implements OnModuleInit {
  private readonly databaseType: string;
  private db: any | null = null;

  constructor() {
    this.databaseType = process.env.DATABASE_TYPE || 'postgresql';
    // Set timezone to Asia/Jakarta
    process.env.TZ = 'Asia/Jakarta';
  }

  // On module initialization, connect to the database
  async onModuleInit() {
    try {
      if (this.databaseType === 'postgresql') {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        // Initialize the Drizzle ORM instance with the connection pool
        this.db = drizzle(pool, { schema });
      } else {
        throw new Error('Unsupported database provider');
      }
    } catch (error) {
      console.error('Error initializing database connection:', error);
      throw new Error(
        'Failed to initialize database connection in DrizzleService.',
      );
    }
  }

  // Health check function to verify the database connection
  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      if (this.databaseType === 'postgresql') {
        // Set timezone for the session
        await this.db.execute("SET timezone='Asia/Jakarta'");
        await this.db.execute('SELECT 1');
      } else {
        throw new Error('Unsupported database provider');
      }

      // Return the "up" status if the query succeeds
      return Promise.resolve({
        drizzle: {
          status: 'up',
        },
      });
    } catch (e) {
      // Return the "down" status if there's an error
      return Promise.resolve({
        drizzle: {
          status: 'down',
        },
      });
    }
  }
}
