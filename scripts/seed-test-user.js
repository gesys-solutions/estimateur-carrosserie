// seed-test-user.js - Create test admin user for smoke tests
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');
  
  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      id: 'test-tenant-001',
      name: 'Demo Carrosserie',
      slug: 'demo',
    },
  });
  console.log('✅ Tenant created:', tenant.name);
  
  // Create admin user
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.com'
      }
    },
    update: {},
    create: {
      id: 'test-user-001',
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash: passwordHash,
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);
  console.log('\n📋 Test credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
