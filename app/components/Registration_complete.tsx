import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveAuthData, saveToken, clearPartialRegistration } from "../utils/storage";

export default function CompleteRegistration() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    instagram: "",
    minAge: "",
    maxAge: "",
  });

  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const genderOptions = ["MALE", "FEMALE", "OTHER"];
  const interestsOptions = [
    "Coding", "Gaming", "Music", "Sports", "Travel", 
    "Food", "Art", "Movies", "Reading", "Fitness"
  ];
  const goalsOptions = ["DATING", "FRIENDS", "GO_WITH_THE_FLOW"];
  const workStyleOptions = ["DAY", "NIGHT", "FLEXIBLE"];
  const communicationStyleOptions = ["INTROVERT", "EXTROVERT", "AMBIVERT"];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [showInterestsPicker, setShowInterestsPicker] = useState(false);
  const [showGoalsPicker, setShowGoalsPicker] = useState(false);

  useEffect(() => {
    checkExistingTokenAndSetup();
  }, []);

  const checkExistingTokenAndSetup = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication found. Please login again.");
        router.replace("/components/Login");
        return;
      }
      
      await requestPermissionsAndGetLocation();
    } catch (error) {
      console.log("Setup error:", error);
      router.replace("/components/Login");
    } finally {
      setInitialLoading(false);
    }
  };

  const requestPermissionsAndGetLocation = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await getLocationWithRetry();
    } catch (error) {
      console.log("Permission error:", error);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (err) {
      console.log("Location error:", err);
      return null;
    }
  };

  const getLocationWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const coords = await getLocation();
      if (coords) {
        setUserLocation(coords);
        setLocationError(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setLocationError(true);
    setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const pickAndOptimizeImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled && res.assets[0]) {
        setLoading(true);
        const optimized = await ImageManipulator.manipulateAsync(
          res.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(optimized);
        setLoading(false);
      }
    } catch (error) {
      console.log("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image");
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation Error", "Name is required");
      return false;
    }
    if (!form.age || parseInt(form.age) < 18) {
      Alert.alert("Validation Error", "You must be 18 years or older");
      return false;
    }
    if (!form.gender) {
      Alert.alert("Validation Error", "Please select your gender");
      return false;
    }
    if (!form.bio.trim() || form.bio.length < 10) {
      Alert.alert("Validation Error", "Bio must be at least 10 characters");
      return false;
    }
    if (!image) {
      Alert.alert("Validation Error", "Profile picture is required");
      return false;
    }
    if (selectedInterests.length === 0) {
      Alert.alert("Validation Error", "Please select at least one interest");
      return false;
    }
    if (selectedGoals.length === 0) {
      Alert.alert("Validation Error", "Please select at least one goal");
      return false;
    }
    if (!workStyle) {
      Alert.alert("Validation Error", "Please select your work style");
      return false;
    }
    if (!communicationStyle) {
      Alert.alert("Validation Error", "Please select your communication style");
      return false;
    }
    if (!userLocation) {
      Alert.alert("Validation Error", "Unable to get your location");
      return false;
    }
    return true;
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert("Limit Reached", "You can select up to 10 interests");
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("age", form.age);
      formData.append("gender", form.gender);
      formData.append("bio", form.bio);
      formData.append("instagram", form.instagram);
      formData.append("minAge", form.minAge);
      formData.append("maxAge", form.maxAge);
      formData.append("interests", JSON.stringify(selectedInterests));
      formData.append("goals", JSON.stringify(selectedGoals));
      formData.append("workStyle", workStyle);
      formData.append("communicationStyle", communicationStyle);

      if (userLocation) {
        formData.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [userLocation.longitude, userLocation.latitude],
          })
        );
      }

      if (image) {
        const filename = image.uri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profilePicture", {
          uri: image.uri,
          name: filename,
          type,
        } as any);
      }

      const response = await api.post("/api/auth/complete-registration", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Handle response properly - use existing token if new one not provided
        const authToken = response.data.token || token;
        
        await saveAuthData({
          ...response.data,
          token: authToken
        });
        await saveToken(authToken);
        await clearPartialRegistration();
        
        Alert.alert(
          "Success! 🎉",
          "Your profile has been completed successfully!",
          [
            { 
              text: "Continue", 
              onPress: () => {
                router.replace("/components/MainApp");
              } 
            }
          ]
        );
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (err: any) {
      console.log("Submit error:", err);
      Alert.alert(
        "Registration Failed",
        err.response?.data?.error || err.message || "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderGenderPicker = () => (
    <Modal
      visible={showGenderPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-slate-800 rounded-t-3xl p-4">
          <Text className="text-white text-xl font-bold mb-4">Select Gender</Text>
          {genderOptions.map(gender => (
            <TouchableOpacity
              key={gender}
              onPress={() => {
                setForm({ ...form, gender });
                setShowGenderPicker(false);
              }}
              className="p-4 border-b border-slate-700"
            >
              <Text className="text-white text-lg">{gender}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setShowGenderPicker(false)}
            className="mt-4 p-4 bg-red-500 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderInterestsPicker = () => (
    <Modal
      visible={showInterestsPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInterestsPicker(false)}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-slate-800 m-4 rounded-3xl p-4">
          <Text className="text-white text-xl font-bold mb-4">
            Select Interests ({selectedInterests.length}/10)
          </Text>
          <FlatList
            data={interestsOptions}
            numColumns={2}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleInterest(item)}
                className={`m-2 p-3 rounded-xl ${
                  selectedInterests.includes(item) ? "bg-green-500" : "bg-slate-700"
                }`}
                style={{ flex: 1 }}
              >
                <Text className="text-white text-center">{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setShowInterestsPicker(false)}
            className="mt-4 p-4 bg-green-500 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGoalsPicker = () => (
    <Modal
      visible={showGoalsPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGoalsPicker(false)}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-slate-800 m-4 rounded-3xl p-4">
          <Text className="text-white text-xl font-bold mb-4">Select Goals</Text>
          {goalsOptions.map(goal => (
            <TouchableOpacity
              key={goal}
              onPress={() => {
                toggleGoal(goal);
                setTimeout(() => setShowGoalsPicker(false), 500);
              }}
              className={`p-4 m-2 rounded-xl ${
                selectedGoals.includes(goal) ? "bg-green-500" : "bg-slate-700"
              }`}
            >
              <Text className="text-white text-center">{goal.replace(/_/g, " ")}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setShowGoalsPicker(false)}
            className="mt-4 p-4 bg-red-500 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-950">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-white mt-4">Setting up...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-white text-2xl font-bold mb-2">
          Complete Your Profile
        </Text>
        <Text className="text-gray-400 mb-6">
          Help others get to know you better
        </Text>

        <Text className="text-green-500 font-semibold mb-3">Basic Information</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          value={form.name}
          onChangeText={(text) => handleChange("name", text)}
          className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4"
          maxLength={50}
        />

        <TextInput
          placeholder="Age"
          placeholderTextColor="#94a3b8"
          value={form.age}
          onChangeText={(text) => handleChange("age", text.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4"
          maxLength={3}
        />

        <TouchableOpacity
          onPress={() => setShowGenderPicker(true)}
          className="bg-slate-800 px-4 py-3 rounded-xl mb-4"
        >
          <Text className={form.gender ? "text-white" : "text-gray-500"}>
            {form.gender || "Select Gender"}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Bio (10-500 characters)"
          placeholderTextColor="#94a3b8"
          value={form.bio}
          onChangeText={(text) => handleChange("bio", text)}
          multiline
          numberOfLines={4}
          className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4"
          maxLength={500}
        />

        <TextInput
          placeholder="Instagram Username (optional)"
          placeholderTextColor="#94a3b8"
          value={form.instagram}
          onChangeText={(text) => handleChange("instagram", text.replace("@", ""))}
          className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4"
        />

        <Text className="text-green-500 font-semibold mb-3 mt-4">Preferences</Text>

        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1">
            <TextInput
              placeholder="Min Age"
              placeholderTextColor="#94a3b8"
              value={form.minAge}
              onChangeText={(text) => handleChange("minAge", text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              className="bg-slate-800 text-white px-4 py-3 rounded-xl"
            />
          </View>
          <View className="flex-1">
            <TextInput
              placeholder="Max Age"
              placeholderTextColor="#94a3b8"
              value={form.maxAge}
              onChangeText={(text) => handleChange("maxAge", text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              className="bg-slate-800 text-white px-4 py-3 rounded-xl"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowInterestsPicker(true)}
          className="bg-slate-800 px-4 py-3 rounded-xl mb-4"
        >
          <Text className="text-white">
            Interests ({selectedInterests.length}/10)
          </Text>
          {selectedInterests.length > 0 && (
            <Text className="text-gray-400 text-sm mt-1">
              {selectedInterests.join(", ")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowGoalsPicker(true)}
          className="bg-slate-800 px-4 py-3 rounded-xl mb-4"
        >
          <Text className="text-white">
            Goals ({selectedGoals.length})
          </Text>
          {selectedGoals.length > 0 && (
            <Text className="text-gray-400 text-sm mt-1">
              {selectedGoals.join(", ")}
            </Text>
          )}
        </TouchableOpacity>

        <View className="mb-4">
          <Text className="text-gray-400 mb-2">Work Style</Text>
          <View className="flex-row flex-wrap">
            {workStyleOptions.map(style => (
              <TouchableOpacity
                key={style}
                onPress={() => setWorkStyle(style)}
                className={`m-1 px-4 py-2 rounded-full ${
                  workStyle === style ? "bg-green-500" : "bg-slate-800"
                }`}
              >
                <Text className="text-white">{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 mb-2">Communication Style</Text>
          <View className="flex-row flex-wrap">
            {communicationStyleOptions.map(style => (
              <TouchableOpacity
                key={style}
                onPress={() => setCommunicationStyle(style)}
                className={`m-1 px-4 py-2 rounded-full ${
                  communicationStyle === style ? "bg-green-500" : "bg-slate-800"
                }`}
              >
                <Text className="text-white">{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-slate-800 px-4 py-3 rounded-xl mb-4">
          <Text className="text-gray-400 mb-1">Location Status</Text>
          <Text className="text-white">
            {locationError ? "⚠️ Using approximate location" : "✅ Location detected"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={pickAndOptimizeImage}
          className="bg-blue-500 py-3 rounded-xl mb-4"
          disabled={loading}
        >
          <Text className="text-center text-white font-semibold">
            {image ? "Change Profile Picture" : "Pick Profile Picture"}
          </Text>
        </TouchableOpacity>

        {image && (
          <View className="bg-slate-800 p-3 rounded-xl mb-4">
            <Text className="text-green-500 text-center">✓ Image selected</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-4 rounded-xl ${loading ? "bg-gray-600" : "bg-green-500"}`}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {loading ? "Completing Profile..." : "Complete Registration"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View className="mt-4">
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        )}
      </View>

      {renderGenderPicker()}
      {renderInterestsPicker()}
      {renderGoalsPicker()}
    </ScrollView>
  );
}