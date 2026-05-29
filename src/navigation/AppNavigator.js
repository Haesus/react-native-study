import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AnimationScreen from '../screens/AnimationScreen';
import ApiScreen from '../screens/ApiScreen';
import DetailScreen from '../screens/DetailScreen';
import DeviceScreen from '../screens/DeviceScreen';
import GesturesScreen from '../screens/GesturesScreen';
import HomeScreen from '../screens/HomeScreen';
import PushTokenScreen from '../screens/PushTokenScreen';
import SocialLoginScreen from '../screens/SocialLoginScreen';
import UIKitViewsScreen from '../screens/UIKitViewsScreen';
import { styles } from '../styles/styles';
import { navigateFromNotification, navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;

    if (!navigateFromNotification(data)) {
      setTimeout(() => navigateFromNotification(data), 300);
    }
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            screenOptions={{
              contentStyle: styles.navigatorContent,
              headerStyle: styles.navigatorHeader,
              headerTintColor: '#f8fafc',
              headerTitleStyle: styles.navigatorTitle,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RN 테스트' }} />
            <Stack.Screen name="Api" component={ApiScreen} options={{ title: 'API' }} />
            <Stack.Screen name="Detail" component={DetailScreen} options={{ title: '상세' }} />
            <Stack.Screen name="Device" component={DeviceScreen} options={{ title: '기기 기능' }} />
            <Stack.Screen
              name="PushToken"
              component={PushTokenScreen}
              options={{ title: '푸시 토큰' }}
            />
            <Stack.Screen
              name="SocialLogin"
              component={SocialLoginScreen}
              options={{ title: '소셜 로그인' }}
            />
            <Stack.Screen
              name="UIKitViews"
              component={UIKitViewsScreen}
              options={{ title: 'RN 뷰 테스트' }}
            />
            <Stack.Screen name="Gestures" component={GesturesScreen} options={{ title: '제스처' }} />
            <Stack.Screen
              name="Animation"
              component={AnimationScreen}
              options={{ title: '애니메이션' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
