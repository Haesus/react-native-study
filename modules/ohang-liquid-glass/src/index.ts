import { requireNativeViewManager } from 'expo-modules-core';
import { Platform, View } from 'react-native';
import type { ComponentType } from 'react';
import type { ViewProps } from 'react-native';

export type LiquidGlassStyle = 'clear' | 'regular' | 'prominent';

export type OhangLiquidGlassViewProps = ViewProps & {
  glassStyle?: LiquidGlassStyle;
  interactive?: boolean;
  tintColor?: string;
  cornerRadius?: number;
};

export const OhangLiquidGlassView: ComponentType<OhangLiquidGlassViewProps> =
  Platform.OS === 'ios'
    ? requireNativeViewManager<OhangLiquidGlassViewProps>('OhangLiquidGlass')
    : View;
