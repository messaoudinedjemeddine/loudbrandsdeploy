const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { getWilayaById, getWilayaName } = require('../utils/wilaya-mapper');
const DeliveryDeskMapper = require('../utils/delivery-desk-mapper');
const router = express.Router();

const prisma = new PrismaClient();

const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  customerEmail: z.string().email().optional(),
  deliveryType: z.enum(['HOME_DELIVERY', 'PICKUP']),
  deliveryAddress: z.string().optional(),
  wilayaId: z.number().min(1, 'Wilaya is required'), // Changed from cityId to wilayaId
  deliveryDeskId: z.string().optional(),
  deliveryDeskName: z.string().optional(),
  deliveryFee: z.union([z.number().min(0, 'Delivery fee must be non-negative'), z.undefined()]).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    sizeId: z.string().optional()
  })).min(1, 'At least one item is required')
}).refine((data) => {
  // For PICKUP orders, deliveryDeskId should be provided and not empty
  if (data.deliveryType === 'PICKUP' && (!data.deliveryDeskId || data.deliveryDeskId.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Delivery desk ID is required for pickup orders",
  path: ["deliveryDeskId"]
});

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Received order data:', req.body);
    
    let orderData;
    try {
      orderData = createOrderSchema.parse(req.body);
    } catch (validationError) {
      console.error('❌ Validation error:', validationError.errors);
      console.error('❌ Received data:', req.body);
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: validationError.errors,
        receivedData: req.body
      });
    }

    // Get wilaya information using the mapper utility
    const wilayaInfo = getWilayaById(orderData.wilayaId);
    if (!wilayaInfo) {
      return res.status(400).json({ 
        error: `Unsupported wilaya ID: ${orderData.wilayaId}` 
      });
    }

    const cityName = wilayaInfo.name;

    // Find the city by name with fallback options
    let city = await prisma.city.findFirst({
      where: { name: cityName }
    });

    // If not found, try alternative name formats
    if (!city) {
      // Try with different case variations and alternative names
      city = await prisma.city.findFirst({
        where: {
          OR: [
            { name: { equals: cityName, mode: 'insensitive' } },
            { name: { contains: cityName, mode: 'insensitive' } },
            { nameAr: { contains: cityName, mode: 'insensitive' } },
            // Try with alternative names from the mapper
            ...wilayaInfo.alternatives.map(alt => ({ 
              name: { equals: alt, mode: 'insensitive' } 
            })),
            ...wilayaInfo.alternatives.map(alt => ({ 
              nameAr: { contains: alt, mode: 'insensitive' } 
            }))
          ]
        }
      });
    }

    if (!city) {
      console.error(`City not found for wilaya ID ${orderData.wilayaId} with name: ${cityName}`);
      console.error('Available cities in database:', await prisma.city.findMany({ select: { name: true, nameAr: true } }));
      return res.status(400).json({ 
        error: `City not found for wilaya: ${cityName}. Please contact support.` 
      });
    }

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { sizes: true }
      });

      if (!product || !product.isActive) {
        return res.status(400).json({ 
          error: `Product not found: ${item.productId}` 
        });
      }

      // Check stock
      let availableStock = product.stock;
      if (item.sizeId) {
        const size = product.sizes.find(s => s.id === item.sizeId);
        if (!size) {
          return res.status(400).json({ 
            error: `Size not found for product: ${product.name}` 
          });
        }
        availableStock = size.stock;
      }

      if (availableStock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product: ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        sizeId: item.sizeId,
        size: item.sizeId ? product.sizes.find(s => s.id === item.sizeId)?.size : null
      });
    }

    // Use delivery fee from frontend or calculate default
    const deliveryFee = (orderData.deliveryFee !== undefined && orderData.deliveryFee !== null) ? orderData.deliveryFee : (orderData.deliveryType === 'HOME_DELIVERY' ? 500 : 0);
    const total = subtotal + deliveryFee;
    
    console.log('🔍 Order creation debug:', {
      subtotal,
      deliveryFee,
      total,
      deliveryType: orderData.deliveryType,
      frontendDeliveryFee: orderData.deliveryFee
    });

    // Handle delivery desk for pickup orders
    let deliveryDeskId = null;
    if (orderData.deliveryType === 'PICKUP') {
      // Use the mapper to find or create a delivery desk for this city
      const centerName = orderData.deliveryDeskName || `Yalidine Center - ${city.name}`;
      deliveryDeskId = await DeliveryDeskMapper.findOrCreateDeliveryDesk(
        city.id,
        orderData.deliveryDeskId, // Yalidine center ID
        centerName // Yalidine center name
      );
      
      if (deliveryDeskId) {
        console.log(`✅ Delivery desk resolved: ${deliveryDeskId}`);
      } else {
        console.log(`⚠️ Could not resolve delivery desk for city: ${city.name} (${city.id})`);
        // Order will be created without a delivery desk
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          deliveryType: orderData.deliveryType,
          deliveryAddress: orderData.deliveryAddress,
          deliveryFee,
          subtotal,
          total,
          notes: orderData.notes,
          cityId: city.id,
          deliveryDeskId: deliveryDeskId,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          city: true,
          deliveryDesk: true
        }
      });

      // Update stock
      for (const item of orderData.items) {
        if (item.sizeId) {
          await tx.productSize.update({
            where: { id: item.sizeId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      return newOrder;
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        city: true,
        deliveryDesk: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;