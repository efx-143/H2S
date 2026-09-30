import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initOfflineDb } from '../db/sqlite';

// Import WebView dynamically to avoid web issues
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function SetupMapScreen({ navigation }: any) {
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const webViewRef = useRef<any>(null);

  const handleCompleteSetup = async () => {
    if (coordinates.length > 0) {
      await AsyncStorage.setItem('farm_polygon', JSON.stringify(coordinates));
    }
    // Set onboarding complete flag
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    await initOfflineDb();
    navigation.replace('MainTabs');
  };

  const undoLastPoint = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('undoPoint(); true;');
    }
  };

  const clearAll = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('clearAll(); true;');
    }
  };

  const mapHtml = `
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
        var map = L.map('map', {zoomControl: false}).setView([18.6665, 74.0388], 15);
        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
        }).addTo(map);

        var coordinates = [];
        var polygon = null;
        var markers = [];

        function updatePolygon() {
          if (polygon) { map.removeLayer(polygon); }
          if (coordinates.length > 0) {
            polygon = L.polygon(coordinates, {color: '#16a34a', fillColor: 'rgba(22, 163, 74, 0.4)', weight: 3}).addTo(map);
          }
          window.ReactNativeWebView.postMessage(JSON.stringify(coordinates));
        }

        map.on('click', function(e) {
          coordinates.push([e.latlng.lat, e.latlng.lng]);
          var marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          markers.push(marker);
          updatePolygon();
        });

        window.undoPoint = function() {
          if (coordinates.length > 0) {
            coordinates.pop();
            var marker = markers.pop();
            map.removeLayer(marker);
            updatePolygon();
          }
        };

        window.clearAll = function() {
          coordinates = [];
          markers.forEach(m => map.removeLayer(m));
          markers = [];
          updatePolygon();
        };
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`p-6 bg-white z-10 shadow-sm`}>
        <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>Trace Your Farm</Text>
        <Text style={tw`text-gray-500 mb-4`}>Tap on the map corners to trace your farm boundaries.</Text>
      </View>
      
      <View style={tw`flex-1 bg-gray-200 relative`}>
        {Platform.OS === 'web' ? (
          <View style={tw`flex-1`}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.02,18.65,74.05,18.68&layer=mapnik&marker=18.6665,74.0388"
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          </View>
        ) : (
          <View style={tw`flex-1 relative`}>
            <WebView 
              ref={webViewRef}
              source={{ html: mapHtml }}
              style={{ width: '100%', height: '100%' }}
              onMessage={(event: any) => {
                try {
                  const coords = JSON.parse(event.nativeEvent.data);
                  const formattedCoords = coords.map((c: any) => ({ latitude: c[0], longitude: c[1] }));
                  setCoordinates(formattedCoords);
                } catch(e) {}
              }}
              javaScriptEnabled={true}
              scrollEnabled={false}
              bounces={false}
            />

            <View style={[tw`absolute top-4 right-4 flex-row`, { zIndex: 1000 }]}>
              {coordinates.length > 0 && (
                <>
                  <TouchableOpacity style={tw`bg-white p-3 rounded-xl shadow-md`} onPress={undoLastPoint}>
                    <Text style={tw`text-gray-800 font-bold`}>Undo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={tw`bg-white p-3 rounded-xl shadow-md ml-2`} onPress={clearAll}>
                    <Text style={tw`text-red-500 font-bold`}>Clear</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        <View style={[tw`absolute bottom-8 left-6 right-6`, { zIndex: 1000, elevation: 10 }]}>
          <TouchableOpacity 
            style={tw`bg-gray-900 p-4 rounded-2xl shadow-lg`}
            onPress={handleCompleteSetup}
            activeOpacity={0.7}
          >
            <Text style={tw`text-white text-center text-lg font-bold`}>Save Boundaries & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
