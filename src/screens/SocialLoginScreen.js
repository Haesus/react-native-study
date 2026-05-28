import * as AppleAuthentication from 'expo-apple-authentication';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import {
  isKakaoTalkLoginAvailable,
  login as kakaoLogin,
  me as getKakaoProfile,
} from '@react-native-kakao/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import Screen from '../components/Screen';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_IOS_URL_SCHEME,
  GOOGLE_WEB_CLIENT_ID,
  KAKAO_NATIVE_APP_KEY,
} from '../constants/auth';
import { styles } from '../styles/styles';

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function SocialButton({ children, disabled = false, style, textStyle, onPress }) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.socialButton,
        style,
        disabled && styles.socialButtonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.socialButtonText, textStyle]}>{children}</Text>
    </Pressable>
  );
}

export default function SocialLoginScreen() {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [kakaoTalkAvailable, setKakaoTalkAvailable] = useState(false);
  const [lastProvider, setLastProvider] = useState('없음');
  const [lastResult, setLastResult] = useState('아직 로그인 결과가 없습니다.');

  const hasGoogleConfig = Boolean(GOOGLE_IOS_CLIENT_ID && GOOGLE_IOS_URL_SCHEME);
  const hasKakaoConfig = Boolean(KAKAO_NATIVE_APP_KEY);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  useEffect(() => {
    if (!hasKakaoConfig) {
      return;
    }

    initializeKakaoSDK(KAKAO_NATIVE_APP_KEY);
    isKakaoTalkLoginAvailable()
      .then(setKakaoTalkAvailable)
      .catch(() => setKakaoTalkAvailable(false));
  }, [hasKakaoConfig, KAKAO_NATIVE_APP_KEY]);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
      webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
      scopes: ['profile', 'email'],
    });
  }, []);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      setLastProvider('Apple');
      setLastResult(
        formatJson({
          user: credential.user,
          email: credential.email,
          fullName: credential.fullName,
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          realUserStatus: credential.realUserStatus,
        }),
      );
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        setLastProvider('Apple');
        setLastResult('사용자가 Apple 로그인을 취소했습니다.');
        return;
      }

      Alert.alert('Apple 로그인 오류', error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasGoogleConfig) {
      Alert.alert(
        'Google 설정 필요',
        'iOS 실기기 테스트용 EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID와 EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME을 추가한 뒤 다시 빌드하세요.',
      );
      return;
    }

    try {
      const response = await GoogleSignin.signIn();

      setLastProvider('Google');
      setLastResult(formatJson(response));
    } catch (error) {
      Alert.alert('Google 로그인 오류', error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  const runKakaoLogin = async ({ forceAccountLogin = false } = {}) => {
    if (!hasKakaoConfig) {
      Alert.alert(
        'Kakao 설정 필요',
        'EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY를 추가하고 Kakao Developers에 iOS Bundle ID를 등록한 뒤 다시 빌드하세요.',
      );
      return;
    }

    try {
      const token = await kakaoLogin(
        forceAccountLogin
          ? {
              useKakaoAccountLogin: true,
            }
          : undefined,
      );
      let profile = null;

      try {
        profile = await getKakaoProfile();
      } catch (profileError) {
        profile = { error: profileError.message };
      }

      setLastProvider('Kakao');
      setLastResult(
        formatJson({
          loginMethod: forceAccountLogin
            ? 'Kakao Account forced'
            : kakaoTalkAvailable
              ? 'KakaoTalk or Kakao Account fallback'
              : 'Kakao Account fallback',
          token,
          profile,
        }),
      );
    } catch (error) {
      Alert.alert('Kakao 로그인 오류', error.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleKakaoLogin = () => runKakaoLogin();

  const handleKakaoAccountLogin = () => runKakaoLogin({ forceAccountLogin: true });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>OAuth / Native Auth</Text>
        <Text style={styles.screenTitle}>소셜 로그인</Text>
        <Text style={styles.description}>
          Apple, Google, Kakao 네이티브 로그인 SDK 흐름을 테스트합니다.
        </Text>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>로그인 버튼</Text>
        <Text style={styles.resultText}>
          Apple 사용 가능: {appleAvailable ? '가능' : '불가 또는 확인 중'}
        </Text>

        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleAuthButton}
            onPress={handleAppleLogin}
          />
        ) : (
          <SocialButton disabled style={styles.appleFallbackButton}>
            Apple 로그인 사용 불가
          </SocialButton>
        )}

        <SocialButton
          style={styles.googleButton}
          textStyle={styles.googleButtonText}
          onPress={handleGoogleLogin}
        >
          Google로 로그인
        </SocialButton>

        <SocialButton
          style={styles.kakaoButton}
          textStyle={styles.kakaoButtonText}
          onPress={handleKakaoLogin}
        >
          Kakao로 로그인
        </SocialButton>

        <SocialButton
          style={styles.kakaoButton}
          textStyle={styles.kakaoButtonText}
          onPress={handleKakaoAccountLogin}
        >
          Kakao 계정으로 로그인
        </SocialButton>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>설정 상태</Text>
        <Text style={styles.resultText}>
          Google iOS Client ID: {GOOGLE_IOS_CLIENT_ID ? '설정됨' : '없음'}
        </Text>
        <Text style={styles.resultText}>
          Google Web Client ID: {GOOGLE_WEB_CLIENT_ID ? '설정됨' : '없음'}
        </Text>
        <Text style={styles.resultText}>
          Kakao Native App Key: {KAKAO_NATIVE_APP_KEY ? '설정됨' : '없음'}
        </Text>
        <Text style={styles.resultText}>
          KakaoTalk 로그인: {kakaoTalkAvailable ? '가능' : '불가 또는 확인 중'}
        </Text>
        <Text style={styles.resultText}>
          Google iOS URL Scheme: {GOOGLE_IOS_URL_SCHEME ? '설정됨' : '없음'}
        </Text>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>네이티브 설정 값</Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.codeText}>
            Kakao URL Scheme: {KAKAO_NATIVE_APP_KEY ? `kakao${KAKAO_NATIVE_APP_KEY}` : '미설정'}
            {'\n'}Google iOS URL Scheme: {GOOGLE_IOS_URL_SCHEME || '미설정'}
          </Text>
        </View>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>마지막 결과</Text>
        <Text style={styles.resultText}>Provider: {lastProvider}</Text>
        <View style={styles.tokenBox}>
          <Text selectable style={styles.codeText}>
            {lastResult}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
