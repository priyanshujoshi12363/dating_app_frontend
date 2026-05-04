import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import api from "../utils/api";
import { saveToken, savePartialRegistration } from "../utils/storage";

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Enter phone number");
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Enter valid phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/register", {
        phoneNumber,
      });

      const data = res.data;

      if (data.success) {
        await savePartialRegistration({
          phoneNumber,
          token: data.token,
          userId: data.user?.id,
          isPartial: true,
        });
        
        await saveToken(data.token);
        
        Alert.alert("Success", "Please complete your profile.");
        router.replace("/components/Registration_complete");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2 text-center">
        Create Account 🚀
      </Text>
      <Text className="text-gray-400 text-center mb-8">
        Join DevMatch and find your perfect match
      </Text>

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="#94a3b8"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="numeric"
        maxLength={10}
        className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-5"
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className={`py-4 rounded-xl ${loading ? "bg-gray-600" : "bg-green-500"}`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? "Sending OTP..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/components/Login")}
        className="mt-4 py-4"
      >
        <Text className="text-center text-gray-400">
          Already have an account?{" "}
          <Text className="text-blue-500 font-semibold">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}