'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  CreditCard,
  Package,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { useLocaleStore } from '@/lib/locale-store'
import { api } from '@/lib/api'
import { yalidineAPI, type Wilaya, type Commune, type Center, type ShippingFees } from '@/lib/yalidine-api'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { isRTL } = useLocaleStore()
  
  // Yalidine data states
  const [yalidineStatus, setYalidineStatus] = useState<{ configured: boolean; message: string } | null>(null)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [shippingFees, setShippingFees] = useState<ShippingFees | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryType: 'HOME_DELIVERY',
    wilayaId: '',
    communeId: '',
    centerId: '',
    deliveryAddress: '',
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
    loadYalidineData()
  }, [])

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
      }
    } catch (error) {
      console.error('Failed to load Yalidine data:', error)
      toast.error('Failed to load shipping data')
    }
  }

  // Load communes when wilaya changes
  const loadCommunes = async (wilayaId: string) => {
    if (!wilayaId) {
      setCommunes([])
      setCenters([])
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
      toast.error('Failed to load delivery options')
    } finally {
      setIsLoadingShipping(false)
    }
  }

  // Calculate shipping fees
  const calculateShippingFees = async (toWilayaId: number) => {
    try {
      // Use Batna (5) as default from wilaya
      const fromWilayaId = 5
      
      // Calculate total weight and dimensions from cart items (using defaults if not available)
      const totalWeight = items.reduce((sum, item) => sum + 0.5, 0) // Default 0.5kg per item
      const totalLength = 30 // Default 30cm
      const totalWidth = 20 // Default 20cm
      const totalHeight = items.reduce((sum, item) => sum + 10, 0) // Default 10cm per item
      
      const fees = await yalidineAPI.calculateFees({
        fromWilayaId,
        toWilayaId,
        weight: totalWeight,
        length: totalLength,
        width: totalWidth,
        height: totalHeight,
        declaredValue: getTotalPrice()
      })
      
      console.log('Shipping fees calculated:', fees)
      setShippingFees(fees)
    } catch (error) {
      console.error('Failed to calculate shipping fees:', error)
      toast.error('Failed to calculate shipping fees. Please try again.')
      setShippingFees(null)
    }
  }

  if (!mounted) return null

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-16 container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Add some products to proceed with checkout</p>
          <Button asChild>
            <Link href="/loud-styles">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedWilaya = wilayas.find(w => w.id.toString() === formData.wilayaId)
  const selectedCommune = communes.find(c => c.id.toString() === formData.communeId)
  const selectedCenter = centers.find(c => c.center_id.toString() === formData.centerId)
  
  // Calculate delivery fee based on Yalidine data
  const getDeliveryFee = () => {
    if (!shippingFees) {
      // Fallback to default delivery fees if shipping fees not available
      console.warn('Shipping fees not available, using default fees');
      return formData.deliveryType === 'HOME_DELIVERY' ? 500 : 0;
    }
    
    try {
      if (formData.deliveryType === 'HOME_DELIVERY') {
        return shippingFees.deliveryOptions?.express?.home || 500; // Fallback to 500 if not available
      } else {
        return shippingFees.deliveryOptions?.express?.desk || 0;
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error)
      return formData.deliveryType === 'HOME_DELIVERY' ? 500 : 0; // Fallback to default
    }
  }
  
  const deliveryFee = getDeliveryFee()
  const subtotal = getTotalPrice()
  const total = subtotal + deliveryFee

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Handle wilaya change
    if (field === 'wilayaId') {
      setFormData(prev => ({ 
        ...prev, 
        wilayaId: value,
        communeId: '',
        centerId: ''
      }))
      loadCommunes(value)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.customerName || !formData.customerPhone) {
        toast.error('Please fill in all required fields')
        return
      }
    }
    
    if (currentStep === 2) {
      if (!formData.wilayaId) {
        toast.error('Please select a wilaya')
        return
      }
      if (formData.deliveryType === 'HOME_DELIVERY' && !formData.deliveryAddress) {
        toast.error('Please enter your delivery address')
        return
      }
      if (formData.deliveryType === 'PICKUP' && !formData.centerId) {
        toast.error('Please select a pickup location')
        return
      }
    }
    
    setCurrentStep(prev => prev + 1)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    
    try {
      // Debug: Log the items being sent
      console.log('🔍 Debug: Items being sent to order:', items);
      console.log('🔍 Debug: Form data:', formData);
      
      // Get selected center info for pickup orders
      const selectedCenter = centers.find(c => c.center_id.toString() === formData.centerId);
      
      // Prepare order data
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryType: formData.deliveryType as 'HOME_DELIVERY' | 'PICKUP',
        deliveryAddress: formData.deliveryType === 'HOME_DELIVERY' ? formData.deliveryAddress : undefined,
        wilayaId: parseInt(formData.wilayaId),
        deliveryDeskId: formData.deliveryType === 'PICKUP' && formData.centerId ? formData.centerId : undefined,
        deliveryDeskName: formData.deliveryType === 'PICKUP' && selectedCenter ? selectedCenter.name : undefined,
        deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          sizeId: item.sizeId
        }))
      }

      // Debug: Log the order data being sent
      console.log('🔍 Debug: Order data being sent:', orderData);
      console.log('🔍 Debug: Delivery fee calculation:', {
        deliveryFee,
        subtotal,
        total,
        deliveryType: formData.deliveryType,
        shippingFees: shippingFees
      });
      console.log('🔍 Debug: API base URL:', process.env.NEXT_PUBLIC_API_URL || 'https://loudbrands-backend-eu-abfa65dd1df6.herokuapp.com/api');

      // Create order via API
      const response = await api.orders.create(orderData) as { order: { orderNumber: string } }
      
      // Prepare order details for success page
      const orderDetails = {
        orderNumber: response.order.orderNumber,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || '',
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryType === 'HOME_DELIVERY' ? formData.deliveryAddress : '',
        wilayaId: parseInt(formData.wilayaId),
        deliveryDeskName: formData.deliveryType === 'PICKUP' && selectedCenter ? selectedCenter.name : '',
        notes: formData.notes || '',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image
        })),
        subtotal: getTotalPrice(),
        deliveryFee: getDeliveryFee(),
        total: getTotalPrice() + getDeliveryFee(),
        orderDate: new Date().toISOString()
      }
      
      // Store order details in localStorage for the success page
      localStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails))
      
      // Clear cart
      clearCart()
      
      // Redirect to success page with order number
      router.push(`/order-success?orderNumber=${response.order.orderNumber}`)
      
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Customer Info', icon: User },
    { number: 2, title: 'Delivery', icon: Truck },
    { number: 3, title: 'Review', icon: Check }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 dark:from-primary/20 dark:via-primary/10 dark:to-secondary/20">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {isRTL ? 'إتمام الطلب' : 'Checkout'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isRTL 
                  ? 'أكمل طلبك بسهولة وأمان'
                  : 'Complete your order safely and easily'
                }
              </p>
            </motion.div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-2 font-medium ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.number ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <Card>
                <CardContent className="p-6">
                  {/* Step 1: Customer Information */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customerName">Full Name *</Label>
                            <Input
                              id="customerName"
                              value={formData.customerName}
                              onChange={(e) => handleInputChange('customerName', e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerPhone">Phone Number *</Label>
                            <Input
                              id="customerPhone"
                              value={formData.customerPhone}
                              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                              placeholder="+213 XXX XXX XXX"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="customerEmail">Email (Optional)</Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={formData.customerEmail}
                              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button onClick={handleNextStep}>
                          Next: Delivery Options
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Delivery Options */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
                        
                        {/* Delivery Type */}
                        <div className="mb-6">
                          <Label className="text-base font-medium">Delivery Type</Label>
                          <RadioGroup
                            value={formData.deliveryType}
                            onValueChange={(value) => handleInputChange('deliveryType', value)}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="HOME_DELIVERY" id="home" />
                              <Label htmlFor="home" className="flex items-center cursor-pointer">
                                <Truck className="w-4 h-4 mr-2" />
                                Home Delivery
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="PICKUP" id="pickup" />
                              <Label htmlFor="pickup" className="flex items-center cursor-pointer">
                                <Package className="w-4 h-4 mr-2" />
                                Pickup from Desk
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Wilaya Selection */}
                        <div className="mb-6">
                          <Label htmlFor="wilaya">Wilaya *</Label>
                          <Select value={formData.wilayaId} onValueChange={(value) => handleInputChange('wilayaId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your wilaya" />
                            </SelectTrigger>
                            <SelectContent>
                              {yalidineStatus === null ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Loading wilayas...
                                </div>
                              ) : !yalidineStatus.configured ? (
                                <div className="p-4 text-center text-muted-foreground">
                                  Shipping service not available
                                </div>
                              ) : (
                                wilayas.map((wilaya) => (
                                  <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                                    {wilaya.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {yalidineStatus && !yalidineStatus.configured && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {yalidineStatus.message}
                            </p>
                          )}
                        </div>

                        {/* Commune Selection */}
                        {formData.wilayaId && (
                          <div className="mb-6">
                            <Label htmlFor="commune">Commune *</Label>
                            <Select value={formData.communeId} onValueChange={(value) => handleInputChange('communeId', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your commune" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingShipping ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading communes...
                                  </div>
                                ) : (
                                  communes.map((commune) => (
                                    <SelectItem key={commune.id} value={commune.id.toString()}>
                                      {commune.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Center Selection */}
                        {formData.deliveryType === 'PICKUP' && formData.wilayaId && (
                          <div className="mb-6">
                            <Label htmlFor="center">Pickup Location *</Label>
                            <Select value={formData.centerId} onValueChange={(value) => handleInputChange('centerId', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pickup location" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingShipping ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading centers...
                                  </div>
                                ) : (
                                  centers
                                    .filter(center => center.wilaya_id.toString() === formData.wilayaId)
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

                        {/* Shipping Information */}
                        {shippingFees && (
                          <div className="mb-6">
                            <Label className="text-base font-medium">Shipping Information</Label>
                            <Card className="mt-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>From:</span>
                                    <span className="font-medium">{shippingFees.fromWilaya}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>To:</span>
                                    <span className="font-medium">{shippingFees.toWilaya}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Zone:</span>
                                    <span className="font-medium">{shippingFees.zone}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between text-sm">
                                    <span>Home Delivery:</span>
                                    <span className="font-medium">{(shippingFees.deliveryOptions?.express?.home || 0).toLocaleString()} DA</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Pickup from Center:</span>
                                    <span className="font-medium">{(shippingFees.deliveryOptions?.express?.desk || 0).toLocaleString()} DA</span>
                                  </div>
                                  {shippingFees.deliveryOptions?.economic?.home && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                      <span>Economic Home Delivery:</span>
                                      <span>{shippingFees.deliveryOptions.economic.home.toLocaleString()} DA</span>
                                    </div>
                                  )}
                                  {shippingFees.deliveryOptions?.economic?.desk && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                      <span>Economic Pickup:</span>
                                      <span>{shippingFees.deliveryOptions.economic.desk.toLocaleString()} DA</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Home Delivery Address */}
                        {formData.deliveryType === 'HOME_DELIVERY' && (
                          <div className="mb-6">
                            <Label htmlFor="address">Delivery Address *</Label>
                            <Textarea
                              id="address"
                              value={formData.deliveryAddress}
                              onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                              placeholder="Enter your complete address"
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Order Notes */}
                        <div>
                          <Label htmlFor="notes">Order Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Any special instructions for your order"
                            rows={2}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                          Back
                        </Button>
                        <Button onClick={handleNextStep}>
                          Review Order
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review Order */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
                        
                        {/* Customer Info Summary */}
                        <Card className="mb-6">
                          <CardHeader>
                            <CardTitle className="text-lg">Customer Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium">Name:</p>
                                <p className="text-muted-foreground">{formData.customerName}</p>
                              </div>
                              <div>
                                <p className="font-medium">Phone:</p>
                                <p className="text-muted-foreground">{formData.customerPhone}</p>
                              </div>
                              {formData.customerEmail && (
                                <div className="md:col-span-2">
                                  <p className="font-medium">Email:</p>
                                  <p className="text-muted-foreground">{formData.customerEmail}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Delivery Info Summary */}
                        <Card className="mb-6">
                          <CardHeader>
                            <CardTitle className="text-lg">Delivery Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium">Delivery Type:</p>
                                <p className="text-muted-foreground">
                                  {formData.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Pickup from Desk'}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Wilaya:</p>
                                <p className="text-muted-foreground">{selectedWilaya?.name}</p>
                              </div>
                              {formData.deliveryType === 'HOME_DELIVERY' && (
                                <div>
                                  <p className="font-medium">Address:</p>
                                  <p className="text-muted-foreground">{formData.deliveryAddress}</p>
                                </div>
                              )}
                              {formData.notes && (
                                <div>
                                  <p className="font-medium">Notes:</p>
                                  <p className="text-muted-foreground">{formData.notes}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                          Back
                        </Button>
                        <Button 
                          onClick={handleSubmitOrder}
                          disabled={isSubmitting}
                          className="min-w-32"
                        >
                          {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        </Button>
                      </div>
                      
                      {/* Debug Button */}
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            console.log('🔍 Debug: Current cart items:', items);
                            console.log('🔍 Debug: Form data:', formData);
                            console.log('🔍 Debug: Cart from localStorage:', localStorage.getItem('cart'));
                            alert('Check browser console for debug information');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Debug Info
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.sizeId || 'no-size'}`} className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 bg-muted rounded-md overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                          )}
                          <p className="text-sm">
                            {item.quantity} × {item.price.toLocaleString()} DA
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.quantity * item.price).toLocaleString()} DA
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{subtotal.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>{deliveryFee.toLocaleString()} DA</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">{total.toLocaleString()} DA</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="font-medium">Payment Method</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cash on Delivery (COD)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}