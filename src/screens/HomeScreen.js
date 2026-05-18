import { useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function HomeScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isColumnLayout, setIsColumnLayout] = useState(false);

  const displayName = name.trim() || 'React Native';
  const counterLayoutStyle = isColumnLayout ? styles.column : styles.row;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Expo RN 샘플</Text>
        <Text style={styles.title}>안녕, {displayName}</Text>
        <Text style={styles.description}>
          API 호출, 제스처, 애니메이션, 내비게이션을 한 앱에서 빠르게 확인합니다.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>표시할 이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요!"
          placeholderTextColor="#8a96a8"
        />

        <View style={styles.layoutToggleRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>카운터 배치</Text>
            <Text style={styles.helper}>{isColumnLayout ? 'Column' : 'Row'}</Text>
          </View>
          <Switch value={isColumnLayout} onValueChange={setIsColumnLayout} />
        </View>

        <View style={counterLayoutStyle}>
          <View>
            <Text style={styles.label}>카운터</Text>
            <Text style={styles.count}>{count}</Text>
          </View>
          <PrimaryButton onPress={() => setCount((currentCount) => currentCount + 1)}>
            +1
          </PrimaryButton>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>테스트 모드</Text>
            <Text style={styles.helper}>{isEnabled ? '활성화됨' : '비활성화됨'}</Text>
          </View>
          <Switch value={isEnabled} onValueChange={setIsEnabled} />
        </View>

        <View style={styles.navGrid}>
          <PrimaryButton onPress={() => navigation.navigate('Api')}>API</PrimaryButton>
          <PrimaryButton onPress={() => navigation.navigate('Device')}>기기 기능</PrimaryButton>
          <PrimaryButton onPress={() => navigation.navigate('PushToken')}>푸시 토큰</PrimaryButton>
          <PrimaryButton onPress={() => navigation.navigate('Gestures')}>제스처</PrimaryButton>
          <PrimaryButton onPress={() => navigation.navigate('Animation')}>애니메이션</PrimaryButton>
        </View>
      </View>
    </Screen>
  );
}
