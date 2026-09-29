import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export async function initOfflineDb() {
  if (Platform.OS === 'web') {
    console.log("Web platform detected: Bypassing SQLite offline DB initialization.");
    return { success: true, db: null };
  }

  try {
    const db = await SQLite.openDatabaseAsync('agrodpg.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS plots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        geom TEXT,
        area_hectares REAL,
        crop_type TEXT
      );
    `);
    return { success: true, db };
  } catch (error) {
    console.error("Failed to init database", error);
    return { success: false, error };
  }
}
