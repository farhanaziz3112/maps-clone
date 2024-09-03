import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  GoogleMapsModule,
  MapPolyline,
  MapAdvancedMarker,
  MapInfoWindow,
  MapBicyclingLayer,
} from '@angular/google-maps';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { MenuItem, SelectItem } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SidebarModule } from 'primeng/sidebar';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { KnobModule } from 'primeng/knob';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [
    TimelineModule,
    MapPolyline,
    KnobModule,
    TieredMenuModule,
    ProgressSpinnerModule,
    AvatarModule,
    AccordionModule,
    BadgeModule,
    TagModule,
    GalleriaModule,
    SidebarModule,
    DividerModule,
    GoogleMapsModule,
    SidebarComponent,
    TopbarComponent,
    CommonModule,
    MapBicyclingLayer,
    FormsModule,
    ReactiveFormsModule,
    MenuModule,
    TableModule,
    StyleClassModule,
    PanelMenuModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RatingModule,
  ],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
})
export class MapsComponent implements AfterViewChecked {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild(MapAdvancedMarker) mapAdvancedMarker!: MapAdvancedMarker;

  //-----------------------------Layout boolean and function------------------------------------

  viewSidebarMenu: boolean = false;

  viewLocationInfo: boolean = false;

  viewPlaces: boolean = false;

  viewDirections: boolean = false;

  viewSettings: boolean = false;

  viewSearchFilter: boolean = false;

  displayGallery: boolean | any;

  viewPlaceDetail: boolean = false;

  viewGallery() {
    this.displayGallery = true;
  }

  toggleLocationInfo() {
    this.viewLocationInfo = true;
    this.viewPlaces = false;
    this.viewDirections = false;
    this.viewSettings = false;
    this.viewSidebarMenu = true;
  }

  togglePlaces() {
    this.viewPlaces = true;
    this.viewLocationInfo = false;
    this.viewDirections = false;
    this.viewSettings = false;
    this.viewSidebarMenu = true;
  }

  toggleDirections() {
    this.viewDirections = true;
    this.viewPlaces = false;
    this.viewLocationInfo = false;
    this.viewSettings = false;
    this.viewSidebarMenu = true;
  }

  toggleSettings() {
    this.viewSettings = true;
    this.viewPlaces = false;
    this.viewDirections = false;
    this.viewLocationInfo = false;
    this.viewSidebarMenu = true;
  }

  togglePlaceDetail() {
    this.viewPlaceDetail = !this.viewPlaceDetail;
  }

  toggleSideMenu() {
    this.viewSidebarMenu = !this.viewSidebarMenu;
  }

  getSideMenuStatus(): string {
    if (this.viewSidebarMenu) {
      return 'sidebar-active';
    } else {
      return 'sidebar-inactive';
    }
  }

  getPlaceDetailStatus(): string {
    if (this.viewPlaceDetail) {
      return 'place-detail-active';
    } else {
      return 'place-detail-inactive';
    }
  }

  profileMenu: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
    },
  ];

  //-----------------------------Form initialization------------------------------------

  coordinateForm!: FormGroup;

  searchPlaceForm!: FormGroup;

  placeSortField: string = '';
  placeSortOrder: number = 0;
  placeSortForm!: FormGroup;
  placesSortOptions: SelectItem[] = [
    {
      label: 'Rating High to Low',
      value: '!rating',
    },
    {
      label: 'Rating Low to High',
      value: 'rating',
    },
  ];

  //-----------------------------Location and maps options------------------------------------

  options!: google.maps.MapOptions;

  clickLocation: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0,
  };

  deviceLocation: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0,
  };

  searchLocation: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0,
  };

  zoom = 15;

  display: any;

  //-----------------------------Constructor------------------------------------

  constructor(
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          this.deviceLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.clickLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.options = {
            mapId: 'DEMO_MAP_ID',
            mapTypeId: 'roadmap',
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            zoom: this.zoom,
          };

          this.initializePlacesService();
          this.initializeRouteService();
        }
      );
    }
    this.coordinateForm = this.formBuilder.group({
      lat: [''],
      lng: [''],
    });
    this.searchPlaceForm = this.formBuilder.group({
      name: [''],
    });
    this.placeSortForm = this.formBuilder.group({
      sort: [''],
    });
  }

  //-----------------------------Url Sanitization------------------------------------
  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getUrl(url: string): any {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  //-----------------------------Place Filter------------------------------------

  applyPlaceFilter() {
    if (this.placeSortForm.value['sort'] != '') {
      let sortOption = this.placeSortForm.value['sort'];

      if (sortOption.indexOf('!') === 0) {
        this.placeSortOrder = -1;
        this.placeSortField = sortOption.substring(1, sortOption.length);
      } else {
        this.placeSortOrder = 1;
        this.placeSortField = sortOption;
      }

      this.searchedPlaces = [...this.searchedPlaces].sort((a: any, b: any) => {
        let result = 0;

        if (a.rating < b.rating) {
          result = -1;
        } else {
          result = 1;
        }

        return result * this.placeSortOrder;
      });

      this.nearbyPlaces = [...this.nearbyPlaces].sort((a: any, b: any) => {
        let result = 0;

        if (a.rating < b.rating) {
          result = -1;
        } else {
          result = 1;
        }

        return result * this.placeSortOrder;
      });
    }

    this.viewSearchFilter = false;
  }

  //-----------------------------Random location------------------------------------

  randomLocations: any[] = [];

  generateRandomLocation(total: number) {
    this.randomLocations = this.getRandomLocation(total);
  }

  clearRandomLocation() {
    this.randomLocations = [];
  }

  getRandomLocation(totalLocations: number): any[] {
    let locations: any[] = [];
    let minLat = 1.27;
    let maxLat = 1.7;
    let minLng = 103.5;
    let maxLng = 104.3;
    for (let i = 0; i < totalLocations; i++) {
      const parser = new DOMParser();

      const pinSvgString =
        '<svg fill="#000000" width="40" height="40" viewBox="0 0 24 24" id="place" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><path id="secondary" d="M12,3A6,6,0,0,0,6,9c0,5,6,12,6,12s6-7,6-12A6,6,0,0,0,12,3Zm0,8a2,2,0,1,1,2-2A2,2,0,0,1,12,11Z" style="fill: rgb(44, 169, 188); stroke-width: 2;"></path><path id="primary" d="M14,9a2,2,0,1,1-2-2A2,2,0,0,1,14,9Zm4,0A6,6,0,0,0,6,9c0,5,6,12,6,12S18,14,18,9Z" style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></svg>';

      const pinSvg = parser.parseFromString(
        pinSvgString,
        'image/svg+xml'
      ).documentElement;

      let lat = Math.random() * (maxLat - minLat) + minLat;
      let lng = Math.random() * (maxLng - minLng) + minLng;
      locations.push({
        position: {
          lat: lat,
          lng: lng,
        },
        label: {
          color: 'red',
          text: 'Location ' + (i + 1),
        },
        title: 'Location ' + (i + 1),
        content: pinSvg,
        // animation: google.maps.Animation.DROP
        // options: { animation: google.maps.Animation.BOUNCE },
      });
    }
    return locations;
  }

  //--------------------------------Autocomplete Place------------------------------------

  @ViewChild('addressText', { static: false }) addressText: ElementRef | any;
  queryWait: boolean = false;
  private autocomplete: google.maps.places.Autocomplete | any;

  ngAfterViewChecked() {
    if (this.addressText && !this.autocomplete) {
      this.getPlaceAutoComplete();
    }
  }

  private getPlaceAutoComplete() {
    this.autocomplete = new google.maps.places.Autocomplete(
      this.addressText.nativeElement,
      {}
    );

    google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
      const parser = new DOMParser();

      const pinSvgString =
        '<svg height="60px" width="60px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><path style="fill:#444C6D;" d="M256,207.448c-8.828,0-17.655-0.883-35.31-3.531v38.841h70.621v-38.841 C273.655,206.566,264.828,207.448,256,207.448"/><path style="fill:#D8D8D8;" d="M229.517,242.759h52.966l-7.945,211.862c0,9.71-8.828,17.655-18.538,17.655 c-9.71,0-17.655-7.945-18.538-17.655L229.517,242.759z"/><path style="fill:#43B05B;" d="M276.303,392.828l-2.648,61.793c0,9.71-8.828,17.655-18.538,17.655s-17.655-7.945-18.538-17.655 l-2.648-61.793C103.283,395.476,0,420.193,0,450.207c0,31.779,114.759,57.379,256,57.379s256-25.6,256-57.379 C512,420.193,408.717,395.476,276.303,392.828"/><path id="SVGCleanerId_0" style="fill:#DD342E;" d="M361.931,110.345C361.931,52.083,314.262,4.414,256,4.414 S150.069,52.083,150.069,110.345S197.738,216.276,256,216.276S361.931,168.607,361.931,110.345"/><path d="M185.379,119.172c-5.297,0-8.828-3.531-8.828-8.828c0-44.138,35.31-79.448,79.448-79.448c5.297,0,8.828,3.531,8.828,8.828 s-3.531,8.828-8.828,8.828c-34.428,0-61.793,27.366-61.793,61.793C194.207,115.641,190.676,119.172,185.379,119.172z"/><g><path id="SVGCleanerId_0_1_" style="fill:#DD342E;" d="M361.931,110.345C361.931,52.083,314.262,4.414,256,4.414 S150.069,52.083,150.069,110.345S197.738,216.276,256,216.276S361.931,168.607,361.931,110.345"/></g><path style="fill:#F86363;" d="M185.379,119.172c-5.297,0-8.828-3.531-8.828-8.828c0-44.138,35.31-79.448,79.448-79.448 c5.297,0,8.828,3.531,8.828,8.828s-3.531,8.828-8.828,8.828c-34.428,0-61.793,27.366-61.793,61.793 C194.207,115.641,190.676,119.172,185.379,119.172"/></svg>';

      const pinSvg = parser.parseFromString(
        pinSvgString,
        'image/svg+xml'
      ).documentElement;

      let place = this.autocomplete.getPlace();

      this.options = {
        ...this.options,
        center: {
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        },
      };

      this.clickedPlace = this.getPlaceDetail(place, pinSvg);
      this.clickedPlacePhotos = this.clickedPlace.photos;
      this.searchedPlaces = [];
      this.nearbyPlaces = [];
      this.searchedPlaces.push(this.clickedPlace);
      this.viewPlaceDetail = true;
    });
  }

  //--------------------------------Places------------------------------------

  placeService!: google.maps.places.PlacesService;

  initializePlacesService() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
      const map = new google.maps.Map(
        document.createElement('div'),
        this.options
      );
      this.placeService = new google.maps.places.PlacesService(map);
    } else {
      console.error('Google Maps API is not loaded yet.');
    }
    // const map = new google.maps.Map(
    //   document.createElement('div'),
    //   this.options
    // );
    // this.placeService = new google.maps.places.PlacesService(map);
  }

  placesType: any[] = [
    {
      label: 'ATM',
      value: 'atm',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#3B88C3" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"></path><path fill="#BBDDF5" d="M0 10h36v17H0z"></path><path d="M5.297 13.74c.272-.736.896-1.329 1.713-1.329c.848 0 1.44.561 1.712 1.329l3.137 8.708c.096.256.128.48.128.593c0 .624-.512 1.056-1.105 1.056c-.672 0-1.008-.352-1.168-.832l-.48-1.505h-4.45l-.48 1.489c-.16.496-.497.848-1.153.848c-.64 0-1.184-.479-1.184-1.12c0-.256.08-.448.112-.528l3.218-8.709zm.177 5.81h3.041l-1.489-4.642h-.032l-1.52 4.642zm8.991-4.738H12.72c-.768 0-1.088-.561-1.088-1.104c0-.561.4-1.104 1.088-1.104h5.89c.688 0 1.089.544 1.089 1.104c0 .544-.32 1.104-1.089 1.104h-1.745v8.035c0 .8-.512 1.248-1.2 1.248s-1.201-.448-1.201-1.248v-8.035zm7.568-1.072c.096-.576.72-1.232 1.568-1.232c.801 0 1.424.576 1.601 1.152l1.89 6.338h.031l1.889-6.338c.176-.576.801-1.152 1.6-1.152c.85 0 1.473.656 1.57 1.232l1.488 8.932c.016.096.016.191.016.271c0 .704-.512 1.152-1.152 1.152c-.816 0-1.137-.368-1.248-1.12l-.945-6.515h-.031l-1.922 6.707c-.111.384-.416.928-1.279.928c-.865 0-1.169-.544-1.281-.928l-1.92-6.707h-.033l-.943 6.515c-.113.752-.433 1.12-1.249 1.12c-.64 0-1.152-.448-1.152-1.152c0-.08 0-.176.017-.271l1.485-8.932z" fill="#269"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#3B88C3" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"></path><path fill="#BBDDF5" d="M0 10h36v17H0z"></path><path d="M5.297 13.74c.272-.736.896-1.329 1.713-1.329c.848 0 1.44.561 1.712 1.329l3.137 8.708c.096.256.128.48.128.593c0 .624-.512 1.056-1.105 1.056c-.672 0-1.008-.352-1.168-.832l-.48-1.505h-4.45l-.48 1.489c-.16.496-.497.848-1.153.848c-.64 0-1.184-.479-1.184-1.12c0-.256.08-.448.112-.528l3.218-8.709zm.177 5.81h3.041l-1.489-4.642h-.032l-1.52 4.642zm8.991-4.738H12.72c-.768 0-1.088-.561-1.088-1.104c0-.561.4-1.104 1.088-1.104h5.89c.688 0 1.089.544 1.089 1.104c0 .544-.32 1.104-1.089 1.104h-1.745v8.035c0 .8-.512 1.248-1.2 1.248s-1.201-.448-1.201-1.248v-8.035zm7.568-1.072c.096-.576.72-1.232 1.568-1.232c.801 0 1.424.576 1.601 1.152l1.89 6.338h.031l1.889-6.338c.176-.576.801-1.152 1.6-1.152c.85 0 1.473.656 1.57 1.232l1.488 8.932c.016.096.016.191.016.271c0 .704-.512 1.152-1.152 1.152c-.816 0-1.137-.368-1.248-1.12l-.945-6.515h-.031l-1.922 6.707c-.111.384-.416.928-1.279.928c-.865 0-1.169-.544-1.281-.928l-1.92-6.707h-.033l-.943 6.515c-.113.752-.433 1.12-1.249 1.12c-.64 0-1.152-.448-1.152-1.152c0-.08 0-.176.017-.271l1.485-8.932z" fill="#269"></path></svg>',
    },
    {
      label: 'Bank',
      value: 'bank',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#66757F" d="M3 16h30v18H3z"></path><path fill="#CCD6DD" d="M2 34h32a2 2 0 0 1 2 2H0a2 2 0 0 1 2-2z"></path><path fill="#292F33" d="M18 23a3 3 0 0 0-3 3v6h6v-6a3 3 0 0 0-3-3z"></path><path fill="#CCD6DD" d="M3 21h4v11H3zm6 0h4v11H9zm20 0h4v11h-4zm-6 0h4v11h-4z"></path><path fill="#AAB8C2" d="M2 32h32v2H2z"></path><path fill="#66757F" d="M36 11L18 0L0 11z"></path><path fill="#CCD6DD" d="M18 2.4L2 12v4h32v-4z"></path><path fill="#8899A6" d="M3 19h4v2H3zm6 0h4v2H9zm14 0h4v2h-4zm6 0h4v2h-4z"></path><path fill="#CCD6DD" d="M1 12h34v5H1z"></path><path fill="#AAB8C2" d="M36 12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h34a1 1 0 0 1 1 1v1zm0 6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h34a1 1 0 0 1 1 1v1z"></path><path fill="#E1E8ED" d="M13 32h10v2H13z"></path><path fill="#F5F8FA" d="M11 34h14v2H11z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#66757F" d="M3 16h30v18H3z"></path><path fill="#CCD6DD" d="M2 34h32a2 2 0 0 1 2 2H0a2 2 0 0 1 2-2z"></path><path fill="#292F33" d="M18 23a3 3 0 0 0-3 3v6h6v-6a3 3 0 0 0-3-3z"></path><path fill="#CCD6DD" d="M3 21h4v11H3zm6 0h4v11H9zm20 0h4v11h-4zm-6 0h4v11h-4z"></path><path fill="#AAB8C2" d="M2 32h32v2H2z"></path><path fill="#66757F" d="M36 11L18 0L0 11z"></path><path fill="#CCD6DD" d="M18 2.4L2 12v4h32v-4z"></path><path fill="#8899A6" d="M3 19h4v2H3zm6 0h4v2H9zm14 0h4v2h-4zm6 0h4v2h-4z"></path><path fill="#CCD6DD" d="M1 12h34v5H1z"></path><path fill="#AAB8C2" d="M36 12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h34a1 1 0 0 1 1 1v1zm0 6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h34a1 1 0 0 1 1 1v1z"></path><path fill="#E1E8ED" d="M13 32h10v2H13z"></path><path fill="#F5F8FA" d="M11 34h14v2H11z"></path></svg>',
    },
    {
      label: 'Cafe',
      value: 'cafe',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><ellipse fill="#99AAB5" cx="18" cy="26" rx="18" ry="10"></ellipse><ellipse fill="#CCD6DD" cx="18" cy="24" rx="18" ry="10"></ellipse><path fill="#F5F8FA" d="M18 31C3.042 31 1 16 1 12h34c0 2-1.958 19-17 19z"></path><path fill="#CCD6DD" d="M34.385 9.644c2.442-10.123-9.781-7.706-12.204-5.799A38.063 38.063 0 0 0 18 3.611c-9.389 0-17 3.229-17 8.444C1 17.271 8.611 21.5 18 21.5s17-4.229 17-9.444c0-.863-.226-1.664-.615-2.412zm-2.503-2.692c-1.357-.938-3.102-1.694-5.121-2.25c1.875-.576 4.551-.309 5.121 2.25z"></path><ellipse fill="#8A4B38" cx="18" cy="13" rx="15" ry="7"></ellipse><path fill="#D99E82" d="M20 17a.997.997 0 0 1-.707-.293c-2.337-2.337-2.376-4.885-.125-8.262c.739-1.109.9-2.246.478-3.377c-.461-1.236-1.438-1.996-1.731-2.077c-.553 0-.958-.443-.958-.996c0-.552.491-.995 1.043-.995c.997 0 2.395 1.153 3.183 2.625c1.034 1.933.91 4.039-.351 5.929c-1.961 2.942-1.531 4.332-.125 5.738A.999.999 0 0 1 20 17zm-6-2a.997.997 0 0 1-.707-.293c-2.337-2.337-2.376-4.885-.125-8.262c.727-1.091.893-2.083.494-2.947c-.444-.961-1.431-1.469-1.684-1.499a.99.99 0 0 1-.989-1c0-.552.458-1 1.011-1c.997 0 2.585.974 3.36 2.423c.481.899 1.052 2.761-.528 5.131c-1.961 2.942-1.531 4.332-.125 5.738a.999.999 0 0 1 0 1.414A.991.991 0 0 1 14 15z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><ellipse fill="#99AAB5" cx="18" cy="26" rx="18" ry="10"></ellipse><ellipse fill="#CCD6DD" cx="18" cy="24" rx="18" ry="10"></ellipse><path fill="#F5F8FA" d="M18 31C3.042 31 1 16 1 12h34c0 2-1.958 19-17 19z"></path><path fill="#CCD6DD" d="M34.385 9.644c2.442-10.123-9.781-7.706-12.204-5.799A38.063 38.063 0 0 0 18 3.611c-9.389 0-17 3.229-17 8.444C1 17.271 8.611 21.5 18 21.5s17-4.229 17-9.444c0-.863-.226-1.664-.615-2.412zm-2.503-2.692c-1.357-.938-3.102-1.694-5.121-2.25c1.875-.576 4.551-.309 5.121 2.25z"></path><ellipse fill="#8A4B38" cx="18" cy="13" rx="15" ry="7"></ellipse><path fill="#D99E82" d="M20 17a.997.997 0 0 1-.707-.293c-2.337-2.337-2.376-4.885-.125-8.262c.739-1.109.9-2.246.478-3.377c-.461-1.236-1.438-1.996-1.731-2.077c-.553 0-.958-.443-.958-.996c0-.552.491-.995 1.043-.995c.997 0 2.395 1.153 3.183 2.625c1.034 1.933.91 4.039-.351 5.929c-1.961 2.942-1.531 4.332-.125 5.738A.999.999 0 0 1 20 17zm-6-2a.997.997 0 0 1-.707-.293c-2.337-2.337-2.376-4.885-.125-8.262c.727-1.091.893-2.083.494-2.947c-.444-.961-1.431-1.469-1.684-1.499a.99.99 0 0 1-.989-1c0-.552.458-1 1.011-1c.997 0 2.585.974 3.36 2.423c.481.899 1.052 2.761-.528 5.131c-1.961 2.942-1.531 4.332-.125 5.738a.999.999 0 0 1 0 1.414A.991.991 0 0 1 14 15z"></path></svg>',
    },
    {
      label: 'Hospital',
      value: 'hospital',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#CCD6DD" d="M24 10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8zM0 14v20a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V14H0z"></path><path fill="#99AAB5" d="M18 12H2a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path><path fill="#99AAB5" d="M34 12H18a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path><path fill="#55ACEE" d="M2 22h32v4H2zm0-6h32v4H2zm0 12h32v4H2z"></path><path fill="#E1E8ED" d="M8 12h20v24H8z"></path><path fill="#55ACEE" d="M10 20h16v4H10zm0-6h16v4H10zm0 12h16v4H10z"></path><path fill="#3B88C3" d="M13 32h10v4H13z"></path><path fill="#DD2E44" d="M22 4h-3V1h-2v3h-3v2h3v3h2V6h3z"></path><path fill="#99AAB5" d="M26 10H10a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#CCD6DD" d="M24 10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8zM0 14v20a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V14H0z"></path><path fill="#99AAB5" d="M18 12H2a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path><path fill="#99AAB5" d="M34 12H18a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path><path fill="#55ACEE" d="M2 22h32v4H2zm0-6h32v4H2zm0 12h32v4H2z"></path><path fill="#E1E8ED" d="M8 12h20v24H8z"></path><path fill="#55ACEE" d="M10 20h16v4H10zm0-6h16v4H10zm0 12h16v4H10z"></path><path fill="#3B88C3" d="M13 32h10v4H13z"></path><path fill="#DD2E44" d="M22 4h-3V1h-2v3h-3v2h3v3h2V6h3z"></path><path fill="#99AAB5" d="M26 10H10a2 2 0 0 0-2 2h20a2 2 0 0 0-2-2z"></path></svg>',
    },
    {
      label: 'Mosque',
      value: 'mosque',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#F4900C" d="M23 4.326c0 4.368-9.837 6.652-9.837 13.206c0 2.184 1.085 4.468 2.177 4.468h15.291c1.093 0 2.192-2.284 2.192-4.468C32.823 10.977 23 8.694 23 4.326z"></path><path fill="#FFD983" d="M35 33.815C35 35.022 34.711 36 32.815 36h-19.66C11.26 36 11 35.022 11 33.815V22.894c0-1.206.26-1.894 2.156-1.894h19.66c1.895 0 2.184.688 2.184 1.894v10.921z"></path><path fill="#FFD983" d="M23 34a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1z"></path><path fill="#662113" d="M26 29c0-3-1.896-5-3-5s-3 2-3 5v7h6v-7zm-8 2.333c0-2-1.264-3.333-2-3.333s-2 1.333-2 3.333V36h4v-4.667zm14 0c0-2-1.264-3.333-2-3.333s-2 1.333-2 3.333V36h4v-4.667z"></path><path fill="#FFD983" d="M9 34a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v26z"></path><path fill="#F4900C" d="M5.995.326c0 1.837-2.832 2.918-2.832 5.675c0 .919.312 2 .627 2h4.402c.314 0 .631-1.081.631-2c0-2.757-2.828-3.838-2.828-5.675z"></path><path fill="#FFAC33" d="M10 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1zm0-4a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#F4900C" d="M23 4.326c0 4.368-9.837 6.652-9.837 13.206c0 2.184 1.085 4.468 2.177 4.468h15.291c1.093 0 2.192-2.284 2.192-4.468C32.823 10.977 23 8.694 23 4.326z"></path><path fill="#FFD983" d="M35 33.815C35 35.022 34.711 36 32.815 36h-19.66C11.26 36 11 35.022 11 33.815V22.894c0-1.206.26-1.894 2.156-1.894h19.66c1.895 0 2.184.688 2.184 1.894v10.921z"></path><path fill="#FFD983" d="M23 34a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1z"></path><path fill="#662113" d="M26 29c0-3-1.896-5-3-5s-3 2-3 5v7h6v-7zm-8 2.333c0-2-1.264-3.333-2-3.333s-2 1.333-2 3.333V36h4v-4.667zm14 0c0-2-1.264-3.333-2-3.333s-2 1.333-2 3.333V36h4v-4.667z"></path><path fill="#FFD983" d="M9 34a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v26z"></path><path fill="#F4900C" d="M5.995.326c0 1.837-2.832 2.918-2.832 5.675c0 .919.312 2 .627 2h4.402c.314 0 .631-1.081.631-2c0-2.757-2.828-3.838-2.828-5.675z"></path><path fill="#FFAC33" d="M10 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1zm0-4a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1z"></path></svg>',
    },
    {
      label: 'Park',
      value: 'park',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#662113" d="M22 33c0 2.209-1.791 3-4 3s-4-.791-4-3l1-9c0-2.209.791-2 3-2s3-.209 3 2l1 9z"></path><path fill="#5C913B" d="M31.406 27.297C24.443 21.332 21.623 12.791 18 12.791c-3.623 0-6.443 8.541-13.405 14.506c-2.926 2.507-1.532 3.957 2.479 3.667c3.576-.258 6.919-1.069 10.926-1.069s7.352.812 10.926 1.069c4.012.29 5.405-1.16 2.48-3.667z"></path><path fill="#3E721D" d="M29.145 24.934C23.794 20.027 20.787 13 18 13c-2.785 0-5.793 7.027-11.144 11.934c-4.252 3.898 5.572 4.773 11.144 0c5.569 4.773 15.396 3.898 11.145 0z"></path><path fill="#5C913B" d="M29.145 20.959C23.794 16.375 20.787 9.811 18 9.811c-2.785 0-5.793 6.564-11.144 11.148c-4.252 3.642 5.572 4.459 11.144 0c5.569 4.459 15.396 3.642 11.145 0z"></path><path fill="#3E721D" d="M26.7 17.703C22.523 14.125 20.176 9 18 9c-2.174 0-4.523 5.125-8.7 8.703c-3.319 2.844 4.35 3.482 8.7 0c4.349 3.482 12.02 2.844 8.7 0z"></path><path fill="#5C913B" d="M26.7 14.726c-4.177-3.579-6.524-8.703-8.7-8.703c-2.174 0-4.523 5.125-8.7 8.703c-3.319 2.844 4.35 3.481 8.7 0c4.349 3.481 12.02 2.843 8.7 0z"></path><path fill="#3E721D" d="M25.021 12.081C21.65 9.193 19.756 5.057 18 5.057c-1.755 0-3.65 4.136-7.021 7.024c-2.679 2.295 3.511 2.809 7.021 0c3.51 2.81 9.701 2.295 7.021 0z"></path><path fill="#5C913B" d="M25.021 9.839C21.65 6.951 19.756 2.815 18 2.815c-1.755 0-3.65 4.136-7.021 7.024c-2.679 2.295 3.511 2.809 7.021 0c3.51 2.81 9.701 2.295 7.021 0z"></path><path fill="#3E721D" d="M23.343 6.54C20.778 4.342 19.336 1.195 18 1.195c-1.335 0-2.778 3.148-5.343 5.345c-2.038 1.747 2.671 2.138 5.343 0c2.671 2.138 7.382 1.746 5.343 0z"></path><path fill="#5C913B" d="M23.343 5.345C20.778 3.148 19.336 0 18 0c-1.335 0-2.778 3.148-5.343 5.345c-2.038 1.747 2.671 2.138 5.343 0c2.671 2.138 7.382 1.746 5.343 0z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#662113" d="M22 33c0 2.209-1.791 3-4 3s-4-.791-4-3l1-9c0-2.209.791-2 3-2s3-.209 3 2l1 9z"></path><path fill="#5C913B" d="M31.406 27.297C24.443 21.332 21.623 12.791 18 12.791c-3.623 0-6.443 8.541-13.405 14.506c-2.926 2.507-1.532 3.957 2.479 3.667c3.576-.258 6.919-1.069 10.926-1.069s7.352.812 10.926 1.069c4.012.29 5.405-1.16 2.48-3.667z"></path><path fill="#3E721D" d="M29.145 24.934C23.794 20.027 20.787 13 18 13c-2.785 0-5.793 7.027-11.144 11.934c-4.252 3.898 5.572 4.773 11.144 0c5.569 4.773 15.396 3.898 11.145 0z"></path><path fill="#5C913B" d="M29.145 20.959C23.794 16.375 20.787 9.811 18 9.811c-2.785 0-5.793 6.564-11.144 11.148c-4.252 3.642 5.572 4.459 11.144 0c5.569 4.459 15.396 3.642 11.145 0z"></path><path fill="#3E721D" d="M26.7 17.703C22.523 14.125 20.176 9 18 9c-2.174 0-4.523 5.125-8.7 8.703c-3.319 2.844 4.35 3.482 8.7 0c4.349 3.482 12.02 2.844 8.7 0z"></path><path fill="#5C913B" d="M26.7 14.726c-4.177-3.579-6.524-8.703-8.7-8.703c-2.174 0-4.523 5.125-8.7 8.703c-3.319 2.844 4.35 3.481 8.7 0c4.349 3.481 12.02 2.843 8.7 0z"></path><path fill="#3E721D" d="M25.021 12.081C21.65 9.193 19.756 5.057 18 5.057c-1.755 0-3.65 4.136-7.021 7.024c-2.679 2.295 3.511 2.809 7.021 0c3.51 2.81 9.701 2.295 7.021 0z"></path><path fill="#5C913B" d="M25.021 9.839C21.65 6.951 19.756 2.815 18 2.815c-1.755 0-3.65 4.136-7.021 7.024c-2.679 2.295 3.511 2.809 7.021 0c3.51 2.81 9.701 2.295 7.021 0z"></path><path fill="#3E721D" d="M23.343 6.54C20.778 4.342 19.336 1.195 18 1.195c-1.335 0-2.778 3.148-5.343 5.345c-2.038 1.747 2.671 2.138 5.343 0c2.671 2.138 7.382 1.746 5.343 0z"></path><path fill="#5C913B" d="M23.343 5.345C20.778 3.148 19.336 0 18 0c-1.335 0-2.778 3.148-5.343 5.345c-2.038 1.747 2.671 2.138 5.343 0c2.671 2.138 7.382 1.746 5.343 0z"></path></svg>',
    },
    {
      label: 'Police',
      value: 'police',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#2A6797" d="M32 36v-2c0-3.314-2.685-6-6-6H10a6 6 0 0 0-6 6v2h28z"></path><ellipse fill="#2A6797" cx="18.003" cy="7.501" rx="12" ry="7.5"></ellipse><path fill="#F7DECE" d="M13.64 28.101s2.848 1.963 4.36 1.963c1.512 0 4.359-1.963 4.359-1.963V24.29h-8.72v3.811z"></path><path fill="#EEC2AD" d="M13.632 25.973c1.216 1.374 2.724 1.746 4.364 1.746c1.639 0 3.146-.373 4.363-1.746v-3.491h-8.728v3.491z"></path><path fill="#F7DECE" d="M11.444 15.936c0 1.448-.734 2.622-1.639 2.622s-1.639-1.174-1.639-2.622s.734-2.623 1.639-2.623c.905-.001 1.639 1.174 1.639 2.623m16.389 0c0 1.448-.733 2.622-1.639 2.622c-.905 0-1.639-1.174-1.639-2.622s.733-2.623 1.639-2.623c.906-.001 1.639 1.174 1.639 2.623"></path><path fill="#F7DECE" d="M9.477 16.959c0-5.589 3.816-10.121 8.523-10.121s8.522 4.532 8.522 10.121S22.707 27.08 18 27.08c-4.707 0-8.523-4.531-8.523-10.121"></path><path fill="#C1694F" d="M18 23.802c-2.754 0-3.6-.705-3.741-.848a.655.655 0 0 1 .902-.95c.052.037.721.487 2.839.487c2.2 0 2.836-.485 2.842-.49a.638.638 0 0 1 .913.015a.669.669 0 0 1-.014.938c-.141.143-.987.848-3.741.848"></path><path fill="#292F33" d="M18 4.406c5.648 0 9.178 3.242 9.178 6.715s-.706 4.863-1.412 3.473l-1.412-2.778s-4.235 0-5.647-1.39c0 0 2.118 4.168-2.118 0c0 0 .706 2.779-3.53-.694c0 0-2.118 1.389-2.824 4.862c-.196.964-1.412 0-1.412-3.473C8.822 7.648 11.646 4.406 18 4.406"></path><path fill="#662113" d="M14 17c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1m8 0c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1"></path><path fill="#C1694F" d="M18.75 19.75h-1.5c-.413 0-.75-.337-.75-.75s.337-.75.75-.75h1.5c.413 0 .75.337.75.75s-.337.75-.75.75"></path><path fill="#2A6797" d="M8.5 8v1c0 1.105 4.253 2 9.5 2s9.5-.895 9.5-2V8h-19z"></path><path fill="#4289C1" d="M27.001 8V6S23.251 3.75 18 3.75C12.752 3.75 9.002 6 9.002 6v2h17.999z"></path><path fill="#FDCB58" d="M27.5 8h-19c-.275 0-.5.225-.5.5s.225.5.5.5h19c.275 0 .5-.225.5-.5s-.225-.5-.5-.5z"></path><path fill="#193D59" d="M19.947 32.277c.886.622 1.812 1.245 2.147 1.379c.018.007.016-.11.012-.114c-1.958-2.292-4.084-3.534-4.084-3.534l.013-.009l-.014.001h-.03l.011.008s-2.09 1.225-4.035 3.48c.013.103.037.158.076.137c.297-.16 1.175-.766 2.03-1.368c.039.112.078.213.112.275c.156.281.528.906.528.906s-.753.562-1.035 2.563h4.667c-.281-1.595-1.031-2.563-1.031-2.563s.375-.625.531-.906c.031-.059.066-.151.102-.255z"></path><path fill="#4289C1" d="M18.001 30.008s-.01-.006-.011-.008c-.124-.084-4.14-2.817-4.698-3.375c-.271-.271-.97.905-.958 1.208c.041 1.084 1.386 5.939 1.583 5.709l.049-.054c1.945-2.256 4.035-3.48 4.035-3.48zm.02 0s2.126 1.242 4.084 3.534c.004.005.011-.005.016-.005c.237.029 1.527-4.642 1.567-5.704c.012-.303-.688-1.479-.958-1.208c-.557.557-4.56 3.282-4.696 3.374l-.013.009z"></path><path fill="#1E4B6E" d="M18.016 30.688c-.562.031-1.452.941-1.359 1.328c.427 1.785.779 1.312 1.391 1.312c.542 0 .93.437 1.391-1.391c.12-.478-1.034-1.272-1.423-1.249zm.026 3.145c-1.477 0-2.019 2.167-2.019 2.167h4.023c.001 0-.527-2.167-2.004-2.167z"></path><path fill="#FDCB58" d="M20.25 1.501h-.002a.737.737 0 0 0-.57.282c-.281.069-.667.084-1.157-.071a.748.748 0 0 0-1.04.001c-.491.155-.877.14-1.157.071a.738.738 0 0 0-.571-.282h-.002a.749.749 0 1 0 0 1.5h.002c0 3 1.498 3.75 2.247 3.75c.751 0 2.248-.75 2.248-3.75h.002a.75.75 0 1 0 0-1.501z"></path><path fill="#4289C1" d="M11.468 29.412l-5.926.938a.501.501 0 0 1-.572-.416l-.157-.988a.5.5 0 0 1 .416-.571l5.926-.938a.502.502 0 0 1 .572.415l.156.988a.5.5 0 0 1-.415.572"></path><circle fill="#FFF" cx="10.625" cy="28.513" r=".576"></circle><path fill="#4289C1" d="M24.544 29.412l5.926.938a.5.5 0 0 0 .572-.416l.157-.988a.5.5 0 0 0-.416-.571l-5.927-.938a.502.502 0 0 0-.572.415l-.156.988a.502.502 0 0 0 .416.572"></path><circle fill="#FFF" cx="25.191" cy="28.513" r=".576"></circle></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#2A6797" d="M32 36v-2c0-3.314-2.685-6-6-6H10a6 6 0 0 0-6 6v2h28z"></path><ellipse fill="#2A6797" cx="18.003" cy="7.501" rx="12" ry="7.5"></ellipse><path fill="#F7DECE" d="M13.64 28.101s2.848 1.963 4.36 1.963c1.512 0 4.359-1.963 4.359-1.963V24.29h-8.72v3.811z"></path><path fill="#EEC2AD" d="M13.632 25.973c1.216 1.374 2.724 1.746 4.364 1.746c1.639 0 3.146-.373 4.363-1.746v-3.491h-8.728v3.491z"></path><path fill="#F7DECE" d="M11.444 15.936c0 1.448-.734 2.622-1.639 2.622s-1.639-1.174-1.639-2.622s.734-2.623 1.639-2.623c.905-.001 1.639 1.174 1.639 2.623m16.389 0c0 1.448-.733 2.622-1.639 2.622c-.905 0-1.639-1.174-1.639-2.622s.733-2.623 1.639-2.623c.906-.001 1.639 1.174 1.639 2.623"></path><path fill="#F7DECE" d="M9.477 16.959c0-5.589 3.816-10.121 8.523-10.121s8.522 4.532 8.522 10.121S22.707 27.08 18 27.08c-4.707 0-8.523-4.531-8.523-10.121"></path><path fill="#C1694F" d="M18 23.802c-2.754 0-3.6-.705-3.741-.848a.655.655 0 0 1 .902-.95c.052.037.721.487 2.839.487c2.2 0 2.836-.485 2.842-.49a.638.638 0 0 1 .913.015a.669.669 0 0 1-.014.938c-.141.143-.987.848-3.741.848"></path><path fill="#292F33" d="M18 4.406c5.648 0 9.178 3.242 9.178 6.715s-.706 4.863-1.412 3.473l-1.412-2.778s-4.235 0-5.647-1.39c0 0 2.118 4.168-2.118 0c0 0 .706 2.779-3.53-.694c0 0-2.118 1.389-2.824 4.862c-.196.964-1.412 0-1.412-3.473C8.822 7.648 11.646 4.406 18 4.406"></path><path fill="#662113" d="M14 17c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1m8 0c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1"></path><path fill="#C1694F" d="M18.75 19.75h-1.5c-.413 0-.75-.337-.75-.75s.337-.75.75-.75h1.5c.413 0 .75.337.75.75s-.337.75-.75.75"></path><path fill="#2A6797" d="M8.5 8v1c0 1.105 4.253 2 9.5 2s9.5-.895 9.5-2V8h-19z"></path><path fill="#4289C1" d="M27.001 8V6S23.251 3.75 18 3.75C12.752 3.75 9.002 6 9.002 6v2h17.999z"></path><path fill="#FDCB58" d="M27.5 8h-19c-.275 0-.5.225-.5.5s.225.5.5.5h19c.275 0 .5-.225.5-.5s-.225-.5-.5-.5z"></path><path fill="#193D59" d="M19.947 32.277c.886.622 1.812 1.245 2.147 1.379c.018.007.016-.11.012-.114c-1.958-2.292-4.084-3.534-4.084-3.534l.013-.009l-.014.001h-.03l.011.008s-2.09 1.225-4.035 3.48c.013.103.037.158.076.137c.297-.16 1.175-.766 2.03-1.368c.039.112.078.213.112.275c.156.281.528.906.528.906s-.753.562-1.035 2.563h4.667c-.281-1.595-1.031-2.563-1.031-2.563s.375-.625.531-.906c.031-.059.066-.151.102-.255z"></path><path fill="#4289C1" d="M18.001 30.008s-.01-.006-.011-.008c-.124-.084-4.14-2.817-4.698-3.375c-.271-.271-.97.905-.958 1.208c.041 1.084 1.386 5.939 1.583 5.709l.049-.054c1.945-2.256 4.035-3.48 4.035-3.48zm.02 0s2.126 1.242 4.084 3.534c.004.005.011-.005.016-.005c.237.029 1.527-4.642 1.567-5.704c.012-.303-.688-1.479-.958-1.208c-.557.557-4.56 3.282-4.696 3.374l-.013.009z"></path><path fill="#1E4B6E" d="M18.016 30.688c-.562.031-1.452.941-1.359 1.328c.427 1.785.779 1.312 1.391 1.312c.542 0 .93.437 1.391-1.391c.12-.478-1.034-1.272-1.423-1.249zm.026 3.145c-1.477 0-2.019 2.167-2.019 2.167h4.023c.001 0-.527-2.167-2.004-2.167z"></path><path fill="#FDCB58" d="M20.25 1.501h-.002a.737.737 0 0 0-.57.282c-.281.069-.667.084-1.157-.071a.748.748 0 0 0-1.04.001c-.491.155-.877.14-1.157.071a.738.738 0 0 0-.571-.282h-.002a.749.749 0 1 0 0 1.5h.002c0 3 1.498 3.75 2.247 3.75c.751 0 2.248-.75 2.248-3.75h.002a.75.75 0 1 0 0-1.501z"></path><path fill="#4289C1" d="M11.468 29.412l-5.926.938a.501.501 0 0 1-.572-.416l-.157-.988a.5.5 0 0 1 .416-.571l5.926-.938a.502.502 0 0 1 .572.415l.156.988a.5.5 0 0 1-.415.572"></path><circle fill="#FFF" cx="10.625" cy="28.513" r=".576"></circle><path fill="#4289C1" d="M24.544 29.412l5.926.938a.5.5 0 0 0 .572-.416l.157-.988a.5.5 0 0 0-.416-.571l-5.927-.938a.502.502 0 0 0-.572.415l-.156.988a.502.502 0 0 0 .416.572"></path><circle fill="#FFF" cx="25.191" cy="28.513" r=".576"></circle></svg>',
    },
    {
      label: 'Restaurant',
      value: 'restaurant',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#D99E82" d="M18 20.411c-9.371 0-16.967-.225-16.967 6.427C1.033 33.487 8.629 35 18 35c9.371 0 16.967-1.513 16.967-8.162c0-6.651-7.596-6.427-16.967-6.427z"></path><path fill="#662113" d="M34.47 20.916S26.251 19.932 18 19.89c-8.251.042-16.47 1.026-16.47 1.026C.717 27.39 7.467 30.057 18 30.057s17.283-2.667 16.47-9.141z"></path><path fill="#FFCC4D" d="M33.886 18.328l-31.855.646c-1.1 0-2.021 2.229-.854 2.812c8.708 2.708 15.708 5.448 15.708 5.448c.962.532 1.287.534 2.25.003c0 0 9.666-3.868 15.875-5.493c.881-.23-.025-3.416-1.124-3.416z"></path><path fill="#77B255" d="M34.725 18.412c-1.9-1.751-1.79-.819-3.246-1.23c-.553-.156-4.51-5.271-13.529-5.271h-.02c-9.019 0-12.976 5.115-13.529 5.271c-1.456.411-1.346-.521-3.246 1.23c-.872.804-1.108 1.222-.188 1.43c1.386.313 1.26 1.152 2.253 1.444c1.202.353 1.696-.292 3.634-.028c1.653.225 1.761 2.369 3.429 2.369s1.668-.8 3.335-.8s2.653 2.146 4.321 2.146s2.653-2.146 4.321-2.146c1.668 0 1.668.8 3.335.8c1.668 0 1.776-2.144 3.429-2.369c1.938-.263 2.433.381 3.634.028c.993-.292.867-1.13 2.253-1.444c.922-.207.687-.626-.186-1.43z"></path><path fill="#DD2E44" d="M34.077 16.52c0 2.984-7.198 4.393-16.077 4.393S1.923 19.504 1.923 16.52c0-5.403.966-5.403 16.077-5.403s16.077.001 16.077 5.403z"></path><path fill="#D99E82" d="M18 .524C8.629.524 1.033 4.915 1.033 11.566c0 6.125 7.596 6.375 16.967 6.375s16.967-.25 16.967-6.375C34.967 4.914 27.371.524 18 .524z"></path><path d="M10.784 3.695a1.069 1.069 0 1 0-1.152 1.802c.498.319 1.76.557 2.079.059c.318-.498-.429-1.543-.927-1.861zm9.734-1.035c-.562.182-1.549 1.006-1.366 1.568c.183.562 1.464.648 2.026.466a1.069 1.069 0 0 0-.66-2.034zm10.909 7.035c-.452-.38-1.585.225-1.966.677a1.07 1.07 0 0 0 1.638 1.376c.381-.453.781-1.673.328-2.053zm-3.643-5a1.07 1.07 0 0 0-1.152 1.803c.498.319 1.76.557 2.078.059c.319-.499-.428-1.544-.926-1.862zm-15 7a1.07 1.07 0 0 0-1.478.326a1.068 1.068 0 0 0 .326 1.476c.498.319 1.76.558 2.078.059c.319-.498-.428-1.543-.926-1.861zm3.046-4.808c-.336.486-.62 1.739-.133 2.075c.486.336 1.557-.374 1.893-.86a1.07 1.07 0 0 0-1.76-1.215zm7.954 4.808a1.07 1.07 0 0 0-1.478.326a1.068 1.068 0 0 0 .326 1.476c.498.319 1.76.558 2.078.059c.319-.498-.428-1.543-.926-1.861zM4.948 7.808c-.394.441-.833 1.648-.392 2.042c.439.394 1.591-.174 1.985-.615a1.07 1.07 0 1 0-1.593-1.427z" fill="#FFE8B6"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#D99E82" d="M18 20.411c-9.371 0-16.967-.225-16.967 6.427C1.033 33.487 8.629 35 18 35c9.371 0 16.967-1.513 16.967-8.162c0-6.651-7.596-6.427-16.967-6.427z"></path><path fill="#662113" d="M34.47 20.916S26.251 19.932 18 19.89c-8.251.042-16.47 1.026-16.47 1.026C.717 27.39 7.467 30.057 18 30.057s17.283-2.667 16.47-9.141z"></path><path fill="#FFCC4D" d="M33.886 18.328l-31.855.646c-1.1 0-2.021 2.229-.854 2.812c8.708 2.708 15.708 5.448 15.708 5.448c.962.532 1.287.534 2.25.003c0 0 9.666-3.868 15.875-5.493c.881-.23-.025-3.416-1.124-3.416z"></path><path fill="#77B255" d="M34.725 18.412c-1.9-1.751-1.79-.819-3.246-1.23c-.553-.156-4.51-5.271-13.529-5.271h-.02c-9.019 0-12.976 5.115-13.529 5.271c-1.456.411-1.346-.521-3.246 1.23c-.872.804-1.108 1.222-.188 1.43c1.386.313 1.26 1.152 2.253 1.444c1.202.353 1.696-.292 3.634-.028c1.653.225 1.761 2.369 3.429 2.369s1.668-.8 3.335-.8s2.653 2.146 4.321 2.146s2.653-2.146 4.321-2.146c1.668 0 1.668.8 3.335.8c1.668 0 1.776-2.144 3.429-2.369c1.938-.263 2.433.381 3.634.028c.993-.292.867-1.13 2.253-1.444c.922-.207.687-.626-.186-1.43z"></path><path fill="#DD2E44" d="M34.077 16.52c0 2.984-7.198 4.393-16.077 4.393S1.923 19.504 1.923 16.52c0-5.403.966-5.403 16.077-5.403s16.077.001 16.077 5.403z"></path><path fill="#D99E82" d="M18 .524C8.629.524 1.033 4.915 1.033 11.566c0 6.125 7.596 6.375 16.967 6.375s16.967-.25 16.967-6.375C34.967 4.914 27.371.524 18 .524z"></path><path d="M10.784 3.695a1.069 1.069 0 1 0-1.152 1.802c.498.319 1.76.557 2.079.059c.318-.498-.429-1.543-.927-1.861zm9.734-1.035c-.562.182-1.549 1.006-1.366 1.568c.183.562 1.464.648 2.026.466a1.069 1.069 0 0 0-.66-2.034zm10.909 7.035c-.452-.38-1.585.225-1.966.677a1.07 1.07 0 0 0 1.638 1.376c.381-.453.781-1.673.328-2.053zm-3.643-5a1.07 1.07 0 0 0-1.152 1.803c.498.319 1.76.557 2.078.059c.319-.499-.428-1.544-.926-1.862zm-15 7a1.07 1.07 0 0 0-1.478.326a1.068 1.068 0 0 0 .326 1.476c.498.319 1.76.558 2.078.059c.319-.498-.428-1.543-.926-1.861zm3.046-4.808c-.336.486-.62 1.739-.133 2.075c.486.336 1.557-.374 1.893-.86a1.07 1.07 0 0 0-1.76-1.215zm7.954 4.808a1.07 1.07 0 0 0-1.478.326a1.068 1.068 0 0 0 .326 1.476c.498.319 1.76.558 2.078.059c.319-.498-.428-1.543-.926-1.861zM4.948 7.808c-.394.441-.833 1.648-.392 2.042c.439.394 1.591-.174 1.985-.615a1.07 1.07 0 1 0-1.593-1.427z" fill="#FFE8B6"></path></svg>',
    },
    {
      label: 'Shopping Mall',
      value: 'shopping_mall',
      svg: '<svg width="40px" height="40px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#F4900C" d="M11 0a8 8 0 0 0-8 8v8h2V8a6 6 0 0 1 12 0v8h2V8a8 8 0 0 0-8-8z"></path><path fill="#DD2E44" d="M1 8l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2v23H1z"></path><path fill="#FFCC4D" d="M25 5a8 8 0 0 0-8 8v8h2v-8a6 6 0 0 1 12 0v8h2v-8a8 8 0 0 0-8-8z"></path><path fill="#744EAA" d="M15 13l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2v23H15z"></path></svg>',
      smallSvg:
        '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#F4900C" d="M11 0a8 8 0 0 0-8 8v8h2V8a6 6 0 0 1 12 0v8h2V8a8 8 0 0 0-8-8z"></path><path fill="#DD2E44" d="M1 8l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2v23H1z"></path><path fill="#FFCC4D" d="M25 5a8 8 0 0 0-8 8v8h2v-8a6 6 0 0 1 12 0v8h2v-8a8 8 0 0 0-8-8z"></path><path fill="#744EAA" d="M15 13l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2l2 2l2-2v23H15z"></path></svg>',
    },
  ];

  nearbyPlaces: any[] = [];
  searchedPlaces: any[] = [];

  clickedPlace: any;
  clickedPlacePhotos: any[] = [];
  clickedTypeOfPlace: any;

  photoOptions: google.maps.places.PhotoOptions = {
    maxHeight: 500,
    maxWidth: 500,
  };

  getPlaceDetail(place: any, pinSvg: any): any {
    return {
      placeId: place.place_id,
      position: {
        lat: place.geometry?.location?.lat() || 0, // Ensure lat() is called safely
        lng: place.geometry?.location?.lng() || 0, // Ensure lng() is called safely
      },
      name: place.name || '',
      address: place.formatted_address || '',
      phoneNumber: place.formatted_phone_number || '',
      content: pinSvg || '',
      photos: place.photos || [],
      rating: place.rating || '0',
      reviews: place.reviews || [],
      userRatingTotal: place.user_ratings_total || 0,
      website: place.website || '',
      isOpen: place.opening_hours?.isOpen ? 'open' : 'close',
    };
  }

  searchPlaces() {
    let searchedText = this.searchPlaceForm.value['name'];

    this.viewPlaceDetail = false;

    const request: google.maps.places.TextSearchRequest = {
      location: new google.maps.LatLng(
        this.clickLocation.lat,
        this.clickLocation.lng
      ),
      radius: 5000,
      query: searchedText,
    };

    this.placeService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        this.placeSortForm.patchValue({
          sort: '',
        });
        this.nearbyPlaces = [];
        this.searchedPlaces = [];
        results.forEach((placeWithoutDetail) => {
          if (placeWithoutDetail.place_id) {
            const request = {
              placeId: placeWithoutDetail.place_id,
            };

            this.placeService.getDetails(request, (place, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place
              ) {
                const parser = new DOMParser();

                const pinSvgString =
                  '<svg fill="#000000" width="40" height="40" viewBox="0 0 24 24" id="place" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><path id="secondary" d="M12,3A6,6,0,0,0,6,9c0,5,6,12,6,12s6-7,6-12A6,6,0,0,0,12,3Zm0,8a2,2,0,1,1,2-2A2,2,0,0,1,12,11Z" style="fill: rgb(44, 169, 188); stroke-width: 2;"></path><path id="primary" d="M14,9a2,2,0,1,1-2-2A2,2,0,0,1,14,9Zm4,0A6,6,0,0,0,6,9c0,5,6,12,6,12S18,14,18,9Z" style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></svg>';

                const pinSvg = parser.parseFromString(
                  pinSvgString,
                  'image/svg+xml'
                ).documentElement;

                this.searchedPlaces.push(this.getPlaceDetail(place, pinSvg));
              }
            });
          }
        });
      }
    });
  }

  findNearbyPlaces(placeInfo: any, radius: number) {
    this.viewPlaceDetail = false;
    this.clickedTypeOfPlace = placeInfo;

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(
        this.clickLocation.lat,
        this.clickLocation.lng
      ),
      radius: radius,
      type: placeInfo.value,
    };

    this.placeService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // this.nearbyPlaces = results;
        this.placeSortForm.patchValue({
          sort: '',
        });
        this.searchPlaceForm.patchValue({
          name: '',
        });
        this.nearbyPlaces = [];
        this.searchedPlaces = [];
        results.forEach((placeWithoutDetail) => {
          if (placeWithoutDetail.place_id) {
            const request = {
              placeId: placeWithoutDetail.place_id,
            };

            this.placeService.getDetails(request, (place, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place
              ) {
                const parser = new DOMParser();

                const pinSvgString = placeInfo.svg;

                const pinSvg = parser.parseFromString(
                  pinSvgString,
                  'image/svg+xml'
                ).documentElement;

                this.nearbyPlaces.push(this.getPlaceDetail(place, pinSvg));
                // console.log(place.reviews);
              }
            });
          }
        });
        // console.log(this.nearbyPlaces);
        this.display;
      }
    });
  }

  onPlaceCardClick(place: any) {
    this.viewPlaceDetail = true;

    this.options = {
      ...this.options,
      center: {
        lat: place.position.lat,
        lng: place.position.lng,
      },
    };

    // const parser = new DOMParser();

    // const pinSvgString =
    //   '<svg height="60px" width="60px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><path style="fill:#444C6D;" d="M256,207.448c-8.828,0-17.655-0.883-35.31-3.531v38.841h70.621v-38.841 C273.655,206.566,264.828,207.448,256,207.448"/><path style="fill:#D8D8D8;" d="M229.517,242.759h52.966l-7.945,211.862c0,9.71-8.828,17.655-18.538,17.655 c-9.71,0-17.655-7.945-18.538-17.655L229.517,242.759z"/><path style="fill:#43B05B;" d="M276.303,392.828l-2.648,61.793c0,9.71-8.828,17.655-18.538,17.655s-17.655-7.945-18.538-17.655 l-2.648-61.793C103.283,395.476,0,420.193,0,450.207c0,31.779,114.759,57.379,256,57.379s256-25.6,256-57.379 C512,420.193,408.717,395.476,276.303,392.828"/><path id="SVGCleanerId_0" style="fill:#DD342E;" d="M361.931,110.345C361.931,52.083,314.262,4.414,256,4.414 S150.069,52.083,150.069,110.345S197.738,216.276,256,216.276S361.931,168.607,361.931,110.345"/><path d="M185.379,119.172c-5.297,0-8.828-3.531-8.828-8.828c0-44.138,35.31-79.448,79.448-79.448c5.297,0,8.828,3.531,8.828,8.828 s-3.531,8.828-8.828,8.828c-34.428,0-61.793,27.366-61.793,61.793C194.207,115.641,190.676,119.172,185.379,119.172z"/><g><path id="SVGCleanerId_0_1_" style="fill:#DD342E;" d="M361.931,110.345C361.931,52.083,314.262,4.414,256,4.414 S150.069,52.083,150.069,110.345S197.738,216.276,256,216.276S361.931,168.607,361.931,110.345"/></g><path style="fill:#F86363;" d="M185.379,119.172c-5.297,0-8.828-3.531-8.828-8.828c0-44.138,35.31-79.448,79.448-79.448 c5.297,0,8.828,3.531,8.828,8.828s-3.531,8.828-8.828,8.828c-34.428,0-61.793,27.366-61.793,61.793 C194.207,115.641,190.676,119.172,185.379,119.172"/></svg>';

    // const pinSvg = parser.parseFromString(
    //   pinSvgString,
    //   'image/svg+xml'
    // ).documentElement;

    this.clickedPlace = place;
    this.clickedPlacePhotos = place.photos;

    // for (let i = 0; i < this.nearbyPlaces.length; i++) {
    //   if (this.nearbyPlaces[i].placeId === place.placeId) {
    //     this.nearbyPlaces[i].content = pinSvg;
    //   }
    // }
  }

  // displayNearbyMarkers(places: google.maps.places.PlaceResult[]) {
  //   places.forEach((place) => {
  //     if (place.geometry && place.geometry.location) {
  //       const marker = {
  //         position: place.geometry.location.toJSON(),
  //         title: place.name,
  //       };
  //       this.randomLocations.push(marker);
  //     }
  //   });
  // }

  //--------------------------------Routes------------------------------------

  routeService!: google.maps.DirectionsService;
  allRoutesPath: any[] = [];
  allRoutesDetails: any[] = [];

  routeColor: any[] = [
    '#1E90FF', // Dodger Blue
    // '#32CD32', // Lime Green
    '#ff6f00', // Orange Red
    // '#FFD700', // Gold
    '#00FA9A', // Medium Spring Green
    '#FF69B4', // Hot Pink
    '#9400D3', // Dark Violet
    '#00CED1', // Dark Turquoise
    '#FF6347', // Tomato
    '#DC143C', // Crimson
  ];

  data = [
    {
      address: 'muhammad farhan bin abd aziz muhammad farhan bin abd aziz muhammad farhan bin abd aziz muhammad farhan bin abd aziz muhammad farhan bin abd aziz',
      icon: 'pi pi-car'
    },
    {
      address: 'muhammad farhan bin abd aziz',
      icon: 'pi pi-map-marker'
    }
  ]

  initializeRouteService() {
    this.routeService = new google.maps.DirectionsService();
  }

  getDirection(place: any) {
    const request: google.maps.DirectionsRequest = {
      destination: place.position,
      origin: this.deviceLocation,
      // avoidHighways: true,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
      },
      provideRouteAlternatives: true,
    };

    this.routeService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        // console.log(result.routes[0].overview_path);
        // console.log(result.routes[0].overview_polyline);
        console.log(result);
        this.allRoutesPath = [];
        this.allRoutesDetails = [];
        result.routes.forEach((route) => {
          this.allRoutesPath.push(route.overview_path);
          this.allRoutesDetails.push({
            ...route,
            startEndAddress: [
              {
                address: route.legs[0].start_address,
                icon: 'pi pi-car'
              },
              {
                address: route.legs[0].end_address,
                icon: 'pi pi-map-marker'
              }
            ]
          });
        });
        console.log(this.allRoutesDetails);
      }
    });
  }

  //--------------------------------Click Event------------------------------------

  clickMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) {
      this.clickLocation = event.latLng.toJSON();
      // this.viewSidebarMenu = true;
    }
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) {
      this.display = event.latLng.toJSON();
    }
  }

  onMarkerClick(marker: MapAdvancedMarker) {
    this.infoWindow.openAdvancedMarkerElement(
      marker.advancedMarker,
      marker.advancedMarker.title
    );
  }

  //--------------------------------Add new marker------------------------------------

  addedMarkers: any[] = [];

  addNewMarker() {
    const parser = new DOMParser();

    const pinSvgString =
      '<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.6188 8.7C19.5788 4.07 15.5388 2 11.9988 2C11.9988 2 11.9988 2 11.9888 2C8.45877 2 4.42877 4.07 3.37877 8.69C2.19877 13.85 5.35877 18.22 8.21877 20.98C9.27877 22 10.6388 22.51 11.9988 22.51C13.3588 22.51 14.7188 22 15.7688 20.98C18.6288 18.22 21.7888 13.86 20.6188 8.7ZM14.5288 13.49C14.3788 13.64 14.1888 13.71 13.9988 13.71C13.8088 13.71 13.6188 13.64 13.4688 13.49L12.0188 12.04L10.5288 13.53C10.3788 13.68 10.1888 13.75 9.99877 13.75C9.80877 13.75 9.61877 13.68 9.46877 13.53C9.17877 13.24 9.17877 12.76 9.46877 12.47L10.9588 10.98L9.50877 9.53C9.21877 9.24 9.21877 8.76 9.50877 8.47C9.79877 8.18 10.2788 8.18 10.5688 8.47L12.0188 9.92L13.4188 8.52C13.7088 8.23 14.1888 8.23 14.4788 8.52C14.7688 8.81 14.7688 9.29 14.4788 9.58L13.0788 10.98L14.5288 12.43C14.8188 12.72 14.8188 13.19 14.5288 13.49Z" fill="#292D32"/></svg>';

    const pinSvg = parser.parseFromString(
      pinSvgString,
      'image/svg+xml'
    ).documentElement;

    this.addedMarkers.push({
      position: {
        lat: this.clickLocation.lat,
        lng: this.clickLocation.lng,
      },
      label: {
        color: 'blue',
        text: 'Location ' + (this.addedMarkers.length + 1),
      },
      title: 'Added Marker ' + (this.addedMarkers.length + 1),
      content: pinSvg,
    });
  }

  clearAddedMarkers() {
    this.addedMarkers = [];
  }

  //--------------------------------Search coordinate------------------------------------

  searchCoordinate() {
    this.searchLocation.lat = parseFloat(this.coordinateForm.value['lat']);
    this.searchLocation.lng = parseFloat(this.coordinateForm.value['lng']);

    this.options = {
      ...this.options,
      center: {
        lat: this.searchLocation.lat,
        lng: this.searchLocation.lng,
      },
    };
  }

  //--------------------------------Go to------------------------------------

  goToPlace(place: any) {
    if (place.position) {
      this.deviceLocation = {
        lat: place.position.lat,
        lng: place.position.lng,
      };
      this.options = {
        ...this.options,
        center: {
          lat: this.deviceLocation.lat,
          lng: this.deviceLocation.lng,
        },
        zoom: 20,
      };
    }
  }

  goTo(marker: any) {
    this.deviceLocation.lat = marker.position.lat;
    this.deviceLocation.lng = marker.position.lng;

    this.options = {
      ...this.options,
      center: {
        lat: this.deviceLocation.lat,
        lng: this.deviceLocation.lng,
      },
    };
  }
}

// export interface MapDirectionsResponse {
//   status: google.maps.DirectionsStatus;
//   result?: google.maps.DirectionsResult;
// }
