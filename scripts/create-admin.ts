import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create tenant first
  const tenant = await prisma.tenant.upsert({
    where: { id: 'gesys-demo' },
    update: {},
    create: {
      id: 'gesys-demo',
      name: 'Gesys Solutions (Demo)',
      slug: 'gesys-demo',
    }
  })
  console.log('Tenant created:', tenant.name)

  // Create admin user
  const hashedPassword = await bcrypt.hash('EstimPro2026!', 10)
  const user = await prisma.user.upsert({
    where: { email: 'yvesgagnon@gesys.ai' },
    update: {},
    create: {
      email: 'yvesgagnon@gesys.ai',
      firstName: 'Yves',
      lastName: 'Gagnon',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    }
  })
  console.log('Admin user created:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
