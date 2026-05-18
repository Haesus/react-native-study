import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function GesturesScreen() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const [tapCount, setTapCount] = useState(0);

  const registerDoubleTap = useCallback(() => {
    setTapCount((currentCount) => currentCount + 1);
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      offsetX.value = savedX.value + event.translationX;
      offsetY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = offsetX.value;
      savedY.value = offsetY.value;
    });

  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      scale.value = withSpring(1.15);
      rotate.value = withTiming(rotate.value + 8, { duration: 180 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      runOnJS(registerDoubleTap)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
      { rotateZ: `${rotate.value}deg` },
    ],
  }));

  return (
    <Screen>
      <Text style={styles.screenTitle}>제스처</Text>
      <Text style={styles.description}>
        카드를 드래그하고, 두 번 탭해서 반응형 제스처와 UI thread 애니메이션을 확인합니다.
      </Text>

      <View style={styles.gestureStage}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.gestureCard, cardStyle]}>
            <Text style={styles.gestureTitle}>Drag me</Text>
            <Text style={styles.gestureHint}>Double tap: {tapCount}</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </Screen>
  );
}
