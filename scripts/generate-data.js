import * as districtData from './assets/districts.json' assert {type: 'json'};
import * as regionData from './assets/regions.json' assert {type: 'json'};
import * as wardData from './assets/wards.json' assert {type: 'json'};
import * as hamletData from './assets/vitongoji.json' assert {type: 'json'};
import * as villageData from './assets/villages.json' assert {type: 'json'};

import * as hamletReaData from './output/regions.json' assert {type: 'json'};

import {v4 as uuidv4} from 'uuid';

import fs from 'fs';

// fs.readFile('./assets/region.csv', 'utf8', function(err, data){
//   var lines = data.split("\n").map(d => d.split(","))
//   var json = JSON.stringify(lines,null,2);
//   fs.writeFile('./output/village.json', json, 'utf8', () => {});
// });

console.log("Starting: ", hamletReaData.default.length)

var matchedRegions = 0;
var matchedDistricts = 0;
var matchedWards = 0;
var matchedVillages = 0;
var matchedHamlets = 0;
var matchedHamletData = 0;


  function mapRegion(regionFeature) {
    matchedRegions++
    return {
      name: regionFeature.properties.Region_Nam,
      polygon: formatPolygon(regionFeature.geometry),
      districts: districtData.default.features
        .filter((districtFeature) => {
          const wardInthisDistrict = wardData.default.features.find((wardFeature) => formatForMatch(wardFeature.properties.District_N) == formatForMatch(districtFeature.properties.District_N))
          if(formatForMatch(wardInthisDistrict.properties.Region_Nam) == formatForMatch(regionFeature.properties.Region_Nam)) {
            matchedDistricts++
          }
          return formatForMatch(wardInthisDistrict.properties.Region_Nam) == formatForMatch(regionFeature.properties.Region_Nam)
        }).map(mapDistrict)
    }
  }

  function mapDistrict(districtFeature) {

    var i = wardData.default.features
        .filter(
          (wardFeature) =>
            formatForMatch(wardFeature.properties.District_N) == formatForMatch(districtFeature.properties.District_N)
        )
    matchedWards += i.length

    return {
      name: districtFeature.properties.District_N,
      polygon: formatPolygon(districtFeature.geometry),
      wards: i.map(mapWard)
    }
    return r
  }

  function formatForMatch(name) {
    return name.toLowerCase().replace(/\s/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace('wa','a').trimEnd("i");
  }

  // function matchWards(ward1, ward2) {
  //   if(formatForMatch(ward1.ward_name) == formatForMatch(ward2.Ward_Name)) {
  //     return true;
  //   }
  //   return ward1.ward_code == ward2.Ward_Code &&
  //           ward1.dist_code == ward2.District_C &&
  //           ward1.reg_code == ward2.Region_Cod
  // }

  // function matchVillages(village1, village2) {
  //   if(formatForMatch(ward1.Ward_Name) == formatForMatch(ward2.ward_name)) {
  //     return true;
  //   }
  //   return ward1.ward_code == ward2.Ward_Code &&
  //           ward1.dist_code == ward2.District_C &&
  //           ward1.reg_code == ward2.Region_Cod
  // }

  function mapWard(wardFeature) {
    var i = villageData.default.features
        .filter((villageFeature) => formatForMatch(villageFeature.properties.Ward_Name) == formatForMatch(wardFeature.properties.Ward_Name) && formatForMatch(villageFeature.properties.District_N) == formatForMatch(wardFeature.properties.District_N))
    matchedVillages += i.length
    if(!i) console.log("EMPTY WARD: ", wardFeature.properties.Ward_Name)
    return {
      name: wardFeature.properties.Ward_Name,
      polygon: formatPolygon(wardFeature.geometry),
      // villages: formatVillages(hamletData.default.features
      //   .filter((villageFeature) => matchWards(villageFeature.properties, wardFeature.properties)))
      villages: i.map(mapVillages)
    }
  }

  function mapVillages(villageFeature) {
    var i = hamletData.default.features
        .filter((hamletFeature) => formatForMatch(hamletFeature.properties.vill_name) == formatForMatch(villageFeature.properties.Vil_Mtaa_N) && formatForMatch(hamletFeature.properties.ward_name) == formatForMatch(villageFeature.properties.Ward_Name))
    matchedHamlets += i.length
    if(!i) console.log("EMPTY VILLAGE: ", villageFeature.properties.Vil_Mtaa_N)
    process.stdout.write(`${matchedRegions} : ${regionData.default.features.length} | ${matchedDistricts} : ${districtData.default.features.length} | ${matchedWards} : ${wardData.default.features.length} | ${matchedVillages} : ${villageData.default.features.length} | ${matchedHamlets} : ${hamletData.default.features.length} | ${matchedHamletData} : ${hamletReaData.default.length} \r`);
    return {
      name: villageFeature.properties.Vil_Mtaa_N,
      polygon: formatPolygon2(villageFeature.geometry),
      hamlets: i.map(mapHamlet)
    }
  }

  function mapHamlet(hamletFeature) {

    var i = hamletReaData.default.find(hamlet =>
        formatForMatch(hamlet[5]) == formatForMatch(hamletFeature.properties.vill_name) &&
        formatForMatch(hamlet[7]) == formatForMatch(hamletFeature.properties.hamlet))

    if(i) matchedHamletData++
    return {
      name: hamletFeature.properties.hamlet,
      village: hamletFeature.properties.vill_name,
      point: hamletFeature.geometry.coordinates,
      data : hamletReaData.default.find(hamlet =>
        formatForMatch(hamlet[5]) == formatForMatch(hamletFeature.properties.vill_name) &&
        formatForMatch(hamlet[7]) == formatForMatch(hamletFeature.properties.hamlet))
    }
  }

  function formatPolygon2(geometry) {
    var filename = "polygon-" + uuidv4()
    const polygonCoordinates = []
    for (const coords of geometry.coordinates) {
        const i = coords.map((coord) => { return {lng: coord[0], lat: coord[1]} })
        polygonCoordinates.push(i)
    }
    var json = JSON.stringify(polygonCoordinates, null,2);
    fs.writeFile('../src/assets/polygons/' + filename + '.json', json, 'utf8', () => {});
    return filename;
  }

  function formatPolygon(geometry) {
    var filename = "polygon-" + uuidv4()
    const polygonCoordinates = []
    for (const coords of geometry.coordinates) {
        const i = coords[0].map((coord) => { return {lng: coord[0], lat: coord[1]} })
        polygonCoordinates.push(i)
    }
    var json = JSON.stringify(polygonCoordinates, null,2);
    fs.writeFile('../src/assets/polygons/' + filename + '.json', json, 'utf8', () => {});
    return filename;
  }

  var regions = regionData.default.features.map(mapRegion)
  console.log("Remaining: ", hamletReaData.default.length)
  var json = JSON.stringify(hamletReaData.default, null,2);
  fs.writeFile('./output/remaining-village.json', json, 'utf8', () => {});


  var json = JSON.stringify(regions,null,2);
  fs.writeFile('../src/assets/regions.json', json, 'utf8', () => {});

  // fs.writeFile('../src/assets/remaining-wards.json', JSON.stringify(wardData.default.features,null,2), 'utf8', () => {});


  console.log("MatchedDistricts: ", matchedDistricts + ":" + districtData.default.features.length);
  console.log("MatchedWards: ", matchedWards + ":" + wardData.default.features.length);
  console.log("MatchedVillages: ", matchedVillages + ":" + villageData.default.features.length);
  console.log("MatchedHamlets: ", matchedHamlets + ":" + hamletData.default.features.length);
  console.log("MatchedHamletData: ", matchedHamletData + ":" + hamletReaData.default.length);


