import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={tw`flex-1 bg-green-50`}>
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <View style={tw`w-32 h-32 bg-green-500 rounded-full mb-8 items-center justify-center shadow-lg`}>
          <Text style={tw`text-6xl`}>🌾</Text>
        </View>
        <Text style={tw`text-4xl font-extrabold text-green-800 text-center mb-4`}>
          AgriLink DPG
        </Text>
        <Text style={tw`text-lg text-green-700 text-center mb-12 px-4 leading-relaxed`}>
          Your digital companion for smarter farming. Map your plots, scan for diseases, and get localized advisories.
        </Text>
        
        <TouchableOpacity 
          style={tw`bg-green-600 px-10 py-4 rounded-full shadow-md w-full`}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <Text style={tw`text-white text-xl font-bold text-center`}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
