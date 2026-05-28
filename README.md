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
- Expo Apple Authentication
- React Native Google Sign-In
- React Native Kakao

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
- 푸시 토큰 화면
  - Expo Push Token, native device token 발급
  - Expo Push API curl 테스트 예시 표시
  - 푸시 수신/탭 payload 확인
  - 알림 data의 `screen` 값으로 화면 이동
- 소셜 로그인 화면
  - Apple 네이티브 로그인 버튼
  - Google 네이티브 로그인 버튼
  - Kakao 네이티브 로그인 버튼
  - provider별 로그인 응답 payload 확인
  - Kakao access token과 사용자 profile 응답 확인
  - Kakao URL Scheme과 Google iOS URL Scheme 확인
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
├── app.config.js
├── app.json
├── babel.config.js
├── eas.json
├── index.js
├── src
│   ├── components
│   │   ├── PrimaryButton.js
│   │   └── Screen.js
│   ├── constants
│   │   ├── api.js
│   │   └── auth.js
│   ├── navigation
│   │   ├── AppNavigator.js
│   │   └── navigationRef.js
│   ├── screens
│   │   ├── AnimationScreen.js
│   │   ├── ApiScreen.js
│   │   ├── DetailScreen.js
│   │   ├── DeviceScreen.js
│   │   ├── GesturesScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PushTokenScreen.js
│   │   └── SocialLoginScreen.js
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

## 소셜 로그인 테스트

소셜 로그인 화면은 Home의 `소셜 로그인` 버튼에서 진입합니다. Apple은 iOS 실기기에서 native Sign in with Apple을 사용하고, Google은 `@react-native-google-signin/google-signin` 기반 native 로그인을 사용합니다. Kakao는 `@react-native-kakao/core` config plugin과 `@react-native-kakao/user` 기반 native 로그인을 사용합니다.

앱 scheme은 `app.json`의 `expo.scheme`에 정의된 `testrn`입니다. Kakao native 로그인용 URL Scheme은 Native App Key 기준으로 `kakao{NATIVE_APP_KEY}` 형식으로 생성됩니다.

```txt
Kakao URL Scheme: kakao{NATIVE_APP_KEY}
```

로컬 테스트용 환경값은 `.env.local`에 넣습니다. `.env.local`은 git에 포함하지 않습니다.

```bash
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.your-ios-client-id
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=your-kakao-native-app-key
```

필요한 외부 설정은 다음과 같습니다.

- Apple
  - Apple Developer의 bundle identifier `com.younhaesu.testrn`에 Sign in with Apple capability 필요
  - Expo 설정은 `app.json`의 `ios.usesAppleSignIn: true`와 `expo-apple-authentication` plugin에서 관리
- Google
  - Google Cloud Console 또는 Firebase에서 iOS OAuth Client 생성
  - iOS bundle id는 `com.younhaesu.testrn`
  - 발급받은 iOS Client ID를 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`에 설정
  - iOS Client의 reversed client id 또는 URL scheme을 `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`에 설정
  - 필요하면 Web Client ID를 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`에 설정
  - `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`이 있으면 `app.config.js`에서 Google Sign-In config plugin을 자동으로 추가
- Kakao
  - Kakao Developers 앱 생성
  - iOS 플랫폼에 bundle id `com.younhaesu.testrn` 등록
  - Native App Key를 `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`에 설정
  - URL Scheme은 `@react-native-kakao/core` config plugin이 `kakao{NATIVE_APP_KEY}` 형식으로 생성
  - Kakao Login 활성화 및 필요한 동의항목 설정
  - 현재 테스트 화면은 Kakao native login 후 access token과 사용자 profile 조회까지 수행

환경값 또는 native capability가 바뀐 뒤에는 development build를 다시 만들어야 합니다.

```bash
npx expo run:ios --device
```

## Expo Push 알림 테스트

development build를 실기기에 설치한 뒤 앱의 `푸시 토큰` 화면에서 Expo Push Token을 발급합니다. 화면에 표시되는 curl 명령을 터미널에서 실행하면 별도 서버 없이 Expo Push API로 테스트 알림을 보낼 수 있습니다.

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExpoPushToken[...]",
    "sound": "default",
    "title": "Expo 푸시 테스트",
    "body": "curl로 보낸 테스트 알림입니다.",
    "data": {
      "screen": "PushToken",
      "source": "curl"
    }
  }'
```

`data.screen`에는 `Home`, `Api`, `Device`, `PushToken`, `Gestures`, `Animation` 같은 navigation route 이름을 넣을 수 있습니다. 사용자가 알림을 탭하면 해당 화면으로 이동합니다.

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
