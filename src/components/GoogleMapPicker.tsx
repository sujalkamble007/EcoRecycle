import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Type } from "lucide-react";

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const GoogleMapPicker = ({ onLocationSelect }: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
    });

    (loader as any).importLibrary('maps').then(async () => {
      const defaultCenter = { lat: 20.5937, lng: 78.9629 };
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: defaultCenter,
        zoom: 5,
      });

      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        position: defaultCenter,
        draggable: true,
      });

      const geocoder = new google.maps.Geocoder();
      const updateAddress = (lat: number, lng: number) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            onLocationSelect(lat, lng, results[0].formatted_address);
          }
        });
      };

      markerInstance.addListener("dragend", () => {
        const position = markerInstance.getPosition();
        if (position) {
          updateAddress(position.lat(), position.lng());
        }
      });

      mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          markerInstance.setPosition(e.latLng);
          updateAddress(e.latLng.lat(), e.latLng.lng());
        }
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.setCenter(userLocation);
          mapInstance.setZoom(15);
          markerInstance.setPosition(userLocation);
          updateAddress(userLocation.lat, userLocation.lng);
        });
      }

      setMarker(markerInstance);
      setIsLoaded(true);
    });
  }, [apiKey, onLocationSelect]);

  const handleManualAddressChange = (value: string) => {
    setManualAddress(value);
    if (value.trim()) {
      // For manual address, use default India coordinates
      onLocationSelect(20.5937, 78.9629, value);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="google-api-key">Google Maps API Key</Label>
          <Input
            id="google-api-key"
            type="text"
            placeholder="Enter your Google Maps API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Get your API key from{" "}
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="map" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Map Selection
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Enter Address
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="map" className="space-y-4 mt-4">
        <p className="text-sm text-muted-foreground">
          Click on the map or drag the marker to select your pickup location
        </p>
        <div
          ref={mapRef}
          className="w-full h-96 rounded-2xl overflow-hidden shadow-soft"
        />
      </TabsContent>
      
      <TabsContent value="text" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="manual-address">Enter Your Address</Label>
          <Textarea
            id="manual-address"
            placeholder="Enter your complete pickup address&#10;Example: House No., Street Name, Area, City, State, PIN Code"
            value={manualAddress}
            onChange={(e) => handleManualAddressChange(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground">
            Type your complete address including street, area, city, and postal code
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default GoogleMapPicker;
