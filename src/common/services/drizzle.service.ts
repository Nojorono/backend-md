import { Injectable, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import * as schema from '../../schema'; // Import all schemas from index file

config();

@Injectable()
export class DrizzleService implements OnModuleInit {
  private readonly databaseType: string;
  private db: any;

  constructor() {
    this.databaseType = process.env.DATABASE_TYPE || 'postgresql';
  }

  // On module initialization, connect to the database
  async onModuleInit() {
    if (this.databaseType === 'postgresql') {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL, // Ensure DATABASE_URL is set in your .env file
      });

      // Initialize the Drizzle ORM instance with the connection pool
      this.db = drizzle(pool, { schema });
    } else {
      throw new Error('Unsupported database provider');
    }
  }

  // Get the database instance for use in other services
  getDatabase() {
    return this.db;
  }

  // Health check function to verify the database connection
  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      if (this.databaseType === 'postgresql') {
        await this.db.execute('SELECT 1'); // Drizzle's method for executing raw queries
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
