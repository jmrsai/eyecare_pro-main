import { Tabs } from 'expo-router';
import { Home, User, Settings, Gamepad2, CheckCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkup"
        options={{
          title: 'Check-up',
          tabBarIcon: ({ color }) => <CheckCircle color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
      <Tabs.Screen
        name="kids"
        options={{
          title: 'Kids Zone',
          tabBarIcon: ({ color }) => <Gamepad2 color={color} />,
        }}
      />
    </Tabs>
  );
}
