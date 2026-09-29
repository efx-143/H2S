import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

// We import MapView and Polygon dynamically or conditionally to avoid Web crashes.
let MapView: any;
let Polygon: any;
let PROVIDER_DEFAULT: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Polygon = Maps.Polygon;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}

export default function MapScreen() {
  const [plotCoordinates, setPlotCoordinates] = useState([
    { latitude: 18.6650, longitude: 74.0370 },
    { latitude: 18.6680, longitude: 74.0370 },
    { latitude: 18.6680, longitude: 74.0400 },
    { latitude: 18.6650, longitude: 74.0400 }
  ]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {React.createElement('iframe', {
          src: 'https://www.openstreetmap.org/export/embed.html?bbox=74.02,18.65,74.05,18.68&layer=mapnik&marker=18.6665,74.0388',
          width: '100%',
          height: '100%',
          style: { border: 0 }
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 18.6665,
          longitude: 74.0388,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Polygon 
          coordinates={plotCoordinates}
          fillColor="rgba(43, 138, 62, 0.4)"
          strokeColor="rgba(43, 138, 62, 1)"
          strokeWidth={3}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  webFallbackContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  webFallbackText: {
    fontSize: 18,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 26,
  }
});
