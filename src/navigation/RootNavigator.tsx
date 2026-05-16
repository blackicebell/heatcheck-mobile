import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppTabs } from "@/navigation/AppTabs";
import { ArtistSetupScreen } from "@/screens/ArtistSetupScreen";
import { HeatScoreEducationScreen } from "@/screens/HeatScoreEducationScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { SplashScreen } from "@/screens/SplashScreen";
import { TrialPaywallScreen } from "@/screens/TrialPaywallScreen";
import { AuthStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 260,
        contentStyle: { backgroundColor: "#050608" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ArtistSetup" component={ArtistSetupScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="HeatScoreEducation" component={HeatScoreEducationScreen} />
      <Stack.Screen name="TrialPaywall" component={TrialPaywallScreen} />
    </Stack.Navigator>
  );
}
