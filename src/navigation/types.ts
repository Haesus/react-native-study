import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type RootStackParamList = {
  Home: undefined;
  Api: undefined;
  Detail: { post: Post };
  Device: undefined;
  PushToken: undefined;
  SocialLogin: undefined;
  UIKitViews: undefined;
  BiometricAuth: undefined;
  Gestures: undefined;
  Animation: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;
