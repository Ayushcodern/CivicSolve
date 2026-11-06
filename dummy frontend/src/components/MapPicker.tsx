import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, Compass, AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface LocationData {
  lat: number;
  lon: number;
  district: string;
  ward: string;
  address?: string;
}

export interface MapPickerProps {
  initialLat?: number;
  initialLon?: number;
  onChange?: (data: LocationData) => void;
  className?: string;
  height?: string;
}

// Default center: Madhya Pradesh (Indore / Sanwer region: 22.9734° N, 75.8321° E)
const DEFAULT_LAT = 22.9734;
const DEFAULT_LON = 75.8321;

export const MapPicker: React.FC<MapPickerProps> = ({
  initialLat = DEFAULT_LAT,
  initialLon = DEFAULT_LON,
  onChange,
  className = "",
  height = "380px",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLat,
    lon: initialLon,
  });
  const [district, setDistrict] = useState<string>("Indore");
  const [ward, setWard] = useState<string>("Sanwer");
  const [address, setAddress] = useState<string>("");
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Reverse Geocoding with Nominatim OpenStreetMap API
  const reverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      setGeocoding(true);
      setGeoError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en,hi",
              "User-Agent": "CivicSolve-OpenPlatform/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Geocoding service unavailable");
        }

        const data = await response.json();
        const addr = data.address || {};

        // Parse District with smart regional fallbacks for Madhya Pradesh
        const detectedDistrict =
          addr.state_district ||
          addr.county ||
          addr.district ||
          addr.city ||
          addr.state ||
          "Indore";

        // Parse Ward / Tehsil / Village / Suburb
        const detectedWard =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.city_district ||
          addr.tehsil ||
          addr.subdistrict ||
          addr.road ||
          "Ward / Tehsil";

        const formattedAddress =
          data.display_name || `${detectedWard}, ${detectedDistrict}`;

        setDistrict(detectedDistrict);
        setWard(detectedWard);
        setAddress(formattedAddress);

        if (onChange) {
          onChange({
            lat,
            lon,
            district: detectedDistrict,
            ward: detectedWard,
            address: formattedAddress,
          });
        }
      } catch (err) {
        console.warn("Reverse geocode fallback activated:", err);
        const fallbackDistrict = district || "Indore";
        const fallbackWard = ward || "Ward / Tehsil";
        if (onChange) {
          onChange({
            lat,
            lon,
            district: fallbackDistrict,
            ward: fallbackWard,
            address: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
          });
        }
      } finally {
        setGeocoding(false);
      }
    },
    [district, ward, onChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Custom high-contrast SVG marker icon to prevent missing png 404s
      const customIcon = L.divIcon({
        className: "civicsolve-marker-wrapper",
        html: `
          <div style="position: relative; width: 36px; height: 36px; transform: translate(-18px, -36px);">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              background: #0f4c3a;
              border: 3px solid #ffffff;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background: #e67e22;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
            <div style="
              width: 14px;
              height: 6px;
              background: rgba(0,0,0,0.25);
              border-radius: 50%;
              margin: 2px auto 0;
              filter: blur(1px);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap Standard Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draggable Marker
      const marker = L.marker([initialLat, initialLon], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      // Marker drag listener
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        const newLat = parseFloat(position.lat.toFixed(5));
        const newLon = parseFloat(position.lng.toFixed(5));
        setCoords({ lat: newLat, lon: newLon });
        reverseGeocode(newLat, newLon);
      });

      // Map click listener: moves marker to clicked point
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const newLat = parseFloat(lat.toFixed(5));
        const newLon = parseFloat(lng.toFixed(5));
        marker.setLatLng([newLat, newLon]);
        setCoords({ lat: newLat, lon: newLon });
        reverseGeocode(newLat, newLon);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode
      reverseGeocode(initialLat, initialLon);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLon, reverseGeocode]);

  // Use My Current Location via browser Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(5));
        const lon = parseFloat(position.coords.longitude.toFixed(5));

        setCoords({ lat, lon });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
          markerRef.current.setLatLng([lat, lon]);
        }

        reverseGeocode(lat, lon);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case 1:
            setGeoError("Location permission denied. Please enable GPS permissions.");
            break;
          case 2:
            setGeoError("Location information is currently unavailable.");
            break;
          case 3:
            setGeoError("Location request timed out. Please try again.");
            break;
          default:
            setGeoError("Could not retrieve current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className={`relative rounded-xl border border-border bg-card overflow-hidden shadow-sm ${className}`}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-0 relative cursor-crosshair"
      />

      {/* Floating 'Use My Current Location' Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur-xs px-3.5 py-2 text-xs font-semibold text-foreground shadow-md border border-border hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all cursor-pointer"
        aria-label="Use My Current Location"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Navigation className="h-4 w-4 text-primary" />
        )}
        <span>{locating ? "Locating GPS..." : "Use My Current Location"}</span>
      </button>

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="absolute top-3 right-12 z-10 flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-xs px-2.5 py-1 text-[11px] text-muted-foreground border border-border shadow-xs animate-pulse">
          <Compass className="h-3.5 w-3.5 animate-spin text-saffron" />
          <span>Resolving ward...</span>
        </div>
      )}

      {/* Error banner */}
      {geoError && (
        <div className="absolute top-14 left-3 right-3 z-10 flex items-center gap-2 rounded-lg bg-destructive/10 backdrop-blur-xs px-3 py-2 text-xs text-destructive border border-destructive/30 shadow-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Coordinate & Geocoded District/Ward Bar */}
      <div className="p-3.5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <MapPin className="h-4 w-4 text-saffron" />
            <span>Pin:</span>
          </span>
          <span className="font-mono bg-background px-2 py-0.5 rounded border border-border text-foreground">
            {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-background px-2.5 py-0.5 rounded border border-border">
            <span className="text-muted-foreground">District:</span>
            <span className="font-semibold text-foreground">{district}</span>
          </div>

          <div className="flex items-center gap-1 bg-background px-2.5 py-0.5 rounded border border-border">
            <span className="text-muted-foreground">Ward/Tehsil:</span>
            <span className="font-semibold text-foreground">{ward}</span>
          </div>
        </div>

        {address && (
          <div className="w-full text-[11px] text-muted-foreground truncate" title={address}>
            {address}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
