import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import api from "../utils/api";
import { saveAuthData, saveToken } from "../utils/storage";

const COUNTRY_OPTIONS = [
  { code: "US", dial: "+1" },
  { code: "IN", dial: "+91" },
  { code: "GB", dial: "+44" },
];

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Enter phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        phoneNumber: selectedCountry.dial + phoneNumber,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d12" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spark</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Logo */}
        <View style={styles.logoBg}>
          <Text style={styles.logoMark}>✦S</Text>
          <Text style={styles.logoSub}>LUMINOUS</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your journey through{"\n"}the Spark network.
        </Text>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Phone Number</Text>

          {/* Phone Row */}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryBtn}
              activeOpacity={0.75}
              onPress={() => setShowCountryPicker((v) => !v)}
            >
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder={`${selectedCountry.dial} (555) 000-0000`}
              placeholderTextColor="#44445a"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              selectionColor="#ff6b6b"
            />
          </View>

          {/* Country dropdown */}
          {showCountryPicker && (
            <View style={styles.dropdown}>
              {COUNTRY_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCountry(c);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {c.code}  {c.dial}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Send Code — gradient-style via overlapping views */}
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.sendBtnText}>
              {loading ? "Sending…" : "Send Code"}
            </Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <Text style={styles.socialBtnText}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <Text style={styles.socialBtnText}>iOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Legal */}
        <Text style={styles.legalText}>
          By tapping 'Send Code', you agree to our{"\n"}
          <Text style={styles.legalLink}>Terms of Service</Text>
          <Text style={styles.legalText}> and </Text>
          <Text style={styles.legalLink}>Privacy Policy</Text>
          <Text style={styles.legalText}>.</Text>
        </Text>

        {/* Register link */}
        <TouchableOpacity
          style={styles.registerRow}
          onPress={() => router.push("/components/Register")}
        >
          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text style={styles.registerHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const SALMON = "#ff6b6b";
const ORANGE = "#ff9f43";
const BG = "#0d0d12";
const CARD_BG = "#14141c";
const INPUT_BG = "#0d0d12";
const BORDER = "#22222e";
const MUTED = "#555568";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 14 : 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1e1e28",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backArrow: { color: "#aaa", fontSize: 24 },
  headerTitle: {
    color: SALMON,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* Body */
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: "center",
  },

  /* Logo */
  logoBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1a1a24",
    borderWidth: 1.5,
    borderColor: "#2a2a38",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    shadowColor: SALMON,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoMark: { color: SALMON, fontSize: 22, fontWeight: "900" },
  logoSub: {
    color: SALMON,
    fontSize: 7.5,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginTop: 3,
  },

  /* Title */
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: MUTED,
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 26,
  },

  /* Card */
  card: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  fieldLabel: {
    color: "#ccccdd",
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 10,
  },

  /* Phone Row */
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 6,
  },
  countryCode: { color: "#fff", fontSize: 13.5, fontWeight: "600" },
  chevron: { color: MUTED, fontSize: 10 },
  phoneInput: {
    flex: 1,
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#fff",
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: BORDER,
  },

  /* Dropdown */
  dropdown: {
    backgroundColor: "#1c1c28",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a38",
  },
  dropdownText: { color: "#ddd", fontSize: 13.5 },

  /* Send Code button — coral→orange gradient approximated */
  sendBtn: {
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
    // Approximated gradient: use a mid-salmon colour
    backgroundColor: "#ff7e5f",
    shadowColor: SALMON,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  sendBtnDisabled: { backgroundColor: "#444", shadowOpacity: 0 },
  sendBtnText: { color: "#fff", fontSize: 15.5, fontWeight: "700", letterSpacing: 0.3 },

  /* Divider */
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2a2a38" },
  dividerText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginHorizontal: 12,
  },

  /* Social */
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1,
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  socialBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  /* Legal footer */
  legalText: {
    color: MUTED,
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
  },
  legalLink: { color: SALMON, fontWeight: "600" },

  /* Register */
  registerRow: { marginTop: 14, paddingVertical: 6 },
  registerText: { color: MUTED, fontSize: 13, textAlign: "center" },
  registerHighlight: { color: SALMON, fontWeight: "700" },
});