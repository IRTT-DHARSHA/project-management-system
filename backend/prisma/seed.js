/**
 * Seed script - creates a demo user with sample projects and tasks.
 * Run with: npm run seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      fullName: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  const website = await prisma.project.create({
    data: {
      name: 'Company Website Redesign',
      description: 'Revamp the marketing website with a new design system.',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-10-15'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Design homepage mockups',
            description: 'Create high-fidelity mockups in Figma.',
            priority: 'HIGH',
            status: 'COMPLETED',
            dueDate: new Date('2026-08-10'),
          },
          {
            name: 'Implement responsive navbar',
            description: 'Build the navbar component with mobile menu.',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            dueDate: new Date('2026-09-05'),
          },
          {
            name: 'Set up analytics',
            description: 'Integrate Google Analytics and event tracking.',
            priority: 'LOW',
            status: 'PENDING',
            dueDate: new Date('2026-09-20'),
          },
        ],
      },
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Launch',
      description: 'Ship v1 of the companion mobile app.',
      status: 'NOT_STARTED',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Define MVP feature set',
            description: 'Workshop with stakeholders to scope MVP.',
            priority: 'HIGH',
            status: 'PENDING',
            dueDate: new Date('2026-10-10'),
          },
          {
            name: 'Set up CI/CD pipeline',
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: new Date('2026-10-20'),
          },
        ],
      },
    },
  });

  console.log('Seed complete:');
  console.log({ user: user.email, projects: [website.name, mobileApp.name] });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
