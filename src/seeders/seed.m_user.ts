import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { mUser } from '../schema';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function seedUsers() {
  try {
    // Sample user data
    const users = [
      {
        username: 'administrator',
        user_role_id: 1, // Ensure this role exists in your m_user_roles table
        fullname: 'Administrator',
        password: await bcrypt.hash('123123', 10),
        email: 'administrator@nna.id',
        phone: '1234567890',
        tipe_md: 'N',
        area: [],
        region: null,
        is_active: 1,
        valid_from: new Date(),
        valid_to: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        remember_token: null,
        last_login: null,
        created_by: 'system',
        updated_by: 'system',
      },
      {
        username: 'admin',
        user_role_id: 2,
        fullname: 'Regular Admin',
        password: await bcrypt.hash('123123', 10),
        email: 'admin@nna.1',
        phone: '0987654321',
        tipe_md: 'N',
        area: [],
        region: null,
        is_active: 1,
        valid_from: new Date(),
        valid_to: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        remember_token: null,
        last_login: null,
        created_by: 'system',
        updated_by: 'system',
      },
    ];

    await db.insert(mUser).values(users);
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await pool.end(); // Close the connection pool to avoid hanging connections
  }
}

export default seedUsers;
