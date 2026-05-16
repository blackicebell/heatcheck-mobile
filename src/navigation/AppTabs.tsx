import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AudienceScreen } from "@/screens/AudienceScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { ReleasesScreen } from "@/screens/ReleasesScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { colors } from "@/theme";
import { AppTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<AppTabParamList>();

const icons: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "pulse",
  Insights: "analytics",
  Releases: "disc",
  Audience: "people",
  Profile: "person-circle",
  Settings: "settings",
};

function getTabIconName(routeName: keyof AppTabParamList, focused: boolean) {
  const icon = icons[routeName];

  return (focused ? icon : `${icon}-outline`) as keyof typeof Ionicons.glyphMap;
}

export function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + 10;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: bottomOffset,
          height: 84,
          paddingTop: 10,
          paddingBottom: 12,
          paddingHorizontal: 10,
          borderRadius: 30,
          backgroundColor: "rgba(17,19,24,0.92)",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.32,
          shadowRadius: 24,
          elevation: 14,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            name={getTabIconName(route.name, focused)}
            size={22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Releases" component={ReleasesScreen} />
      <Tab.Screen name="Audience" component={AudienceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
