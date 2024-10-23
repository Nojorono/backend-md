import seedUserRole from './seed.m_user_role';
import seedUsers from './seed.m_user';

async function runSeeders() {
  try {
    console.log('Seeding...');
    await seedUserRole();
    await seedUsers();
    console.log('Seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

runSeeders();
