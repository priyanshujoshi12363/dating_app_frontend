import "./global.css";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { getAuthData, getPartialRegistration } from "./utils/storage";

export default function HomeScreen() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"login" | "register" | "complete" | "main">("login");

  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      const authData = await getAuthData();
      
      if (authData && authData.user?.isProfileComplete) {
        setInitialRoute("main");
        setIsReady(true);
        return;
      }

      const partialReg = await getPartialRegistration();
      
      if (partialReg && partialReg.isPartial) {
        const isRecent = Date.now() - (partialReg.timestamp || 0) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          setInitialRoute("complete");
          setIsReady(true);
          return;
        }
      }

      setInitialRoute("login");
      setIsReady(true);
      
    } catch (err) {
      console.error("Auth check error:", err);
      setInitialRoute("login");
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-950">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (initialRoute === "login") return <Redirect href="/components/Login" />;
  if (initialRoute === "register") return <Redirect href="/components/Register" />;
  if (initialRoute === "complete") return <Redirect href="/components/Registration_complete" />;
  if (initialRoute === "main") return <Redirect href="/components/MainApp" />;

  return null;
}