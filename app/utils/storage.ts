import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "auth";
const TOKEN_KEY = "token";
const PARTIAL_REG_KEY = "partial_registration";

export interface AuthData {
  success: boolean;
  message: string;
  token?: string; // Make token optional
  user?: {
    id: string;
    phoneNumber: string;
    name: string;
    profilePicture: string;
    isVerified: boolean;
    isProfileComplete: boolean;
    createdAt: string;
  };
  profile?: any;
}

export const saveAuthData = async (data: AuthData) => {
  try {
    if (!data) {
      console.error("No data provided to saveAuthData");
      return false;
    }
    
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
    
    // Only save token if it exists
    if (data.token) {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
    } else {
      console.warn("No token in auth data, not saving token");
    }
    
    await clearPartialRegistration();
    return true;
  } catch (error) {
    console.error("Error saving auth data:", error);
    return false;
  }
};

export const saveToken = async (token: string) => {
  try {
    if (!token) {
      console.error("Cannot save undefined or null token");
      return false;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const getAuthData = async (): Promise<AuthData | null> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting auth data:", error);
    return null;
  }
};

export const savePartialRegistration = async (data: any) => {
  try {
    const partialData = { ...data, timestamp: Date.now() };
    await AsyncStorage.setItem(PARTIAL_REG_KEY, JSON.stringify(partialData));
    return true;
  } catch (error) {
    console.error("Error saving partial registration:", error);
    return false;
  }
};

export const getPartialRegistration = async () => {
  try {
    const data = await AsyncStorage.getItem(PARTIAL_REG_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting partial registration:", error);
    return null;
  }
};

export const clearPartialRegistration = async () => {
  try {
    await AsyncStorage.removeItem(PARTIAL_REG_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing partial registration:", error);
    return false;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_KEY, TOKEN_KEY, PARTIAL_REG_KEY]);
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error);
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    const authData = await getAuthData();
    return !!(token && authData);
  } catch (error) {
    return false;
  }
};

const storage = {
  saveAuthData,
  getAuthData,
  saveToken,
  getToken,
  savePartialRegistration,
  getPartialRegistration,
  clearPartialRegistration,
  clearAuthData,
  isAuthenticated,
};

export default storage;