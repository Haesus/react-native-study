import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

const authenticationTypeLabels = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'Fingerprint / Touch ID',
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'Face ID / 얼굴 인식',
  [LocalAuthentication.AuthenticationType.IRIS]: 'Iris / 홍채',
};

const securityLevelLabels = {
  [LocalAuthentication.SecurityLevel.NONE]: 'NONE',
  [LocalAuthentication.SecurityLevel.SECRET]: 'SECRET',
  [LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK]: 'BIOMETRIC_WEAK',
  [LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG]: 'BIOMETRIC_STRONG',
};

function formatAuthenticationTypes(types) {
  if (!types.length) {
    return '지원 타입 없음';
  }

  return types.map((type) => authenticationTypeLabels[type] || `Unknown(${type})`).join(', ');
}

export default function BiometricAuthScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(LocalAuthentication.SecurityLevel.NONE);
  const [authenticationTypes, setAuthenticationTypes] = useState([]);
  const [disableDeviceFallback, setDisableDeviceFallback] = useState(false);
  const [result, setResult] = useState(null);

  const loadBiometricState = useCallback(async () => {
    setIsLoading(true);

    try {
      const [nextHasHardware, nextIsEnrolled, nextSecurityLevel, nextTypes] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);

      setHasHardware(nextHasHardware);
      setIsEnrolled(nextIsEnrolled);
      setSecurityLevel(nextSecurityLevel);
      setAuthenticationTypes(nextTypes);
    } catch (error) {
      setResult({
        success: false,
        error: 'state_check_failed',
        warning: error.message || '생체 인증 상태 확인에 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBiometricState();
  }, [loadBiometricState]);

  const authenticate = async () => {
    setResult(null);

    const authenticationResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Face ID로 본인 인증',
      fallbackLabel: '암호 사용',
      cancelLabel: '취소',
      disableDeviceFallback,
    });

    setResult(authenticationResult);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Local Authentication</Text>
        <Text style={styles.title}>Face ID 인증 테스트</Text>
        <Text style={styles.description}>
          expo-local-authentication으로 iOS Face ID/Touch ID 또는 기기 암호 fallback 인증을
          호출합니다.
        </Text>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>기기 상태</Text>
        {isLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.helper}>생체 인증 상태 확인 중</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>하드웨어</Text>
              <Text style={styles.infoValue}>{hasHardware ? '있음' : '없음'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>등록 상태</Text>
              <Text style={styles.infoValue}>{isEnrolled ? '등록됨' : '미등록'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>보안 레벨</Text>
              <Text style={styles.infoValue}>{securityLevelLabels[securityLevel]}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>지원 인증 타입</Text>
              <Text style={styles.resultText}>{formatAuthenticationTypes(authenticationTypes)}</Text>
            </View>
          </>
        )}
        <PrimaryButton onPress={loadBiometricState}>상태 새로고침</PrimaryButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>인증 실행</Text>
        <View style={styles.formRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>기기 암호 fallback 비활성화</Text>
            <Text style={styles.helper}>
              {disableDeviceFallback ? '생체 인증만 허용' : '실패 시 기기 암호 허용'}
            </Text>
          </View>
          <Switch value={disableDeviceFallback} onValueChange={setDisableDeviceFallback} />
        </View>
        <PrimaryButton onPress={authenticate}>Face ID 인증 요청</PrimaryButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>결과</Text>
        {result ? (
          <View style={result.success ? styles.successBox : styles.errorBox}>
            <Text style={result.success ? styles.successText : styles.errorText}>
              {result.success ? '인증 성공' : `인증 실패: ${result.error}`}
            </Text>
            {result.warning ? <Text style={styles.resultText}>{result.warning}</Text> : null}
          </View>
        ) : (
          <Text style={styles.resultText}>아직 인증을 실행하지 않았습니다.</Text>
        )}
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          Face ID는 Expo Go에서 테스트할 수 없고 dev build가 필요합니다. iOS에서는
          NSFaceIDUsageDescription 문구가 앱 바이너리에 들어가야 하므로 설정 변경 후 재빌드해야
          합니다.
        </Text>
      </View>
    </Screen>
  );
}
