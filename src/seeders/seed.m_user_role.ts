import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { mUserRoles } from '../schema'; // Adjust schema import based on your setup

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

// Function to generate role data, including optional menus
const createRole = (
  name: string,
  description: string,
  menus: Array<{ name: string; value: string }> = [],
  createdBy = 'system',
  updatedBy = 'system',
) => ({
  name,
  description,
  menus,
  created_by: createdBy,
  updated_by: updatedBy,
});

// Seeder function for user roles with menu access for SUPER-ADMIN and ADMIN
async function seedUserRoles() {
  try {
    const adminMenus = [
      { name: 'Dashboard', value: '/' },
      { name: 'User Profile', value: '/pages/user' },
      { name: 'Master Outlet', value: '/master/outlet' },
      { name: 'Master Users', value: '/master/users' },
      { name: 'Master Roles', value: '/master/roles' },
      { name: 'Master Batch', value: '/master/batch' },
      { name: 'Call Plan', value: '/call-plan' },
      { name: 'Call Plan Schedule', value: '/call-plan/schedule/:id' },
    ];

    const roles = [
      createRole('SUPER-ADMIN', 'Administrator with full access', adminMenus),
      createRole('ADMIN', 'Administrator with full access', adminMenus),
      createRole('NASIONAL', 'NASIONAL Administrator access', adminMenus),
      createRole('REGIONAL', 'REGIONAL limited access', adminMenus),
      createRole('AMO', 'AMO limited access', adminMenus),
      createRole('TL', 'Regular user with limited access', []),
      createRole('MD', 'Regular user with limited access', []),
    ];

    await db.insert(mUserRoles).values(roles);
    console.log('User roles with menus seeded successfully');
  } catch (error) {
    console.error('Error seeding user roles with menus:', error);
  } finally {
    await pool.end();
  }
}

export default seedUserRoles;
