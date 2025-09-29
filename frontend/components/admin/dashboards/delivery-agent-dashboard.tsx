'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  Loader2,
  Eye,
  AlertTriangle,
  Navigation,
  Phone,
  Package,
  MessageSquare,
  Edit,
  Tag,
  ExternalLink,
  Send,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useLocaleStore } from '@/lib/locale-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { yalidineAPI } from '@/lib/yalidine-api'

interface DeliveryStats {
  enPreparation: number;
  centre: number;
  versWilaya: number;
  sortiEnLivraison: number;
  livre: number;
  echecLivraison: number;
  retourARetirer: number;
  retourneAuVendeur: number;
  echangeEchoue: number;
  confirmedOrders: number;
  totalShipments: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'HOME_DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  callCenterStatus: 'NEW' | 'CONFIRMED' | 'CANCELED' | 'PENDING' | 'DOUBLE_ORDER' | 'DELAYED';
  deliveryStatus: string;
  communicationStatus?: 'ANSWERED' | 'DIDNT_ANSWER' | 'SMS_SENT';
  notes?: string;
  trackingNumber?: string;
  yalidineShipmentId?: string;
  createdAt: string;
  updatedAt: string;
  city: {
    id: string;
    name: string;
    nameAr?: string;
  };
  deliveryDesk?: {
    id: string;
    name: string;
    nameAr?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      nameAr?: string;
      image?: string;
    };
  }>;
}

interface YalidineShipment {
  id: string;
  tracking: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  from_wilaya_name: string;
  to_wilaya_name: string;
  to_commune_name: string;
  product_list: string;
  price: number;
  weight: number;
  last_status: string;
  date_creation: string;
  date_last_status: string;
}

const statusColors = {
  READY: 'bg-yellow-100 text-yellow-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  ANSWERED: 'bg-green-100 text-green-800',
  DIDNT_ANSWER: 'bg-red-100 text-red-800',
  SMS_SENT: 'bg-blue-100 text-blue-800'
}

const statusLabels = {
  READY: 'Ready',
  IN_TRANSIT: 'In Transit',
  DONE: 'Delivered',
  CONFIRMED: 'Confirmed',
  ANSWERED: 'Answered',
  DIDNT_ANSWER: 'Didn\'t Answer',
  SMS_SENT: 'SMS Sent'
}

const communicationStatusColors = {
  ANSWERED: 'bg-green-100 text-green-800 border border-green-200',
  DIDNT_ANSWER: 'bg-red-100 text-red-800 border border-red-200',
  SMS_SENT: 'bg-blue-100 text-blue-800 border border-blue-200'
}

const communicationStatusLabels = {
  ANSWERED: 'Answered',
  DIDNT_ANSWER: 'Didn\'t Answer',
  SMS_SENT: 'SMS Sent'
}

export function DeliveryAgentDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, isRTL, direction } = useLocaleStore()
  const [stats, setStats] = useState<DeliveryStats>({
    enPreparation: 0,
    centre: 0,
    versWilaya: 0,
    sortiEnLivraison: 0,
    livre: 0,
    echecLivraison: 0,
    retourARetirer: 0,
    retourneAuVendeur: 0,
    echangeEchoue: 0,
    confirmedOrders: 0,
    totalShipments: 0
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [yalidineShipments, setYalidineShipments] = useState<YalidineShipment[]>([])
  const [loadingShipments, setLoadingShipments] = useState(false)
  
  // Pagination state for Yalidine shipments
  const [shipmentPagination, setShipmentPagination] = useState({
    has_more: false,
    total_data: 0,
    current_page: 1,
    total_pages: 0,
    per_page: 25
  })
  
  // Status filter for Yalidine shipments
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Yalidine status options
  const yalidineStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pas encore expédié', label: 'Pas encore expédié' },
    { value: 'A vérifier', label: 'A vérifier' },
    { value: 'En préparation', label: 'En préparation' },
    { value: 'Pas encore ramassé', label: 'Pas encore ramassé' },
    { value: 'Prêt à expédier', label: 'Prêt à expédier' },
    { value: 'Ramassé', label: 'Ramassé' },
    { value: 'Bloqué', label: 'Bloqué' },
    { value: 'Débloqué', label: 'Débloqué' },
    { value: 'Transfert', label: 'Transfert' },
    { value: 'Expédié', label: 'Expédié' },
    { value: 'Centre', label: 'Centre' },
    { value: 'En localisation', label: 'En localisation' },
    { value: 'Vers Wilaya', label: 'Vers Wilaya' },
    { value: 'Reçu à Wilaya', label: 'Reçu à Wilaya' },
    { value: 'En attente du client', label: 'En attente du client' },
    { value: 'Prêt pour livreur', label: 'Prêt pour livreur' },
    { value: 'Sorti en livraison', label: 'Sorti en livraison' },
    { value: 'En attente', label: 'En attente' },
    { value: 'En alerte', label: 'En alerte' },
    { value: 'Tentative échouée', label: 'Tentative échouée' },
    { value: 'Livré', label: 'Livré' },
    { value: 'Echèc livraison', label: 'Echèc livraison' },
    { value: 'Retour vers centre', label: 'Retour vers centre' },
    { value: 'Retourné au centre', label: 'Retourné au centre' },
    { value: 'Retour transfert', label: 'Retour transfert' },
    { value: 'Retour groupé', label: 'Retour groupé' },
    { value: 'Retour à retirer', label: 'Retour à retirer' },
    { value: 'Retour vers vendeur', label: 'Retour vers vendeur' },
    { value: 'Retourné au vendeur', label: 'Retourné au vendeur' },
    { value: 'Echange échoué', label: 'Echange échoué' }
  ]
  
  // Enhanced functionality state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    fetchDeliveryData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pagination when filter changes
  useEffect(() => {
    setShipmentPagination(prev => ({ ...prev, current_page: 1 }))
  }, [statusFilter])

  // Filter shipments by status
  const allFilteredShipments = statusFilter && statusFilter !== 'all'
    ? yalidineShipments.filter(shipment => shipment.last_status === statusFilter)
    : yalidineShipments

  // Paginate the filtered results
  const startIndex = (shipmentPagination.current_page - 1) * shipmentPagination.per_page
  const endIndex = startIndex + shipmentPagination.per_page
  const filteredShipments = allFilteredShipments.slice(startIndex, endIndex)
  
  // Update pagination info based on filtered results
  const totalFilteredItems = allFilteredShipments.length
  const totalPages = Math.ceil(totalFilteredItems / shipmentPagination.per_page)

  const fetchDeliveryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch delivery data, Yalidine shipments, and Yalidine stats
      const [ordersData, yalidineStats] = await Promise.all([
        api.admin.getOrders({ limit: 100 }), // Get more orders for delivery agent
        yalidineAPI.getShipmentStats().catch(err => {
          console.warn('Failed to fetch Yalidine stats:', err)
          return {
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
          }
        })
      ])

      const ordersList = (ordersData as any).orders || ordersData as Order[]
      setOrders(ordersList)

      // Fetch Yalidine shipments
      await fetchYalidineShipments()

      // Calculate stats combining Yalidine data with confirmed orders
        const confirmedOrders = ordersList.filter((o: Order) => o.callCenterStatus === 'CONFIRMED')
      const stats = {
        ...yalidineStats,
        confirmedOrders: confirmedOrders.length
      }
      setStats(stats)

    } catch (err) {
      console.error('Error fetching delivery data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchYalidineShipments = async (page: number = 1) => {
    try {
      setLoadingShipments(true)
        const response = await yalidineAPI.getAllShipments({ page })
      
      // Handle pagination data
      setShipmentPagination({
        has_more: response.has_more || false,
        total_data: response.total_data || response.data?.length || 0,
        current_page: page,
        total_pages: Math.ceil((response.total_data || 0) / shipmentPagination.per_page),
        per_page: shipmentPagination.per_page
      })
      
      setYalidineShipments(response.data || [])
    } catch (error) {
      console.error('Error fetching Yalidine shipments:', error)
      setYalidineShipments([])
      setShipmentPagination({
        has_more: false,
        total_data: 0,
        current_page: 1,
        total_pages: 0,
        per_page: shipmentPagination.per_page
      })
    } finally {
      setLoadingShipments(false)
    }
  }

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setShipmentPagination(prev => ({ ...prev, current_page: page }))
    }
  }

  const nextPage = () => {
    if (shipmentPagination.current_page < totalPages) {
      goToPage(shipmentPagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (shipmentPagination.current_page > 1) {
      goToPage(shipmentPagination.current_page - 1)
    }
  }

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, { deliveryStatus: status })
      fetchDeliveryData() // Refresh data
    } catch (err) {
      console.error('Error updating delivery status:', err)
    }
  }

  // Enhanced functionality functions
  const updateCommunicationStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      setLoadingAction(true)
      const updateData: any = { communicationStatus: status }
      if (notes) updateData.notes = notes
      
      await api.admin.updateOrderStatus(orderId, updateData)
      toast.success(`Communication status updated to ${communicationStatusLabels[status as keyof typeof communicationStatusLabels]}`)
      fetchDeliveryData()
    } catch (err) {
      console.error('Error updating communication status:', err)
      toast.error('Failed to update communication status')
    } finally {
      setLoadingAction(false)
    }
  }

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      setLoadingAction(true)
      await api.admin.updateOrderStatus(orderId, { notes })
      toast.success('Order notes updated successfully')
      fetchDeliveryData()
      setShowNotesDialog(false)
    } catch (err) {
      console.error('Error updating order notes:', err)
      toast.error('Failed to update order notes')
    } finally {
      setLoadingAction(false)
    }
  }

  const sendWhatsAppMessage = (phoneNumber: string, trackingNumber: string) => {
    try {
      // Format phone number for WhatsApp (remove leading 0 and add country code)
      const formattedPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber
      const whatsappNumber = `213${formattedPhone}`
      
      // Create WhatsApp message
      const message = `مرحبا! يمكنك تتبع طلبك باستخدام الرقم التالي: ${trackingNumber}

يمكنك تتبع طلبك على موقعنا:
https://loudim.com/track-order

شكرا لك!`
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank')
      
      toast.success('WhatsApp message prepared for sending')
    } catch (err) {
      console.error('Error preparing WhatsApp message:', err)
      toast.error('Failed to prepare WhatsApp message')
    }
  }

  const formatYalidineDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_blank')
  }

  const handleNavigateToAddress = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading delivery data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDeliveryData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Delivery Management Dashboard</h2>
        <p className="text-muted-foreground">
          Manage deliveries and track order status. Handle customer communications and navigation.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">En préparation</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enPreparation}</div>
              <p className="text-xs text-muted-foreground">
                Orders being prepared
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
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Centre</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.centre}</div>
              <p className="text-xs text-muted-foreground">
                At distribution center
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
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Vers Wilaya</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.versWilaya}</div>
              <p className="text-xs text-muted-foreground">
                Heading to destination
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
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Sorti en livraison</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sortiEnLivraison}</div>
              <p className="text-xs text-muted-foreground">
                Out for delivery
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Livré</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.livre}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Échec de livraison</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.echecLivraison}</div>
              <p className="text-xs text-muted-foreground">
                Delivery failed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Retour à retirer</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.retourARetirer}</div>
              <p className="text-xs text-muted-foreground">
                Return to pickup
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Retourné au vendeur</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.retourneAuVendeur}</div>
              <p className="text-xs text-muted-foreground">
                Returned to seller
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Échange échoué</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.echangeEchoue}</div>
              <p className="text-xs text-muted-foreground">
                Exchange failed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className="text-sm font-medium">Confirmed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedOrders}</div>
              <p className="text-xs text-muted-foreground">
                From our website
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delivery Management */}
      <Tabs defaultValue="confirmed" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="confirmed">Confirmed Orders ({stats.confirmedOrders})</TabsTrigger>
          <TabsTrigger value="preparation">En préparation ({stats.enPreparation})</TabsTrigger>
          <TabsTrigger value="delivery">Sorti en livraison ({stats.sortiEnLivraison})</TabsTrigger>
          <TabsTrigger value="waiting">En attente du client ({yalidineShipments.filter(s => s.last_status === 'En attente du client').length})</TabsTrigger>
          <TabsTrigger value="failed">Tentative échouée ({yalidineShipments.filter(s => s.last_status === 'Tentative échouée').length})</TabsTrigger>
          <TabsTrigger value="alert">En alerte ({yalidineShipments.filter(s => s.last_status === 'En alerte').length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({stats.livre})</TabsTrigger>
          <TabsTrigger value="yalidine">Yalidine Shipments ({yalidineShipments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CheckCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Confirmed Orders - Customer Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.filter(order => order.callCenterStatus === 'CONFIRMED').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No confirmed orders to contact</p>
              ) : (
                <div className="space-y-4">
                  {orders.filter(order => order.callCenterStatus === 'CONFIRMED').map((order) => (
                    <div key={order.id} className={`flex items-center justify-between p-4 border rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} mb-2`}>
                          <h4 className="font-medium">#{order.orderNumber}</h4>
                          <Badge variant="outline">{order.customerPhone}</Badge>
                        </div>
                        {order.trackingNumber && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Yalidine Tracking:</span> 
                            <span className="ml-2 font-mono bg-blue-50 px-2 py-1 rounded text-blue-700">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'} text-sm text-muted-foreground mb-2`}>
                          <span>{order.customerName}</span>
                          <span>{order.items.length} items</span>
                          <span>{order.total.toLocaleString()} DA</span>
                          <span>{order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Pickup'}</span>
                        </div>
                        {order.deliveryAddress && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Address:</span> {order.deliveryAddress}
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Notes:</span> {order.notes}
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowNotesDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Notes
                        </Button>
                        {order.trackingNumber && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendWhatsAppMessage(order.customerPhone, order.trackingNumber!)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders in Preparation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'En préparation').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `preparation-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                        {shipment.customer_address && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <strong>Address:</strong> {shipment.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        {shipment.customer_address && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToAddress(shipment.customer_address!)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'En préparation').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders in preparation
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Out for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'Sorti en livraison').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `delivery-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-sky-100 text-sky-800 border border-sky-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                        {shipment.customer_address && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <strong>Address:</strong> {shipment.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        {shipment.customer_address && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToAddress(shipment.customer_address!)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'Sorti en livraison').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders out for delivery
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En attente du client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'En attente du client').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `waiting-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                        {shipment.customer_address && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <strong>Address:</strong> {shipment.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        {shipment.customer_address && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToAddress(shipment.customer_address!)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'En attente du client').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders waiting for client
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tentative échouée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'Tentative échouée').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `failed-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-red-100 text-red-800 border border-red-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                        {shipment.customer_address && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <strong>Address:</strong> {shipment.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        {shipment.customer_address && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToAddress(shipment.customer_address!)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'Tentative échouée').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No failed delivery attempts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En alerte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'En alerte').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `alert-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-red-100 text-red-800 border border-red-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                        {shipment.customer_address && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <strong>Address:</strong> {shipment.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        {shipment.customer_address && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToAddress(shipment.customer_address!)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'En alerte').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders in alert status
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yalidineShipments.filter(shipment => shipment.last_status === 'Livré').map((shipment, index) => (
                  <div key={shipment.id || shipment.tracking || `delivered-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">#{shipment.tracking}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {shipment.price?.toLocaleString()} DA
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {shipment.last_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {shipment.product_list || 'N/A'} • {shipment.weight || 1} kg
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallCustomer(shipment.customer_phone)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {yalidineShipments.filter(shipment => shipment.last_status === 'Livré').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No delivered orders today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yalidine" className="space-y-4">
      <Card>
        <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Package className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Yalidine Shipments ({totalFilteredItems} total)
                  {totalPages > 1 && ` • Page ${shipmentPagination.current_page} of ${totalPages}`}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {yalidineStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {statusFilter && statusFilter !== 'all' && (
                    <Button 
                      onClick={() => setStatusFilter('all')} 
                      variant="outline"
                      size="sm"
                    >
                      Clear Filter
                    </Button>
                  )}
                  <Button 
                    onClick={() => fetchYalidineShipments(1)} 
                    disabled={loadingShipments}
                    variant="outline"
                    size="sm"
                  >
                    <Loader2 className={`h-4 w-4 mr-2 ${loadingShipments ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
        </CardHeader>
        <CardContent>
              {loadingShipments ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading shipments from Yalidine...</span>
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>
                    {statusFilter && statusFilter !== 'all'
                      ? `No shipments found with status "${statusFilter}"` 
                      : 'No shipments found in Yalidine account'
                    }
                  </p>
                  {statusFilter && statusFilter !== 'all' && (
                    <Button 
                      onClick={() => setStatusFilter('all')} 
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredShipments.map((shipment, index) => (
                    <div key={shipment.id || shipment.tracking || `shipment-${index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-lg">#{shipment.tracking}</p>
                                <Badge className={`${
                                  shipment.last_status === 'Livré' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  shipment.last_status === 'Sorti en livraison' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                  shipment.last_status === 'En préparation' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  shipment.last_status === 'Echèc livraison' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  shipment.last_status === 'Retourné au vendeur' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Echange échoué' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  shipment.last_status === 'Pas encore expédié' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                                  shipment.last_status === 'A vérifier' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                  shipment.last_status === 'Pas encore ramassé' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                  shipment.last_status === 'Prêt à expédier' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                  shipment.last_status === 'Ramassé' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                                  shipment.last_status === 'Bloqué' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                  shipment.last_status === 'Débloqué' ? 'bg-lime-100 text-lime-800 border border-lime-200' :
                                  shipment.last_status === 'Transfert' ? 'bg-violet-100 text-violet-800 border border-violet-200' :
                                  shipment.last_status === 'Expédié' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  shipment.last_status === 'Centre' ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200' :
                                  shipment.last_status === 'En localisation' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                                  shipment.last_status === 'Vers Wilaya' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                  shipment.last_status === 'Reçu à Wilaya' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  shipment.last_status === 'En attente du client' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                  shipment.last_status === 'Prêt pour livreur' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  shipment.last_status === 'En attente' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                  shipment.last_status === 'En alerte' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  shipment.last_status === 'Tentative échouée' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  shipment.last_status === 'Retour vers centre' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Retourné au centre' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Retour transfert' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Retour groupé' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Retour à retirer' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  shipment.last_status === 'Retour vers vendeur' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                  'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}>
                                  {shipment.last_status || 'Active'}
                                </Badge>
                              </div>
                              <p className="font-medium">{shipment.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{shipment.customer_phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-lg">{shipment.price?.toLocaleString()} DA</p>
                              <p className="text-sm text-muted-foreground">
                                {shipment.weight || 1} kg
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">From:</span> {shipment.from_wilaya_name || 'Batna'}
                            </div>
                            <div>
                              <span className="font-medium">To:</span> {shipment.to_wilaya_name} • {shipment.to_commune_name}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {formatYalidineDate(shipment.date_creation)}
                            </div>
                            <div>
                              <span className="font-medium">Products:</span> {shipment.product_list || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Last Status Date:</span> {formatYalidineDate(shipment.date_last_status)}
                            </div>
                          </div>
                          {shipment.customer_address && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Address:</span> {shipment.customer_address}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendWhatsAppMessage(shipment.customer_phone, shipment.tracking)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            WhatsApp
            </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCallCustomer(shipment.customer_phone)}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
            </Button>
          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalFilteredItems > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems} shipments
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={shipmentPagination.current_page === 1}
                    >
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = pageNum === shipmentPagination.current_page;
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <>
                          {shipmentPagination.current_page > 3 && (
                            <span className="px-2">...</span>
                          )}
                          {shipmentPagination.current_page > 3 && shipmentPagination.current_page < totalPages - 2 && (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => goToPage(shipmentPagination.current_page)}
                            >
                              {shipmentPagination.current_page}
                            </Button>
                          )}
                          {shipmentPagination.current_page < totalPages - 2 && (
                            <span className="px-2">...</span>
                          )}
                          {totalPages > 5 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => goToPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={shipmentPagination.current_page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Communication Status Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Communication Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order #{selectedOrder?.orderNumber}</Label>
              <p className="text-sm text-muted-foreground">
                Customer: {selectedOrder?.customerName} ({selectedOrder?.customerPhone})
              </p>
            </div>
            <div>
              <Label>Communication Status</Label>
              <Select onValueChange={(value) => {
                if (selectedOrder) {
                  updateCommunicationStatus(selectedOrder.id, value)
                  setShowCommunicationDialog(false)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANSWERED">Answered</SelectItem>
                    <SelectItem value="DIDNT_ANSWER">Didn&apos;t Answer</SelectItem>
                  <SelectItem value="SMS_SENT">SMS Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order #{selectedOrder?.orderNumber}</Label>
              <p className="text-sm text-muted-foreground">
                Customer: {selectedOrder?.customerName} ({selectedOrder?.customerPhone})
              </p>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                placeholder="Add notes about this order..."
                defaultValue={selectedOrder?.notes || ''}
                onChange={(e) => {
                  if (selectedOrder) {
                    selectedOrder.notes = e.target.value
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedOrder) {
                    updateOrderNotes(selectedOrder.id, selectedOrder.notes || '')
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
} 