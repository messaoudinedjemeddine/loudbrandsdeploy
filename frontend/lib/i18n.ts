export type Locale = 'en' | 'ar' | 'fr'

export const locales: Locale[] = ['en', 'ar', 'fr']
export const defaultLocale: Locale = 'en'

export interface Translations {
  // Navigation
  nav: {
    home: string
    products: string
    categories: string
    about: string
    contact: string
    cart: string
    wishlist: string
    login: string
    logout: string
    profile: string
    trackOrder: string
    faq: string
  }
  
  // Common
  common: {
    search: string
    searchPlaceholder: string
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    edit: string
    delete: string
    view: string
    back: string
    next: string
    previous: string
    close: string
    submit: string
    required: string
    optional: string
    currency: string
    outOfStock: string
    inStock: string
    sale: string
    new: string
    featured: string
    bestseller: string
    addToCart: string
    buyNow: string
    viewDetails: string
    shareProduct: string
    addToWishlist: string
    removeFromWishlist: string
    quantity: string
    size: string
    color: string
    price: string
    total: string
    subtotal: string
    deliveryFee: string
    free: string
    continueShopping: string
    proceedToCheckout: string
    clearCart: string
    emptyCart: string
    itemsInCart: string
    fullName: string
    email: string
    phoneNumber: string
    subject: string
    message: string
  }
  
  // Product
      product: {
      description: string
      specifications: string
      features: string
      reviews: string
      rating: string
      reference: string
      brand: string
      category: string
      availability: string
      warranty: string
      freeDelivery: string
      easyReturns: string
      securePayment: string
      support247: string
      selectSize: string
      selectColor: string
      maxQuantity: string
      productNotFound: string
      relatedProducts: string
      recentlyViewed: string
      launch: {
        availableNow: string
        launchIn: string
        comingSoon: string
        launchMode: string
        launchDate: string
        launchEnabled: string
        launchDisabled: string
      }
    }
  
  // Checkout
  checkout: {
    title: string
    customerInfo: string
    deliveryOptions: string
    reviewOrder: string
    orderSummary: string
    fullName: string
    phoneNumber: string
    email: string
    deliveryType: string
    homeDelivery: string
    pickupFromDesk: string
    city: string
    address: string
    pickupLocation: string
    orderNotes: string
    paymentMethod: string
    cashOnDelivery: string
    placeOrder: string
    placingOrder: string
    orderPlaced: string
    estimatedDelivery: string
    orderConfirmation: string
    whatNext: string
    needHelp: string
  }
  
  // Footer
  footer: {
    quickLinks: string
    customerService: string
    contactInfo: string
    newsletter: string
    subscribeNewsletter: string
    enterEmail: string
    subscribe: string
    followUs: string
    allRightsReserved: string
    privacyPolicy: string
    termsOfService: string
    cookiePolicy: string
    freeShipping: string
    securePayment: string
    support247: string
    easyReturns: string
  }
  
  // Pages
  pages: {
    home: {
      heroTitle: string
      heroSubtitle: string
      shopNow: string
      shopByCategory: string
      featuredProducts: string
      stayUpdated: string
      newsletterText: string
    }
    
    loudBrands: {
      whoWeAre: string
      ourStory: string
      ourValues: string
      loudBrands: string
      fromHeart: string
      leadingBrand: string
      loudStylesDesc: string
      loudimDesc: string
      proudAlgerian: string
      storyBegin: string
      storyJourney: string
      storyInnovation: string
      loudStylesPurpose: string
      loudimPurpose: string
      storyToday: string
      qualityFirst: string
      qualityFirstDesc: string
      refinedElegance: string
      refinedEleganceDesc: string
      localIndustry: string
      localIndustryDesc: string
      boldness: string
      boldnessDesc: string
      innovation: string
      innovationDesc: string
      exploreLoudim: string
      exploreLoudStyles: string
      loudimTagline: string
      loudStylesTagline: string
    }
    
    about: {
      title: string
      subtitle: string
      ourStory: string
      ourValues: string
      meetOurTeam: string
      ourMission: string
      customerFirst: string
      qualityAssurance: string
      fastDelivery: string
      excellence: string
    }
    
    contact: {
      title: string
      subtitle: string
      sendMessage: string
      faq: string
      phone: string
      email: string
      address: string
      businessHours: string
      stillHaveQuestions: string
      callUs: string
      sendUsMessage: string
    }
    
    faq: {
      title: string
      subtitle: string
      searchAnswers: string
      allCategories: string
      ordersDelivery: string
      paymentPricing: string
      returnsExchanges: string
      accountSecurity: string
      productsQuality: string
      noResults: string
      clearSearch: string
    }
    
    trackOrder: {
      title: string
      subtitle: string
      orderNumber: string
      trackOrder: string
      searching: string
      orderFound: string
      orderNotFound: string
      orderDetails: string
      trackingTimeline: string
      orderItems: string
    }
    
    wishlist: {
      title: string
      subtitle: string
      emptyWishlist: string
      emptyWishlistText: string
      startShopping: string
      shareWishlist: string
      addAllToCart: string
      youMightLike: string
      exploreMore: string
      addedOn: string
    }
  }
  
  // Admin
  admin: {
    dashboard: string
    products: string
    inventory: string
    orders: string
    shipping: string
    categories: string
    users: string
    analytics: string
    settings: string
    customerCalls: string
    orderProcessing: string
    deliveryAreas: string
    logout: string
    roleNames: {
      ADMIN: string
      SUPERADMIN: string
      CALL_CENTER: string
      ORDER_CONFIRMATION: string
      DELIVERY_COORDINATOR: string
      USER: string
    }
    sidebarTitle: string
    stats: {
      happyCustomers: string
      productsSold: string
      citiesCovered: string
      yearsExperience: string
    }
    values: {
      customerFirst: string
      qualityAssurance: string
      fastDelivery: string
      excellence: string
    }
    team: {
      meetOurTeam: string
      founder: string
      headOfOperations: string
      technologyDirector: string
      description1: string
      description2: string
      description3: string
    }
    contactInfo: {
      phone: string
      email: string
      address: string
      businessHours: string
      callUs: string
      sendUsMessage: string
      details: {
        phone: string[]
        email: string[]
        address: string[]
        businessHours: string[]
      }
    }
    faq: {
      q1: string
      a1: string
      q2: string
      a2: string
      q3: string
      a3: string
      q4: string
      a4: string
    }
    form: {
      productName: string
      productNameAr: string
      description: string
      descriptionAr: string
      categoryName: string
      categoryNameAr: string
      price: string
      stock: string
      image: string
      status: string
      actions: string
      view: string
      edit: string
      delete: string
      save: string
      cancel: string
      create: string
      update: string
      search: string
      filter: string
      sort: string
      export: string
      import: string
      bulkActions: string
      selectAll: string
      clearSelection: string
    }
    messages: {
      loading: string
      error: string
      success: string
      confirmDelete: string
      noData: string
      noResults: string
      retry: string
      back: string
      next: string
      previous: string
      close: string
      submit: string
      reset: string
    }
  }
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      categories: 'Categories',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      wishlist: 'Wishlist',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      trackOrder: 'Track Order',
      faq: 'FAQ'
    },
    
    common: {
      search: 'Search',
      searchPlaceholder: 'Search products...',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      submit: 'Submit',
      required: 'Required',
      optional: 'Optional',
      currency: 'DA',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      sale: 'Sale',
      new: 'New',
      featured: 'Featured',
      bestseller: 'Bestseller',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      viewDetails: 'View Details',
      shareProduct: 'Share Product',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      quantity: 'Quantity',
      size: 'Size',
      color: 'Color',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      free: 'Free',
      continueShopping: 'Continue Shopping',
      proceedToCheckout: 'Proceed to Checkout',
      clearCart: 'Clear Cart',
      emptyCart: 'Your cart is empty',
      itemsInCart: 'items in cart',
      fullName: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      subject: 'Subject',
      message: 'Message'
    },
    
    product: {
      description: 'Description',
      specifications: 'Specifications',
      features: 'Features',
      reviews: 'Reviews',
      rating: 'Rating',
      reference: 'Reference',
      brand: 'Brand',
      category: 'Category',
      availability: 'Availability',
      warranty: 'Warranty',
      freeDelivery: 'Free Delivery',
      easyReturns: 'Easy Returns',
      securePayment: 'Secure Payment',
      support247: '24/7 Support',
      selectSize: 'Please select a size',
      selectColor: 'Please select a color',
      maxQuantity: 'Max',
      productNotFound: 'Product not found',
      relatedProducts: 'Related Products',
      recentlyViewed: 'Recently Viewed',
      launch: {
        availableNow: 'Available Now!',
        launchIn: 'Launch in:',
        comingSoon: 'Coming Soon',
        launchMode: 'Launch Mode',
        launchDate: 'Launch Date & Time',
        launchEnabled: 'Launch mode enabled',
        launchDisabled: 'Launch mode disabled'
      }
    },
    
    checkout: {
      title: 'Checkout',
      customerInfo: 'Customer Information',
      deliveryOptions: 'Delivery Options',
      reviewOrder: 'Review Order',
      orderSummary: 'Order Summary',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      email: 'Email',
      deliveryType: 'Delivery Type',
      homeDelivery: 'Home Delivery',
      pickupFromDesk: 'Pickup from Desk',
      city: 'City',
      address: 'Address',
      pickupLocation: 'Pickup Location',
      orderNotes: 'Order Notes',
      paymentMethod: 'Payment Method',
      cashOnDelivery: 'Cash on Delivery',
      placeOrder: 'Place Order',
      placingOrder: 'Placing Order...',
      orderPlaced: 'Order Placed Successfully!',
      estimatedDelivery: 'Estimated Delivery',
      orderConfirmation: 'Order Confirmation',
      whatNext: "What's Next?",
      needHelp: 'Need Help?'
    },
    
    footer: {
      quickLinks: 'Quick Links',
      customerService: 'Customer Service',
      contactInfo: 'Contact Info',
      newsletter: 'Newsletter',
      subscribeNewsletter: 'Subscribe to our newsletter',
      enterEmail: 'Enter your email',
      subscribe: 'Subscribe',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      freeShipping: 'Free Shipping',
      securePayment: 'Secure Payment',
      support247: '24/7 Support',
      easyReturns: 'Easy Returns'
    },
    
    pages: {
      home: {
        heroTitle: 'Shop the Best',
        heroSubtitle: 'Discover amazing products with fast delivery across Algeria',
        shopNow: 'Shop Now',
        shopByCategory: 'Shop by Category',
        featuredProducts: 'Featured Products',
        stayUpdated: 'Stay Updated',
        newsletterText: 'Subscribe to our newsletter and be the first to know about new products and exclusive offers'
      },
      
      loudBrands: {
        whoWeAre: 'Who We Are',
        ourStory: 'Our Story',
        ourValues: 'Our Values',
        loudBrands: 'LOUD Brands',
        fromHeart: 'From the heart of Algeria, we are redefining elegance with a style that blends modernity and authenticity.',
        leadingBrand: 'We are a leading Algerian brand specializing in the design and production of occasion wear and everyday clothing, through two distinct branches:',
        loudStylesDesc: 'Luxurious wedding and evening gowns.',
        loudimDesc: 'Chic outerwear and sophisticated casual wear.',
        proudAlgerian: 'We are here to offer Algerian women local choices that powerfully compete with international brands—with complete pride, we are 100% Algerian.',
        storyBegin: 'LOUD Brands began as a simple dream: to create local fashion that reflects the identity of the Algerian woman and meets her refined taste for every occasion.',
        storyJourney: 'From a wedding dress that immortalizes life\'s big moment to a casual look that mirrors your everyday self—our journey has been filled with passion, design, and commitment to quality.',
        storyInnovation: 'We chose to be different... so we innovated by creating two branches to cater to every aspect of your life:',
        loudStylesPurpose: 'For every grand moment, a look worthy of you.',
        loudimPurpose: 'For every day, an elegance that suits you.',
        storyToday: 'Today, we are proud to be an Algerian brand making a difference with every step.',
        qualityFirst: 'Quality First',
        qualityFirstDesc: 'From fabric selection to the final stitch, we prioritize the smallest details.',
        refinedElegance: 'Refined Elegance',
        refinedEleganceDesc: 'We design pieces that reflect your personality, with a contemporary vision and an Algerian touch.',
        localIndustry: 'Empowering Local Industry',
        localIndustryDesc: 'Our ultimate pride is being 100% Algerian production.',
        boldness: 'Boldness and Distinction',
        boldnessDesc: 'We believe every woman deserves to be unique and different.',
        innovation: 'Continuous Innovation',
        innovationDesc: 'We follow the latest fashion lines and adapt them to suit your local taste.',
        exploreLoudim: 'Explore LOUDIM',
        exploreLoudStyles: 'Explore LOUD STYLES',
        loudimTagline: 'LOUDIM collection combines elegance and comfort, designed for the modern woman seeking distinction in every occasion.',
        loudStylesTagline: 'LOUD STYLES collection embodies luxury and sophistication, crafted for the woman who demands excellence in every moment.'
      },
      
      about: {
        title: 'About E-Shop Algeria',
        subtitle: "We're on a mission to revolutionize online shopping in Algeria",
        ourStory: 'Our Story',
        ourValues: 'Our Values',
        meetOurTeam: 'Meet Our Team',
        ourMission: 'Our Mission',
        customerFirst: 'Customer First',
        qualityAssurance: 'Quality Assurance',
        fastDelivery: 'Fast Delivery',
        excellence: 'Excellence'
      },
      
      contact: {
        title: 'Contact Us',
        subtitle: "We're here to help! Get in touch with us for any questions, concerns, or feedback.",
        sendMessage: 'Send us a Message',
        faq: 'Frequently Asked Questions',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        businessHours: 'Business Hours',
        stillHaveQuestions: 'Still have questions?',
        callUs: 'Call Us',
        sendUsMessage: 'Send us a Message'
      },
      
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about shopping, delivery, returns, and more.',
        searchAnswers: 'Search for answers...',
        allCategories: 'All Categories',
        ordersDelivery: 'Orders & Delivery',
        paymentPricing: 'Payment & Pricing',
        returnsExchanges: 'Returns & Exchanges',
        accountSecurity: 'Account & Security',
        productsQuality: 'Products & Quality',
        noResults: 'No results found',
        clearSearch: 'Clear Search'
      },
      
      trackOrder: {
        title: 'Track Your Order',
        subtitle: 'Enter your order number to track your package and see real-time updates',
        orderNumber: 'Order Number',
        trackOrder: 'Track Order',
        searching: 'Searching...',
        orderFound: 'Order found!',
        orderNotFound: 'Order not found. Please check your order number.',
        orderDetails: 'Order Details',
        trackingTimeline: 'Tracking Timeline',
        orderItems: 'Order Items'
      },
      
      wishlist: {
        title: 'My Wishlist',
        subtitle: 'Keep track of items you love and want to purchase later',
        emptyWishlist: 'Your wishlist is empty',
        emptyWishlistText: 'Start adding items to your wishlist by clicking the heart icon on products you love',
        startShopping: 'Start Shopping',
        shareWishlist: 'Share Wishlist',
        addAllToCart: 'Add All to Cart',
        youMightLike: 'You Might Also Like',
        exploreMore: 'Explore More Products',
        addedOn: 'Added on'
      }
    },
    admin: {
      dashboard: 'Dashboard',
      products: 'Products',
      inventory: 'Inventory',
      orders: 'Orders',
      shipping: 'Shipping',
      categories: 'Categories',
      users: 'Users',
      analytics: 'Analytics',
      settings: 'Settings',
      customerCalls: 'Customer Calls',
      orderProcessing: 'Order Processing',
      deliveryAreas: 'Delivery Areas',
      logout: 'Logout',
      roleNames: {
        ADMIN: 'Administrator',
        SUPERADMIN: 'Super Administrator',
        CALL_CENTER: 'Call Center Agent',
        ORDER_CONFIRMATION: 'Order Processor',
        DELIVERY_COORDINATOR: 'Delivery Agent',
        USER: 'User'
      },
      sidebarTitle: 'Loudim Dashboard',
      stats: {
        happyCustomers: 'Happy Customers',
        productsSold: 'Products Sold',
        citiesCovered: 'Cities Covered',
        yearsExperience: 'Years Experience'
      },
      values: {
        customerFirst: 'Customer First',
        qualityAssurance: 'Quality Assurance',
        fastDelivery: 'Fast Delivery',
        excellence: 'Excellence'
      },
      team: {
        meetOurTeam: 'Meet Our Team',
        founder: 'Founder & CEO',
        headOfOperations: 'Head of Operations',
        technologyDirector: 'Technology Director',
        description1: 'Passionate about bringing quality products to Algerian customers.',
        description2: 'Ensures smooth operations and exceptional customer experience.',
        description3: 'Leads our technology initiatives and platform development.'
      },
      contactInfo: {
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        businessHours: 'Business Hours',
        callUs: 'Call Us',
        sendUsMessage: 'Send us a Message',
        details: {
          phone: ['+213 XXX XXX XXX', '+213 YYY YYY YYY'],
          email: ['contact@eshop-algeria.com', 'support@eshop-algeria.com'],
          address: ['123 Main Street', 'Algiers, Algeria'],
          businessHours: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM']
        }
      },
      faq: {
        q1: 'How long does delivery take?',
        a1: 'Delivery typically takes 2-5 business days depending on your location within Algeria.',
        q2: 'What payment methods do you accept?',
        a2: 'We accept cash on delivery, bank transfers, and major credit cards.',
        q3: 'Can I return or exchange items?',
        a3: 'Yes, we offer a 30-day return policy for most items in original condition.',
        q4: 'Do you deliver to all wilayas?',
        a4: 'Yes, we deliver to all 48 wilayas across Algeria.'
      },
      form: {
        productName: 'Product Name',
        productNameAr: 'Product Name (Arabic)',
        description: 'Description',
        descriptionAr: 'Description (Arabic)',
        categoryName: 'Category Name',
        categoryNameAr: 'Category Name (Arabic)',
        price: 'Price',
        stock: 'Stock',
        image: 'Image',
        status: 'Status',
        actions: 'Actions',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import',
        bulkActions: 'Bulk Actions',
        selectAll: 'Select All',
        clearSelection: 'Clear Selection'
      },
      messages: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Operation completed successfully',
        confirmDelete: 'Are you sure you want to delete this item?',
        noData: 'No data available',
        noResults: 'No results found',
        retry: 'Retry',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        close: 'Close',
        submit: 'Submit',
        reset: 'Reset'
      }
    }
  },
  
  ar: {
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      categories: 'الفئات',
      about: 'من نحن',
      contact: 'اتصل بنا',
      cart: 'السلة',
      wishlist: 'المفضلة',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
      trackOrder: 'تتبع الطلب',
      faq: 'الأسئلة الشائعة'
    },
    
    common: {
      search: 'بحث',
      searchPlaceholder: 'البحث عن المنتجات...',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      edit: 'تعديل',
      delete: 'حذف',
      view: 'عرض',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق',
      submit: 'إرسال',
      required: 'مطلوب',
      optional: 'اختياري',
      currency: 'د.ج',
      outOfStock: 'غير متوفر',
      inStock: 'متوفر',
      sale: 'تخفيض',
      new: 'جديد',
      featured: 'مميز',
      bestseller: 'الأكثر مبيعاً',
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      viewDetails: 'عرض التفاصيل',
      shareProduct: 'مشاركة المنتج',
      addToWishlist: 'أضف للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      quantity: 'الكمية',
      size: 'المقاس',
      color: 'اللون',
      price: 'السعر',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      deliveryFee: 'رسوم التوصيل',
      free: 'مجاني',
      continueShopping: 'متابعة التسوق',
      proceedToCheckout: 'إتمام الطلب',
      clearCart: 'إفراغ السلة',
      emptyCart: 'سلتك فارغة',
      itemsInCart: 'عنصر في السلة',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phoneNumber: 'رقم الهاتف',
      subject: 'الموضوع',
      message: 'الرسالة'
    },
    
    product: {
      description: 'الوصف',
      specifications: 'المواصفات',
      features: 'المميزات',
      reviews: 'التقييمات',
      rating: 'التقييم',
      reference: 'المرجع',
      brand: 'العلامة التجارية',
      category: 'الفئة',
      availability: 'التوفر',
      warranty: 'الضمان',
      freeDelivery: 'توصيل مجاني',
      easyReturns: 'إرجاع سهل',
      securePayment: 'دفع آمن',
      support247: 'دعم على مدار الساعة',
      selectSize: 'يرجى اختيار المقاس',
      selectColor: 'يرجى اختيار اللون',
      maxQuantity: 'الحد الأقصى',
      productNotFound: 'المنتج غير موجود',
      relatedProducts: 'منتجات ذات صلة',
      recentlyViewed: 'شوهدت مؤخراً',
      launch: {
        availableNow: 'متوفر الآن!',
        launchIn: 'الإطلاق في:',
        comingSoon: 'قريباً',
        launchMode: 'وضع الإطلاق',
        launchDate: 'تاريخ ووقت الإطلاق',
        launchEnabled: 'تم تفعيل وضع الإطلاق',
        launchDisabled: 'تم إلغاء وضع الإطلاق'
      }
    },
    
    checkout: {
      title: 'إتمام الطلب',
      customerInfo: 'معلومات العميل',
      deliveryOptions: 'خيارات التوصيل',
      reviewOrder: 'مراجعة الطلب',
      orderSummary: 'ملخص الطلب',
      fullName: 'الاسم الكامل',
      phoneNumber: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      deliveryType: 'نوع التوصيل',
      homeDelivery: 'توصيل منزلي',
      pickupFromDesk: 'استلام من المكتب',
      city: 'المدينة',
      address: 'العنوان',
      pickupLocation: 'موقع الاستلام',
      orderNotes: 'ملاحظات الطلب',
      paymentMethod: 'طريقة الدفع',
      cashOnDelivery: 'الدفع عند الاستلام',
      placeOrder: 'تأكيد الطلب',
      placingOrder: 'جاري تأكيد الطلب...',
      orderPlaced: 'تم تأكيد الطلب بنجاح!',
      estimatedDelivery: 'التوصيل المتوقع',
      orderConfirmation: 'تأكيد الطلب',
      whatNext: 'ما التالي؟',
      needHelp: 'تحتاج مساعدة؟'
    },
    
    footer: {
      quickLinks: 'روابط سريعة',
      customerService: 'خدمة العملاء',
      contactInfo: 'معلومات الاتصال',
      newsletter: 'النشرة الإخبارية',
      subscribeNewsletter: 'اشترك في نشرتنا الإخبارية',
      enterEmail: 'أدخل بريدك الإلكتروني',
      subscribe: 'اشتراك',
      followUs: 'تابعنا',
      allRightsReserved: 'جميع الحقوق محفوظة',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      cookiePolicy: 'سياسة ملفات تعريف الارتباط',
      freeShipping: 'شحن مجاني',
      securePayment: 'دفع آمن',
      support247: 'دعم على مدار الساعة',
      easyReturns: 'إرجاع سهل'
    },
    
    pages: {
      home: {
        heroTitle: 'تسوق الأفضل',
        heroSubtitle: 'اكتشف منتجات مذهلة مع توصيل سريع في جميع أنحاء الجزائر',
        shopNow: 'تسوق الآن',
        shopByCategory: 'تسوق حسب الفئة',
        featuredProducts: 'المنتجات المميزة',
        stayUpdated: 'ابق على اطلاع',
        newsletterText: 'اشترك في نشرتنا الإخبارية وكن أول من يعرف عن المنتجات الجديدة والعروض الحصرية'
      },
      
      loudBrands: {
        whoWeAre: 'من نحن',
        ourStory: 'قصتنا',
        ourValues: 'قيمنا',
        loudBrands: 'LOUD Brands',
        fromHeart: 'من قلب الجزائر، نحن نعيد تعريف الأناقة بأسلوب يجمع بين الحداثة والأصالة.',
        leadingBrand: 'نحن علامة جزائرية رائدة متخصصة في تصميم وإنتاج ملابس المناسبات والملابس اليومية، من خلال فرعين متميزين:',
        loudStylesDesc: 'فساتين أعراس وملابس سهرات فاخرة.',
        loudimDesc: 'ملابس خارجية أنيقة وملابس كاجوال راقية.',
        proudAlgerian: 'نحن هنا لنقدم للنساء الجزائريات خيارات محلية تنافس بقوة العلامات التجارية الدولية—بفخر كامل، نحن 100% جزائريون.',
        storyBegin: 'بدأت LOUD Brands كحلم بسيط: إنشاء موضة محلية تعكس هوية المرأة الجزائرية وتلبي ذوقها المتميز في كل مناسبة.',
        storyJourney: 'من فستان زفاف يخلد لحظة كبيرة في الحياة إلى إطلالة كاجوال تعكس ذاتك اليومية—كانت رحلتنا مليئة بالشغف والتصميم والالتزام بالجودة.',
        storyInnovation: 'اخترنا أن نكون مختلفين... لذلك ابتكرنا من خلال إنشاء فرعين لخدمة كل جانب من جوانب حياتك:',
        loudStylesPurpose: 'لكل لحظة عظيمة، إطلالة تليق بك.',
        loudimPurpose: 'لكل يوم، أناقة تناسبك.',
        storyToday: 'اليوم، نحن فخورون بأن نكون علامة جزائرية تحدث فرقاً مع كل خطوة.',
        qualityFirst: 'الجودة أولاً',
        qualityFirstDesc: 'من اختيار القماش إلى الغرزة الأخيرة، نولي أصغر التفاصيل أولوية.',
        refinedElegance: 'أناقة راقية',
        refinedEleganceDesc: 'نصمم قطعاً تعكس شخصيتك، برؤية معاصرة ولمسة جزائرية.',
        localIndustry: 'تمكين الصناعة المحلية',
        localIndustryDesc: 'فخرنا الأكبر هو أن نكون إنتاج 100% جزائري.',
        boldness: 'الجسارة والتميز',
        boldnessDesc: 'نؤمن أن كل امرأة تستحق أن تكون فريدة ومختلفة.',
        innovation: 'الابتكار المستمر',
        innovationDesc: 'نتبع أحدث خطوط الموضة ونكيفها لتناسب ذوقك المحلي.',
        exploreLoudim: 'استكشفي LOUDIM',
        exploreLoudStyles: 'استكشفي LOUD STYLES',
        loudimTagline: 'مجموعة LOUDIM تجمع بين الأناقة والراحة، مصممة للمرأة العصرية التي تبحث عن التميز في كل مناسبة.',
        loudStylesTagline: 'مجموعة LOUD STYLES تجسد الفخامة والأناقة، مصنوعة للمرأة التي تطالب بالتميز في كل لحظة.'
      },
      
      about: {
        title: 'حول متجر الجزائر الإلكتروني',
        subtitle: 'نحن في مهمة لثورة التسوق عبر الإنترنت في الجزائر',
        ourStory: 'قصتنا',
        ourValues: 'قيمنا',
        meetOurTeam: 'تعرف على فريقنا',
        ourMission: 'مهمتنا',
        customerFirst: 'العميل أولاً',
        qualityAssurance: 'ضمان الجودة',
        fastDelivery: 'توصيل سريع',
        excellence: 'التميز'
      },
      
      contact: {
        title: 'اتصل بنا',
        subtitle: 'نحن هنا للمساعدة! تواصل معنا لأي أسئلة أو استفسارات أو ملاحظات.',
        sendMessage: 'أرسل لنا رسالة',
        faq: 'الأسئلة الشائعة',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        address: 'العنوان',
        businessHours: 'ساعات العمل',
        stillHaveQuestions: 'لا تزال لديك أسئلة؟',
        callUs: 'اتصل بنا',
        sendUsMessage: 'أرسل لنا رسالة'
      },
      
      faq: {
        title: 'الأسئلة الشائعة',
        subtitle: 'اعثر على إجابات للأسئلة الشائعة حول التسوق والتوصيل والإرجاع والمزيد.',
        searchAnswers: 'البحث عن إجابات...',
        allCategories: 'جميع الفئات',
        ordersDelivery: 'الطلبات والتوصيل',
        paymentPricing: 'الدفع والتسعير',
        returnsExchanges: 'الإرجاع والاستبدال',
        accountSecurity: 'الحساب والأمان',
        productsQuality: 'المنتجات والجودة',
        noResults: 'لم يتم العثور على نتائج',
        clearSearch: 'مسح البحث'
      },
      
      trackOrder: {
        title: 'تتبع طلبك',
        subtitle: 'أدخل رقم طلبك لتتبع الطرد ومشاهدة التحديثات في الوقت الفعلي',
        orderNumber: 'رقم الطلب',
        trackOrder: 'تتبع الطلب',
        searching: 'جاري البحث...',
        orderFound: 'تم العثور على الطلب!',
        orderNotFound: 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب.',
        orderDetails: 'تفاصيل الطلب',
        trackingTimeline: 'الجدول الزمني للتتبع',
        orderItems: 'عناصر الطلب'
      },
      
      wishlist: {
        title: 'قائمة المفضلة',
        subtitle: 'تتبع العناصر التي تحبها وتريد شراؤها لاحقاً',
        emptyWishlist: 'قائمة المفضلة فارغة',
        emptyWishlistText: 'ابدأ بإضافة عناصر إلى قائمة المفضلة بالنقر على أيقونة القلب على المنتجات التي تحبها',
        startShopping: 'ابدأ التسوق',
        shareWishlist: 'مشاركة قائمة المفضلة',
        addAllToCart: 'أضف الكل للسلة',
        youMightLike: 'قد يعجبك أيضاً',
        exploreMore: 'استكشف المزيد من المنتجات',
        addedOn: 'أضيف في'
      }
    },
    admin: {
      dashboard: 'لوحة التحكم',
      products: 'المنتجات',
      inventory: 'المخزون',
      orders: 'الطلبات',
      shipping: 'الشحن',
      categories: 'الفئات',
      users: 'المستخدمون',
      analytics: 'التحليلات',
      settings: 'الإعدادات',
      customerCalls: 'مكالمات العملاء',
      orderProcessing: 'معالجة الطلبات',
      deliveryAreas: 'مناطق التوصيل',
      logout: 'تسجيل الخروج',
      roleNames: {
        ADMIN: 'مدير',
        SUPERADMIN: 'مدير عام',
        CALL_CENTER: 'موظف مركز الاتصال',
        ORDER_CONFIRMATION: 'معالج الطلبات',
        DELIVERY_COORDINATOR: 'مندوب التوصيل',
        USER: 'مستخدم'
      },
      sidebarTitle: 'لوحة تحكم لوديم',
      stats: {
        happyCustomers: 'عملاء سعداء',
        productsSold: 'منتجات مباعة',
        citiesCovered: 'مدن مشمولة',
        yearsExperience: 'سنوات الخبرة'
      },
      values: {
        customerFirst: 'العميل أولاً',
        qualityAssurance: 'ضمان الجودة',
        fastDelivery: 'توصيل سريع',
        excellence: 'التميز'
      },
      team: {
        meetOurTeam: 'تعرف على فريقنا',
        founder: 'المؤسس والرئيس التنفيذي',
        headOfOperations: 'رئيس العمليات',
        technologyDirector: 'مدير التكنولوجيا',
        description1: 'شغوف بتقديم منتجات عالية الجودة للعملاء في الجزائر.',
        description2: 'يضمن سير العمليات بسلاسة وتجربة عملاء استثنائية.',
        description3: 'يقود مبادراتنا التقنية وتطوير المنصة.'
      },
      contactInfo: {
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        address: 'العنوان',
        businessHours: 'ساعات العمل',
        callUs: 'اتصل بنا',
        sendUsMessage: 'أرسل لنا رسالة',
        details: {
          phone: ['+213 XXX XXX XXX', '+213 YYY YYY YYY'],
          email: ['contact@eshop-algeria.com', 'support@eshop-algeria.com'],
          address: ['123 شارع رئيسي', 'الجزائر العاصمة، الجزائر'],
          businessHours: ['الإثنين-الجمعة: 9:00 ص - 6:00 م', 'السبت: 10:00 ص - 4:00 م']
        }
      },
      faq: {
        q1: 'كم يستغرق التوصيل؟',
        a1: 'عادةً ما يستغرق التوصيل من 2 إلى 5 أيام عمل حسب موقعك في الجزائر.',
        q2: 'ما هي طرق الدفع المتوفرة؟',
        a2: 'نقبل الدفع عند الاستلام، التحويلات البنكية، وجميع البطاقات الائتمانية الرئيسية.',
        q3: 'هل يمكنني إرجاع أو استبدال المنتجات؟',
        a3: 'نعم، نقدم سياسة إرجاع لمدة 30 يومًا لمعظم المنتجات بحالتها الأصلية.',
        q4: 'هل توصلون إلى جميع الولايات؟',
        a4: 'نعم، نقوم بالتوصيل إلى جميع الولايات الـ 48 في الجزائر.'
      },
      form: {
        productName: 'اسم المنتج',
        productNameAr: 'اسم المنتج (بالعربية)',
        description: 'الوصف',
        descriptionAr: 'الوصف (بالعربية)',
        categoryName: 'اسم الفئة',
        categoryNameAr: 'اسم الفئة (بالعربية)',
        price: 'السعر',
        stock: 'المخزون',
        image: 'الصورة',
        status: 'الحالة',
        actions: 'الإجراءات',
        view: 'عرض',
        edit: 'تعديل',
        delete: 'حذف',
        save: 'حفظ',
        cancel: 'إلغاء',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        sort: 'ترتيب',
        export: 'تصدير',
        import: 'استيراد',
        bulkActions: 'إجراءات جماعية',
        selectAll: 'تحديد الكل',
        clearSelection: 'مسح التحديد'
      },
      messages: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تمت العملية بنجاح',
        confirmDelete: 'هل أنت متأكد من حذف هذا العنصر؟',
        noData: 'لا توجد بيانات متاحة',
        noResults: 'لم يتم العثور على نتائج',
        retry: 'إعادة المحاولة',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        close: 'إغلاق',
        submit: 'إرسال',
        reset: 'إعادة تعيين'
      }
    }
  },
  
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Produits',
      categories: 'Catégories',
      about: 'À propos',
      contact: 'Contact',
      cart: 'Panier',
      wishlist: 'Liste de souhaits',
      login: 'Connexion',
      logout: 'Déconnexion',
      profile: 'Profil',
      trackOrder: 'Suivre la commande',
      faq: 'FAQ'
    },
    
    common: {
      search: 'Rechercher',
      searchPlaceholder: 'Rechercher des produits...',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer',
      submit: 'Soumettre',
      required: 'Requis',
      optional: 'Optionnel',
      currency: 'DA',
      outOfStock: 'Rupture de stock',
      inStock: 'En stock',
      sale: 'Promotion',
      new: 'Nouveau',
      featured: 'En vedette',
      bestseller: 'Meilleure vente',
      addToCart: 'Ajouter au panier',
      buyNow: 'Acheter maintenant',
      viewDetails: 'Voir les détails',
      shareProduct: 'Partager le produit',
      addToWishlist: 'Ajouter à la liste de souhaits',
      removeFromWishlist: 'Retirer de la liste de souhaits',
      quantity: 'Quantité',
      size: 'Taille',
      color: 'Couleur',
      price: 'Prix',
      total: 'Total',
      subtotal: 'Sous-total',
      deliveryFee: 'Frais de livraison',
      free: 'Gratuit',
      continueShopping: 'Continuer les achats',
      proceedToCheckout: 'Procéder au paiement',
      clearCart: 'Vider le panier',
      emptyCart: 'Votre panier est vide',
      itemsInCart: 'articles dans le panier',
      fullName: 'Nom complet',
      email: 'Email',
      phoneNumber: 'Numéro de téléphone',
      subject: 'Sujet',
      message: 'Message'
    },
    
    product: {
      description: 'Description',
      specifications: 'Spécifications',
      features: 'Caractéristiques',
      reviews: 'Avis',
      rating: 'Évaluation',
      reference: 'Référence',
      brand: 'Marque',
      category: 'Catégorie',
      availability: 'Disponibilité',
      warranty: 'Garantie',
      freeDelivery: 'Livraison gratuite',
      easyReturns: 'Retours faciles',
      securePayment: 'Paiement sécurisé',
      support247: 'Support 24/7',
      selectSize: 'Veuillez sélectionner une taille',
      selectColor: 'Veuillez sélectionner une couleur',
      maxQuantity: 'Max',
      productNotFound: 'Produit non trouvé',
      relatedProducts: 'Produits connexes',
      recentlyViewed: 'Vus récemment',
      launch: {
        availableNow: 'Disponible maintenant !',
        launchIn: 'Lancement dans :',
        comingSoon: 'Bientôt disponible',
        launchMode: 'Mode de lancement',
        launchDate: 'Date et heure de lancement',
        launchEnabled: 'Mode de lancement activé',
        launchDisabled: 'Mode de lancement désactivé'
      }
    },
    
    checkout: {
      title: 'Paiement',
      customerInfo: 'Informations client',
      deliveryOptions: 'Options de livraison',
      reviewOrder: 'Réviser la commande',
      orderSummary: 'Résumé de la commande',
      fullName: 'Nom complet',
      phoneNumber: 'Numéro de téléphone',
      email: 'Email',
      deliveryType: 'Type de livraison',
      homeDelivery: 'Livraison à domicile',
      pickupFromDesk: 'Retrait au bureau',
      city: 'Ville',
      address: 'Adresse',
      pickupLocation: 'Lieu de retrait',
      orderNotes: 'Notes de commande',
      paymentMethod: 'Méthode de paiement',
      cashOnDelivery: 'Paiement à la livraison',
      placeOrder: 'Passer la commande',
      placingOrder: 'Passage de la commande...',
      orderPlaced: 'Commande passée avec succès !',
      estimatedDelivery: 'Livraison estimée',
      orderConfirmation: 'Confirmation de commande',
      whatNext: 'Et maintenant ?',
      needHelp: 'Besoin d\'aide ?'
    },
    
    footer: {
      quickLinks: 'Liens rapides',
      customerService: 'Service client',
      contactInfo: 'Informations de contact',
      newsletter: 'Newsletter',
      subscribeNewsletter: 'Abonnez-vous à notre newsletter',
      enterEmail: 'Entrez votre email',
      subscribe: 'S\'abonner',
      followUs: 'Suivez-nous',
      allRightsReserved: 'Tous droits réservés',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: 'Conditions de service',
      cookiePolicy: 'Politique des cookies',
      freeShipping: 'Livraison gratuite',
      securePayment: 'Paiement sécurisé',
      support247: 'Support 24/7',
      easyReturns: 'Retours faciles'
    },
    
    pages: {
      home: {
        heroTitle: 'Achetez le meilleur',
        heroSubtitle: 'Découvrez des produits incroyables avec une livraison rapide dans toute l\'Algérie',
        shopNow: 'Acheter maintenant',
        shopByCategory: 'Acheter par catégorie',
        featuredProducts: 'Produits en vedette',
        stayUpdated: 'Restez informé',
        newsletterText: 'Abonnez-vous à notre newsletter et soyez le premier à connaître les nouveaux produits et offres exclusives'
      },
      
      loudBrands: {
        whoWeAre: 'Qui nous sommes',
        ourStory: 'Notre histoire',
        ourValues: 'Nos valeurs',
        loudBrands: 'LOUD Brands',
        fromHeart: 'Du cœur de l\'Algérie, nous redéfinissons l\'élégance avec un style qui allie modernité et authenticité.',
        leadingBrand: 'Nous sommes une marque algérienne leader spécialisée dans la conception et la production de vêtements d\'occasion et de tous les jours, à travers deux branches distinctes :',
        loudStylesDesc: 'Robes de mariée et tenues de soirée luxueuses.',
        loudimDesc: 'Vêtements d\'extérieur élégants et vêtements décontractés sophistiqués.',
        proudAlgerian: 'Nous sommes ici pour offrir aux femmes algériennes des choix locaux qui rivalisent puissamment avec les marques internationales—avec une fierté totale, nous sommes 100% algériens.',
        storyBegin: 'LOUD Brands a commencé comme un simple rêve : créer une mode locale qui reflète l\'identité de la femme algérienne et répond à son goût raffiné pour chaque occasion.',
        storyJourney: 'D\'une robe de mariée qui immortalise le grand moment de la vie à un look décontracté qui reflète votre moi quotidien—notre parcours a été rempli de passion, de design et d\'engagement envers la qualité.',
        storyInnovation: 'Nous avons choisi d\'être différents... alors nous avons innové en créant deux branches pour répondre à chaque aspect de votre vie :',
        loudStylesPurpose: 'Pour chaque grand moment, un look digne de vous.',
        loudimPurpose: 'Pour chaque jour, une élégance qui vous convient.',
        storyToday: 'Aujourd\'hui, nous sommes fiers d\'être une marque algérienne qui fait la différence à chaque pas.',
        qualityFirst: 'Qualité d\'abord',
        qualityFirstDesc: 'De la sélection du tissu au point final, nous privilégions les plus petits détails.',
        refinedElegance: 'Élégance raffinée',
        refinedEleganceDesc: 'Nous concevons des pièces qui reflètent votre personnalité, avec une vision contemporaine et une touche algérienne.',
        localIndustry: 'Autonomiser l\'industrie locale',
        localIndustryDesc: 'Notre fierté ultime est d\'être une production 100% algérienne.',
        boldness: 'Audace et distinction',
        boldnessDesc: 'Nous croyons que chaque femme mérite d\'être unique et différente.',
        innovation: 'Innovation continue',
        innovationDesc: 'Nous suivons les dernières lignes de mode et les adaptons à votre goût local.',
        exploreLoudim: 'Explorez LOUDIM',
        exploreLoudStyles: 'Explorez LOUD STYLES',
        loudimTagline: 'La collection LOUDIM allie élégance et confort, conçue pour la femme moderne qui recherche la distinction à chaque occasion.',
        loudStylesTagline: 'La collection LOUD STYLES incarne le luxe et la sophistication, conçue pour la femme qui exige l\'excellence à chaque moment.'
      },
      
      about: {
        title: 'À propos d\'E-Shop Algérie',
        subtitle: 'Nous avons pour mission de révolutionner le shopping en ligne en Algérie',
        ourStory: 'Notre histoire',
        ourValues: 'Nos valeurs',
        meetOurTeam: 'Rencontrez notre équipe',
        ourMission: 'Notre mission',
        customerFirst: 'Client d\'abord',
        qualityAssurance: 'Assurance qualité',
        fastDelivery: 'Livraison rapide',
        excellence: 'Excellence'
      },
      
      contact: {
        title: 'Contactez-nous',
        subtitle: 'Nous sommes là pour vous aider ! Contactez-nous pour toute question, préoccupation ou commentaire.',
        sendMessage: 'Envoyez-nous un message',
        faq: 'Questions fréquemment posées',
        phone: 'Téléphone',
        email: 'Email',
        address: 'Adresse',
        businessHours: 'Heures d\'ouverture',
        stillHaveQuestions: 'Vous avez encore des questions ?',
        callUs: 'Appelez-nous',
        sendUsMessage: 'Envoyez-nous un message'
      },
      
      faq: {
        title: 'Questions fréquemment posées',
        subtitle: 'Trouvez des réponses aux questions courantes sur les achats, la livraison, les retours et plus encore.',
        searchAnswers: 'Rechercher des réponses...',
        allCategories: 'Toutes les catégories',
        ordersDelivery: 'Commandes et livraison',
        paymentPricing: 'Paiement et prix',
        returnsExchanges: 'Retours et échanges',
        accountSecurity: 'Compte et sécurité',
        productsQuality: 'Produits et qualité',
        noResults: 'Aucun résultat trouvé',
        clearSearch: 'Effacer la recherche'
      },
      
      trackOrder: {
        title: 'Suivre votre commande',
        subtitle: 'Entrez votre numéro de commande pour suivre votre colis et voir les mises à jour en temps réel',
        orderNumber: 'Numéro de commande',
        trackOrder: 'Suivre la commande',
        searching: 'Recherche...',
        orderFound: 'Commande trouvée !',
        orderNotFound: 'Commande non trouvée. Veuillez vérifier votre numéro de commande.',
        orderDetails: 'Détails de la commande',
        trackingTimeline: 'Chronologie de suivi',
        orderItems: 'Articles de la commande'
      },
      
      wishlist: {
        title: 'Ma liste de souhaits',
        subtitle: 'Gardez une trace des articles que vous aimez et que vous voulez acheter plus tard',
        emptyWishlist: 'Votre liste de souhaits est vide',
        emptyWishlistText: 'Commencez à ajouter des articles à votre liste de souhaits en cliquant sur l\'icône cœur sur les produits que vous aimez',
        startShopping: 'Commencer les achats',
        shareWishlist: 'Partager la liste de souhaits',
        addAllToCart: 'Tout ajouter au panier',
        youMightLike: 'Vous pourriez aussi aimer',
        exploreMore: 'Explorer plus de produits',
        addedOn: 'Ajouté le'
      }
    },
    
    admin: {
      dashboard: 'Tableau de bord',
      products: 'Produits',
      inventory: 'Inventaire',
      orders: 'Commandes',
      shipping: 'Expédition',
      categories: 'Catégories',
      users: 'Utilisateurs',
      analytics: 'Analyses',
      settings: 'Paramètres',
      customerCalls: 'Appels clients',
      orderProcessing: 'Traitement des commandes',
      deliveryAreas: 'Zones de livraison',
      logout: 'Déconnexion',
      roleNames: {
        ADMIN: 'Administrateur',
        SUPERADMIN: 'Super administrateur',
        CALL_CENTER: 'Agent du centre d\'appels',
        ORDER_CONFIRMATION: 'Traiteur de commandes',
        DELIVERY_COORDINATOR: 'Agent de livraison',
        USER: 'Utilisateur'
      },
      sidebarTitle: 'Tableau de bord Loudim',
      stats: {
        happyCustomers: 'Clients satisfaits',
        productsSold: 'Produits vendus',
        citiesCovered: 'Villes couvertes',
        yearsExperience: 'Années d\'expérience'
      },
      values: {
        customerFirst: 'Client d\'abord',
        qualityAssurance: 'Assurance qualité',
        fastDelivery: 'Livraison rapide',
        excellence: 'Excellence'
      },
      team: {
        meetOurTeam: 'Rencontrez notre équipe',
        founder: 'Fondateur et PDG',
        headOfOperations: 'Chef des opérations',
        technologyDirector: 'Directeur technologique',
        description1: 'Passionné par l\'apport de produits de qualité aux clients algériens.',
        description2: 'Assure des opérations fluides et une expérience client exceptionnelle.',
        description3: 'Dirige nos initiatives technologiques et le développement de la plateforme.'
      },
      contactInfo: {
        phone: 'Téléphone',
        email: 'Email',
        address: 'Adresse',
        businessHours: 'Heures d\'ouverture',
        callUs: 'Appelez-nous',
        sendUsMessage: 'Envoyez-nous un message',
        details: {
          phone: ['+213 XXX XXX XXX', '+213 YYY YYY YYY'],
          email: ['contact@eshop-algeria.com', 'support@eshop-algeria.com'],
          address: ['123 Rue Principale', 'Alger, Algérie'],
          businessHours: ['Lun-Ven: 9h00 - 18h00', 'Sam: 10h00 - 16h00']
        }
      },
      faq: {
        q1: 'Combien de temps prend la livraison ?',
        a1: 'La livraison prend généralement 2 à 5 jours ouvrables selon votre emplacement en Algérie.',
        q2: 'Quelles méthodes de paiement acceptez-vous ?',
        a2: 'Nous acceptons le paiement à la livraison, les virements bancaires et les principales cartes de crédit.',
        q3: 'Puis-je retourner ou échanger des articles ?',
        a3: 'Oui, nous offrons une politique de retour de 30 jours pour la plupart des articles dans leur état d\'origine.',
        q4: 'Livrez-vous dans toutes les wilayas ?',
        a4: 'Oui, nous livrons dans les 48 wilayas d\'Algérie.'
      },
      form: {
        productName: 'Nom du produit',
        productNameAr: 'Nom du produit (arabe)',
        description: 'Description',
        descriptionAr: 'Description (arabe)',
        categoryName: 'Nom de la catégorie',
        categoryNameAr: 'Nom de la catégorie (arabe)',
        price: 'Prix',
        stock: 'Stock',
        image: 'Image',
        status: 'Statut',
        actions: 'Actions',
        view: 'Voir',
        edit: 'Modifier',
        delete: 'Supprimer',
        save: 'Enregistrer',
        cancel: 'Annuler',
        create: 'Créer',
        update: 'Mettre à jour',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        export: 'Exporter',
        import: 'Importer',
        bulkActions: 'Actions en lot',
        selectAll: 'Tout sélectionner',
        clearSelection: 'Effacer la sélection'
      },
      messages: {
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite',
        success: 'Opération terminée avec succès',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
        noData: 'Aucune donnée disponible',
        noResults: 'Aucun résultat trouvé',
        retry: 'Réessayer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        close: 'Fermer',
        submit: 'Soumettre',
        reset: 'Réinitialiser'
      }
    }
  }
}

// Utility functions
export function getTranslation(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale]
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar'
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

export function formatCurrency(amount: number, locale: Locale): string {
  const t = getTranslation(locale)
  return `${amount.toLocaleString()} ${t.common.currency}`
}