'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { TrackingComponent } from '@/components/tracking-component'
import { Package, MapPin, Clock } from 'lucide-react'

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Track Your Order
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Enter your Yalidine tracking number to get comprehensive order details, 
                real-time shipping updates, and complete order information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Order Details</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Real-time Location</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Delivery Timeline</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tracking Component */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <TrackingComponent />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}