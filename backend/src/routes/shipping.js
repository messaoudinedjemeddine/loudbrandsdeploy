const express = require('express');
const router = express.Router();
const yalidineService = require('../services/yalidine');
const { getWilayaById, getWilayaName } = require('../utils/wilaya-mapper');
const { z } = require('zod');

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache helper function
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Validation schemas
const calculateFeesSchema = z.object({
  fromWilayaId: z.number().int().positive(),
  toWilayaId: z.number().int().positive(),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  declaredValue: z.number().positive().optional()
});

const createShipmentSchema = z.object({
  orderId: z.string().min(1),
  firstname: z.string().min(1),
  familyname: z.string().min(1),
  contactPhone: z.string().min(1),
  address: z.string().min(1),
  fromWilayaName: z.string().min(1),
  toWilayaName: z.string().min(1),
  toCommuneName: z.string().min(1),
  productList: z.string().min(1),
  price: z.number().positive(),
  weight: z.number().positive(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  isStopDesk: z.boolean().optional(),
  stopDeskId: z.number().int().positive().optional(),
  doInsurance: z.boolean().optional(),
  declaredValue: z.number().positive().optional(),
  freeshipping: z.boolean().optional(),
  hasExchange: z.boolean().optional(),
  productToCollect: z.string().optional()
});

// Check if Yalidine is configured
router.get('/status', (req, res) => {
  res.json({
    configured: yalidineService.isConfigured(),
    message: yalidineService.isConfigured() 
      ? 'Yalidine shipping is available' 
      : 'Yalidine API not configured'
  });
});

// Test Yalidine API connection and endpoints
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Testing Yalidine connection...');
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    console.log('✅ Yalidine is configured, testing connection...');
    
    // Test basic API call
    try {
      const wilayas = await yalidineService.getWilayas();
      console.log('✅ Wilayas test passed:', wilayas.data?.length || 0, 'wilayas found');
    } catch (wilayaError) {
      console.error('❌ Wilayas test failed:', wilayaError.message);
      return res.status(500).json({ 
        error: 'Yalidine API test failed', 
        details: wilayaError.message,
        configured: yalidineService.isConfigured()
      });
    }

    res.json({ 
      success: true, 
      message: 'Yalidine API is working correctly',
      configured: yalidineService.isConfigured()
    });
  } catch (error) {
    console.error('Error testing Yalidine connection:', error);
    res.status(500).json({ 
      error: 'Failed to test connection',
      details: error.message,
      configured: yalidineService.isConfigured()
    });
  }
});

// Get all wilayas (provinces)
router.get('/wilayas', async (req, res) => {
  try {
    console.log('🔍 Wilayas request received');
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    // Check cache first
    const cacheKey = 'wilayas';
    const cachedWilayas = getCachedData(cacheKey);
    if (cachedWilayas) {
      console.log('✅ Returning cached wilayas data');
      return res.json(cachedWilayas);
    }

    console.log('🔍 Calling Yalidine service for wilayas');
    
    // Add retry logic for intermittent failures
    let wilayas;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        wilayas = await yalidineService.getWilayas();
        console.log('✅ Wilayas fetched successfully, count:', wilayas.data ? wilayas.data.length : 'unknown');
        break;
      } catch (retryError) {
        retryCount++;
        console.log(`⚠️ Retry ${retryCount}/${maxRetries} for wilayas request`);
        
        if (retryCount >= maxRetries) {
          throw retryError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Cache the result
    setCachedData(cacheKey, wilayas);
    
    res.json(wilayas);
  } catch (error) {
    console.error('❌ Error fetching wilayas:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch wilayas' });
  }
});

// Get communes by wilaya
router.get('/communes', async (req, res) => {
  try {
    console.log('🔍 Communes request received:', { wilayaId: req.query.wilayaId });
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { wilayaId } = req.query;
    
    // Check cache first
    const cacheKey = `communes_${wilayaId || 'all'}`;
    const cachedCommunes = getCachedData(cacheKey);
    if (cachedCommunes) {
      console.log('✅ Returning cached communes data');
      return res.json(cachedCommunes);
    }
    
    console.log('🔍 Calling Yalidine service with wilayaId:', wilayaId);
    
    // Add retry logic for intermittent failures
    let communes;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        communes = await yalidineService.getCommunes(wilayaId ? parseInt(wilayaId) : null);
        console.log('✅ Communes fetched successfully, count:', communes.data ? communes.data.length : 'unknown');
        break;
      } catch (retryError) {
        retryCount++;
        console.log(`⚠️ Retry ${retryCount}/${maxRetries} for communes request`);
        
        if (retryCount >= maxRetries) {
          throw retryError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Cache the result
    setCachedData(cacheKey, communes);
    
    res.json(communes);
  } catch (error) {
    console.error('❌ Error fetching communes:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch communes' });
  }
});

// Get pickup centers
router.get('/centers', async (req, res) => {
  try {
    console.log('🔍 Centers request received:', { wilayaId: req.query.wilayaId });
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { wilayaId } = req.query;
    
    // Check cache first
    const cacheKey = `centers_${wilayaId || 'all'}`;
    const cachedCenters = getCachedData(cacheKey);
    if (cachedCenters) {
      console.log('✅ Returning cached centers data');
      return res.json(cachedCenters);
    }
    
    console.log('🔍 Calling Yalidine service with wilayaId:', wilayaId);
    
    // Add retry logic for intermittent failures
    let centers;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        centers = await yalidineService.getCenters(wilayaId ? parseInt(wilayaId) : null);
        console.log('✅ Centers fetched successfully, count:', centers.data ? centers.data.length : 'unknown');
        break;
      } catch (retryError) {
        retryCount++;
        console.log(`⚠️ Retry ${retryCount}/${maxRetries} for centers request`);
        
        if (retryCount >= maxRetries) {
          throw retryError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Cache the result
    setCachedData(cacheKey, centers);
    
    res.json(centers);
  } catch (error) {
    console.error('❌ Error fetching centers:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch pickup centers' });
  }
});

// Calculate shipping fees
router.post('/calculate-fees', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const validatedData = calculateFeesSchema.parse(req.body);
    const { fromWilayaId, toWilayaId, weight, length, width, height, declaredValue } = validatedData;

    // Get base fees from Yalidine
    const feesData = await yalidineService.calculateFees(fromWilayaId, toWilayaId);
    
    // Calculate weight fees if dimensions provided
    let weightFees = 0;
    let billableWeight = weight || 1;
    
    if (weight && length && width && height) {
      billableWeight = yalidineService.getBillableWeight(weight, length, width, height);
      weightFees = yalidineService.calculateWeightFees(billableWeight, feesData.oversize_fee);
    }

    // Calculate COD fees
    const codFees = declaredValue ? (declaredValue * feesData.cod_percentage / 100) : 0;

    // Get delivery options for the first commune (you might want to get specific commune)
    const firstCommune = Object.values(feesData.per_commune)[0];
    
    // Add proper null checks and fallback values for desk delivery
    const homeDeliveryFee = (firstCommune.express_home || 0) + weightFees;
    const deskDeliveryFee = (firstCommune.express_desk || firstCommune.express_home || 0) + weightFees;
    
    const deliveryOptions = {
      express: {
        home: homeDeliveryFee,
        desk: deskDeliveryFee
      },
      economic: {
        home: firstCommune.economic_home + weightFees,
        desk: firstCommune.economic_desk + weightFees
      }
    };

    res.json({
      fromWilaya: feesData.from_wilaya_name,
      toWilaya: feesData.to_wilaya_name,
      zone: feesData.zone,
      weightFees,
      codFees,
      deliveryOptions,
      billableWeight,
      oversizeFee: feesData.oversize_fee,
      codPercentage: feesData.cod_percentage,
      insurancePercentage: feesData.insurance_percentage,
      returnFee: feesData.retour_fee
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Error calculating shipping fees:', error);
    res.status(500).json({ error: 'Failed to calculate shipping fees' });
  }
});

// Create shipment
router.post('/create-shipment', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const validatedData = createShipmentSchema.parse(req.body);
    
    // Validate phone number
    if (!yalidineService.validatePhoneNumber(validatedData.contactPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Format data for Yalidine API
    const parcelData = yalidineService.formatParcelData(validatedData);
    
    console.log('🔍 Creating shipment with data:', validatedData);
    console.log('🔍 Formatted parcel data:', parcelData);
    
    // Create shipment
    const result = await yalidineService.createParcel(parcelData);
    console.log('🔍 Yalidine service result:', result);
    
    // Get the result for the specific order
    const orderResult = result[validatedData.orderId];
    console.log('🔍 Order result:', orderResult);
    
    if (!orderResult || !orderResult.success) {
      console.error('❌ Shipment creation failed:', {
        orderResult,
        message: orderResult?.message,
        result: result
      });
      return res.status(400).json({ 
        error: 'Failed to create shipment', 
        message: orderResult?.message || 'Unknown error',
        details: orderResult
      });
    }

    res.json({
      success: true,
      tracking: orderResult.tracking,
      orderId: orderResult.order_id,
      label: orderResult.label,
      importId: orderResult.import_id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Get shipment details
router.get('/shipment/:tracking', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { tracking } = req.params;
    const shipment = await yalidineService.getParcel(tracking);
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Failed to fetch shipment details' });
  }
});

// Get shipment tracking history
router.get('/tracking/:tracking', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { tracking } = req.params;
    const history = await yalidineService.getParcelHistory(tracking);
    res.json(history);
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
});

// Update shipment
router.patch('/shipment/:tracking', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { tracking } = req.params;
    const updateData = req.body;
    
    const result = await yalidineService.updateParcel(tracking, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete shipment
router.delete('/shipment/:tracking', async (req, res) => {
  try {
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    const { tracking } = req.params;
    const result = await yalidineService.deleteParcel(tracking);
    res.json(result);
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// Debug endpoint to test shipment creation with sample data
router.post('/test-shipment', async (req, res) => {
  try {
    console.log('🔍 Testing shipment creation with sample data...');
    
    if (!yalidineService.isConfigured()) {
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    // Sample shipment data for testing
    const sampleData = {
      orderId: 'TEST-ORDER-001',
      customerName: 'Test Customer',
      customerPhone: '0551234567',
      customerAddress: 'Test Address, Test City',
      fromWilayaName: 'Batna',
      toWilayaName: 'Alger',
      toCommuneName: 'Alger',
      productList: 'Test Product (1x)',
      price: 1000,
      weight: 0.5,
      length: 30,
      width: 20,
      height: 10,
      isStopDesk: false,
      doInsurance: false,
      declaredValue: 1000,
      freeshipping: false,
      hasExchange: false
    };

    console.log('🔍 Sample data:', sampleData);

    const validatedData = createShipmentSchema.parse(sampleData);
    console.log('✅ Data validation passed');

    const parcelData = yalidineService.formatParcelData(validatedData);
    console.log('🔍 Formatted parcel data:', parcelData);

    const result = await yalidineService.createParcel(parcelData);
    console.log('🔍 Yalidine service result:', result);

    const orderResult = result[sampleData.orderId];
    console.log('🔍 Order result:', orderResult);

    if (!orderResult || !orderResult.success) {
      console.error('❌ Test shipment creation failed:', orderResult);
      return res.status(400).json({ 
        error: 'Test shipment creation failed', 
        message: orderResult?.message || 'Unknown error',
        details: orderResult,
        result: result
      });
    }

    res.json({
      success: true,
      message: 'Test shipment created successfully',
      tracking: orderResult.tracking,
      orderId: orderResult.order_id,
      label: orderResult.label,
      importId: orderResult.import_id
    });
  } catch (error) {
    console.error('❌ Test shipment creation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid test data', details: error.errors });
    }
    res.status(500).json({ 
      error: 'Test shipment creation failed',
      details: error.message
    });
  }
});

// Debug endpoint to test shipments without filters
router.get('/shipments/debug', async (req, res) => {
  try {
    console.log('🔍 Debug shipments request received');
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    console.log('🔍 Calling Yalidine service for debug shipments');
    
    // Try to get shipments without any filters
    const shipments = await yalidineService.getAllParcels({});
    
            console.log('✅ Debug shipments result:', {
          success: true,
          count: shipments.data?.length || 0,
          hasData: !!shipments.data,
          dataType: typeof shipments.data,
          sample: shipments.data?.[0] || 'No data'
        });
        
        // Log detailed structure of first shipment
        if (shipments.data && shipments.data.length > 0) {
          console.log('🔍 Detailed shipment structure:');
          console.log('Keys:', Object.keys(shipments.data[0]));
          console.log('Full object:', JSON.stringify(shipments.data[0], null, 2));
        }
    
    res.json({
      success: true,
      count: shipments.data?.length || 0,
      data: shipments.data || [],
      message: 'Debug shipments fetched'
    });
  } catch (error) {
    console.error('❌ Error in debug shipments:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch debug shipments',
      message: error.message,
      details: error.response?.data || 'No response details'
    });
  }
});

// Get all shipments from Yalidine with filters
router.get('/shipments', async (req, res) => {
  try {
    console.log('🔍 Shipments request received with filters:', req.query);
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    // Extract filters from query parameters
    const filters = {
      status: req.query.status,
      from_wilaya_name: req.query.from_wilaya_name,
      to_wilaya_name: req.query.to_wilaya_name,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      tracking: req.query.tracking,
      customer_phone: req.query.customer_phone,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // Handle month filtering
    if (req.query.month) {
      const month = parseInt(req.query.month);
      const currentYear = new Date().getFullYear();
      
      // Create date range for the specified month
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0); // Last day of the month
      
      filters.date_from = startDate.toISOString().split('T')[0];
      filters.date_to = endDate.toISOString().split('T')[0];
    }

    // Create cache key based on filters
    const cacheKey = `yalidine_shipments_${JSON.stringify(filters)}`;
    const cachedShipments = getCachedData(cacheKey);
    if (cachedShipments) {
      console.log('✅ Returning cached shipments data');
      return res.json(cachedShipments);
    }

    console.log('🔍 Calling Yalidine service for shipments with filters');
    
    // Add retry logic for intermittent failures
    let shipments;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        shipments = await yalidineService.getAllParcels(filters);
        console.log('✅ Shipments fetched successfully');
        break;
      } catch (retryError) {
        retryCount++;
        console.log(`⚠️ Retry ${retryCount}/${maxRetries} for shipments request`);
        
        if (retryCount >= maxRetries) {
          throw retryError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Cache the result (shorter cache for filtered results)
    setCachedData(cacheKey, shipments);
    
    res.json(shipments);
  } catch (error) {
    console.error('❌ Error fetching shipments:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Get Yalidine shipment statistics
router.get('/shipments/stats', async (req, res) => {
  try {
    console.log('🔍 Yalidine shipment stats request received');
    
    if (!yalidineService.isConfigured()) {
      console.log('❌ Yalidine service not configured');
      return res.status(503).json({ error: 'Yalidine shipping not configured' });
    }

    // Get all shipments to calculate statistics
    const shipments = await yalidineService.getAllParcels({});
    
    if (!shipments.data || shipments.data.length === 0) {
      return res.json({
        enPreparation: 0,
        centre: 0,
        versWilaya: 0,
        sortiEnLivraison: 0,
        livre: 0,
        echecLivraison: 0,
        retourARetirer: 0,
        retourneAuVendeur: 0,
        echangeEchoue: 0,
        totalShipments: 0
      });
    }

    // Count shipments by status
    const stats = {
      enPreparation: 0,
      centre: 0,
      versWilaya: 0,
      sortiEnLivraison: 0,
      livre: 0,
      echecLivraison: 0,
      retourARetirer: 0,
      retourneAuVendeur: 0,
      echangeEchoue: 0,
      totalShipments: shipments.data.length
    };

    shipments.data.forEach(shipment => {
      const status = shipment.last_status;
      
      switch (status) {
        case 'En préparation':
          stats.enPreparation++;
          break;
        case 'Centre':
          stats.centre++;
          break;
        case 'Vers Wilaya':
          stats.versWilaya++;
          break;
        case 'Sorti en livraison':
          stats.sortiEnLivraison++;
          break;
        case 'Livré':
          stats.livre++;
          break;
        case 'Echèc livraison':
          stats.echecLivraison++;
          break;
        case 'Retour à retirer':
          stats.retourARetirer++;
          break;
        case 'Retourné au vendeur':
          stats.retourneAuVendeur++;
          break;
        case 'Echange échoué':
          stats.echangeEchoue++;
          break;
      }
    });

    console.log('✅ Yalidine shipment stats calculated:', stats);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching Yalidine shipment stats:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch shipment statistics' });
  }
});

module.exports = router; 