import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function AnimationScreen() {
  const width = useSharedValue(112);
  const opacity = useSharedValue(1);
  const [expanded, setExpanded] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    width: width.value,
  }));

  const toggleAnimation = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    width.value = withSpring(nextExpanded ? 250 : 112);
    opacity.value = withTiming(nextExpanded ? 0.72 : 1, { duration: 260 });
  };

  return (
    <Screen>
      <Text style={styles.screenTitle}>애니메이션</Text>
      <Text style={styles.description}>
        Reanimated shared value와 spring/timing 전환을 눌러서 확인합니다.
      </Text>

      <View style={styles.animationStage}>
        <Animated.View style={[styles.animatedBlock, animatedStyle]}>
          <Text style={styles.animatedText}>{expanded ? 'Expanded' : 'Ready'}</Text>
        </Animated.View>
        <PrimaryButton onPress={toggleAnimation}>토글</PrimaryButton>
      </View>
    </Screen>
  );
}
