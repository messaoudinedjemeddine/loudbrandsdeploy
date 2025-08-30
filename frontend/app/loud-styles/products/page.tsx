'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Star, 
  Search, 
  Sparkles,
  TrendingUp,
  Heart,
  Eye
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useLocaleStore } from '@/lib/locale-store'
import { toast } from 'sonner'
import { LaunchCountdown } from '@/components/launch-countdown'
import { LoudStylesNavbar } from '@/components/loud-styles-navbar'

// Define Product type
interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
  } | string;
  categoryAr?: string;
  rating?: number;
  isOnSale?: boolean;
  isLaunch?: boolean;
  isLaunchActive?: boolean;
  isOrderable?: boolean;
  launchAt?: string;
  stock: number;
  sizes: Array<{ id: string; size: string; stock: number }> | string[];
}

export default function LoudStylesProductsPage() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const addItem = useCartStore((state) => state.addItem)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { isRTL } = useLocaleStore()

  // Fetch products
  useEffect(() => {
    setMounted(true)
    
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch products
        const productsRes = await fetch('/api/products')
        if (!productsRes.ok) {
          throw new Error(`HTTP error! status: ${productsRes.status}`)
        }
        const productsData = await productsRes.json()
        
        if (productsData.error) {
          throw new Error(productsData.error)
        }
        
        const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || [])
        setProducts(productsArray)
        setFilteredProducts(productsArray)
        
      } catch (error) {
        console.error('Failed to fetch data:', error)
        // Set empty arrays to prevent the page from crashing
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      // Filter products by category
      const filtered = products.filter(product => {
        const categoryName = typeof product.category === 'string' 
          ? product.category 
          : product.category.name;
        return categoryName.toLowerCase().includes(categoryParam.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      const productName = (isRTL ? (product.nameAr ?? '') : (product.name ?? '')).toLowerCase();
      const categoryName = (isRTL 
        ? (typeof product.category === 'string' 
            ? (product.categoryAr ?? '') 
            : (product.category.nameAr ?? ''))
        : (typeof product.category === 'string' 
            ? product.category 
            : product.category.name)
      ).toLowerCase();
      
      return productName.includes(searchQuery.toLowerCase()) ||
             categoryName.includes(searchQuery.toLowerCase());
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, isRTL])

  if (!mounted) return null

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: isRTL ? (product.nameAr || product.name) : product.name,
      price: product.price,
      image: product.image || '/placeholder.svg'
    })
  }

  const ProductCard = ({ product, index }: { product: Product, index: number }) => {
    // Convert sizes to string array for rendering
    const sizeStrings = Array.isArray(product.sizes) && product.sizes.length > 0
      ? typeof product.sizes[0] === 'string' 
        ? product.sizes as string[]
        : (product.sizes as Array<{id: string; size: string; stock: number}>).map(s => s.size)
      : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="group relative h-full"
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-beige-100 via-beige-200 to-beige-300 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
          {/* Product Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
            <Link href={`/loud-styles/products/${product.slug}`} className="block w-full h-full">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.image && product.image.trim() !== '' ? product.image : '/placeholder.svg'}
                  alt={isRTL ? product.nameAr || product.name : product.name}
                  fill
                  className="object-cover transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </motion.div>
            </Link>
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const isCurrentlyWishlisted = isInWishlist(product.id)
                    
                    if (isCurrentlyWishlisted) {
                      removeFromWishlist(product.id)
                      toast.success(isRTL ? 'تم إزالة من المفضلة' : 'Removed from wishlist')
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
                      toast.success(isRTL ? 'تم الإضافة للمفضلة' : 'Added to wishlist')
                    }
                  }}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg"
                  asChild
                >
                  <Link href={`/loud-styles/products/${product.slug}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} space-y-2`}>
              {product.isOnSale && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg text-center">
                    <Sparkles className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {isRTL ? 'تخفيض' : 'Sale'}
                  </Badge>
                </motion.div>
              )}
              {product.isLaunch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.1, duration: 0.4 }}
                >
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg text-center">
                    Coming Soon
                  </Badge>
                </motion.div>
              )}
            </div>
            
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
              {product.stock <= 5 && product.stock > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 shadow-lg text-center">
                    {isRTL ? 'مخزون قليل' : 'Low Stock'}
                  </Badge>
                </motion.div>
              )}
              {product.stock === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg text-center">
                    {isRTL ? 'غير متوفر' : 'Out of Stock'}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <CardContent className="p-4 flex-1 flex flex-col min-h-0">
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Category */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Badge variant="outline" className="text-xs font-medium text-center">
                  {isRTL 
                    ? (typeof product.category === 'string' 
                        ? (product.categoryAr || product.category) 
                        : (product.category.nameAr || product.category.name))
                    : (typeof product.category === 'string' 
                        ? product.category 
                        : product.category.name)
                  }
                </Badge>
                <div className={`flex items-center space-x-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">
                    {product.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>

              {/* Product Name */}
              <Link href={`/loud-styles/products/${product.slug}`} className="block flex-1 min-h-0">
                <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors group-hover:text-primary text-center min-h-[2.5rem] flex items-center justify-center">
                  {isRTL ? product.nameAr || product.name : product.name}
                </h3>
              </Link>

              {/* Sizes Preview */}
              {sizeStrings.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center min-h-[1.5rem]">
                  {sizeStrings.slice(0, 3).map((size: string, sizeIndex: number) => (
                    <span 
                      key={size || sizeIndex} 
                      className="text-xs bg-muted px-2 py-1 rounded-full font-medium text-center"
                    >
                      {size || '-'}
                    </span>
                  ))}
                  {sizeStrings.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-muted-foreground">
                      +{sizeStrings.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'} mt-auto`}>
                <div className="space-y-1 text-center flex-1">
                  <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center`}>
                    <span className="text-lg font-bold text-primary">
                      {product.price.toLocaleString()} {isRTL ? 'د.ج' : 'DA'}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.oldPrice.toLocaleString()} {isRTL ? 'د.ج' : 'DA'}
                      </span>
                    )}
                  </div>
                  {product.oldPrice && (
                    <div className={`flex items-center space-x-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center`}>
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% {isRTL ? 'توفير' : 'off'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Launch Countdown */}
              {product.isLaunch && product.launchAt && (
                <div className="mt-3">
                  <LaunchCountdown launchAt={product.launchAt} />
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-center mt-3 h-10"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0 || (product.isLaunch && product.isLaunchActive)}
              >
                <ShoppingCart className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {product.stock === 0 
                  ? (isRTL ? 'غير متوفر' : 'Out of Stock')
                  : (product.isLaunch && product.isLaunchActive)
                    ? 'Coming Soon'
                    : (isRTL ? 'أضيفي للسلة' : 'Add to Cart')
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#b6b8b2' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <LoudStylesNavbar />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20" style={{ backgroundColor: '#b6b8b2' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-secondary bg-clip-text text-transparent text-center leading-tight">
              {isRTL ? 'أناقة الأزياء التقليدية الجزائرية' : 'LOUD STYLES Collection'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-center leading-relaxed">
              {isRTL 
                ? 'تسوقي حسب المجموعة - المجموعة المميزة'
                : 'A unique collection of premium products with the highest quality and best prices'
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5`} />
              <Input
                placeholder={isRTL ? 'البحث في المنتجات...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} h-12 text-lg bg-white/80 backdrop-blur-sm border-2 border-primary/20 focus:border-primary/50 transition-all duration-300 text-center`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8" style={{ backgroundColor: '#b6b8b2' }}>
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {isRTL ? 'لا توجد منتجات' : 'No products found'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              {isRTL 
                ? 'لا توجد منتجات تطابق معايير البحث. جربي تعديل المرشحات.'
                : 'No products match your search criteria. Try adjusting your filters.'
              }
            </p>
            <Button onClick={() => setSearchQuery('')} variant="outline" className="text-center">
              {isRTL ? 'مسح البحث' : 'Clear Search'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
