import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async (base64String: string | null | undefined) => {
    if (!base64String) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const lang = await AsyncStorage.getItem('farmer_language') || 'English';
      const response = await fetch('http://172.16.30.34:8000/api/v1/diagnostics/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64String,
          crop_type: "Unknown",
          language: lang
        })
      });
      const data = await response.json();
      setDiagnosis(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`flex-1 p-6 items-center justify-center`}>
        <TouchableOpacity 
          style={tw`w-full h-80 bg-gray-200 rounded-3xl border-4 border-dashed border-gray-400 items-center justify-center mb-8 overflow-hidden`}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={tw`w-full h-full`} />
          ) : (
            <>
              <Text style={tw`text-6xl mb-4`}>📸</Text>
              <Text style={tw`text-gray-500 font-medium text-lg`}>Tap to open camera</Text>
            </>
          )}
        </TouchableOpacity>

        {loading ? (
          <View style={tw`items-center`}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={tw`mt-4 text-gray-600 font-bold`}>AI is analyzing the leaf...</Text>
          </View>
        ) : diagnosis ? (
          <View style={tw`bg-white p-6 rounded-2xl shadow-sm w-full border border-gray-100`}>
            <Text style={tw`text-xl font-bold text-gray-900 mb-2`}>Disease: {diagnosis.disease_name}</Text>
            <Text style={tw`text-sm text-green-600 font-bold mb-4`}>Confidence: {Math.round(diagnosis.confidence * 100)}%</Text>
            <Text style={tw`text-gray-700 leading-relaxed font-medium`}>{diagnosis.treatment_advisory}</Text>
            
            <TouchableOpacity 
              style={tw`mt-6 bg-gray-100 py-3 rounded-xl`}
              onPress={() => { setImage(null); setDiagnosis(null); }}
            >
              <Text style={tw`text-center text-gray-800 font-bold`}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={tw`text-2xl font-bold text-gray-900 mb-3`}>Disease Diagnostic</Text>
            <Text style={tw`text-gray-500 text-center mb-8 px-4 text-base leading-relaxed`}>
              Use our AI model powered by Gemini to instantly identify crop diseases and get localized remedies.
            </Text>
            
            <TouchableOpacity style={tw`bg-gray-900 px-12 py-4 rounded-full shadow-lg w-full`} onPress={pickImage}>
              <Text style={tw`text-white text-center text-xl font-bold`}>Scan Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
