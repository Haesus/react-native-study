import { createNavigationContainerRef } from '@react-navigation/native';

const validRoutes = new Set([
  'Home',
  'Api',
  'Device',
  'PushToken',
  'SocialLogin',
  'Gestures',
  'Animation',
]);

export const navigationRef = createNavigationContainerRef();

export function navigateFromNotification(data = {}) {
  const screen = typeof data.screen === 'string' ? data.screen : 'PushToken';
  const params = typeof data.params === 'object' && data.params !== null ? data.params : undefined;

  if (!validRoutes.has(screen) || !navigationRef.isReady()) {
    return false;
  }

  navigationRef.navigate(screen, params);
  return true;
}
