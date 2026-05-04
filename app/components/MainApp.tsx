import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { clearAuthData } from "../utils/storage";

export default function MainApp() {
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
            router.replace("/components/Login");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="bg-slate-900 px-6 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">DevMatch</Text>
        <Text className="text-gray-400">Find your perfect match</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-white text-xl text-center mb-4">
          Welcome to Main App! 🎉
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Your profile is complete. Start matching with developers near you!
        </Text>

        <View className="w-full h-96 bg-slate-800 rounded-2xl justify-center items-center mb-8">
          <Text className="text-gray-400">Swipe Cards Coming Soon</Text>
        </View>

        <View className="flex-row space-x-4 w-full justify-around">
          <TouchableOpacity className="bg-red-500 p-4 rounded-full w-20 h-20 justify-center items-center">
            <Text className="text-white text-2xl">✖</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-500 p-4 rounded-full w-20 h-20 justify-center items-center">
            <Text className="text-white text-2xl">❤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-600 mx-6 mb-6 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}