import * as villageData from './assets/villages.json' assert {type: 'json'};
import * as districtData from './assets/districts.json' assert {type: 'json'};
import * as regionData from './assets/regions.json' assert {type: 'json'};
import fs from 'fs';


var output2 = '';
var output3 = '';

// for (const villageFeature of villageData.default.features) {
//   var i = `${villageFeature.properties.Region_Nam}, ${villageFeature.properties.District_N}, ${villageFeature.properties.Ward_Name}, ${villageFeature.properties.Vil_Mtaa_N} \n`;
//   output += i;
//   console.log(i)
// }

// fs.writeFile('../src/assets/villages.csv', output, 'utf8', () => {});

for (const regionFeature of regionData.default.features) {
  var i = `${regionFeature.properties.Region_Nam.replaceAll(" ", "_")} \n`;
  output2 += i;
  console.log(i)
}
fs.writeFile('../src/assets/region-names.csv', output2, 'utf8', () => {});

for (const districtFeature of districtData.default.features) {
  var i = `${districtFeature.properties.District_N.replaceAll(" ", "_")} \n`;
  output3 += i;
  console.log(i)
}

fs.writeFile('../src/assets/district-names.csv', output3, 'utf8', () => {});
