'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  CreditCard,
  FileText,
  Download,
  Edit3,
  Save,
  X,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { yalidineAPI } from '@/lib/yalidine-api'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OrderItem {
  id: string
  name: string
  nameAr?: string
  quantity: number
  price: number
  size?: string
  product: {
    id: string
    name: string
    nameAr?: string
    image?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  total: number
  subtotal: number
  deliveryFee: number
  deliveryType: 'HOME_DELIVERY' | 'PICKUP'
  deliveryAddress?: string
  city: {
    name: string
    nameAr?: string
  }
  deliveryDesk?: {
    name: string
    nameAr?: string
  }
  callCenterStatus: 'CONFIRMED' | 'CANCELED' | 'PENDING' | 'DOUBLE_ORDER' | 'DELAYED'
  createdAt: string
  updatedAt: string
  notes?: string
  trackingNumber?: string
  yalidineShipmentId?: string
  items: OrderItem[]
}

const statusColors = {
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  DOUBLE_ORDER: 'bg-orange-100 text-orange-800',
  DELAYED: 'bg-purple-100 text-purple-800'
}

const statusIcons = {
  CONFIRMED: CheckCircle,
  CANCELED: XCircle,
  PENDING: Clock,
  DOUBLE_ORDER: Package,
  DELAYED: Truck
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmé',
    CANCELED: 'Annulé',
    PENDING: 'En Attente',
    DOUBLE_ORDER: 'Commande Double',
    DELAYED: 'Retardé'
  }
  return labels[status] || status
}

export default function AdminOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.admin.getOrders() as { orders: Order[] }
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.callCenterStatus === statusFilter)
    }

    // City filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(order => order.city.name === cityFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter, cityFilter])

  if (!mounted) return null

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, { callCenterStatus: status })
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, callCenterStatus: status as any } : order
      ))
      
      // If status is CONFIRMED, create Yalidine shipment
      if (status === 'CONFIRMED') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          try {
            const shipmentResult = await createYalidineShipment(order)
            if (shipmentResult.success && shipmentResult.tracking) {
              toast.success(`Order confirmed and shipment created in Yalidine. Tracking: ${shipmentResult.tracking}`)
            } else {
              toast.success('Order confirmed and shipment created in Yalidine')
            }
          } catch (shipmentError) {
            console.error('Failed to create Yalidine shipment:', shipmentError)
            const errorMessage = shipmentError instanceof Error ? shipmentError.message : 'Unknown error'
            toast.warning(`Order confirmed but failed to create Yalidine shipment: ${errorMessage}`)
          }
        }
      } else {
        toast.success('Order status updated')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleEditNote = (orderId: string, currentNote: string) => {
    setEditingNoteId(orderId)
    setNoteText(currentNote || '')
  }

  const handleSaveNote = async (orderId: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, { notes: noteText })
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, notes: noteText } : order
      ))
      setEditingNoteId(null)
      setNoteText('')
      toast.success('Note saved successfully')
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setNoteText('')
  }

  // Create Yalidine shipment when order is confirmed
  const createYalidineShipment = async (order: Order) => {
    try {
      console.log('🔍 Starting Yalidine shipment creation for order:', order.orderNumber)
      
      // Validate Yalidine configuration
      try {
        const yalidineStatus = await yalidineAPI.getStatus()
        if (!yalidineStatus.configured) {
          throw new Error('Yalidine is not configured')
        }
      } catch (statusError: any) {
        if (statusError.message && statusError.message.includes('Failed to fetch')) {
          throw new Error('Backend server is not responding. Please check if the backend server is running.')
        }
        throw new Error('Failed to check Yalidine configuration')
      }

      // Get customer name parts (Yalidine requires separate firstname and familyname)
      const nameParts = order.customerName.trim().split(' ')
      const firstname = nameParts[0] || order.customerName
      const familyname = nameParts.slice(1).join(' ') || order.customerName

      // Calculate package dimensions and weight
      const totalWeight = Math.max(0.1, order.items.reduce((sum, item) => sum + 0.5, 0)) // Minimum 0.1kg
      const totalLength = 30 // Default 30cm
      const totalWidth = 20 // Default 20cm
      const totalHeight = Math.max(5, order.items.reduce((sum, item) => sum + 10, 0)) // Minimum 5cm

      const productList = order.items.map(item => 
        `${item.product.name} (${item.quantity}x)`
      ).join(', ')

      // City to Wilaya ID mapping
      const cityToWilayaMap: { [key: string]: number } = {
        'Adrar': 1, 'Chlef': 2, 'Laghouat': 3, 'Oum El Bouaghi': 4, 'Batna': 5, 'Béjaïa': 6, 'Biskra': 7, 'Béchar': 8, 'Blida': 9, 'Bouira': 10,
        'Tamanrasset': 11, 'Tébessa': 12, 'Tlemcen': 13, 'Tiaret': 14, 'Tizi Ouzou': 15, 'Alger': 16, 'Djelfa': 17, 'Jijel': 18, 'Sétif': 19, 'Saïda': 20,
        'Skikda': 21, 'Sidi Bel Abbès': 22, 'Annaba': 23, 'Guelma': 24, 'Constantine': 25, 'Médéa': 26, 'Mostaganem': 27, "M'Sila": 28, 'Mascara': 29, 'Ouargla': 30,
        'Oran': 31, 'El Bayadh': 32, 'Illizi': 33, 'Bordj Bou Arréridj': 34, 'Boumerdès': 35, 'El Tarf': 36, 'Tindouf': 37, 'Tissemsilt': 38, 'El Oued': 39, 'Khenchela': 40,
        'Souk Ahras': 41, 'Tipaza': 42, 'Mila': 43, 'Aïn Defla': 44, 'Naâma': 45, 'Aïn Témouchent': 46, 'Ghardaïa': 47, 'Relizane': 48, 'Timimoun': 49, 'Bordj Badji Mokhtar': 50,
        'Ouled Djellal': 51, 'Béni Abbès': 52, 'In Salah': 53, 'In Guezzam': 54, 'Touggourt': 55, 'Djanet': 56, "El M'Ghair": 57, 'El Meniaa': 58
      }
      
      const toWilayaId = cityToWilayaMap[order.city.name] || 5 // Default to Batna (5)
      
      // Get exact wilaya and commune names from Yalidine API
      let toWilayaName = 'Batna' // Default fallback
      let toCommuneName = 'Batna' // Default fallback
      
      try {
        // Get wilayas to find the exact name
        const wilayasData = await yalidineAPI.getWilayas()
        const wilayas = wilayasData.data || []
        const matchingWilaya = wilayas.find(w => w.id === toWilayaId)
        
        if (matchingWilaya) {
          toWilayaName = matchingWilaya.name
          console.log('✅ Found matching wilaya:', toWilayaName, 'ID:', toWilayaId)
        } else {
          console.warn('⚠️ No matching wilaya found for ID:', toWilayaId, 'using default: Batna')
          toWilayaName = 'Batna'
        }
        
        // Get communes to find the exact commune name
        const communesData = await yalidineAPI.getCommunes(toWilayaId)
        const communes = communesData.data || []
        const matchingCommune = communes.find(c => 
          c.name.toLowerCase().includes(order.city.name.toLowerCase()) ||
          order.city.name.toLowerCase().includes(c.name.toLowerCase())
        )
        
        if (matchingCommune) {
          toCommuneName = matchingCommune.name
          console.log('✅ Found matching commune:', toCommuneName, 'ID:', matchingCommune.id)
        } else {
          console.warn('⚠️ No matching commune found, using wilaya name as commune')
          toCommuneName = toWilayaName
        }
      } catch (error) {
        console.error('❌ Error getting wilaya/commune names:', error)
        // Use default values if API fails
        toWilayaName = 'Batna'
        toCommuneName = 'Batna'
      }

      // For pickup orders, get the actual Yalidine center ID
      let stopDeskId = undefined
      if (order.deliveryType === 'PICKUP' && order.deliveryDesk) {
        try {
          console.log('🔍 Getting Yalidine centers for wilaya:', toWilayaId)
          const centersData = await yalidineAPI.getCenters(toWilayaId)
          const centers = centersData.data || []
          console.log('🔍 Available Yalidine centers:', centers.length)
          
          const matchingCenter = centers.find(center => 
            center.name.toLowerCase().includes(order.deliveryDesk!.name.toLowerCase()) ||
            order.deliveryDesk!.name.toLowerCase().includes(center.name.toLowerCase())
          )
          
          if (matchingCenter) {
            stopDeskId = matchingCenter.center_id
            console.log('✅ Found matching Yalidine center:', matchingCenter.name, 'ID:', stopDeskId)
          } else {
            if (centers.length > 0) {
              stopDeskId = centers[0].center_id
              console.log('⚠️ No exact match found, using first available center:', centers[0].name, 'ID:', stopDeskId)
            } else {
              throw new Error(`No Yalidine centers available for wilaya ${toWilayaName}`)
            }
          }
        } catch (centerError) {
          console.error('❌ Error getting Yalidine centers:', centerError)
          throw new Error(`Failed to get Yalidine centers for ${toWilayaName}. Please check if centers are available.`)
        }
      }

      // Validate required fields before creating shipment
      // For HOME_DELIVERY orders, address is required
      if (order.deliveryType === 'HOME_DELIVERY' && (!order.deliveryAddress || order.deliveryAddress.trim() === '')) {
        throw new Error('Customer address is required for home delivery orders')
      }

      if (order.deliveryType === 'PICKUP' && (!stopDeskId || stopDeskId <= 0)) {
        throw new Error('Stop desk ID is required for pickup orders')
      }

      // Validate phone number format (Algerian format)
      const phoneRegex = /^0[5-7][0-9]{8}$/
      if (!phoneRegex.test(order.customerPhone)) {
        throw new Error('Invalid phone number format. Must be Algerian mobile number (05xxxxxxxx, 06xxxxxxxx, 07xxxxxxxx)')
      }

      // Validate price (must be between 0 and 150000)
      if (order.total < 0 || order.total > 150000) {
        throw new Error('Price must be between 0 and 150000 DA')
      }

      // Validate declared value (must be between 0 and 150000)
      if (order.subtotal < 0 || order.subtotal > 150000) {
        throw new Error('Declared value must be between 0 and 150000 DA')
      }

      // Create shipment data according to Yalidine API documentation
      const shipmentData = {
        orderId: order.orderNumber,
        fromWilayaName: 'Batna', // Default from wilaya
        firstname: firstname,
        familyname: familyname,
        contactPhone: order.customerPhone,
        address: order.deliveryType === 'HOME_DELIVERY' ? order.deliveryAddress : `${order.city.name} - ${order.deliveryDesk?.name || 'Pickup Location'}`,
        toCommuneName: toCommuneName,
        toWilayaName: toWilayaName,
        productList: productList,
        price: order.total,
        doInsurance: false,
        declaredValue: order.subtotal,
        length: totalLength,
        width: totalWidth,
        height: totalHeight,
        weight: totalWeight,
        freeshipping: false,
        isStopDesk: order.deliveryType === 'PICKUP',
        stopDeskId: stopDeskId,
        hasExchange: false,
        productToCollect: undefined
      }

      console.log('🔍 Shipment data with corrected names:', {
        originalCity: order.city.name,
        toWilayaName: toWilayaName,
        toCommuneName: toCommuneName,
        toWilayaId: toWilayaId,
        stopDeskId: stopDeskId,
        firstname: firstname,
        familyname: familyname
      })

      // Create the shipment
      const result = await yalidineAPI.createShipment(shipmentData)
      
      console.log('Yalidine shipment created:', result)
      
      // Save the tracking number and shipment ID to the order
      if (result.success && result.tracking) {
        try {
          await api.admin.updateOrderStatus(order.id, { 
            trackingNumber: result.tracking,
            yalidineShipmentId: result.orderId || result.importId?.toString()
          })
          
          // Update local state to show tracking number immediately
          setOrders(prev => prev.map(o => 
            o.id === order.id 
              ? { ...o, trackingNumber: result.tracking, yalidineShipmentId: result.orderId || result.importId?.toString() }
              : o
          ))
        } catch (updateError) {
          console.warn('Failed to update order with tracking number:', updateError)
        }
      }

      return result
    } catch (error: any) {
      console.error('Error creating Yalidine shipment:', error)
      
      // If it's an API error with details, show more specific message
      if (error.message && error.message.includes('Invalid input data')) {
        console.error('Validation error details:', error)
        throw new Error(`Yalidine shipment validation failed: ${error.message}`)
      }
      
      // If it's a shipment creation error, show more details
      if (error.message && error.message.includes('Failed to create shipment')) {
        console.error('Shipment creation error details:', error)
        throw new Error(`Yalidine shipment creation failed: ${error.message}`)
      }
      
      throw error
    }
  }

  // Test Yalidine connection
  const testYalidineConnection = async () => {
    try {
      console.log('🔍 Testing Yalidine connection from frontend...');
      
      // Test status endpoint
      const status = await yalidineAPI.getStatus();
      console.log('✅ Yalidine status:', status);
      
      // Test wilayas endpoint
      const wilayas = await yalidineAPI.getWilayas();
      console.log('✅ Yalidine wilayas:', wilayas.data?.length || 0, 'wilayas found');
      
      // Test centers for a specific wilaya (Alger - 16)
      const centers = await yalidineAPI.getCenters(16);
      console.log('✅ Yalidine centers for Alger:', centers.data?.length || 0, 'centers found');
      if (centers.data && centers.data.length > 0) {
        console.log('📋 Sample centers:', centers.data.slice(0, 3).map(c => ({ id: c.center_id, name: c.name })));
      }
      
      toast.success('Yalidine connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Yalidine connection test failed:', error);
      toast.error(`Yalidine test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleExportOrders = async () => {
    try {
      toast.loading('Exporting orders...')
      const csvData = await api.admin.exportOrders()
      
      // Create and download the file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.dismiss()
      toast.success('Orders exported successfully')
    } catch (error) {
      console.error('Failed to export orders:', error)
      toast.dismiss()
      toast.error('Failed to export orders')
    }
  }

  const cities = Array.from(new Set(orders.map(order => order.city.name)))

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
            <p className="text-muted-foreground">
              Gérez les commandes clients, suivez le statut de livraison et traitez les confirmations de commandes
            </p>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
              <p className="text-muted-foreground">
                Gérez les commandes clients, suivez le statut de livraison et traitez les confirmations de commandes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={testYalidineConnection} variant="outline" className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Test Yalidine</span>
              </Button>
              <Button onClick={handleExportOrders} className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exporter Commandes</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time orders
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Nouvelles Commandes</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.callCenterStatus === 'PENDING').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.callCenterStatus === 'CONFIRMED').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Commandes confirmées
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} DA
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenus de tous temps
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher commandes, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-status" value="all">Tous les Statuts</SelectItem>
                  <SelectItem key="CONFIRMED" value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem key="CANCELED" value="CANCELED">Annulé</SelectItem>
                  <SelectItem key="PENDING" value="PENDING">En Attente</SelectItem>
                  <SelectItem key="DOUBLE_ORDER" value="DOUBLE_ORDER">Commande Double</SelectItem>
                  <SelectItem key="DELAYED" value="DELAYED">Retardé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-cities" value="all">Toutes les Villes</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Commande #</TableHead>
                    <TableHead className="w-[150px]">Client</TableHead>
                    <TableHead className="w-[100px]">Articles</TableHead>
                    <TableHead className="w-[100px]">Total</TableHead>
                    <TableHead className="w-[120px]">Statut</TableHead>
                    <TableHead className="w-[120px]">Suivi</TableHead>
                    <TableHead className="w-[200px]">Notes</TableHead>
                    <TableHead className="w-[150px]">Localisation</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.callCenterStatus as keyof typeof statusIcons]
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="w-[120px]">
                          <div className="font-mono font-medium truncate">
                            {order.orderNumber}
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[150px]">
                          <div className="space-y-1">
                            <div className="font-medium truncate">{order.customerName}</div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{order.customerPhone}</span>
                            </div>
                            {order.customerEmail && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{order.customerEmail}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[100px]">
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={item.id} className="text-sm">
                                <div className="font-medium truncate">
                                  {item.quantity}x {item.product.name}
                                </div>
                                {item.size && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    Taille: {item.size}
                                  </div>
                                )}
                                {index < order.items.length - 1 && (
                                  <div className="border-t my-1"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[100px]">
                          <div className="font-bold text-primary">
                            {order.total.toLocaleString()} DA
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[120px]">
                          <Select
                            value={order.callCenterStatus}
                            onValueChange={(value) => handleUpdateStatus(order.id, value)}
                          >
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto hover:bg-transparent">
                              <SelectValue>
                                <Badge className={statusColors[order.callCenterStatus as keyof typeof statusColors]}>
                                  {getStatusLabel(order.callCenterStatus)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                              <SelectItem value="CANCELED">Annulé</SelectItem>
                              <SelectItem value="PENDING">En Attente</SelectItem>
                              <SelectItem value="DOUBLE_ORDER">Commande Double</SelectItem>
                              <SelectItem value="DELAYED">Retardé</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell className="w-[120px]">
                          {order.trackingNumber ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Truck className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <span className="text-sm font-mono text-blue-600 truncate">
                                  {order.trackingNumber}
                                </span>
                              </div>
                              {order.yalidineShipmentId && (
                                <div className="text-xs text-muted-foreground truncate">
                                  ID: {order.yalidineShipmentId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {order.callCenterStatus === 'CONFIRMED' ? 'Création...' : '-'}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="w-[200px]">
                          {editingNoteId === order.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Ajouter une note..."
                                className="min-h-[60px] text-sm"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveNote(order.id)}
                                  className="h-6 px-2"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Sauvegarder
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-6 px-2"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between group">
                              <div className="text-sm text-muted-foreground flex-1 truncate">
                                {order.notes || '-'}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditNote(order.id, order.notes || '')}
                                className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="w-[150px]">
                          <div className="space-y-1">
                            <div className="font-medium truncate">{order.city.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {order.deliveryType === 'HOME_DELIVERY' 
                                ? (order.deliveryAddress || 'Livraison à Domicile')
                                : (order.deliveryDesk?.name || 'Retrait')
                              }
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[120px]">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[100px]">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
                  <p className="text-muted-foreground">
                    Essayez d'ajuster vos filtres ou termes de recherche
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}