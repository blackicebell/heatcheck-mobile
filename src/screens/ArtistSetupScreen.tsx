import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from "react-native";

import { AnimatedView, AppText, Button, ScreenContainer, SectionHeader } from "@/components";
import { auth, db } from "@/services/firebase";
import { colors, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "ArtistSetup">;

const artistProfileStorageKey = "heatradar.artistProfile";

export function ArtistSetupScreen({ navigation }: Props) {
  const [artistName, setArtistName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canContinue = artistName.trim().length >= 2;

  async function saveProfile() {
    const user = auth.currentUser;

    if (!user || !canContinue || loading) {
      return;
    }

    impactLight();
    setError("");
    setLoading(true);

    try {
      const displayName = artistName.trim();

      await AsyncStorage.setItem(
        artistProfileStorageKey,
        JSON.stringify({
          artistName: displayName,
          email: user.email,
          userId: user.uid,
        }),
      );

      const profileSave = Promise.all([
        withTimeout(updateProfile(user, { displayName }), 8000),
        withTimeout(
          setDoc(
            doc(db, "users", user.uid),
            {
              artistName: displayName,
              createdAt: serverTimestamp(),
              email: user.email,
              plan: "free",
            },
            { merge: true },
          ),
          8000,
        ),
      ]);

      notifySuccess();
      navigation.replace("AppTabs");

      profileSave.catch(() => {
        // The local profile is enough to keep onboarding moving. Firebase can be retried later.
      });
    } catch {
      setError("We could not save your artist profile yet. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <AnimatedView delay={80}>
            <SectionHeader
              title="What should we call you?"
              body="Use your artist name or stage name. This shows up across your dashboard, alerts, and share cards."
            />
          </AnimatedView>
          <AnimatedView delay={160} style={styles.form}>
            <View style={styles.field}>
              <AppText variant="tiny" muted>
                Artist or stage name
              </AppText>
              <TextInput
                autoCapitalize="words"
                autoFocus
                onChangeText={setArtistName}
                placeholder="Maya Vale"
                placeholderTextColor={colors.textSubtle}
                returnKeyType="done"
                style={styles.input}
                value={artistName}
              />
            </View>
            {error ? (
              <AppText variant="small" style={styles.error}>
                {error}
              </AppText>
            ) : null}
          </AnimatedView>
        </View>
        <View style={styles.actions}>
          <Button disabled={!canContinue} loading={loading} onPress={saveProfile}>
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
  },
  form: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: colors.red,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error("profile-save-timeout"));
      }, timeoutMs);
    }),
  ]);
}
