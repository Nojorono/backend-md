// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { HealthIndicatorResult } from '@nestjs/terminus';
// import { PrismaClient } from '@prisma/client';
// import { config } from 'dotenv';
//
// config();
//
// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit {
//   private readonly databaseType: string;
//
//   constructor() {
//     super();
//     this.databaseType = process.env.DATABASE_TYPE || 'postgresql';
//   }
//
//   async onModuleInit() {
//     await this.$connect();
//   }
//
//   async isHealthy(): Promise<HealthIndicatorResult> {
//     try {
//       if (this.databaseType === 'postgresql') {
//         await this.$queryRaw`SELECT 1`;
//       } else if (this.databaseType === 'mongodb') {
//         await this.$queryRaw`db.runCommand({ ping: 1 })`;
//       } else {
//         throw new Error('Unsupported database provider');
//       }
//       return Promise.resolve({
//         prisma: {
//           status: 'up',
//         },
//       });
//     } catch (e) {
//       return Promise.resolve({
//         prisma: {
//           status: 'down',
//         },
//       });
//     }
//   }
// }
