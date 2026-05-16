import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
} from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AnimatedView, AppText, Button, ScreenContainer, SectionHeader } from "@/components";
import googleLogo from "@/assets/brand/google-g.png";
import { needsArtistSetup } from "@/services/artistProfile";
import { auth } from "@/services/firebase";
import { colors, radii, spacing } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";
import { impactLight, notifySuccess } from "@/utils/haptics";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const googleWebClientId =
  "717353489884-58ran11gduia9jo59gbj0uunkjhaj3e4.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: googleWebClientId,
});

export function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signIn" | "create">("create");
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
    passwordsMatch;

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
        "auth-timeout",
      );

      notifySuccess();
      navigation.replace((await needsArtistSetup(result.user.uid)) ? "ArtistSetup" : "AppTabs");
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
      await withTimeout(sendPasswordResetEmail(auth, emailValue), "reset-timeout");
      setResetMessage("Password reset link sent. Check your inbox.");
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    if (loading) {
      return;
    }

    impactLight();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (response.type !== "success") {
        return;
      }

      const { idToken } = response.data;

      if (!idToken) {
        throw new Error("missing-google-token");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await withTimeout(signInWithCredential(auth, credential), "auth-timeout");

      notifySuccess();
      navigation.replace((await needsArtistSetup(result.user.uid)) ? "ArtistSetup" : "AppTabs");
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    impactLight();
    setError("");
    setResetMessage("");
    setMode(isCreatingAccount ? "signIn" : "create");
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
              title={isCreatingAccount ? "Create your account." : "Welcome back."}
              body={
                isCreatingAccount
                  ? "Create a secure account. We'll ask for your artist profile next."
                  : "Sign in to check your Heat Score, alerts, and listener movement."
              }
            />
          </AnimatedView>

          <AnimatedView delay={160} style={styles.form}>
            <Field label="Email">
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
            </Field>

            <Field label="Password">
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
                  <AppText variant="small">{showPassword ? "Hide" : "Show"}</AppText>
                </Pressable>
              </View>
              {isCreatingAccount && password ? (
                <View style={styles.rules}>
                  {passwordRules.map((rule) => {
                    const met = rule.test(password);

                    return (
                      <AppText
                        key={rule.label}
                        variant="small"
                        style={met ? styles.ruleMet : styles.ruleMuted}
                      >
                        {met ? "OK" : "-"} {rule.label}
                      </AppText>
                    );
                  })}
                </View>
              ) : null}
            </Field>

            {isCreatingAccount ? (
              <Field label="Confirm password">
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
              </Field>
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
          </AnimatedView>
        </View>

        <View style={styles.actions}>
          <Button disabled={!canContinue} loading={loading} onPress={continueWithAccount}>
            {isCreatingAccount ? "Create account" : "Sign in"}
          </Button>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <AppText variant="tiny" muted>
              or
            </AppText>
            <View style={styles.divider} />
          </View>
          <GoogleButton loading={loading} onPress={continueWithGoogle} />
          <Button variant="text" onPress={toggleMode}>
            {isCreatingAccount ? "I already have an account" : "Create a new account"}
          </Button>
          {!isCreatingAccount ? (
            <Button variant="text" onPress={sendResetEmail}>
              Forgot password?
            </Button>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="tiny" muted>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function GoogleButton({ loading, onPress }: { loading?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.googleButton,
        loading ? styles.googleButtonDisabled : undefined,
        pressed && !loading ? styles.pressed : undefined,
      ]}
    >
      <Image source={googleLogo} style={styles.googleLogo} />
      <AppText variant="body" style={styles.googleLabel}>
        Continue with Google
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
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
    minHeight: 50,
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
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  showButton: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rules: {
    gap: 4,
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
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  googleButton: {
    minHeight: 56,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  googleButtonDisabled: {
    opacity: 0.55,
  },
  googleLogo: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  googleLabel: {
    color: colors.black,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
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

function withTimeout<T>(promise: Promise<T>, timeoutCode = "request-timeout") {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutCode));
      }, 25000);
    }),
  ]);
}

function getAuthMessage(error: unknown) {
  if (error instanceof Error && error.message === "auth-timeout") {
    return "Firebase is taking longer than expected to sign you in. Check your connection and try again.";
  }

  if (error instanceof Error && error.message === "reset-timeout") {
    return "Password reset is taking longer than expected. Check your connection and try again.";
  }

  if (error instanceof Error && error.message === "missing-google-token") {
    return "Google did not return a sign-in token. Try again in a moment.";
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return "";
  }

  if (code === statusCodes.IN_PROGRESS) {
    return "Google sign-in is already open.";
  }

  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return "Google Play Services needs to be updated before Google sign-in can work.";
  }

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
