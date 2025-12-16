import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayScreen } from '../screens/PlayScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10B981', // Tennis green
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 25,
          paddingTop: 8,
          height: 85,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          headerTitle: 'My Matches',
        }}
      />
      <Tab.Screen 
        name="Play" 
        component={PlayScreen}
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ color, size }) => (
            <Icon name="tennis" size={size} color={color} />
          ),
          headerTitle: 'Play',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={({ navigation }) => ({
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
          headerTitle: 'Profile',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile' as never)}
              >
                <Icon name="pencil" size={24} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings' as never)}
              >
                <Icon name="cog" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

