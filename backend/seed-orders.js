const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Real Algerian names (first names and last names)
const algerianNames = {
  firstNames: [
    'Ahmed', 'Mohammed', 'Ali', 'Omar', 'Youssef', 'Karim', 'Samir', 'Nassim', 'Bilal', 'Rachid',
    'Fatima', 'Amina', 'Khadija', 'Zineb', 'Meriem', 'Sara', 'Nour', 'Layla', 'Yasmina', 'Samira',
    'Abdelkader', 'Mustapha', 'Hassan', 'Said', 'Djamel', 'Farid', 'Malik', 'Tarek', 'Wassim', 'Adel',
    'Nadia', 'Djamila', 'Hakima', 'Fadila', 'Zakia', 'Malika', 'Leila', 'Rachida', 'Houria', 'Yamina'
  ],
  lastNames: [
    'Benali', 'Bouazza', 'Chaabane', 'Dahmani', 'El Amri', 'Fellah', 'Guerroumi', 'Hamidi', 'Ibrahim', 'Jaballah',
    'Khelifi', 'Larbi', 'Mansouri', 'Nacer', 'Ouazani', 'Pacha', 'Rahmani', 'Saadi', 'Taleb', 'Ullah',
    'Verdi', 'Wahab', 'Yahia', 'Zerrouki', 'Abdelkrim', 'Boumediene', 'Cherif', 'Dridi', 'El Kadi', 'Fares',
    'Gacem', 'Hadj', 'Idir', 'Jaziri', 'Kaci', 'Lounis', 'Mekki', 'Nait', 'Ouali', 'Poulet'
  ]
};

// Algerian phone numbers (mobile and landline)
const algerianPhoneNumbers = [
  // Mobile numbers (06, 05, 07)
  '0661234567', '0662345678', '0663456789', '0664567890', '0665678901',
  '0666789012', '0667890123', '0668901234', '0669012345', '0660123456',
  '0551234567', '0552345678', '0553456789', '0554567890', '0555678901',
  '0556789012', '0557890123', '0558901234', '0559012345', '0550123456',
  '0771234567', '0772345678', '0773456789', '0774567890', '0775678901',
  '0776789012', '0777890123', '0778901234', '0779012345', '0770123456',
  // Landline numbers (021, 031, 041, etc.)
  '021123456', '021234567', '021345678', '021456789', '021567890',
  '031123456', '031234567', '031345678', '031456789', '031567890',
  '041123456', '041234567', '041345678', '041456789', '041567890',
  '051123456', '051234567', '051345678', '051456789', '051567890'
];

// Algerian cities with their wilaya codes
const algerianCities = [
  { name: 'Algiers', nameAr: 'الجزائر', code: '16', wilayaId: 16 },
  { name: 'Oran', nameAr: 'وهران', code: '31', wilayaId: 31 },
  { name: 'Constantine', nameAr: 'قسنطينة', code: '25', wilayaId: 25 },
  { name: 'Annaba', nameAr: 'عنابة', code: '23', wilayaId: 23 },
  { name: 'Batna', nameAr: 'باتنة', code: '05', wilayaId: 5 },
  { name: 'Blida', nameAr: 'البليدة', code: '09', wilayaId: 9 },
  { name: 'Setif', nameAr: 'سطيف', code: '19', wilayaId: 19 },
  { name: 'Tlemcen', nameAr: 'تلمسان', code: '13', wilayaId: 13 },
  { name: 'Bejaia', nameAr: 'بجاية', code: '06', wilayaId: 6 },
  { name: 'Tebessa', nameAr: 'تبسة', code: '12', wilayaId: 12 }
];

// Yalidine delivery desks for each city
const yalidineDeliveryDesks = [
  // Algiers
  { name: 'Yalidine Algiers Centre', nameAr: 'ياليدين الجزائر المركز', address: 'Rue Didouche Mourad, Algiers', phone: '021123456', cityName: 'Algiers' },
  { name: 'Yalidine Algiers Bab Ezzouar', nameAr: 'ياليدين الجزائر باب الزوار', address: 'Zone Industrielle, Bab Ezzouar', phone: '021234567', cityName: 'Algiers' },
  { name: 'Yalidine Algiers Hussein Dey', nameAr: 'ياليدين الجزائر حسين داي', address: 'Avenue des Martyrs, Hussein Dey', phone: '021345678', cityName: 'Algiers' },
  
  // Oran
  { name: 'Yalidine Oran Centre', nameAr: 'ياليدين وهران المركز', address: 'Place du 1er Novembre, Oran', phone: '041123456', cityName: 'Oran' },
  { name: 'Yalidine Oran Bir El Djir', nameAr: 'ياليدين وهران بئر الجير', address: 'Route Nationale, Bir El Djir', phone: '041234567', cityName: 'Oran' },
  
  // Constantine
  { name: 'Yalidine Constantine Centre', nameAr: 'ياليدين قسنطينة المركز', address: 'Avenue de la République, Constantine', phone: '031123456', cityName: 'Constantine' },
  { name: 'Yalidine Constantine El Khroub', nameAr: 'ياليدين قسنطينة الخروب', address: 'Route de Batna, El Khroub', phone: '031234567', cityName: 'Constantine' },
  
  // Annaba
  { name: 'Yalidine Annaba Centre', nameAr: 'ياليدين عنابة المركز', address: 'Boulevard de l\'Indépendance, Annaba', phone: '038123456', cityName: 'Annaba' },
  
  // Batna
  { name: 'Yalidine Batna Centre', nameAr: 'ياليدين باتنة المركز', address: 'Avenue de la Révolution, Batna', phone: '033123456', cityName: 'Batna' },
  
  // Blida
  { name: 'Yalidine Blida Centre', nameAr: 'ياليدين البليدة المركز', address: 'Rue de la Liberté, Blida', phone: '025123456', cityName: 'Blida' },
  
  // Setif
  { name: 'Yalidine Setif Centre', nameAr: 'ياليدين سطيف المركز', address: 'Place du 8 Mai 1945, Setif', phone: '036123456', cityName: 'Setif' },
  
  // Tlemcen
  { name: 'Yalidine Tlemcen Centre', nameAr: 'ياليدين تلمسان المركز', address: 'Avenue de l\'Indépendance, Tlemcen', phone: '043123456', cityName: 'Tlemcen' },
  
  // Bejaia
  { name: 'Yalidine Bejaia Centre', nameAr: 'ياليدين بجاية المركز', address: 'Boulevard de la Mer, Bejaia', phone: '034123456', cityName: 'Bejaia' },
  
  // Tebessa
  { name: 'Yalidine Tebessa Centre', nameAr: 'ياليدين تبسة المركز', address: 'Avenue de l\'Armée, Tebessa', phone: '037123456', cityName: 'Tebessa' }
];

// Sample products for orders
const sampleProducts = [
  { name: 'iPhone 15 Pro', price: 150000, stock: 50 },
  { name: 'Samsung Galaxy S24', price: 120000, stock: 30 },
  { name: 'Designer Watch', price: 25000, stock: 20 },
  { name: 'Wireless Headphones', price: 15000, stock: 40 },
  { name: 'Laptop Dell XPS', price: 180000, stock: 15 },
  { name: 'Gaming Mouse', price: 8000, stock: 60 },
  { name: 'Bluetooth Speaker', price: 12000, stock: 35 },
  { name: 'Smart Watch', price: 35000, stock: 25 },
  { name: 'Tablet iPad', price: 95000, stock: 20 },
  { name: 'Wireless Charger', price: 5000, stock: 80 }
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPhoneNumber() {
  return getRandomElement(algerianPhoneNumbers);
}

function getRandomName() {
  const firstName = getRandomElement(algerianNames.firstNames);
  const lastName = getRandomElement(algerianNames.lastNames);
  return `${firstName} ${lastName}`;
}

function getRandomOrderNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
}

function getRandomDeliveryAddress(cityName) {
  const streets = [
    'Rue de la Liberté', 'Avenue des Martyrs', 'Boulevard de l\'Indépendance',
    'Place du 1er Novembre', 'Rue Didouche Mourad', 'Avenue de la République',
    'Route Nationale', 'Zone Industrielle', 'Avenue de la Révolution'
  ];
  const street = getRandomElement(streets);
  const number = Math.floor(Math.random() * 200) + 1;
  return `${street} ${number}, ${cityName}`;
}

async function seedOrders() {
  try {
    console.log('🌱 Starting orders seeding...');

    // First, ensure we have categories and products
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the main seed file first.');
      return;
    }

    const products = await prisma.product.findMany();
    if (products.length === 0) {
      console.log('❌ No products found. Please run the main seed file first.');
      return;
    }

    // Create or update cities
    console.log('🏙️ Creating/updating Algerian cities...');
    const createdCities = [];
    for (const cityData of algerianCities) {
      const city = await prisma.city.upsert({
        where: { code: cityData.code },
        update: {},
        create: {
          name: cityData.name,
          nameAr: cityData.nameAr,
          code: cityData.code,
          deliveryFee: Math.floor(Math.random() * 500) + 200, // Random delivery fee between 200-700 DA
          isActive: true
        }
      });
      createdCities.push(city);
      console.log(`✅ City created/updated: ${city.name}`);
    }

    // Create or update delivery desks
    console.log('🏢 Creating/updating Yalidine delivery desks...');
    const createdDeliveryDesks = [];
    for (const deskData of yalidineDeliveryDesks) {
      const city = createdCities.find(c => c.name === deskData.cityName);
      if (city) {
        const desk = await prisma.deliveryDesk.create({
          data: {
            name: deskData.name,
            nameAr: deskData.nameAr,
            address: deskData.address,
            phone: deskData.phone,
            cityId: city.id,
            isActive: true
          }
        });
        createdDeliveryDesks.push(desk);
        console.log(`✅ Delivery desk created/updated: ${desk.name}`);
      }
    }

    // Create sample orders
    console.log('📦 Creating sample orders...');
    const ordersToCreate = 50; // Create 50 sample orders
    const createdOrders = [];

    for (let i = 0; i < ordersToCreate; i++) {
      const customerName = getRandomName();
      const customerPhone = getRandomPhoneNumber();
      const orderNumber = getRandomOrderNumber();
      const city = getRandomElement(createdCities);
      const deliveryType = Math.random() > 0.5 ? 'HOME_DELIVERY' : 'PICKUP';
      const deliveryDesk = deliveryType === 'PICKUP' ? 
        getRandomElement(createdDeliveryDesks.filter(d => d.cityId === city.id)) : null;
      
      // Random order statuses
      const callCenterStatuses = ['NEW', 'CONFIRMED', 'PENDING', 'CANCELED', 'DOUBLE_ORDER', 'DELAYED'];
      const deliveryStatuses = ['NOT_READY', 'READY', 'IN_TRANSIT', 'DONE'];
      
      const callCenterStatus = getRandomElement(callCenterStatuses);
      const deliveryStatus = getRandomElement(deliveryStatuses);
      
      // Random order date (within last 30 days)
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      // Create order items
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = getRandomElement(products);
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          quantity: quantity,
          price: product.price,
          productId: product.id
        });
      }
      
      const deliveryFee = deliveryType === 'HOME_DELIVERY' ? city.deliveryFee : 0;
      const total = subtotal + deliveryFee;
      
      // Create the order
      const order = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
          deliveryType: deliveryType,
          deliveryAddress: deliveryType === 'HOME_DELIVERY' ? getRandomDeliveryAddress(city.name) : null,
          deliveryFee: deliveryFee,
          subtotal: subtotal,
          total: total,
          notes: Math.random() > 0.7 ? `Note for order ${orderNumber}: ${getRandomElement(['Urgent delivery', 'Fragile items', 'Call before delivery', 'Leave with neighbor'])}` : null,
          callCenterStatus: callCenterStatus,
          deliveryStatus: deliveryStatus,
          trackingNumber: callCenterStatus === 'CONFIRMED' ? `YL${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : null,
          yalidineShipmentId: callCenterStatus === 'CONFIRMED' ? `SH${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}` : null,
          createdAt: orderDate,
          updatedAt: orderDate,
          cityId: city.id,
          deliveryDeskId: deliveryDesk?.id || null,
          items: {
            create: orderItems
          }
        }
      });
      
      createdOrders.push(order);
      console.log(`✅ Order created: ${order.orderNumber} - ${customerName} (${customerPhone})`);
    }

    console.log('🎉 Orders seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Cities created/updated: ${createdCities.length}`);
    console.log(`- Delivery desks created/updated: ${createdDeliveryDesks.length}`);
    console.log(`- Orders created: ${createdOrders.length}`);
    
    // Show some statistics
    const statusStats = await prisma.order.groupBy({
      by: ['callCenterStatus'],
      _count: {
        callCenterStatus: true
      }
    });
    
    console.log('\n📊 Order Status Distribution:');
    statusStats.forEach(stat => {
      console.log(`- ${stat.callCenterStatus}: ${stat._count.callCenterStatus} orders`);
    });

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedOrders();
}

module.exports = { seedOrders };
