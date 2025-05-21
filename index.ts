console.log("🚨 התחלה – הקובץ שרץ הוא באמת index.ts הזה");

import { GeoPackageAPI } from '@ngageoint/geopackage';
import * as fs from 'fs';

// נתיבים ישירים לקבצים שלך
const gpkg1Path = '/Users/roicohen/Documents/general/היחידה/תרגילי קליטה/blueMarble+lebanon/geopkg-merge/Syria.gpkg';
const gpkg2Path = '/Users/roicohen/Documents/general/היחידה/תרגילי קליטה/blueMarble+lebanon/geopkg-merge/blueMarble.gpkg';
const outputPath = '/Users/roicohen/Documents/general/היחידה/תרגילי קליטה/blueMarble+lebanon/geopkg-merge/merged_output.gpkg';

async function mergeGeoPackages(gpkg1Path: string, gpkg2Path: string, outputPath: string) {
  console.log('📦 טוען קבצים...');
  const gpkg1 = await GeoPackageAPI.open(gpkg1Path);
  const gpkg2 = await GeoPackageAPI.open(gpkg2Path);

  if (fs.existsSync(outputPath)) {
    console.log('🧹 קובץ ממוזג קיים - נמחק');
    fs.unlinkSync(outputPath);
  }

  const merged = await GeoPackageAPI.create(outputPath);
  console.log('📁 נוצר קובץ ממוזג חדש');

  async function copyFeatureTables(from: any, to: any, label: string) {
    const tables = from.getFeatureTables();
    console.log(`🔍 ${label}: נמצאו ${tables.length} שכבות`);

    for (const table of tables) {
      console.log(`➡️ מעתיק שכבה: ${table}`);
      const features = await from.iterateGeoJSONFeatures(table);
      let count = 0;

      for await (const feature of features) {
        if (!to.hasFeatureTable(table)) {
          await to.createFeatureTableFromGeoJSON(table, feature);
          console.log(`🆕 נוצרה טבלה חדשה: ${table}`);
        }
        await to.addGeoJSONFeature(table, feature);
        count++;
      }

      console.log(`✅ הועתקו ${count} רשומות מהשכבה "${table}"`);
    }
  }

  await copyFeatureTables(gpkg1, merged, 'GPKG 1');
  await copyFeatureTables(gpkg2, merged, 'GPKG 2');

  console.log(`🎉 מיזוג הושלם. נוצר קובץ: ${outputPath}`);
}

mergeGeoPackages(gpkg1Path, gpkg2Path, outputPath).catch(console.error);
