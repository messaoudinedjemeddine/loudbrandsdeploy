'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isInstalled || !showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary/20 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* App Icon */}
            <div className="flex-shrink-0 relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-1 shadow-lg">
                <Image
                  src="/icon-192x192.png"
                  alt="LOUD BRANDS"
                  width={56}
                  height={56}
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Download className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold text-foreground">
                  Install LOUD BRANDS
                </h3>
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Get instant access to our premium fashion collection with the app
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>Fast Access</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Smartphone className="w-3 h-3 text-primary" />
                  <span>Mobile Optimized</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-primary" />
                  <span>Premium Experience</span>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 border-2 border-muted-foreground/20 hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Maybe Later
            </Button>
          </div>
          
          {/* Additional Info */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            Free to install • No ads • Secure shopping
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 