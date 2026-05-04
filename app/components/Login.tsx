import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import api from "../utils/api";
import { saveAuthData, saveToken } from "../utils/storage";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Enter phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        phoneNumber,
      });

      const data = res.data;

      if (data.success) {
        await saveAuthData(data);
        await saveToken(data.token);
        
        Alert.alert("Success", data.message);
        router.replace("/components/MainApp");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2 text-center">
        Welcome Back! 👋
      </Text>
      <Text className="text-gray-400 text-center mb-8">
        Login to continue your journey
      </Text>

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="#94a3b8"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="numeric"
        className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-5"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className={`py-4 rounded-xl ${loading ? "bg-gray-600" : "bg-blue-500"}`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/components/Register")}
        className="mt-4 py-4"
      >
        <Text className="text-center text-gray-400">
          Don't have an account?{" "}
          <Text className="text-green-500 font-semibold">Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}