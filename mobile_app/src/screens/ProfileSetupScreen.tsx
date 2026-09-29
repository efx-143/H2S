import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSetupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleNext = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem('farmer_name', name);
      await AsyncStorage.setItem('farmer_phone', phone);
      navigation.navigate('SetupMap');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-center px-6`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>Tell us about you</Text>
        <Text style={tw`text-gray-500 mb-8 text-lg`}>Let's create your farmer profile to personalize your experience.</Text>
        
        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-700 font-bold mb-2`}>Full Name</Text>
          <TextInput 
            style={tw`bg-gray-100 p-4 rounded-xl text-lg text-gray-900`} 
            placeholder="e.g. Ramesh Patil"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={tw`mb-10`}>
          <Text style={tw`text-gray-700 font-bold mb-2`}>Phone Number (Optional)</Text>
          <TextInput 
            style={tw`bg-gray-100 p-4 rounded-xl text-lg text-gray-900`} 
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity 
          style={[tw`bg-green-600 px-10 py-4 rounded-full shadow-md w-full`, !name.trim() && tw`opacity-50`]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={tw`text-white text-xl font-bold text-center`}>Continue to Map</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
