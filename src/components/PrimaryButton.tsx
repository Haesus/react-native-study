import type { PropsWithChildren } from 'react';
import { Pressable, Text } from 'react-native';
import type { PressableProps } from 'react-native';

import { styles } from '../styles/styles';

type PrimaryButtonProps = PropsWithChildren<{
  onPress?: PressableProps['onPress'];
}>;

export default function PrimaryButton({ children, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}
