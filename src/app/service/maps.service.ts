import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  currentLat: google.maps.LatLngLiteral | any;
  currentLng: google.maps.LatLngLiteral | any;
  zoom: number | any;

  constructor() {
    this.currentLat = 1.4393371803247779;
    this.currentLng = 103.62028113554064;
    this.zoom = 15;
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) {
      console.log('ngehhhh');
      
      this.currentLat = event.latLng.lat;
      this.currentLng = event.latLng.lng;
    }
  }

  // move(event: google.maps.MapMouseEvent) {
  //   if (event.latLng != null) {
  //     this.display = event.latLng.toJSON();
  //   }
  // }
}
