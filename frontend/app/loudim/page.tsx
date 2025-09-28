'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Sparkles,
  Truck,
  Shield,
  Headphones,
  CreditCard
} from 'lucide-react'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useLocaleStore } from '@/lib/locale-store'
import { Navbar } from '@/components/navbar'

interface Product {
  id: string
  name: string
  nameAr?: string
  description?: string
  price: number
  oldPrice?: number
  image: string
  slug: string
  rating?: number
  isOnSale?: boolean
  stock: number
  sizes: any[]
  category: {
    id: string
    name: string
    nameAr?: string
    slug: string
  }
  brand: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  nameAr?: string
  slug: string
  image?: string
  productCount: number
}

export default function LoudimPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const addItem = useCartStore((state) => state.addItem)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { isRTL } = useLocaleStore()

  // Features for LOUDIM
  const features = [
    {
      icon: Truck,
      title: isRTL ? 'شحن مع ياليدين' : 'Shipping with Yalidine',
      description: isRTL ? 'شحن موثوق مع ياليدين' : 'Reliable shipping with Yalidine'
    },
    {
      icon: Shield,
      title: isRTL ? 'جودة مضمونة' : 'Quality Guaranteed',
      description: isRTL ? 'أقمشة فاخرة وخياطة متقنة' : 'Premium fabrics and expert craftsmanship'
    },
    {
      icon: Headphones,
      title: isRTL ? 'دعم شخصي' : 'Personal Support',
      description: isRTL ? 'استشارة مجانية لاختيار المقاس المناسب' : 'Free consultation for perfect fit'
    },
    {
      icon: CreditCard,
      title: isRTL ? 'دفع آمن' : 'Secure Payment',
      description: isRTL ? 'دفع عند الاستلام' : 'Cash on delivery'
    }
  ]

  // Fetch LOUDIM data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch LOUDIM products
        const productsResponse = await fetch('/api/products?brand=loudim')
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await productsResponse.json()
        
        const products = productsData.products || []
        const featured = products.slice(0, 4).map((product: any) => ({
          ...product,
          sizes: product.sizes || [],
          rating: product.rating || 4.5,
          isOnSale: product.oldPrice && product.oldPrice > product.price,
          slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-')
        }))
        setFeaturedProducts(featured)

        // Fetch LOUDIM categories
        const categoriesResponse = await fetch('/api/categories?brand=loudim')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        
        const categories = categoriesData.categories || []
        const categoriesWithCount = categories.map((category: any) => ({
          ...category,
          productCount: category.productCount || 0,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
        }))
        setCategories(categoriesWithCount)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: isRTL ? product.nameAr || product.name : product.name,
      price: product.price,
      image: product.image
    })
  }

  const getSizeStrings = (sizes: any[]) => {
    if (!Array.isArray(sizes)) return []
    return sizes.map(size => typeof size === 'string' ? size : size.size)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-100 via-cream-50 to-warm-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          id="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          <Image
            src="/placeholder.svg"
            alt="LOUDIM Hero"
            fill
            className="video-fallback"
            priority
          />
        </video>
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content */}
        <div className={`relative z-10 text-center text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[120%]"
          >
            {isRTL ? 'أناقة الأزياء التقليدية الجزائرية' : 'Elegant Algerian Traditional Fashion'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 font-normal leading-[150%] max-w-3xl mx-auto"
          >
            {isRTL 
              ? 'اكتشفي مجموعتنا الفاخرة من الأزياء التقليدية الجزائرية المصممة خصيصاً للمرأة العصرية'
              : 'Discover our exquisite collection of traditional Algerian fashion designed for the modern woman'
            }
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 transition-all duration-300 font-semibold hover:scale-105 shadow-lg hover:shadow-xl" 
              style={{ backgroundColor: '#a58a66', borderColor: '#a58a66' }}
              asChild
            >
              <Link href="/loudim/products">
                {isRTL ? 'تسوقي الآن' : 'Shop Now'}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 transition-all duration-300 font-semibold hover:scale-105 border-white text-black hover:bg-white hover:text-gray-900" 
              asChild
            >
              <Link href="/loudim/categories">
                {isRTL ? 'استكشفي المجموعات' : 'Explore Collections'}
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-cream-100 via-warm-50 to-cream-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#a58a66' }}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 leading-[120%] text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-[150%]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-[120%] text-gray-900 dark:text-white">
              {isRTL ? 'تسوقي حسب المجموعة' : 'Shop by Collection'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-[150%]">
              {isRTL 
                ? 'اكتشفي مجموعاتنا المتنوعة من الأزياء التقليدية الجزائرية'
                : 'Discover our diverse collections of traditional Algerian fashion'
              }
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="flex-shrink-0"
                  >
                    <Link href={`/loudim/products?category=${category.slug}&brand=loudim`}>
                      <div className="group cursor-pointer relative">
                        {/* Circle Container */}
                        <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-white via-cream-50 to-warm-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 relative">
                          <Image
                            src={category.image || '/placeholder.svg'}
                            alt={isRTL ? category.nameAr || category.name : category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500" />
                          
                          {/* Category Info */}
                          <div className="absolute inset-0 flex items-end justify-center p-6">
                            <div className="text-center text-white">
                              <motion.h3 
                                className="text-xl font-bold mb-2"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isRTL ? category.nameAr || category.name : category.name}
                              </motion.h3>
                              <motion.p 
                                className="text-sm opacity-90"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {category.productCount} {isRTL ? 'قطعة' : 'pieces'}
                              </motion.p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Ring Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-primary/30 transition-all duration-500"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-cream-100 via-warm-50 to-cream-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-[120%] text-gray-900 dark:text-white">
              {isRTL ? 'المجموعة المميزة' : 'Featured Collection'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-[150%]">
              {isRTL 
                ? 'قطع مختارة بعناية من أجمل الأزياء التقليدية الجزائرية'
                : 'Carefully selected pieces from the most beautiful traditional Algerian fashion'
              }
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-80 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 4).map((product, index) => {
                  const sizeStrings = getSizeStrings(product.sizes)
                  
                  return (
                                          <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        viewport={{ once: true }}
                        whileHover={{ 
                          y: -8,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        whileTap={{ 
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                        className="h-full"
                      >
                        <Link href={`/loudim/products/${product.slug}?brand=loudim`} className="block h-full">
                          <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-beige-100 via-beige-200 to-beige-300 dark:from-gray-800 dark:to-gray-900 relative h-full flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl">
                            {/* Hover overlay effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            />
                            
                            <div className="relative flex-1 flex flex-col">
                              <div className="relative h-80 overflow-hidden flex-shrink-0">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className="relative h-full w-full"
                                >
                                  <Image
                                    src={product.image || '/placeholder.svg'}
                                    alt={isRTL ? product.nameAr || product.name : product.name}
                                    fill
                                    className="object-cover transition-transform duration-500"
                                  />
                                </motion.div>
                                {product.isOnSale && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                                  >
                                    <Badge className={`absolute top-4 bg-red-500 hover:bg-red-600 ${isRTL ? 'right-4' : 'left-4'} shadow-lg rounded-lg`}>
                                      {isRTL ? 'تخفيض' : 'Sale'}
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                            
                            <CardContent className="p-6 flex-1 flex flex-col text-center">
                              <motion.h3 
                                className="font-semibold text-lg mb-3 line-clamp-2 hover:text-primary transition-colors text-center leading-[120%]"
                                whileHover={{ color: 'hsl(var(--primary))' }}
                              >
                                {isRTL ? product.nameAr || product.name : product.name}
                              </motion.h3>
                              
                              
                              <motion.div 
                                className="flex items-center justify-center gap-2 mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                              >
                                {product.oldPrice && product.oldPrice > product.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {product.oldPrice?.toLocaleString()} DA
                                  </span>
                                )}
                                <span className="text-xl font-bold text-primary">
                                  {product.price.toLocaleString()} DA
                                </span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center justify-center gap-2 mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                              >
                                {sizeStrings.slice(0, 3).map((size, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                                  >
                                    {size}
                                  </span>
                                ))}
                                {sizeStrings.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{sizeStrings.length - 3}
                                  </span>
                                )}
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center justify-center gap-2 mt-auto"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                              >
                                <Button
                                  size="sm"
                                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-200"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleAddToCart(product)
                                  }}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-10 h-10 p-0"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    const isCurrentlyWishlisted = isInWishlist(product.id)
                                    if (isCurrentlyWishlisted) {
                                      removeFromWishlist(product.id)
                                    } else {
                                      addToWishlist({
                                        id: product.id,
                                        name: product.name,
                                        nameAr: product.nameAr,
                                        price: product.price,
                                        oldPrice: product.oldPrice,
                                        image: product.image,
                                        rating: product.rating,
                                        isOnSale: product.isOnSale,
                                        stock: product.stock,
                                        slug: product.slug
                                      })
                                    }
                                  }}
                                >
                                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                              </motion.div>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 transition-all duration-300 font-medium text-white" 
                  style={{ backgroundColor: '#a58a66', borderColor: '#a58a66' }}
                  asChild
                >
                  <Link href="/loudim/products" style={{ borderColor: '#a58a66', color: 'white' }}>
                    {isRTL ? 'عرض جميع المنتجات' : 'View All Products'}
                  </Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
