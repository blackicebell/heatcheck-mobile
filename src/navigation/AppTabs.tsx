import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          position: "absolute",
          height: 72,
          paddingTop: 7,
          paddingBottom: 10,
          paddingHorizontal: 8,
          marginHorizontal: 14,
          marginBottom: 26,
          borderRadius: 26,
          backgroundColor: "rgba(17,19,24,0.96)",
          borderColor: colors.border,
          borderWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
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
