import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các màn hình trong ứng dụng
import CourseListScreen from './src/screens/CourseListScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import CourseFormScreen from './src/screens/CourseFormScreen';
import CategoryManagementScreen from './src/screens/CategoryManagementScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="CourseList"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="CourseList" component={CourseListScreen} />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="CourseForm" component={CourseFormScreen} />
        <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}