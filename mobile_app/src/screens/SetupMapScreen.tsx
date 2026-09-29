import React from 'react';
import { View, Text, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initOfflineDb } from '../db/sqlite';

// We import MapView conditionally
let MapView: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
}

export default function SetupMapScreen({ navigation }: any) {
  const handleCompleteSetup = async () => {
    // Set onboarding complete flag
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    // Initialize DB here conceptually, before entering main app
    await initOfflineDb();
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`p-6 bg-white z-10 shadow-sm`}>
        <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>Locate Your Farm</Text>
        <Text style={tw`text-gray-500 mb-4`}>Tap to place boundaries or define your crop.</Text>
      </View>
      
      <View style={tw`flex-1 bg-gray-200 relative`}>
        {Platform.OS === 'web' ? (
          <View style={tw`flex-1`}>
            {React.createElement('iframe', {
              src: 'https://www.openstreetmap.org/export/embed.html?bbox=74.02,18.65,74.05,18.68&layer=mapnik&marker=18.6665,74.0388',
              width: '100%',
              height: '100%',
              style: { border: 0 }
            })}
          </View>
        ) : (
          <MapView 
            style={tw`flex-1`}
            initialRegion={{
              latitude: 18.6665,
              longitude: 74.0388,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          />
        )}

        <View style={[tw`absolute bottom-8 left-6 right-6`, { zIndex: 1000, elevation: 10 }]}>
          <TouchableOpacity 
            style={tw`bg-gray-900 p-4 rounded-2xl shadow-lg`}
            onPress={handleCompleteSetup}
            activeOpacity={0.7}
          >
            <Text style={tw`text-white text-center text-lg font-bold`}>Save Location & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
