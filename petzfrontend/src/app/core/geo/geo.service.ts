import { Injectable } from '@angular/core';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  getCurrentPosition(timeoutMs = 15000): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }),
        err => reject(this.mapError(err)),
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    });
  }

  private mapError(err: GeolocationPositionError): Error {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return new Error('Location permission was denied. Enable it in your browser settings.');
      case err.POSITION_UNAVAILABLE:
        return new Error('Could not determine your location. Try again outdoors.');
      case err.TIMEOUT:
        return new Error('Location request timed out. Please try again.');
      default:
        return new Error('Could not get your location.');
    }
  }
}
