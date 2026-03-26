import { Tabs } from 'expo-router';
import { LucideZap, LucideDumbbell, LucideUser } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0A0A0A',
        borderTopWidth: 0,
        height: 90,
        paddingBottom: 20,
        elevation: 0,
      },
      tabBarActiveTintColor: '#8B5CF6',
      tabBarInactiveTintColor: '#666',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LucideZap color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Séance',
          tabBarIcon: ({ color }) => <LucideDumbbell color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <LucideUser color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
