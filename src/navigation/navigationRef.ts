import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

const validRoutes = new Set<keyof RootStackParamList>([
  'Home',
  'Api',
  'Device',
  'PushToken',
  'SocialLogin',
  'UIKitViews',
  'LiquidGlass',
  'BiometricAuth',
  'Gestures',
  'Animation',
]);

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateFromNotification(data: Record<string, unknown> = {}) {
  const screen = typeof data.screen === 'string' ? data.screen : 'PushToken';
  const params = typeof data.params === 'object' && data.params !== null ? data.params : undefined;

  if (!validRoutes.has(screen as keyof RootStackParamList) || !navigationRef.isReady()) {
    return false;
  }

  (navigationRef.navigate as (...args: unknown[]) => void)(screen, params);
  return true;
}
