'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Package, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { yalidineAPI, TrackingHistory } from '@/lib/yalidine-api';

interface TrackingComponentProps {
  initialTrackingNumber?: string;
}

const statusIcons = {
  'Livré': <CheckCircle className="h-4 w-4 text-green-500" />,
  'Echèc livraison': <XCircle className="h-4 w-4 text-red-500" />,
  'En attente': <Clock className="h-4 w-4 text-yellow-500" />,
  'Sorti en livraison': <Package className="h-4 w-4 text-blue-500" />,
  'Expédié': <Package className="h-4 w-4 text-blue-500" />,
  'Centre': <MapPin className="h-4 w-4 text-purple-500" />,
  'default': <AlertCircle className="h-4 w-4 text-gray-500" />
};

const statusColors = {
  'Livré': 'bg-green-100 text-green-800 border-green-200',
  'Echèc livraison': 'bg-red-100 text-red-800 border-red-200',
  'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Sorti en livraison': 'bg-blue-100 text-blue-800 border-blue-200',
  'Expédié': 'bg-blue-100 text-blue-800 border-blue-200',
  'Centre': 'bg-purple-100 text-purple-800 border-purple-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

export function TrackingComponent({ initialTrackingNumber }: TrackingComponentProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [trackingHistory, setTrackingHistory] = useState<TrackingHistory[]>([]);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const searchTracking = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);

      // Get tracking history
      const historyData = await yalidineAPI.getTracking(trackingNumber);
      setTrackingHistory(historyData.data);

      // Get shipment details
      try {
        const details = await yalidineAPI.getShipment(trackingNumber);
        
        // Handle the data structure - Yalidine returns data in a 'data' array
        const shipmentData = details.data && details.data.length > 0 ? details.data[0] : details;
        setShipmentDetails(shipmentData);
      } catch (detailsError) {
        console.warn('Could not fetch shipment details:', detailsError);
        setShipmentDetails(null);
      }

    } catch (error: any) {
      console.error('Error searching tracking:', error);
      setError(error.response?.data?.error || 'Failed to find tracking information');
      setTrackingHistory([]);
      setShipmentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    return statusIcons[status as keyof typeof statusIcons] || statusIcons.default;
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.default;
  };

  const getCurrentStatus = () => {
    if (trackingHistory.length === 0) return null;
    return trackingHistory[0]; // Most recent status
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="tracking" className="sr-only">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number (e.g., yal-123456)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTracking()}
              />
            </div>
            <Button onClick={searchTracking} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      {currentStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(currentStatus.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(currentStatus.status)}>
                      {currentStatus.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(currentStatus.date_status)}
                    </span>
                  </div>
                  {currentStatus.reason && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> {currentStatus.reason}
                    </p>
                  )}
                </div>
              </div>
              
              {currentStatus.center_name && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Current Location</p>
                      <p className="text-sm text-muted-foreground">
                        {currentStatus.center_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentStatus.commune_name}, {currentStatus.wilaya_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Details */}
      {shipmentDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order & Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-primary">Order Number</Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {shipmentDetails.order_id || trackingNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-primary">Tracking Number</Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {trackingNumber}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Recipient Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {shipmentDetails.firstname} {shipmentDetails.familyname}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {shipmentDetails.contact_phone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Delivery Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {shipmentDetails.address}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destination City</Label>
                  <p className="text-sm text-muted-foreground">
                    {shipmentDetails.to_commune_name}, {shipmentDetails.to_wilaya_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Type</Label>
                  <Badge variant="outline" className="text-xs">
                    {shipmentDetails.stopdesk_id ? 'Pickup Point' : 'Home Delivery'}
                  </Badge>
                </div>
                {shipmentDetails.stopdesk_name && (
                  <div>
                    <Label className="text-sm font-medium">Pickup Point</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.stopdesk_name}
                    </p>
                  </div>
                )}
                </div>
              </div>

              <Separator />

              {/* Product & Value Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product & Value Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Products Ordered</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.product_list}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order Value</Label>
                    <p className="text-lg font-bold text-primary">
                      {shipmentDetails.price} DA
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Declared Value</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.declared_value} DA
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insurance</Label>
                    <Badge variant={shipmentDetails.do_insurance ? "default" : "secondary"} className="text-xs">
                      {shipmentDetails.do_insurance ? 'Insured' : 'Not Insured'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Delivery Fee</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.delivery_fee} DA
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Free Shipping</Label>
                    <Badge variant={shipmentDetails.freeshipping ? "default" : "secondary"} className="text-xs">
                      {shipmentDetails.freeshipping ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Package Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Package Specifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Weight</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.weight} kg
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Length</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.length} cm
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Width</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.width} cm
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Height</Label>
                    <p className="text-sm text-muted-foreground">
                      {shipmentDetails.height} cm
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingHistory.map((status, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(status.status)}
                    {index < trackingHistory.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(status.date_status)}
                      </span>
                    </div>
                    {status.reason && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {status.reason}
                      </p>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>{status.center_name}</p>
                      <p>{status.commune_name}, {status.wilaya_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searched && !loading && trackingHistory.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tracking information found</h3>
            <p className="text-muted-foreground">
              Please check your tracking number and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 