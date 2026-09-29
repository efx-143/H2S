import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const name = await AsyncStorage.getItem('farmer_name') || 'Unknown Farmer';
      const phone = await AsyncStorage.getItem('farmer_phone') || '0000000000';

      // 1. Sync Farmer
      const farmerResponse = await fetch('http://127.0.0.1:8000/api/v1/farmers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone_number: phone,
          language_preference: "English"
        })
      });
      
      const farmerData = await farmerResponse.json();
      
      let farmerId = farmerData.id;
      if (!farmerResponse.ok) {
        if (farmerData.detail === "Phone number already registered") {
           // We would fetch the farmer ID here, but for mock, let's just use a random UUID if it fails
           alert("Farmer synced already! Syncing plots now...");
        } else {
           throw new Error(farmerData.detail || "Failed to sync farmer");
        }
      }

      // 2. Sync Plot
      if (farmerId) {
        const plotResponse = await fetch('http://127.0.0.1:8000/api/v1/plots/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmer_id: farmerId,
            area_hectares: 2.4,
            crop_type: "Wheat",
            geom: [
              [74.0370, 18.6650], [74.0370, 18.6680], 
              [74.0400, 18.6680], [74.0400, 18.6650]
            ]
          })
        });
        
        if (!plotResponse.ok) throw new Error("Failed to sync plot");
        alert('Sync Successful! Your farm data is now on the DPG network.');
      }
    } catch (error: any) {
      alert('Sync Failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView contentContainerStyle={tw`p-6`}>
        <View style={tw`mb-8 mt-4`}>
          <Text style={tw`text-3xl font-extrabold text-gray-900`}>Hello, Farmer</Text>
          <Text style={tw`text-gray-500 mt-1 text-lg`}>Your farm is looking healthy today.</Text>
        </View>

        <View style={tw`bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>Weather & Advisories</Text>
          <View style={tw`flex-row items-center justify-between bg-blue-50 p-4 rounded-2xl`}>
            <Text style={tw`text-4xl`}>⛅</Text>
            <View style={tw`flex-1 ml-4`}>
              <Text style={tw`text-blue-900 font-bold text-lg`}>Light rain expected</Text>
              <Text style={tw`text-blue-700 mt-1`}>Good time to delay irrigation.</Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row justify-between mb-6`}>
          <View style={tw`bg-white rounded-3xl p-5 shadow-sm flex-1 mr-2 border border-gray-100 items-center justify-center`}>
            <Text style={tw`text-3xl mb-2`}>🌱</Text>
            <Text style={tw`font-bold text-gray-800 text-lg`}>Wheat</Text>
            <Text style={tw`text-gray-500 text-sm mt-1`}>2.4 Hectares</Text>
          </View>
          <TouchableOpacity 
            style={tw`bg-green-600 rounded-3xl p-5 shadow-md flex-1 ml-2 items-center justify-center`}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <>
                <Text style={tw`text-3xl mb-2 text-white`}>☁️</Text>
                <Text style={tw`font-bold text-white text-lg`}>Sync Data</Text>
                <Text style={tw`text-green-100 text-sm mt-1`}>Offline DB Ready</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
