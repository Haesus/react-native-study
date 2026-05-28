const appJson = require('./app.json');

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;

module.exports = ({ config }) => {
  const plugins = [...appJson.expo.plugins];

  if (googleIosUrlScheme) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: googleIosUrlScheme,
      },
    ]);
  }

  if (kakaoNativeAppKey) {
    plugins.push([
      '@react-native-kakao/core',
      {
        nativeAppKey: kakaoNativeAppKey,
        android: {
          authCodeHandlerActivity: true,
        },
        ios: {
          handleKakaoOpenUrl: true,
        },
      },
    ]);
  }

  return {
    ...config,
    ...appJson.expo,
    plugins,
  };
};
