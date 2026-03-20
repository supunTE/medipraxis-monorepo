import { useAuth } from "@/auth/AuthContext";
import { ButtonComponent, ButtonSize } from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import { useRouter } from "expo-router";
import { SignOutIcon } from "phosphor-react-native";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsRowProps = {
  icon: keyof typeof Icons;
  label: string;
  onPress?: () => void;
};

const SETTINGS_ROWS: SettingsRowProps[] = [
  {
    icon: "FileText",
    label: "Form Configuration",
    onPress: undefined,
  },
  {
    icon: "Gear",
    label: "AI Assistant",
  },
  {
    icon: "Bell",
    label: "Notifications",
  },
  {
    icon: "CalendarBlank",
    label: "Reminders & Appointments",
  },
  {
    icon: "Info",
    label: "Help",
  },
];

const screenTitleStyle = textStyles[TextVariant.Title][TextSize.Large];
const sectionTitleStyle = textStyles[TextVariant.Title][TextSize.Medium];
const profileNameStyle = textStyles[TextVariant.Title][TextSize.Small];
const rowLabelStyle = textStyles[TextVariant.Body][TextSize.Large];
const roleTextStyle = textStyles[TextVariant.Body][TextSize.Medium];

function SettingsRow({ icon, label, onPress }: SettingsRowProps) {
  const Icon = Icons[icon];
  const ArrowIcon = Icons.CaretRight;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Color.LightCream,
        borderColor: "#E2D9C2",
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginTop: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Icon size={24} color={Color.Black} />
        <Text
          style={{
            color: Color.Black,
            fontSize: rowLabelStyle.fontSize,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      </View>
      <ArrowIcon size={24} color={Color.Grey} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName = user?.username || "User";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Color.White,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "android" ? 24 : 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <ButtonComponent.BackButton
            size={ButtonSize.Small}
            onPress={() => router.back()}
          />
          <ButtonComponent
            size={ButtonSize.Small}
            onPress={() => {
              void signOut();
            }}
            leftIcon={SignOutIcon}
            buttonColor={Color.Danger}
            textColor={Color.White}
            iconColor={Color.White}
            className="rounded-xl shadow-sm"
          >
            Logout
          </ButtonComponent>
        </View>

        <Text
          style={{
            color: Color.Black,
            fontSize: screenTitleStyle.fontSize,
            fontWeight: "700",
            marginBottom: 20,
          }}
        >
          Settings
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F7F7F7",
            borderColor: "#E3E3E3",
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginBottom: 26,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#CFCFCF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: Color.White, fontSize: 24, fontWeight: "700" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: Color.Black,
                  fontSize: profileNameStyle.fontSize,
                  fontWeight: "700",
                }}
              >
                {displayName}
              </Text>
              <Text
                style={{
                  color: Color.Grey,
                  fontSize: roleTextStyle.fontSize,
                }}
              >
                Healthcare Professional
              </Text>
            </View>
          </View>

          <Icons.CaretRight size={26} color={Color.Grey} />
        </View>

        <Text
          style={{
            color: Color.Black,
            fontSize: sectionTitleStyle.fontSize,
            fontWeight: "700",
          }}
        >
          App Settings
        </Text>

        {SETTINGS_ROWS.map((row) => (
          <SettingsRow
            key={row.label}
            icon={row.icon}
            label={row.label}
            onPress={
              row.label === "Form Configuration"
                ? () => router.push("/settings/form-setup-center")
                : row.onPress
            }
          />
        ))}
      </View>
    </View>
  );
}
