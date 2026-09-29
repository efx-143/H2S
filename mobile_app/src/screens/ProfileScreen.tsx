import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [name, setName] = useState('Farmer');

  useEffect(() => {
    AsyncStorage.getItem('farmer_name').then(val => {
      if (val) setName(val);
    });
  }, []);

  const handleReset = async () => {
    await AsyncStorage.removeItem('hasCompletedOnboarding');
    alert('Onboarding reset! Please refresh the app to see the Welcome screen again.');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`p-6`}>
        <View style={tw`items-center my-8`}>
          <View style={tw`w-24 h-24 bg-green-200 rounded-full items-center justify-center mb-4`}>
            <Text style={tw`text-4xl`}>👨‍🌾</Text>
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900`}>{name}</Text>
          <Text style={tw`text-gray-500`}>Registered Farmer</Text>
        </View>

        <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>Settings</Text>
          
          <TouchableOpacity style={tw`py-3 border-b border-gray-100 flex-row justify-between items-center`}>
            <Text style={tw`text-gray-700 text-lg`}>Edit Farm Location</Text>
            <Text style={tw`text-gray-400`}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={tw`py-3 border-b border-gray-100 flex-row justify-between items-center`}>
            <Text style={tw`text-gray-700 text-lg`}>Language</Text>
            <Text style={tw`text-gray-500`}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`py-3 flex-row justify-between items-center`} onPress={handleReset}>
            <Text style={tw`text-red-500 text-lg font-bold`}>Reset Onboarding Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
