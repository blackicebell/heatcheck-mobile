import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Card,
  ScreenContainer,
  SectionHeader,
  StaggeredList,
} from "@/components";
import { heatScoreEducation } from "@/data/productContent";
import { colors } from "@/theme";
import { AuthStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "HeatScoreEducation">;

export function HeatScoreEducationScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
      </View>
      <SectionHeader
        eyebrow="No mystery math"
        title="How Heat Score works"
        body="Heat Score is a simple read on whether your music is gaining listener movement across the places you connect."
      />
      <StaggeredList
        data={heatScoreEducation}
        keyExtractor={(item) => item.title}
        renderItem={(item) => (
          <Card>
            <AppText variant="h2">{item.title}</AppText>
            <AppText muted>{item.body}</AppText>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 48,
    justifyContent: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
