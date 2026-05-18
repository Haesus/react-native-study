import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AnimationScreen from '../screens/AnimationScreen';
import ApiScreen from '../screens/ApiScreen';
import DetailScreen from '../screens/DetailScreen';
import DeviceScreen from '../screens/DeviceScreen';
import GesturesScreen from '../screens/GesturesScreen';
import HomeScreen from '../screens/HomeScreen';
import { styles } from '../styles/styles';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
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
