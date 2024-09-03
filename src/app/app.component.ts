import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MapsComponent } from './maps/maps.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { environment } from '../../env/env';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MapsComponent,
    TopbarComponent,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'maps';

  private mapsLoaded = false;

  constructor() {
    // let map: google.maps.Map;
    // async function initMap() {
    //   google.maps.importLibrary('maps');
    //   google.maps.importLibrary('marker');
    //   google.maps.importLibrary('places');
    // }
    // initMap();
    // console.log('init map');
  }

  // ngOnInit(): void {
  //   this.loadGoogleMaps()
  //     .then(() => {
  //       console.log('Google Maps loaded');
  //     })
  //     .catch((err) => {
  //       console.error('Google Maps loading failed', err);
  //     });
  // }

  // private loadGoogleMaps(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     if (this.mapsLoaded) {
  //       resolve();
  //       return;
  //     }

  //     const script = document.createElement('script');
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.apiKey}&libraries=places&language=en`;
  //     script.async = true;
  //     script.onload = () => {
  //       this.mapsLoaded = true;
  //       resolve();
  //     };
  //     script.onerror = (err) => {
  //       reject(err);
  //     };

  //     document.head.appendChild(script);
  //   });
  // }

  // async function initMap() {
  //   google.maps.importLibrary('maps');
  //   google.maps.importLibrary('marker');
  //   google.maps.importLibrary('places');
  // }

  // initMap();
}
