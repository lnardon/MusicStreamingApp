import React from "react";
import { Tabs } from "expo-router";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={focused ? "#ffd000" : "#777777"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "search" : "search-outline"}
              color={focused ? "#ffd000" : "#777777"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "play" : "play-outline"}
              color={focused ? "#ffd000" : "#777777"}
              // style={{ backgroundColor: "red", width: "100%", height: "100%" }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "bar-chart" : "bar-chart-outline"}
              color={focused ? "#ffd000" : "#777777"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={focused ? "#ffd000" : "#777777"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
