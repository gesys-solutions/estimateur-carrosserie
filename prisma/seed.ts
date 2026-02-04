import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo tenant (auto body shop)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "carrosserie-demo" },
    update: {},
    create: {
      name: "Carrosserie Démo",
      slug: "carrosserie-demo",
      address: "123 Rue Principale, Québec, QC G1A 1A1",
      phone: "418-555-0100",
      email: "info@carrosserie-demo.com",
      taxConfig: JSON.stringify({ tps: 5, tvq: 9.975 }),
    },
  });

  console.log(`✅ Tenant created: ${tenant.name}`);

  // Create demo users
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@demo.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@demo.com",
      passwordHash: "$2b$12$placeholder.hash.for.demo.password", // "password123"
      firstName: "Admin",
      lastName: "Démo",
      role: "ADMIN",
    },
  });

  const estimator = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "estimateur@demo.com" },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "estimateur@demo.com",
      passwordHash: "$2b$12$placeholder.hash.for.demo.password",
      firstName: "Jean",
      lastName: "Tremblay",
      role: "ESTIMATOR",
    },
  });

  console.log(`✅ Users created: ${admin.email}, ${estimator.email}`);

  // Create demo insurers
  const insurers = await Promise.all([
    prisma.insurer.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Intact Assurance" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Intact Assurance",
        code: "INT",
        phone: "1-866-464-2424",
        email: "reclamations@intact.net",
      },
    }),
    prisma.insurer.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Desjardins Assurances" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Desjardins Assurances",
        code: "DES",
        phone: "1-888-277-8726",
        email: "reclamations@desjardins.com",
      },
    }),
    prisma.insurer.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "La Capitale" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "La Capitale",
        code: "CAP",
        phone: "1-800-463-4856",
        email: "sinistres@lacapitale.com",
      },
    }),
  ]);

  console.log(`✅ Insurers created: ${insurers.length}`);

  // Create a demo client with vehicle
  const client = await prisma.client.upsert({
    where: { id: "demo-client-1" },
    update: {},
    create: {
      id: "demo-client-1",
      tenantId: tenant.id,
      firstName: "Marie",
      lastName: "Gagnon",
      phone: "418-555-0200",
      email: "marie.gagnon@email.com",
      address: "456 Avenue des Érables",
      city: "Québec",
      postalCode: "G1K 2B3",
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { id: "demo-vehicle-1" },
    update: {},
    create: {
      id: "demo-vehicle-1",
      clientId: client.id,
      make: "Honda",
      model: "Civic",
      year: 2022,
      vin: "1HGBH41JXMN109186",
      plate: "ABC 123",
      color: "Bleu",
      mileage: 45000,
    },
  });

  console.log(`✅ Client created: ${client.firstName} ${client.lastName}`);
  console.log(`✅ Vehicle created: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);

  // Create a demo estimate
  const estimate = await prisma.estimate.upsert({
    where: { tenantId_number: { tenantId: tenant.id, number: "EST-2026-0001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      number: "EST-2026-0001",
      clientId: client.id,
      vehicleId: vehicle.id,
      createdById: estimator.id,
      status: "DRAFT",
      damageType: "Collision",
      description: "Dommages au pare-chocs avant suite à une collision légère",
      subtotal: 1500.0,
      taxTps: 75.0,
      taxTvq: 149.63,
      total: 1724.63,
    },
  });

  // Add line items
  await prisma.lineItem.createMany({
    data: [
      {
        estimateId: estimate.id,
        type: "PART",
        description: "Pare-chocs avant - remplacement",
        quantity: 1,
        unitPrice: 800,
        subtotal: 800,
        sortOrder: 1,
      },
      {
        estimateId: estimate.id,
        type: "LABOR",
        description: "Main d'œuvre - dépose/pose",
        quantity: 3,
        unitPrice: 85,
        subtotal: 255,
        sortOrder: 2,
      },
      {
        estimateId: estimate.id,
        type: "PAINT",
        description: "Peinture et finition",
        quantity: 1,
        unitPrice: 445,
        subtotal: 445,
        sortOrder: 3,
      },
    ],
  });

  console.log(`✅ Estimate created: ${estimate.number}`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
