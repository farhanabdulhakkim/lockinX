import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudyPlanScreen from '../screens/StudyPlan/StudyPlanScreen';
import FriendsScreen from '../screens/Friends/FriendsScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#333' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen name="Plan" component={StudyPlanScreen} />
      <Tab.Screen name="Circle" component={FriendsScreen} />
    </Tab.Navigator>
  );
}
