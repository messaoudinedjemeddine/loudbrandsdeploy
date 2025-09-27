const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('👥 Creating users for dashboards...');
    
    // Create Confirmatrice user
    const confirmatricePassword = await bcrypt.hash('confirmatrice123', 12);
    const confirmatrice = await prisma.user.upsert({
      where: { email: 'confirmatrice@loudbrands.com' },
      update: {},
      create: {
        email: 'confirmatrice@loudbrands.com',
        password: confirmatricePassword,
        firstName: 'Fatima',
        lastName: 'Benali',
        role: 'CONFIRMATRICE',
        phone: '+213 555 123 456'
      }
    });
    console.log('✅ Confirmatrice user created:', confirmatrice.email);

    // Create Agent de Livraison user
    const agentPassword = await bcrypt.hash('agent123', 12);
    const agent = await prisma.user.upsert({
      where: { email: 'agent@loudbrands.com' },
      update: {},
      create: {
        email: 'agent@loudbrands.com',
        password: agentPassword,
        firstName: 'Ahmed',
        lastName: 'Khelil',
        role: 'AGENT_LIVRAISON',
        phone: '+213 555 789 012'
      }
    });
    console.log('✅ Agent de Livraison user created:', agent.email);

    // Create additional Admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@loudbrands.com' },
      update: {},
      create: {
        email: 'admin@loudbrands.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        phone: '+213 555 000 000'
      }
    });
    console.log('✅ Admin user created:', admin.email);

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('================================');
    console.log('🔐 ADMIN DASHBOARD:');
    console.log('   Email: admin@loudbrands.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('📞 CONFIRMATRICE DASHBOARD:');
    console.log('   Email: confirmatrice@loudbrands.com');
    console.log('   Password: confirmatrice123');
    console.log('');
    console.log('🚚 AGENT DE LIVRAISON DASHBOARD:');
    console.log('   Email: agent@loudbrands.com');
    console.log('   Password: agent123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers };
