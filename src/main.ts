/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


// async function initMap() {
//       google.maps.importLibrary('maps');
//       google.maps.importLibrary('marker');
//       google.maps.importLibrary('places');
//     }
//     initMap();