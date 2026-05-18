# React Native Study

Expo 기반 React Native 학습용 프로젝트입니다. 기본 UI 구성부터 API 호출, navigation, gesture, animation, iOS 실기기 권한 처리까지 한 앱에서 확인할 수 있게 구성했습니다.

## 기술 스택

- Expo SDK 54
- React Native 0.81
- React 19
- React Navigation
- React Native Gesture Handler
- React Native Reanimated
- Expo Camera
- Expo Location
- Expo Image Picker
- Expo Media Library

## 주요 기능

- Home 화면
  - TextInput, Switch, counter 상태 관리
  - row/column 레이아웃 전환
  - 각 테스트 화면으로 이동
- API 화면
  - JSONPlaceholder API 호출
  - loading, error, list, detail 흐름 확인
- 기기 기능 화면
  - 카메라 권한 요청 및 사진 촬영
  - 위치 권한 요청 및 현재 위치 조회
  - 사진첩 권한 요청 및 이미지 선택
  - 촬영 이미지 사진첩 저장
  - 권한 거부 후 설정 이동 안내 Alert
- 제스처 화면
  - pan gesture
  - double tap gesture
  - Reanimated 기반 이동/스케일 애니메이션
- 애니메이션 화면
  - Reanimated shared value
  - width, opacity 전환 애니메이션

## 폴더 구조

```txt
.
├── App.js
├── app.json
├── babel.config.js
├── eas.json
├── index.js
├── src
│   ├── components
│   │   ├── PrimaryButton.js
│   │   └── Screen.js
│   ├── constants
│   │   └── api.js
│   ├── navigation
│   │   └── AppNavigator.js
│   ├── screens
│   │   ├── AnimationScreen.js
│   │   ├── ApiScreen.js
│   │   ├── DetailScreen.js
│   │   ├── DeviceScreen.js
│   │   ├── GesturesScreen.js
│   │   └── HomeScreen.js
│   └── styles
│       └── styles.js
└── assets
```

## 실행 방법

의존성을 설치합니다.

```bash
npm install
```

Expo 개발 서버를 실행합니다.

```bash
npx expo start
```

웹에서 확인합니다.

```bash
npx expo start --web
```

iOS 실기기에 development build를 설치합니다.

```bash
npx expo run:ios --device
```

Xcode 빌드 캐시를 지우고 다시 빌드합니다.

```bash
npx expo run:ios --device --no-build-cache
```

## Expo Native 설정 반영

이 프로젝트는 Expo 중심으로 관리합니다. 권한 문구, config plugin, bundle identifier처럼 native 설정이 바뀌면 `app.json`을 기준으로 iOS 프로젝트를 다시 생성해야 합니다.

```bash
npx expo prebuild --clean --platform ios
npx expo run:ios --device
```

`ios/`와 `android/` 폴더는 생성 산출물로 보고 `.gitignore`에서 제외합니다. Expo 설정의 원천은 `app.json`입니다.

## iOS 권한 설정

카메라, 위치, 사진첩 권한 문구는 `app.json`의 `ios.infoPlist`와 `plugins`에 정의되어 있습니다.

- `NSCameraUsageDescription`
- `NSLocationWhenInUseUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`
- `expo-camera`
- `expo-location`
- `expo-image-picker`
- `expo-media-library`

iOS는 한 번 권한을 거부하면 같은 시스템 권한 팝업을 계속 다시 띄우지 않습니다. 이 경우 앱에서는 Alert로 안내한 뒤 사용자가 선택하면 iOS 설정 앱으로 이동하게 처리합니다.

## EAS Build

`eas.json`에는 세 가지 빌드 프로필이 있습니다.

- `development`: 실기기 개발용 development client 빌드
- `preview`: 내부 배포용 빌드
- `production`: App Store/TestFlight 배포용 빌드

예시:

```bash
eas build --profile development --platform ios
eas build --profile preview --platform ios
eas build --profile production --platform ios
```

## 검증

JS 번들 export로 기본 빌드 가능 여부를 확인할 수 있습니다.

```bash
npx expo export --platform ios
```
