import { Tabs } from 'expo-router'
import React from 'react'

import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          borderTopColor: Colors[colorScheme ?? 'light'].muted,
          backgroundColor: Colors[colorScheme ?? 'light'].muted,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connector"
        options={{
          title: 'Connector',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'link' : 'link-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Data',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'server' : 'server-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
