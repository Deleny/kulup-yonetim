import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import KuluplerimScreen from '../screens/KuluplerimScreen';
import EtkinliklerScreen from '../screens/EtkinliklerScreen';
import GorevlerimScreen from '../screens/GorevlerimScreen';
import AidatlarimScreen from '../screens/AidatlarimScreen';
import ProfilScreen from '../screens/ProfilScreen';

// Baskan Screens
import BaskanPanelScreen from '../screens/BaskanPanelScreen';
import UyeYonetimScreen from '../screens/UyeYonetimScreen';
import EtkinlikYonetimScreen from '../screens/EtkinlikYonetimScreen';
import GorevYonetimScreen from '../screens/GorevYonetimScreen';
import AidatYonetimScreen from '../screens/AidatYonetimScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.gray100,
                    height: 60 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: insets.bottom + 8,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray400,
                tabBarLabelStyle: styles.tabLabel,
                headerStyle: styles.header,
                headerTintColor: COLORS.white,
                headerTitleStyle: styles.headerTitle,
                headerShadowVisible: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Kuluplerim') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Etkinlikler') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Gorevlerim') {
                        iconName = focused ? 'checkbox' : 'checkbox-outline';
                    } else if (route.name === 'Profil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Kuluplerim"
                component={KuluplerimScreen}
                options={{ headerTitle: 'Kulüplerim', tabBarLabel: 'Kulüpler' }}
            />
            <Tab.Screen
                name="Etkinlikler"
                component={EtkinliklerScreen}
                options={{ headerTitle: 'Etkinlikler', tabBarLabel: 'Etkinlik' }}
            />
            <Tab.Screen
                name="Gorevlerim"
                component={GorevlerimScreen}
                options={{ headerTitle: 'Görevlerim', tabBarLabel: 'Görevler' }}
            />
            <Tab.Screen
                name="Profil"
                component={ProfilScreen}
                options={{ headerTitle: 'Hesabım', tabBarLabel: 'Hesap' }}
            />
        </Tab.Navigator>
    );
}

// Baskan Tab Navigator
function BaskanTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.gray100,
                    height: 60 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: insets.bottom + 8,
                },
                tabBarActiveTintColor: '#d97706',
                tabBarInactiveTintColor: COLORS.gray400,
                tabBarLabelStyle: styles.tabLabel,
                headerStyle: { backgroundColor: '#d97706', elevation: 0, shadowOpacity: 0 },
                headerTintColor: COLORS.white,
                headerTitleStyle: styles.headerTitle,
                headerShadowVisible: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'BaskanPanel') {
                        iconName = focused ? 'shield' : 'shield-outline';
                    } else if (route.name === 'UyeYonetim') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'EtkinlikYonetim') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'GorevYonetim') {
                        iconName = focused ? 'checkbox' : 'checkbox-outline';
                    }
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="BaskanPanel"
                component={BaskanPanelScreen}
                options={{ headerTitle: 'Başkan Paneli', tabBarLabel: 'Panel' }}
            />
            <Tab.Screen
                name="UyeYonetim"
                component={UyeYonetimScreen}
                options={{ headerTitle: 'Üye Yönetimi', tabBarLabel: 'Üyeler' }}
            />
            <Tab.Screen
                name="EtkinlikYonetim"
                component={EtkinlikYonetimScreen}
                options={{ headerTitle: 'Etkinlik Yönetimi', tabBarLabel: 'Etkinlik' }}
            />
            <Tab.Screen
                name="GorevYonetim"
                component={GorevYonetimScreen}
                options={{ headerTitle: 'Görev Yönetimi', tabBarLabel: 'Görev' }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="BaskanMain" component={BaskanTabs} />
                <Stack.Screen 
                    name="Aidatlarim" 
                    component={AidatlarimScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Aidatlarım',
                        headerStyle: styles.header,
                        headerTintColor: COLORS.white,
                        headerTitleStyle: styles.headerTitle,
                    }}
                />
                <Stack.Screen 
                    name="AidatYonetim" 
                    component={AidatYonetimScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Aidat Yönetimi',
                        headerStyle: { backgroundColor: '#d97706' },
                        headerTintColor: COLORS.white,
                        headerTitleStyle: styles.headerTitle,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabLabel: {
        fontSize: 11,
        fontWeight: FONTS.medium,
        marginTop: 2,
    },
    header: {
        backgroundColor: COLORS.primary,
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTitle: {
        fontWeight: FONTS.semibold,
        fontSize: SIZES.fontLg,
    },
});
