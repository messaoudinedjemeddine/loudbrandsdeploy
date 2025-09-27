'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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

    // Show prompt after a delay (5 seconds)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use the browser's install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      // Show instructions for manual installation
      alert('To install this app:\n\n• On Chrome: Click the menu (⋮) and select "Install LOUD BRANDS"\n• On Safari: Tap Share and select "Add to Home Screen"\n• On Firefox: Click the menu and select "Install"');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isInstalled || !showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center space-x-3">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent p-1 shadow-md">
              <Image
                src="/icon-192x192.png"
                alt="LOUD BRANDS"
                width={32}
                height={32}
                className="rounded-md w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Install App
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Get the full experience
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1 h-7"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 