import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function PushTokenScreen() {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [iosPermissionStatus, setIosPermissionStatus] = useState('unknown');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [nativeTokenType, setNativeTokenType] = useState('');
  const [nativePushToken, setNativePushToken] = useState('');
  const [message, setMessage] = useState('알림 권한을 요청한 뒤 푸시 토큰을 확인하세요.');
  const [lastNotificationData, setLastNotificationData] = useState('');

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const curlExample = useMemo(() => {
    const token = expoPushToken || 'ExpoPushToken[여기에_화면의_토큰을_넣으세요]';

    return `curl -X POST https://exp.host/--/api/v2/push/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${token}",
    "sound": "default",
    "title": "Expo 푸시 테스트",
    "body": "curl로 보낸 테스트 알림입니다.",
    "data": {
      "screen": "PushToken",
      "source": "curl"
    }
  }'`;
  }, [expoPushToken]);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;

      setLastNotificationData(JSON.stringify(data, null, 2));
      setMessage('푸시 알림을 수신했습니다.');
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      setLastNotificationData(JSON.stringify(data, null, 2));
      setMessage('푸시 알림을 탭했습니다.');
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const openNotificationSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      setMessage('설정 앱을 열 수 없습니다. iOS 설정에서 알림 권한을 직접 변경하세요.');
    }
  };

  const showSettingsAlert = () => {
    setMessage('알림 권한은 iOS 설정에서 직접 허용해야 합니다.');

    Alert.alert(
      '알림 권한이 필요합니다',
      '푸시 토큰을 확인하려면 iOS 설정에서 알림 권한을 허용해야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: openNotificationSettings },
      ],
    );
  };

  const updatePermissionState = (permission) => {
    setPermissionStatus(permission.status);
    setIosPermissionStatus(permission.ios?.status ?? 'unknown');
  };

  const requestNotificationPermission = async () => {
    const currentPermission = await Notifications.getPermissionsAsync();
    updatePermissionState(currentPermission);

    if (currentPermission.granted) {
      setMessage('알림 권한이 이미 허용되어 있습니다.');
      Alert.alert('권한 확인', '알림 권한이 이미 허용되어 있습니다.');
      return true;
    }

    if (currentPermission.status === 'denied' && !currentPermission.canAskAgain) {
      showSettingsAlert();
      return false;
    }

    setMessage('알림 권한을 요청하는 중입니다.');
    const requestedPermission = await Notifications.requestPermissionsAsync();
    updatePermissionState(requestedPermission);

    if (!requestedPermission.granted) {
      if (requestedPermission.canAskAgain === false) {
        showSettingsAlert();
      } else {
        setMessage('알림 권한이 거부되었습니다.');
      }
      return false;
    }

    setMessage('알림 권한이 허용되었습니다.');
    return true;
  };

  const loadPushTokens = async () => {
    if (!(await requestNotificationPermission())) {
      return;
    }

    if (!projectId) {
      setMessage('EAS projectId를 찾을 수 없어 Expo Push Token을 발급할 수 없습니다.');
      return;
    }

    setMessage('푸시 토큰을 가져오는 중입니다.');

    try {
      const [nextExpoToken, nextNativeToken] = await Promise.all([
        Notifications.getExpoPushTokenAsync({ projectId }),
        Notifications.getDevicePushTokenAsync(),
      ]);

      setExpoPushToken(nextExpoToken.data);
      setNativeTokenType(nextNativeToken.type);
      setNativePushToken(nextNativeToken.data);
      setMessage('푸시 토큰을 가져왔습니다.');
    } catch (error) {
      setMessage(`푸시 토큰을 가져오지 못했습니다: ${error.message}`);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.screenTitle}>푸시 토큰</Text>
      <Text style={styles.description}>
        Expo Push Service용 토큰과 APNs/FCM native device token을 비교해서 확인합니다.
      </Text>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>권한 상태</Text>
        <Text style={styles.resultText}>status: {permissionStatus}</Text>
        <Text style={styles.resultText}>iOS status: {iosPermissionStatus}</Text>
        <PrimaryButton onPress={requestNotificationPermission}>알림 권한 요청</PrimaryButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>토큰 발급</Text>
        <Text style={styles.resultText}>projectId: {projectId || '없음'}</Text>
        <PrimaryButton onPress={loadPushTokens}>푸시 토큰 가져오기</PrimaryButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>Expo Push Token</Text>
        <Text style={styles.helper}>서버가 Expo Push Service로 보낼 때 사용하는 토큰입니다.</Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.tokenText}>
            {expoPushToken || '아직 발급되지 않았습니다.'}
          </Text>
        </View>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>curl 테스트</Text>
        <Text style={styles.helper}>
          Expo Push Token을 발급한 뒤 아래 명령을 터미널에서 실행하면 이 기기로 테스트 푸시가
          전송됩니다.
        </Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.codeText}>
            {curlExample}
          </Text>
        </View>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>마지막 알림 데이터</Text>
        <Text style={styles.helper}>수신하거나 탭한 푸시의 data payload를 표시합니다.</Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.codeText}>
            {lastNotificationData || '아직 수신한 푸시 data가 없습니다.'}
          </Text>
        </View>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>Native Device Token</Text>
        <Text style={styles.helper}>iOS에서는 APNs, Android에서는 FCM에 대응되는 native 토큰입니다.</Text>
        <Text style={styles.resultText}>type: {nativeTokenType || 'unknown'}</Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.tokenText}>
            {nativePushToken || '아직 발급되지 않았습니다.'}
          </Text>
        </View>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Screen>
  );
}
