import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function MapScreen() {
  const [plotCoordinates, setPlotCoordinates] = useState<any[]>([]);
  const [mapHtml, setMapHtml] = useState<string>('');

  useEffect(() => {
    const loadPolygon = async () => {
      const savedPolygon = await AsyncStorage.getItem('farm_polygon');
      let coords = [
        { latitude: 18.6650, longitude: 74.0370 },
        { latitude: 18.6680, longitude: 74.0370 },
        { latitude: 18.6680, longitude: 74.0400 },
        { latitude: 18.6650, longitude: 74.0400 }
      ];

      if (savedPolygon) {
        coords = JSON.parse(savedPolygon);
      }
      setPlotCoordinates(coords);

      const leafletCoords = coords.map(c => `[${c.latitude}, ${c.longitude}]`).join(',');
      
      // Calculate center to fit the polygon nicely
      let centerLat = 18.6665;
      let centerLng = 74.0388;
      if (coords.length > 0) {
        centerLat = coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
        centerLng = coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100%; }
            .leaflet-control-attribution { display: none; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', {zoomControl: false}).setView([${centerLat}, ${centerLng}], 16);
            L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
              maxZoom: 20,
            }).addTo(map);

            var coordinates = [${leafletCoords}];
            L.polygon(coordinates, {color: '#16a34a', fillColor: 'rgba(22, 163, 74, 0.4)', weight: 3}).addTo(map);
          </script>
        </body>
        </html>
      `;
      setMapHtml(html);
    };
    loadPolygon();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=74.02,18.65,74.05,18.68&layer=mapnik&marker=18.6665,74.0388"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mapHtml ? (
        <WebView 
          source={{ html: mapHtml }}
          style={{ width: '100%', height: '100%' }}
          javaScriptEnabled={true}
          scrollEnabled={false}
          bounces={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
