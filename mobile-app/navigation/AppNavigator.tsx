import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    HomeScreen,
    CameraScreen,
    ProcessingScreen,
    ResultsScreen,
} from '../screens';
import { theme } from '../styles';

export type RootStackParamList = {
    Home: undefined;
    Camera: undefined;
    Processing: undefined;
    Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                    name="Camera"
                    component={CameraScreen}
                    options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                    name="Processing"
                    component={ProcessingScreen}
                    options={{ animation: 'fade', gestureEnabled: false }}
                />
                <Stack.Screen
                    name="Results"
                    component={ResultsScreen}
                    options={{ animation: 'fade', gestureEnabled: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
