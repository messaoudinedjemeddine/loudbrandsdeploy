'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Loader2,
  Edit3,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin/admin-layout'
import { api } from '@/lib/api'
import { yalidineAPI, type Wilaya, type Commune, type Center, type ShippingFees } from '@/lib/yalidine-api'
import { toast } from 'sonner'

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

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
  callCenterStatus: 'NEW' | 'CONFIRMED' | 'CANCELED' | 'NO_RESPONSE'
  deliveryStatus: 'NOT_READY' | 'READY' | 'IN_TRANSIT' | 'DONE'
  createdAt: string
  updatedAt: string
  notes?: string
  items: OrderItem[]
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  NO_RESPONSE: 'bg-gray-100 text-gray-800',
  NOT_READY: 'bg-gray-100 text-gray-800',
  READY: 'bg-yellow-100 text-yellow-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800'
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params)
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingDelivery, setEditingDelivery] = useState(false)
  const [deliveryData, setDeliveryData] = useState({
    deliveryType: 'HOME_DELIVERY' as 'HOME_DELIVERY' | 'PICKUP',
    deliveryAddress: '',
    deliveryDeskId: '',
    deliveryFee: 0,
    wilayaId: '',
    communeId: '',
    centerId: ''
  })
  
  // Yalidine data states
  const [yalidineStatus, setYalidineStatus] = useState<{ configured: boolean; message: string } | null>(null)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [shippingFees, setShippingFees] = useState<ShippingFees | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  
  // Order items editing state
  const [editingItems, setModifieringItems] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    size: ''
  })
  const [availableProducts, setAvailableProducts] = useState<Array<{
    id: string
    name: string
    nameAr?: string
    image?: string
    price: number
  }>>([])
  const [productSearch, setProductSearch] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchOrder()
    loadYalidineData()
    loadAvailableProducts() // Load products on mount
  }, [unwrappedParams.id])

  // Load Yalidine data
  const loadYalidineData = async () => {
    try {
      // Check Yalidine status
      const status = await yalidineAPI.getStatus()
      setYalidineStatus(status)
      
      if (status.configured) {
        // Load wilayas
        const wilayasData = await yalidineAPI.getWilayas()
        setWilayas(wilayasData.data)
      } else {
        console.warn('Yalidine is not configured:', status.message)
        toast.warning('L\'expédition Yalidine n\'est pas configurée. Utilisation des frais de livraison par défaut.')
      }
    } catch (error) {
      console.error('Failed to load Yalidine data:', error)
      toast.warning('L\'expédition Yalidine n\'est pas disponible. Utilisation des frais de livraison par défaut.')
      // Set a default status to prevent further API calls
      setYalidineStatus({ configured: false, message: 'Yalidine API not available' })
    }
  }

  // Load communes when wilaya changes
  const loadCommunes = async (wilayaId: string) => {
    if (!wilayaId) {
      setCommunes([])
      setCenters([])
      return
    }
    
    // Don't try to load Yalidine data if it's not configured
    if (!yalidineStatus?.configured) {
      console.warn('Yalidine not configured, skipping commune/center loading')
      return
    }
    
    try {
      setIsLoadingShipping(true)
      const communesData = await yalidineAPI.getCommunes(parseInt(wilayaId))
      setCommunes(communesData.data)
      
      // Load centers for this wilaya
      const centersData = await yalidineAPI.getCenters(parseInt(wilayaId))
      setCenters(centersData.data)
      
      // Calculate shipping fees
      await calculateShippingFees(parseInt(wilayaId))
    } catch (error) {
      console.error('Failed to load communes:', error)
      toast.warning('Failed to load delivery options. Using default fees.')
      // Clear the data to prevent confusion
      setCommunes([])
      setCenters([])
      setShippingFees(null)
    } finally {
      setIsLoadingShipping(false)
    }
  }

  // Calculate shipping fees
  const calculateShippingFees = async (toWilayaId: number) => {
    // Don't try to calculate fees if Yalidine is not configured
    if (!yalidineStatus?.configured) {
      console.warn('Yalidine not configured, skipping fee calculation')
      return
    }
    
    try {
      // Use Batna (5) as default from wilaya
      const fromWilayaId = 5
      
      // Calculate total weight and dimensions from order items
      const totalWeight = order?.items.reduce((sum, item) => sum + 0.5, 0) || 0 // Default 0.5kg per item
      const totalLength = 30 // Default 30cm
      const totalWidth = 20 // Default 20cm
      const totalHeight = order?.items.reduce((sum, item) => sum + 10, 0) || 0 // Default 10cm per item
      
      const fees = await yalidineAPI.calculateFees({
        fromWilayaId,
        toWilayaId,
        weight: totalWeight,
        length: totalLength,
        width: totalWidth,
        height: totalHeight,
        declaredValue: order?.subtotal || 0
      })
      
      console.log('Shipping fees calculated:', fees)
      setShippingFees(fees)
    } catch (error) {
      console.error('Failed to calculate shipping fees:', error)
      toast.warning('Failed to calculate shipping fees. Using default fees.')
      setShippingFees(null)
    }
  }

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.orders.getById(unwrappedParams.id) as Order
      setOrder(response)
      
      // Initialize delivery data
      setDeliveryData({
        deliveryType: response.deliveryType,
        deliveryAddress: response.deliveryAddress || '',
        deliveryDeskId: (response.deliveryDesk as any)?.id || '',
        deliveryFee: response.deliveryFee,
        wilayaId: '', // Will be set based on city mapping
        communeId: '',
        centerId: ''
      })
    } catch (error) {
      console.error('Failed to fetch order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  // Calculate delivery fee based on Yalidine data
  const getDeliveryFee = () => {
    if (!shippingFees) {
      // Fallback to default delivery fees if shipping fees not available
      console.warn('Shipping fees not available, using default fees');
      return deliveryData.deliveryType === 'HOME_DELIVERY' ? 500 : 0;
    }
    
    try {
      if (deliveryData.deliveryType === 'HOME_DELIVERY') {
        return shippingFees.deliveryOptions?.express?.home || 500; // Fallback to 500 if not available
      } else {
        return shippingFees.deliveryOptions?.express?.desk || 0;
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error)
      return deliveryData.deliveryType === 'HOME_DELIVERY' ? 500 : 0; // Fallback to default
    }
  }

  const handleDeliveryUpdate = async () => {
    if (!order) return
    
    try {
      console.log('Updating delivery information...')
      console.log('Order ID:', order.id)
      console.log('Delivery data:', deliveryData)
      
      // Validate required fields
      if (!deliveryData.deliveryType) {
        toast.error('Please select a delivery type')
        return
      }
      
      if (deliveryData.deliveryType === 'HOME_DELIVERY' && !deliveryData.deliveryAddress?.trim()) {
        toast.error('Please enter a delivery address for home delivery')
        return
      }
      
      // Calculate new delivery fee based on Yalidine data
      const newDeliveryFee = getDeliveryFee()
      const newTotal = order.subtotal + newDeliveryFee
      
      console.log('Calculated delivery fee:', newDeliveryFee)
      console.log('New total:', newTotal)
      
      // Validate calculated values
      if (isNaN(newDeliveryFee) || newDeliveryFee < 0) {
        toast.error('Invalid delivery fee calculated. Please try again.')
        return
      }
      
      if (isNaN(newTotal) || newTotal <= 0) {
        toast.error('Invalid total amount calculated. Please try again.')
        return
      }
      
      // Prepare update data
      const updateData = {
        deliveryType: deliveryData.deliveryType,
        deliveryAddress: deliveryData.deliveryAddress?.trim() || undefined,
        deliveryDeskId: deliveryData.deliveryDeskId || undefined,
        deliveryFee: newDeliveryFee,
        total: newTotal
      }
      
      console.log('Sending update data:', updateData)
      
      // Update order via API
      const response = await api.admin.updateOrderStatus(order.id, updateData)
      console.log('API response:', response)
      
      // Update local state
      setOrder(prev => prev ? {
        ...prev,
        deliveryType: deliveryData.deliveryType,
        deliveryAddress: deliveryData.deliveryAddress,
        deliveryFee: newDeliveryFee,
        total: newTotal
      } : null)
      
      setEditingDelivery(false)
      toast.success('Delivery information updated successfully')
    } catch (error) {
      console.error('Failed to update delivery information:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          toast.error('Network error: Unable to connect to server. Please check your connection.')
        } else if (error.message.includes('401') || error.message.includes('403')) {
          toast.error('Authentication error: Please log in again.')
        } else if (error.message.includes('404')) {
          toast.error('Order not found. Please refresh the page.')
        } else if (error.message.includes('500')) {
          toast.error('Server error: Please try again later.')
        } else {
          toast.error(`Failed to update delivery information: ${error.message}`)
        }
      } else {
        toast.error('Failed to update delivery information. Please try again.')
      }
    }
  }

  const handleAnnulerModifier = () => {
    if (order) {
      setDeliveryData({
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress || '',
        deliveryDeskId: '',
        deliveryFee: order.deliveryFee,
        wilayaId: '',
        communeId: '',
        centerId: ''
      })
    }
    setEditingDelivery(false)
  }

  // Load available produits for adding new items
  const loadAvailableProducts = async () => {
    setLoadingProducts(true)
    try {
      console.log('Loading available produits...')
      
      // Try admin produits endpoint first
      try {
        const response = await api.admin.getProducts({ limit: 100 }) as any
        console.log('Admin API response:', response)
        
        if (response.products && response.products.length > 0) {
          const produitsWithImages = response.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            nameAr: product.nameAr,
            image: product.image || '/placeholder-product.jpg',
            price: product.price
          }))
          
          console.log('Processed produits from admin:', produitsWithImages.length)
          setAvailableProducts(produitsWithImages)
          toast.success(`Loaded ${produitsWithImages.length} products`)
          return
        } else {
          console.log('No products found in admin response')
        }
      } catch (adminError) {
        console.warn('Admin produits endpoint failed, trying regular endpoint:', adminError)
      }
      
      // Fallback to regular produits endpoint
      try {
        const produitsResponse = await api.products.getAll({ limit: 100 }) as any
        console.log('Regular API response:', produitsResponse)
        
        const produitsWithImages = produitsResponse.products?.map((product: any) => ({
          id: product.id,
          name: product.name,
          nameAr: product.nameAr,
          image: product.image || '/placeholder-product.jpg',
          price: product.price
        })) || []
        
        console.log('Processed produits from regular endpoint:', produitsWithImages.length)
        setAvailableProducts(produitsWithImages)
        
        if (produitsWithImages.length > 0) {
          toast.success(`Loaded ${produitsWithImages.length} products`)
        } else {
          toast.warning('No products found')
        }
      } catch (regularError) {
        console.error('Regular products endpoint also failed:', regularError)
        throw regularError
      }
      
    } catch (error) {
      console.error('Failed to load produits from both endpoints:', error)
      toast.error('Failed to load available produits. Please check your connection.')
      setAvailableProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  // Start editing order items
  const startModifieringItems = () => {
    if (order) {
      // Check authentication
      const token = localStorage.getItem('auth-storage')
      console.log('Auth storage available:', !!token)
      
      setOrderItems([...order.items])
      loadAvailableProducts()
      setModifieringItems(true)
    }
  }

  // Annuler editing order items
  const cancelModifieringItems = () => {
    setModifieringItems(false)
    setOrderItems([])
    setNewItem({ productId: '', quantity: 1, size: '' })
  }

  // Update item quantity
  const updateItemQuantité = (itemId: string, quantity: number) => {
    if (quantity <= 0) return
    
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  // Update item size
  const updateItemSize = (itemId: string, size: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, size } : item
    ))
  }

  // Remove item from order
  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Add new item to order
  const addNewItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      toast.error('Please select a product and enter a valid quantity')
      return
    }

    if (!newItem.size || newItem.size.trim() === '') {
      toast.error('Please enter a size for the item')
      return
    }

    const product = availableProducts.find(p => p.id === newItem.productId)
    if (!product) {
      toast.error('Selected product not found')
      return
    }

    const newOrderItem: OrderItem = {
      id: `temp-${Date.now()}`, // Temporary ID for new items
      name: product.name,
      nameAr: product.nameAr,
      quantity: newItem.quantity,
      price: product.price,
      size: newItem.size,
      product: {
        id: product.id,
        name: product.name,
        nameAr: product.nameAr,
        image: product.image
      }
    }

    setOrderItems(prev => [...prev, newOrderItem])
    setNewItem({ productId: '', quantity: 1, size: '' })
    toast.success('Item added to order')
  }

  // Filter produits based on search
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.nameAr && product.nameAr.toLowerCase().includes(productSearch.toLowerCase()))
  )

  // Debug logging for produits
  console.log('Available produits:', availableProducts.length)
  console.log('Filtered produits:', filteredProducts.length)
  console.log('Search term:', productSearch)

  // Sauvegarder order items changes
  const saveOrderItems = async () => {
    if (!order) return

    // Validate that all items have sizes
    const itemsWithoutSize = orderItems.filter(item => !item.size || item.size.trim() === '')
    if (itemsWithoutSize.length > 0) {
      toast.error('Tous les articles doivent avoir une taille spécifiée')
      return
    }

    try {
      console.log('Saving order items...')
      console.log('Order ID:', order.id)
      console.log('Order items:', orderItems)
      
      // Calculate new subtotal
      const newSubtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const newTotal = newSubtotal + order.deliveryFee
      
      console.log('New subtotal:', newSubtotal)
      console.log('New total:', newTotal)

      // Transform order items to match backend expectations
      const transformedItems = orderItems.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          nameAr: item.product.nameAr,
          image: item.product.image
        },
        quantity: item.quantity,
        price: item.price,
        size: item.size || undefined,
        name: item.name,
        nameAr: item.nameAr || undefined
      }))
      
      console.log('Transformed items:', transformedItems)
      
      // Update order with new items and totals
      const result = await api.admin.updateOrderItems(order.id, {
        items: transformedItems,
        subtotal: newSubtotal,
        total: newTotal
      })
      
      console.log('Update result:', result)

      // Update local state
      setOrder(prev => prev ? {
        ...prev,
        items: orderItems,
        subtotal: newSubtotal,
        total: newTotal
      } : null)

      setModifieringItems(false)
      toast.success('Order items updated successfully')
    } catch (error) {
      console.error('Failed to update order items:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Network error: Unable to connect to server. Please check your connection.')
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        toast.error('Authentication error: Please log in again.')
      } else if (errorMessage.includes('404')) {
        toast.error('Order not found. Please refresh the page.')
      } else if (errorMessage.includes('500')) {
        toast.error('Server error: Please try again later.')
      } else if (errorMessage.includes('400')) {
        toast.error('Invalid data: Please check the order items and try again.')
      } else {
        toast.error(`Failed to update order items: ${errorMessage}`)
      }
    }
  }



  if (!mounted) return null

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux Commandes
              </Link>
            </Button>
          </div>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des détails de la commande...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux Commandes
              </Link>
            </Button>
          </div>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Commande introuvable</h3>
            <p className="text-muted-foreground">
              La commande que vous recherchez n'existe pas
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux Commandes
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Commande {order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Passée le {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className={statusColors[order.callCenterStatus as keyof typeof statusColors]}>
              {order.callCenterStatus}
            </Badge>
            <Badge className={statusColors[order.deliveryStatus as keyof typeof statusColors]}>
              {order.deliveryStatus}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Articles de la Commande */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Articles de la Commande
                  </div>
                  {!editingItems ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startModifieringItems}
                      className="flex items-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier les Articles
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelModifieringItems}
                        className="flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveOrderItems}
                        className="flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder les Modifications
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(editingItems ? orderItems : order.items).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                        <Image
                          src={item.product.image || '/placeholder.svg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {editingItems ? (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium">Taille:</label>
                              <Input
                                value={item.size || ''}
                                onChange={(e) => updateItemSize(item.id, e.target.value)}
                                placeholder="Taille (requis)"
                                className="w-24 h-8 text-sm"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium">Quantité:</label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantité(item.id, parseInt(e.target.value) || 1)}
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x {item.size ? `- Taille: ${item.size}` : ''}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price.toLocaleString()} DA</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {(item.quantity * item.price).toLocaleString()} DA
                        </p>
                        {editingItems && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="mt-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new item form */}
                  {editingItems && (
                    <div className="p-4 border-2 border-dashed border-muted-foreground rounded-lg">
                      <h4 className="font-medium mb-3">Ajouter un Nouvel Article</h4>
                      
                      {/* Product Search */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Rechercher des produits..."
                            className="max-w-md"
                          />
                          <span className="text-sm text-muted-foreground">
                            {loadingProducts ? 'Chargement...' : `${filteredProducts.length} of ${availableProducts.length} produits`}
                          </span>
                          {availableProducts.length === 0 && !loadingProducts && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={loadAvailableProducts}
                              >
                                Actualiser
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    console.log('Testing admin produits endpoint...')
                                    const result = await api.admin.getProducts({ limit: 5 })
                                    console.log('Test result:', result)
                                    toast.success('Admin produits endpoint working!')
                                  } catch (error) {
                                    console.error('Test failed:', error)
                                    toast.error('Admin produits endpoint failed')
                                  }
                                }}
                              >
                                Tester API
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Select
                          value={newItem.productId}
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, productId: value }))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Sélectionner un produit">
                              {newItem.productId && (() => {
                                const selectedProduct = availableProducts.find(p => p.id === newItem.productId)
                                return selectedProduct ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="relative w-6 h-6 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                      <Image
                                        src={selectedProduct.image || '/placeholder-product.jpg'}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <span className="truncate">{selectedProduct.name}</span>
                                  </div>
                                ) : null
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {loadingProducts ? (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                Chargement des produits...
                              </div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                {availableProducts.length === 0 ? 'Aucun produit disponible' : 'Aucun produit trouvé'}
                              </div>
                            ) : (
                              filteredProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id} className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2 w-full">
                                  <div className="relative w-8 h-8 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                      src={product.image || '/placeholder-product.jpg'}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">{product.price.toLocaleString()} DA</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            placeholder="Quantité"
                            className="h-9"
                          />
                          {newItem.productId && (() => {
                            const selectedProduct = availableProducts.find(p => p.id === newItem.productId)
                            return selectedProduct ? (
                              <p className="text-xs text-muted-foreground">
                                Price: {selectedProduct.price.toLocaleString()} DA
                              </p>
                            ) : null
                          })()}
                        </div>
                        <Input
                          value={newItem.size}
                          onChange={(e) => setNewItem(prev => ({ ...prev, size: e.target.value }))}
                          placeholder="Taille (requis)"
                          className="h-9"
                          required
                        />
                        <Button
                          onClick={addNewItem}
                          className="h-9"
                        >
                          Ajouter Article
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de la Commande & Actions */}
          <div className="space-y-6">
            {/* Résumé de la Commande */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la Commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>
                    {editingItems 
                      ? orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()
                      : order.subtotal.toLocaleString()
                    } DA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de Livraison:</span>
                  <span>{order.deliveryFee.toLocaleString()} DA</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">
                      {editingItems 
                        ? (orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0) + order.deliveryFee).toLocaleString()
                        : order.total.toLocaleString()
                      } DA
                    </span>
                  </div>
                </div>
                {editingItems && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Les modifications sont prévisualisées ci-dessus. Cliquez sur "Sauvegarder les Modifications" pour les appliquer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations de Livraison Modifieror */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Informations de Livraison
                  </div>
                  {!editingDelivery ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingDelivery(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleDeliveryUpdate}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAnnulerModifier}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingDelivery ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type de Livraison</label>
                      <Select
                        value={deliveryData.deliveryType}
                        onValueChange={(value) => setDeliveryData(prev => ({
                          ...prev,
                          deliveryType: value as 'HOME_DELIVERY' | 'PICKUP'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOME_DELIVERY">Livraison à Domicile</SelectItem>
                          <SelectItem value="PICKUP">Retrait en Point Relais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Wilaya Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Wilaya *</label>
                      {yalidineStatus?.configured ? (
                        <Select 
                          value={deliveryData.wilayaId} 
                          onValueChange={(value) => {
                            setDeliveryData(prev => ({
                              ...prev,
                              wilayaId: value,
                              communeId: '',
                              centerId: ''
                            }))
                            loadCommunes(value)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une wilaya" />
                          </SelectTrigger>
                          <SelectContent>
                            {wilayas.map((wilaya) => (
                              <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                                {wilaya.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            L\'expédition Yalidine n\'est pas configurée. Utilisation des frais de livraison par défaut.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Commune Selection */}
                    {deliveryData.wilayaId && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Commune</label>
                        <Select 
                          value={deliveryData.communeId} 
                          onValueChange={(value) => setDeliveryData(prev => ({
                            ...prev,
                            communeId: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une commune" />
                          </SelectTrigger>
                          <SelectContent>
                            {communes.map((commune) => (
                              <SelectItem key={commune.id} value={commune.id.toString()}>
                                {commune.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Center Selection for Pickup */}
                    {deliveryData.deliveryType === 'PICKUP' && deliveryData.wilayaId && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Lieu de Retrait *</label>
                        <Select 
                          value={deliveryData.centerId} 
                          onValueChange={(value) => setDeliveryData(prev => ({
                            ...prev,
                            centerId: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un lieu de retrait" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingShipping ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Chargement des centres...
                              </div>
                            ) : (
                              centers
                                .filter(center => center.wilaya_id.toString() === deliveryData.wilayaId)
                                .map((center) => (
                                  <SelectItem key={center.center_id} value={center.center_id.toString()}>
                                    {center.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Livraison à Domicile Address */}
                    {deliveryData.deliveryType === 'HOME_DELIVERY' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Adresse de Livraison *</label>
                        <Input
                          value={deliveryData.deliveryAddress}
                          onChange={(e) => setDeliveryData(prev => ({
                            ...prev,
                            deliveryAdresse: e.target.value
                          }))}
                          placeholder="Saisissez votre adresse complète"
                        />
                      </div>
                    )}

                    {/* Informations d'Expédition */}
                    {shippingFees && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Informations d'Expédition</label>
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>De:</span>
                                <span className="font-medium">{shippingFees.fromWilaya}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>À:</span>
                                <span className="font-medium">{shippingFees.toWilaya}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Zone:</span>
                                <span className="font-medium">{shippingFees.zone}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-sm">
                                <span>Livraison à Domicile:</span>
                                <span className="font-medium">{(shippingFees.deliveryOptions?.express?.home || 0).toLocaleString()} DA</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Retrait au Centre:</span>
                                <span className="font-medium">{(shippingFees.deliveryOptions?.express?.desk || 0).toLocaleString()} DA</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium">Nouveau Total: {(order?.subtotal || 0) + getDeliveryFee()} DA</p>
                      <p className="text-xs text-muted-foreground">Frais de Livraison: {getDeliveryFee().toLocaleString()} DA</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Type de Livraison:</p>
                      <p className="text-muted-foreground">
                        {order?.deliveryType === 'HOME_DELIVERY' ? 'Livraison à Domicile' : 'Retrait en Point Relais'}
                      </p>
                    </div>
                    {order?.deliveryType === 'HOME_DELIVERY' && order?.deliveryAddress && (
                      <div>
                        <p className="font-medium">Adresse:</p>
                        <p className="text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                    )}
                    {order?.deliveryType === 'PICKUP' && order?.deliveryDesk && (
                      <div>
                        <p className="font-medium">Point de Retrait:</p>
                        <p className="text-muted-foreground">{order.deliveryDesk.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Frais de Livraison:</p>
                      <p className="text-muted-foreground">{order?.deliveryFee.toLocaleString()} DA</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
