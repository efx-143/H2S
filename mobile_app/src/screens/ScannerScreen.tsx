import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';

export default function ScannerScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`flex-1 p-6 items-center justify-center`}>
        <View style={tw`w-full h-80 bg-gray-200 rounded-3xl border-4 border-dashed border-gray-400 items-center justify-center mb-8 relative overflow-hidden`}>
          <Text style={tw`text-6xl mb-4`}>📸</Text>
          <Text style={tw`text-gray-500 font-medium text-lg`}>Point camera at crop leaves</Text>
        </View>

        <Text style={tw`text-2xl font-bold text-gray-900 mb-3`}>Disease Diagnostic</Text>
        <Text style={tw`text-gray-500 text-center mb-8 px-4 text-base leading-relaxed`}>
          Use our offline AI model to instantly identify crop diseases and get localized remedies.
        </Text>
        
        <TouchableOpacity style={tw`bg-gray-900 px-12 py-4 rounded-full shadow-lg w-full`}>
          <Text style={tw`text-white text-center text-xl font-bold`}>Scan Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
