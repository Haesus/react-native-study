import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { Alert, Image, Linking, Text, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function DeviceScreen() {
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('unknown');
  const [location, setLocation] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [capturedImageUri, setCapturedImageUri] = useState('');
  const [message, setMessage] = useState('기능 버튼을 눌러 권한과 기기 API를 테스트하세요.');

  const hasCameraPermission = cameraPermission?.granted;

  const openPermissionSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      setMessage('설정 앱을 열 수 없습니다. iOS 설정에서 앱 권한을 직접 변경하세요.');
    }
  };

  const showPermissionSettingsAlert = (permissionName) => {
    setMessage(`${permissionName} 권한은 iOS 설정에서 직접 허용해야 합니다.`);

    Alert.alert(
      `${permissionName} 권한이 필요합니다`,
      `이 기능을 사용하려면 iOS 설정에서 ${permissionName} 권한을 허용해야 합니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '설정 열기',
          onPress: openPermissionSettings,
        },
      ],
    );
  };

  const showGrantedPermissionAlert = (permissionName) => {
    setMessage(`${permissionName} 권한이 이미 허용되어 있습니다.`);
    Alert.alert('권한 확인', `${permissionName} 권한이 이미 허용되어 있습니다.`);
  };

  const handleDeniedPermission = (permissionName, permission) => {
    if (permission?.canAskAgain === false) {
      showPermissionSettingsAlert(permissionName);
      return;
    }

    setMessage(`${permissionName} 권한이 거부되었습니다.`);
  };

  const requestCameraAccess = async () => {
    if (cameraPermission?.granted) {
      showGrantedPermissionAlert('카메라');
      return true;
    }

    if (cameraPermission?.canAskAgain === false) {
      showPermissionSettingsAlert('카메라');
      return false;
    }

    setMessage('카메라 권한을 요청하는 중입니다.');
    const permission = await requestCameraPermission();

    if (!permission.granted) {
      handleDeniedPermission('카메라', permission);
      return false;
    }

    setMessage('카메라 권한이 허용되었습니다.');
    return true;
  };

  const requestLocation = async () => {
    const currentPermission = await Location.getForegroundPermissionsAsync();
    setLocationPermissionStatus(currentPermission.status);

    if (currentPermission.granted) {
      showGrantedPermissionAlert('위치');
      const nextLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(nextLocation.coords);
      setMessage('현재 위치를 가져왔습니다.');
      return;
    }

    if (currentPermission.status === 'denied' && !currentPermission.canAskAgain) {
      showPermissionSettingsAlert('위치');
      return;
    }

    setMessage('위치 권한을 요청하는 중입니다.');
    const permission = await Location.requestForegroundPermissionsAsync();
    setLocationPermissionStatus(permission.status);

    if (!permission.granted) {
      handleDeniedPermission('위치', permission);
      return;
    }

    const nextLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation(nextLocation.coords);
    setMessage('현재 위치를 가져왔습니다.');
  };

  const pickImage = async () => {
    const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (currentPermission.granted) {
      showGrantedPermissionAlert('사진첩');
    }

    if (currentPermission.status === 'denied' && !currentPermission.canAskAgain) {
      showPermissionSettingsAlert('사진첩');
      return;
    }

    setMessage('사진첩을 여는 중입니다.');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      handleDeniedPermission('사진첩', permission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      setMessage('사진 선택을 취소했습니다.');
      return;
    }

    setSelectedImageUri(result.assets[0].uri);
    setMessage('사진첩에서 이미지를 선택했습니다.');
  };

  const takePhoto = async () => {
    if (!hasCameraPermission && !(await requestCameraAccess())) {
      return;
    }

    if (!cameraRef.current) {
      setMessage('카메라가 아직 준비되지 않았습니다.');
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
    setCapturedImageUri(photo.uri);
    setMessage('카메라로 사진을 촬영했습니다.');
  };

  const saveCapturedPhoto = async () => {
    if (!capturedImageUri) {
      setMessage('먼저 사진을 촬영하세요.');
      return;
    }

    const permission = mediaPermission?.granted
      ? mediaPermission
      : await requestMediaPermission();

    if (!permission.granted) {
      handleDeniedPermission('사진 저장', permission);
      return;
    }

    await MediaLibrary.saveToLibraryAsync(capturedImageUri);
    setMessage('촬영한 사진을 사진첩에 저장했습니다.');
  };

  return (
    <Screen scroll>
      <Text style={styles.screenTitle}>기기 기능</Text>
      <Text style={styles.description}>
        카메라, 위치, 사진첩처럼 실제 앱에서 자주 쓰는 권한과 하드웨어 API를 테스트합니다.
      </Text>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>카메라</Text>
        <View style={styles.cameraFrame}>
          {hasCameraPermission ? (
            <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderText}>카메라 권한이 필요합니다.</Text>
            </View>
          )}
        </View>
        <View style={styles.actionRow}>
          <PrimaryButton onPress={requestCameraAccess}>권한 요청</PrimaryButton>
          <PrimaryButton onPress={takePhoto}>촬영</PrimaryButton>
          <PrimaryButton onPress={saveCapturedPhoto}>저장</PrimaryButton>
        </View>
        {capturedImageUri ? (
          <Image source={{ uri: capturedImageUri }} style={styles.previewImage} />
        ) : null}
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>위치정보</Text>
        <Text style={styles.resultText}>권한 상태: {locationPermissionStatus}</Text>
        {location ? (
          <Text style={styles.resultText}>
            위도 {location.latitude.toFixed(6)} / 경도 {location.longitude.toFixed(6)}
          </Text>
        ) : null}
        <PrimaryButton onPress={requestLocation}>현재 위치 가져오기</PrimaryButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>사진첩</Text>
        <PrimaryButton onPress={pickImage}>사진 선택</PrimaryButton>
        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
        ) : null}
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Screen>
  );
}
