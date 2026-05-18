import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../styles/styles';

export default function Screen({ children, scroll = false }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.container}>{children}</View>
      )}
    </SafeAreaView>
  );
}
