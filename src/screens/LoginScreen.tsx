import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import {
  AnimatedView,
  AppText,
  Button,
  Card,
  ScreenContainer,
  SectionHeader,
} from "@/components";
import { colors, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";
import { auth, db } from "@/services/firebase";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signIn" | "create">("create");
  const [artistName, setArtistName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isCreatingAccount = mode === "create";
  const passwordIssues = getPasswordIssues(password);
  const passwordsMatch = !isCreatingAccount || password === confirmPassword;
  const canContinue =
    email.trim().length > 0 &&
    passwordIssues.length === 0 &&
    passwordsMatch &&
    (!isCreatingAccount || artistName.trim().length > 0);

  async function continueWithAccount() {
    if (!canContinue || loading) {
      return;
    }

    impactLight();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      const emailValue = email.trim();
      const result = await withTimeout(
        isCreatingAccount
          ? createUserWithEmailAndPassword(auth, emailValue, password)
          : signInWithEmailAndPassword(auth, emailValue, password),
      );

      if (isCreatingAccount) {
        const displayName = artistName.trim();

        await updateProfile(result.user, { displayName });
        saveUserProfile(result.user.uid, displayName, emailValue);
      }

      notifySuccess();
      navigation.replace("AppTabs");
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  async function sendResetEmail() {
    const emailValue = email.trim();

    if (!emailValue) {
      setError("Enter your email first, then we can send a reset link.");
      return;
    }

    impactLight();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await withTimeout(sendPasswordResetEmail(auth, emailValue));
      setResetMessage("Password reset link sent. Check your inbox.");
    } catch (authError) {
      setError(getAuthMessage(authError));
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
              title={isCreatingAccount ? "Create your HeatRadar account." : "Welcome back."}
              body={
                isCreatingAccount
                  ? "Start with the basics. You can connect your music platforms after your account is ready."
                  : "Sign in to check your Heat Score, alerts, and latest listener movement."
              }
            />
          </AnimatedView>
          <AnimatedView delay={180}>
            <Card elevated>
              {isCreatingAccount ? (
                <View style={styles.field}>
                  <AppText variant="tiny" muted>
                    Artist name
                  </AppText>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setArtistName}
                    placeholder="Maya Vale"
                    placeholderTextColor={colors.textSubtle}
                    returnKeyType="next"
                    style={styles.input}
                    value={artistName}
                  />
                </View>
              ) : null}
              <View style={styles.field}>
                <AppText variant="tiny" muted>
                  Email
                </AppText>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="next"
                  style={styles.input}
                  textContentType="emailAddress"
                  value={email}
                />
              </View>
              <View style={styles.field}>
                <AppText variant="tiny" muted>
                  Password
                </AppText>
                <View style={styles.passwordRow}>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.textSubtle}
                    returnKeyType={isCreatingAccount ? "next" : "done"}
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    textContentType={isCreatingAccount ? "newPassword" : "password"}
                    value={password}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowPassword((value) => !value)}
                    style={styles.showButton}
                  >
                    <AppText variant="small">
                      {showPassword ? "Hide" : "Show"}
                    </AppText>
                  </Pressable>
                </View>
                {isCreatingAccount ? (
                  <View style={styles.rules}>
                    {passwordRules.map((rule) => {
                      const met = rule.test(password);

                      return (
                        <AppText
                          key={rule.label}
                          variant="small"
                          style={met ? styles.ruleMet : styles.ruleMuted}
                        >
                          {met ? "✓" : "•"} {rule.label}
                        </AppText>
                      );
                    })}
                  </View>
                ) : null}
              </View>
              {isCreatingAccount ? (
                <View style={styles.field}>
                  <AppText variant="tiny" muted>
                    Confirm password
                  </AppText>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.textSubtle}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    style={[
                      styles.input,
                      confirmPassword && !passwordsMatch ? styles.inputError : undefined,
                    ]}
                    textContentType="newPassword"
                    value={confirmPassword}
                  />
                  {confirmPassword && !passwordsMatch ? (
                    <AppText variant="small" style={styles.error}>
                      Passwords do not match yet.
                    </AppText>
                  ) : null}
                </View>
              ) : null}
              {error ? (
                <AppText variant="small" style={styles.error}>
                  {error}
                </AppText>
              ) : null}
              {resetMessage ? (
                <AppText variant="small" style={styles.success}>
                  {resetMessage}
                </AppText>
              ) : null}
            </Card>
          </AnimatedView>
        </View>
        <View style={styles.actions}>
          <Button disabled={!canContinue} loading={loading} onPress={continueWithAccount}>
            {isCreatingAccount ? "Create account" : "Sign in"}
          </Button>
          <Button
            variant="ghost"
            onPress={() => {
              impactLight();
              setError("");
              setResetMessage("");
              setMode(isCreatingAccount ? "signIn" : "create");
            }}
          >
            {isCreatingAccount ? "I already have an account" : "Create a new account"}
          </Button>
          {!isCreatingAccount ? (
            <Button variant="ghost" onPress={sendResetEmail}>
              Forgot password?
            </Button>
          ) : null}
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
    gap: spacing.xl,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    fontSize: 16,
    fontWeight: "600",
  },
  passwordRow: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
  },
  passwordInput: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  showButton: {
    minHeight: 54,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rules: {
    gap: spacing.xs,
  },
  ruleMet: {
    color: colors.green,
  },
  ruleMuted: {
    color: colors.textSubtle,
  },
  inputError: {
    borderColor: colors.red,
  },
  error: {
    color: colors.red,
  },
  success: {
    color: colors.green,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});

const passwordRules = [
  {
    label: "8 or more characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
] as const;

function getPasswordIssues(password: string) {
  return passwordRules.filter((rule) => !rule.test(password));
}

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error("auth-timeout"));
      }, 12000);
    }),
  ]);
}

function saveUserProfile(userId: string, artistName: string, email: string) {
  withTimeout(
    setDoc(
      doc(db, "users", userId),
      {
        artistName,
        createdAt: serverTimestamp(),
        email,
        plan: "free",
      },
      { merge: true },
    ),
  ).catch(() => undefined);
}

function getAuthMessage(error: unknown) {
  if (error instanceof Error && error.message === "auth-timeout") {
    return "Firebase is taking too long to respond. Check that Email/Password sign-in is enabled, then try again.";
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  if (code.includes("email-already-in-use")) {
    return "That email already has an account. Try signing in instead.";
  }

  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "That email or password does not look right.";
  }

  if (code.includes("user-not-found")) {
    return "No account found for that email yet.";
  }

  if (code.includes("network-request-failed")) {
    return "Network connection dropped. Try again in a moment.";
  }

  return "Something got stuck. Try again in a moment.";
}
