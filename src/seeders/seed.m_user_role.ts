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
  menus: Array<{ title: string; path: string }> = [],
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
      { title: "Dashboard", path: "/" },
      { title: "User Profile", path: "/pages/user" },
      { title: "Master Users", path: "/master/users" },
      { title: "Master Roles", path: "/master/roles" },
      { title: "Master Brand", path: "/master/brand" },
      { title: "Master Sio", path: "/master/sio" },
      { title: "Master Region", path: "/master/region" },
      { title: "Master Area", path: "/master/region/area/:id" },
      { title: "Master Batch", path: "/master/batch" },
      { title: "Batch Target", path: "/master/batch/target/:id" },
      { title: "Survey Outlet", path: "/survey" },
      { title: "Detail Survey Outlet", path: "/survey/detail/:id" },
      { title: "Activity", path: "/activity" },
      { title: "Detail Activity", path: "/activity/detail/:id" },
      { title: "Call Plan", path: "/call-plan" },
      { title: "Call Plan Schedule", path: "/call-plan/schedule/:id" },
      { title: "Master Outlet", path: "/master/outlet" },
      { title: "Outlet Detail", path: "/master/outlet/detail/:id" },
    ];

    const normalMenus = [
      { title: "Dashboard", path: "/" },
      { title: "User Profile", path: "/pages/user" },
      { title: "Detail Survey Outlet", path: "/survey/detail/:id" },
      { title: "Activity", path: "/activity" },
      { title: "Detail Activity", path: "/activity/detail/:id" },
      { title: "Call Plan", path: "/call-plan" },
      { title: "Call Plan Schedule", path: "/call-plan/schedule/:id" },
      { title: "Master Users", path: "/master/users" },
      { title: "Master Outlet", path: "/master/outlet" },
      { title: "Outlet Detail", path: "/master/outlet/detail/:id" },
    ];

    const roles = [
      createRole('SUPER-ADMIN', 'Administrator with full access', adminMenus),
      createRole('ADMIN', 'Administrator with full access', adminMenus),
      createRole('NASIONAL', 'NASIONAL Administrator access', adminMenus),
      createRole('REGIONAL', 'REGIONAL limited access', normalMenus),
      createRole('AMO', 'AMO limited access', normalMenus),
      createRole('TL', 'Regular user with limited access', normalMenus),
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
