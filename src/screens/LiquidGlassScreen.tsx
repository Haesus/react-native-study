import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { OhangLiquidGlassView, type LiquidGlassStyle } from '../../modules/ohang-liquid-glass/src';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

const glassStyles: LiquidGlassStyle[] = ['regular', 'clear', 'prominent'];

export default function LiquidGlassScreen() {
  const [glassStyle, setGlassStyle] = useState<LiquidGlassStyle>('regular');
  const [interactive, setInteractive] = useState(true);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Expo Local Module / Swift</Text>
        <Text style={styles.title}>Liquid Glass 테스트</Text>
        <Text style={styles.description}>
          루트의 modules/ohang-liquid-glass에 있는 Swift 네이티브 View를 Expo autolinking으로
          연결해 렌더링합니다.
        </Text>
      </View>

      <View style={styles.liquidStage}>
        <View style={styles.liquidOrbA} />
        <View style={styles.liquidOrbB} />
        <View style={styles.liquidOrbC} />

        <View style={styles.liquidGlassCard}>
          <OhangLiquidGlassView
            glassStyle={glassStyle}
            interactive={interactive}
            tintColor="#8b5cf6"
            cornerRadius={28}
            style={styles.liquidGlassNativeLayer}
          />
          <View style={styles.liquidGlassContent}>
            <Text style={styles.liquidGlassTitle}>Native Swift Glass</Text>
            <Text style={styles.liquidGlassBody}>
              {Platform.OS === 'ios'
                ? 'iOS 26에서는 UIGlassEffect, 이전 버전에서는 UIBlurEffect fallback을 사용합니다.'
                : 'iOS 전용 네이티브 모듈이라 현재 플랫폼에서는 fallback View를 표시합니다.'}
            </Text>
            <Text style={styles.liquidGlassMeta}>
              style: {glassStyle} / interactive: {interactive ? 'on' : 'off'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>Glass Style</Text>
        <View style={styles.segmentRow}>
          {glassStyles.map((style) => (
            <Pressable
              key={style}
              style={({ pressed }) => [
                styles.segmentButton,
                glassStyle === style && styles.segmentButtonSelected,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setGlassStyle(style)}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  glassStyle === style && styles.segmentButtonTextSelected,
                ]}
              >
                {style}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>Interaction</Text>
        <Pressable
          style={({ pressed }) => [
            styles.demoListRow,
            interactive && styles.pickerOptionSelected,
            pressed && styles.postPressed,
          ]}
          onPress={() => setInteractive((current) => !current)}
        >
          <View>
            <Text style={styles.demoRowTitle}>interactive</Text>
            <Text style={styles.helper}>
              UIGlassEffect의 interactive 동작을 켜고 끕니다. iOS 26에서만 의미가 있습니다.
            </Text>
          </View>
          <Text style={styles.chevronText}>{interactive ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          Swift 코드는 modules/ohang-liquid-glass/ios에 있으며, 네이티브 코드 변경 후에는 dev
          build를 다시 만들어야 반영됩니다.
        </Text>
      </View>
    </Screen>
  );
}
