import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { mUserRoles } from '../schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your database connection string
});
const db = drizzle(pool);

// Pure function to generate role data
const createRole = (
  name: string,
  description: string,
  createdBy = 'system',
  updatedBy = 'system',
) => ({
  name,
  description,
  is_active: 1,
  is_web: 1,
  is_mobile: 1,
  created_by: createdBy,
  updated_by: updatedBy,
});

// Seeder function
async function seedUserRoles() {
  try {
    const roles = [
      createRole('SUPER-ADMIN', 'Administrator with full access'),
      createRole('ADMIN', 'Administrator with full access'),
      createRole('TL', 'Regular user with limited access'),
      createRole('MD', 'Regular user with limited access'),
    ];
    await db.insert(mUserRoles).values(roles);
    console.log('User roles seeded successfully');
  } catch (error) {
    console.error('Error seeding user roles:', error);
  } finally {
    await pool.end(); // Close the connection pool to avoid hanging connections
  }
}

export default seedUserRoles;
