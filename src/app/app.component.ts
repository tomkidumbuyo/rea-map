import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import regionData from '../assets/regions.json';
import { styles } from './map.style';
import { Observable } from 'rxjs';


const DESELECTED_STYLE = {fillOpacity: 0.1, strokeOpacity: .5, strokeWeight: 2, strokeColor: "#2c3e50", fillColor: "#f1c40f",}
const HOVER_STYLE = {fillOpacity: 0.3, strokeOpacity: 0.2, strokeWeight: 2.0, strokeColor: "#2c3e50", fillColor: "#2ecc71",}

const HOVER_LABEL_STYLE = {color: 'black', fontSize: "17px"}
const DESELECTED_LABEL_STYLE = {color: 'black', fontSize: "17px"}

const TANZANIA_CENTER_COORDINATES = { lat: -6.431669815195914, lng: 34.6385658154605 };
const TANZANIA_CENTER_ZOOM = 7;

const level = {
  COUNTRY: 'COUNTRY',
  REGION: 'REGION',
  DISTRICT: 'DISTRICT',
  WARD: 'WARD',
  VILLAGE: 'VILLAGE',
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  regions = regionData;
  map: any;

  level = level.COUNTRY;
  levelName = 'Tanzania';

  selectedRegion: any;
  selectedDistrict: any;
  selectedWard: any;
  selectedVillage: any;
  selectedHamlet: any;



  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    // this.initMap();
    this.selectCountry();
  }

  initMap(polygon?: any): void {
    this.map = new google.maps.Map(document.getElementById("google-map") as HTMLElement, {
      center: TANZANIA_CENTER_COORDINATES,
      zoom: TANZANIA_CENTER_ZOOM,
    });
    this.map.setOptions({ styles: styles["silver"] });

    if(polygon) {
      const bounds = this.getBoundsFromPolygon(polygon)
      this.map.fitBounds(bounds);
    }
  }

  getBoundsFromPolygon(polygon:any[]) {
    var bounds = new google.maps.LatLngBounds();
    for (const coords of polygon) {
      const polly = new google.maps.Polygon({
        paths: coords
      })
      polly.getPath().forEach(function (element, index) { bounds.extend(element); });
    }
    return bounds;
  }

  drawPolygonsToMap(name: string, polygons: any[], clickCallBack: Function) {
    const center = this.getBoundsFromPolygon(polygons).getCenter()
    const map = this.map
    const beachMarker = new google.maps.Marker({
      position: center,
      label: {
        text: name,
        ...DESELECTED_LABEL_STYLE
      },
      map,
      icon: "https://ibb.co/cJpsnpb",
    });

    for (const coords of polygons) {
      // Construct the polygon.
      const polly = new google.maps.Polygon({
        ...DESELECTED_STYLE,
        paths: coords,
      });
      polly.setMap(this.map);
      google.maps.event.addListener(polly, "mouseover", () => {
        polly.setOptions(HOVER_STYLE);
        beachMarker.setLabel(
          {
            text: name,
            ...HOVER_LABEL_STYLE
          },
        )
      });

      google.maps.event.addListener(polly, "click", () => {
        clickCallBack()
      })

      google.maps.event.addListener(polly, "mouseout", () => {
        polly.setOptions(DESELECTED_STYLE);
        beachMarker.setLabel(
          {
            text: name,
            ...DESELECTED_LABEL_STYLE
          },
        )
      });
    }

  }


  async getPolygon(name: string): Promise<any[] | undefined> {
    const polygon = await this.httpClient.get<any[]>('assets/polygons/' + name + '.json').toPromise()
    return polygon;
  }

  async selectCountry() {
    this.selectedRegion = null;
    this.selectedDistrict = null;
    this.selectedWard = null;
    this.selectedVillage = null;
    this.selectedHamlet = null
    this.level = level.COUNTRY;
    this.levelName = 'TANZANIA'
    this.initMap()
      for (const region of Object.values(this.regions)) {
        const polygon = await this.getPolygon(region.polygon)
        if(polygon) {
          this.drawPolygonsToMap(region.name, polygon, () => {
            this.selectRegion(region);
          })
        }
        // for (const district of region.districts) {
        //   for (const ward of district.wards) {
        //     for (const village of ward.villages) {
        //       for (const hamlet of village.hamlets) {
        //         this.addHamletMarker(hamlet,50)
        //       }
        //     }
        //   }
        // }
      }
  }

  async selectRegion(region: any) {
    this.level = level.REGION;
    this.selectedRegion = region;
    this.selectedDistrict = null;
    this.selectedWard = null;
    this.selectedVillage = null;
    this.selectedHamlet = null;
    this.levelName = this.selectedRegion.name

    const regionPolygon = await this.getPolygon(region.polygon)
    this.initMap(regionPolygon)

    for (const district of region.districts) {
      const polygon = await this.getPolygon(district.polygon)
      if(polygon) {
        this.drawPolygonsToMap(district.name, polygon, () => {
          this.selectDistrict(district);
        })
      }
      for (const ward of district.wards) {
        for (const village of ward.villages) {
          for (const hamlet of village.hamlets) {
            this.addHamletMarker(hamlet, 1000)
          }
        }
      }
    }
  }


  async selectDistrict(district: any) {
    this.level = level.DISTRICT;
    this.selectedDistrict = district;
    this.selectedWard = null;
    this.selectedVillage = null;
    this.selectedHamlet = null;
    this.levelName = this.selectedDistrict.name

    const districtPolygon = await this.getPolygon(district.polygon)
    this.initMap(districtPolygon)

    for (const ward of district.wards) {
      const polygon = await this.getPolygon(ward.polygon)
      if(polygon) {
        this.drawPolygonsToMap(ward.name, polygon, () => {
          this.selectWard(ward);
        })
      }

      for (const village of ward.villages) {
        for (const hamlet of village.hamlets) {
          this.addHamletMarker(hamlet, 200, false)
        }
      }
    }
  }

  async selectWard(ward: any) {
    this.level = level.WARD
    this.selectedWard = ward;
    this.selectedVillage = null;
    this.selectedHamlet = null;
    this.levelName = this.selectedWard.name

    const wardPolygon = await this.getPolygon(ward.polygon)
    this.initMap(wardPolygon)

    for (const village of ward.villages) {
      console.log(village)

      const polygon = await this.getPolygon(village.polygon)
      console.log(polygon)
      if(polygon) {
        this.drawPolygonsToMap(village.name, polygon, () => {
          this.selectVillage(village);
        })
      }


      for (const hamlet of village.hamlets) {
        this.addHamletMarker(hamlet)
      }
    }
  }

  async selectVillage(village: any) {
    this.level = level.VILLAGE
    this.selectedVillage = village;
    this.selectedHamlet = null;
    this.levelName = this.selectedVillage.name

    const polygon = await this.getPolygon(village.polygon)
    this.initMap(polygon)
    if(polygon) this.drawPolygonsToMap(village.name, polygon, () => {})
    for (const hamlet of village.hamlets) {
      this.addHamletMarker(hamlet,100, true)
    }
  }

  addHamletMarker(hamlet: any, size?: number, maker? : boolean) {
    const map = this.map
    const position = {lng: hamlet.point[0], lat: hamlet.point[1]}
    new google.maps.Circle({
      center: position,
      strokeColor: hamlet.data ? "#FF0000" : "#f1c40f",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: hamlet.data ? "#FF0000" : "#f1c40f",
      map,
      radius: size || 100,
    });
    // this.map.panTo(position)
  }

  // selectHamlet(hamlet: any) {
  //   this.initMap()
  //   this.selectedHamlet = hamlet;
  //   this.initMap()
  //   this.addHamletMarker(hamlet,50, true)
  //   this.map.panTo({lng: hamlet.point[0], lat: hamlet.point[1]})
  //   this.map.zoom()
  // }

  back() {
    if(this.level == level.REGION) {
      this.selectCountry();
    } else if(this.level == level.DISTRICT) {
      this.selectRegion(this.selectedRegion)
    } else if(this.level == level.WARD) {
      this.selectDistrict(this.selectedDistrict)
    } else if(this.level == level.VILLAGE) {
      this.selectWard(this.selectedWard)
    }
  }


}
