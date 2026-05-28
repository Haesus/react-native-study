# Social Login Response Notes

## 공통 처리 방향

소셜 로그인은 이메일이 아니라 provider별 고유 사용자 ID를 기준으로 계정을 연결하는 것이 안전합니다.

```txt
Apple  -> identityToken.sub 또는 credential.user
Google -> idToken.sub 또는 data.user.id
Kakao  -> idToken.sub 또는 profile.id
```

앱에서 서버로 전달할 후보 데이터:

```json
{
  "provider": "apple | google | kakao",
  "idToken": "provider-id-token",
  "authorizationCode": "provider-authorization-code-if-exists",
  "accessToken": "provider-access-token-if-needed",
  "profile": {
    "providerUserId": "provider-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "profileImageUrl": "https://..."
  }
}
```

서버 권장 처리:

```txt
1. 클라이언트에서 provider token/code 수신
2. 서버에서 provider token 검증 또는 code 교환
3. 검증된 provider user id 추출
4. social_accounts 테이블에서 provider + providerUserId로 조회
5. 없으면 회원 생성 또는 기존 회원과 연결
6. 서비스 자체 access token/session 발급
```

## Apple Login

테스트 응답 예시:

```json
{
  "user": "000551.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.1428",
  "email": "********@privaterelay.appleid.com",
  "fullName": {
    "givenName": "HAESU",
    "middleName": null,
    "namePrefix": null,
    "familyName": "YOUN",
    "nickname": null,
    "nameSuffix": null
  },
  "identityToken": "eyJ...<apple-id-token>...xxx",
  "authorizationCode": "c6b...<apple-authorization-code>...xxx",
  "realUserStatus": 2
}
```

필드 설명:

| Field | Meaning | Backend Note |
| --- | --- | --- |
| `user` | Apple이 내려주는 사용자 고유 식별자 | 이메일 대신 이 값을 계정 연결 키로 사용 가능 |
| `email` | 사용자가 공유한 이메일 또는 Apple relay 이메일 | `null`일 수 있음. 계정 식별자로 의존하지 않음 |
| `fullName.givenName` | 이름 | 최초 승인 때만 내려올 수 있음 |
| `fullName.familyName` | 성 | 최초 승인 때만 내려올 수 있음 |
| `identityToken` | Apple OpenID Connect JWT | 서버에서 검증 후 `sub`, `email`, `is_private_email` 확인 |
| `authorizationCode` | Apple 서버 검증/토큰 교환용 code | 서버에서 Apple token endpoint와 연동할 때 사용 |
| `realUserStatus` | 실제 사용자 가능성 상태 | `2`는 likely real user 의미로 볼 수 있음 |

Apple `identityToken` payload 주요 값:

| Claim | Meaning |
| --- | --- |
| `iss` | 발급자. `https://appleid.apple.com` |
| `aud` | 앱 bundle id. 예: `com.younhaesu.testrn` |
| `sub` | Apple 사용자 고유 식별자 |
| `email` | 공유 이메일 또는 relay 이메일 |
| `email_verified` | 이메일 검증 여부 |
| `is_private_email` | relay 이메일 여부 |
| `iat` | 토큰 발급 시각 |
| `exp` | 토큰 만료 시각 |

Apple 주의사항:

- 이메일은 사용자가 숨길 수 있습니다.
- 이메일을 숨기면 `@privaterelay.appleid.com` 형태의 relay 이메일이 내려올 수 있습니다.
- `email`, `fullName`은 최초 승인 때만 내려오는 경우가 많습니다.
- 재로그인에서 `email`, `fullName`이 `null`이어도 기존 DB 값을 지우면 안 됩니다.

권장 저장:

```json
{
  "provider": "apple",
  "providerUserId": "identityToken.sub 또는 credential.user",
  "emailAtSignup": "nullable",
  "displayName": "nullable",
  "isPrivateEmail": true
}
```

## Google Login

테스트 응답 예시:

```json
{
  "type": "success",
  "data": {
    "idToken": "eyJ...<google-id-token>...xxx",
    "serverAuthCode": "4/...<google-server-auth-code>...xxx",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid"
    ],
    "user": {
      "givenName": "해수",
      "id": "107583092772204100727",
      "email": "********@gmail.com",
      "name": "윤해수 (Tag)",
      "familyName": "윤",
      "photo": "https://lh3.googleusercontent.com/a/...=s120"
    }
  }
}
```

필드 설명:

| Field | Meaning | Backend Note |
| --- | --- | --- |
| `type` | 로그인 결과 상태 | `success`면 로그인 성공 |
| `data.idToken` | Google OpenID Connect JWT | 서버에서 검증 후 `sub`, `email`, `email_verified` 사용 |
| `data.serverAuthCode` | 서버에서 Google token endpoint로 교환 가능한 authorization code | 서버가 Google access/refresh token을 받아야 하면 사용 |
| `data.scopes` | 사용자가 동의한 권한 범위 | 현재는 profile, email, openid |
| `data.user.id` | Google 사용자 고유 ID | `idToken.sub`와 같은 사용자 식별자로 사용 가능 |
| `data.user.email` | Google 이메일 | 검증은 `idToken.email_verified` 기준으로 판단 |
| `data.user.name` | 표시 이름 | UI 표시용 |
| `data.user.givenName` | 이름 | UI 표시용 |
| `data.user.familyName` | 성 | UI 표시용 |
| `data.user.photo` | 프로필 이미지 URL | UI 표시용 |

Google `idToken` payload 주요 값:

| Claim | Meaning |
| --- | --- |
| `iss` | 발급자. `https://accounts.google.com` |
| `aud` | 대상 client id |
| `azp` | authorized party client id |
| `sub` | Google 사용자 고유 식별자 |
| `email` | Google 이메일 |
| `email_verified` | 이메일 검증 여부 |
| `name` | 표시 이름 |
| `picture` | 프로필 이미지 |
| `given_name` | 이름 |
| `family_name` | 성 |
| `iat` | 토큰 발급 시각 |
| `exp` | 토큰 만료 시각 |

권장 저장:

```json
{
  "provider": "google",
  "providerUserId": "idToken.sub 또는 data.user.id",
  "emailAtSignup": "nullable",
  "displayName": "data.user.name",
  "profileImageUrl": "data.user.photo"
}
```

## Kakao Login

Kakao는 두 흐름을 테스트했습니다.

```txt
KakaoTalk or Kakao Account fallback
-> 카카오톡 앱이 가능하면 카카오톡 앱 로그인, 불가능하면 카카오계정 로그인

Kakao Account forced
-> useKakaoAccountLogin: true로 카카오계정 로그인 강제
```

두 방식 모두 최종적으로 같은 종류의 token/profile 응답을 받습니다.

테스트 응답 예시:

```json
{
  "loginMethod": "KakaoTalk or Kakao Account fallback",
  "token": {
    "refreshTokenExpiresAt": 1785134145.864536,
    "refreshTokenExpiresIn": 5183999,
    "refreshToken": "TV2...<kakao-refresh-token>...xxx",
    "idToken": "eyJ...<kakao-id-token>...xxx",
    "tokenType": "bearer",
    "scopes": [
      "account_email",
      "profile_image",
      "openid",
      "profile_nickname"
    ],
    "accessToken": "9-Q...<kakao-access-token>...xxx",
    "accessTokenExpiresIn": 43199,
    "accessTokenExpiresAt": 1779993345.864531
  },
  "profile": {
    "id": 4918056590,
    "email": "********@daum.net",
    "nickname": "윤해수",
    "profileImageUrl": "https://k.kakaocdn.net/.../img_640x640.jpg",
    "thumbnailImageUrl": "https://k.kakaocdn.net/.../img_110x110.jpg",
    "isEmailValid": true,
    "isEmailVerified": true,
    "emailNeedsAgreement": false,
    "profileImageNeedsAgreement": false,
    "profileNicknameNeedsAgreement": false,
    "gender": null,
    "birthday": null,
    "phoneNumber": null,
    "birthyear": null,
    "name": null
  }
}
```

필드 설명:

| Field | Meaning | Backend Note |
| --- | --- | --- |
| `loginMethod` | 테스트 화면에서 구분한 로그인 진입 방식 | 서버 계정 식별에는 보통 중요하지 않음 |
| `token.accessToken` | Kakao API 호출용 access token | 서버에서 Kakao API를 호출해야 하면 사용 |
| `token.refreshToken` | Kakao access token 재발급용 token | 매우 민감. 클라이언트 로그/저장 주의 |
| `token.idToken` | Kakao OpenID Connect JWT | 서버에서 검증 후 `sub`, `email` 확인 가능 |
| `token.tokenType` | bearer token 타입 | API 호출 시 `Authorization: Bearer ...` |
| `token.scopes` | 동의받은 권한 | 현재 email, profile image, nickname, openid |
| `token.accessTokenExpiresIn` | access token 남은 수명, 초 단위 | 만료 처리에 사용 가능 |
| `token.accessTokenExpiresAt` | access token 만료 시각, Unix seconds | 만료 처리에 사용 가능 |
| `token.refreshTokenExpiresIn` | refresh token 남은 수명, 초 단위 | 만료 처리에 사용 가능 |
| `token.refreshTokenExpiresAt` | refresh token 만료 시각, Unix seconds | 만료 처리에 사용 가능 |
| `profile.id` | Kakao 사용자 고유 ID | Kakao 계정 연결 키로 사용 가능 |
| `profile.email` | Kakao 계정 이메일 | 동의가 없으면 없을 수 있음 |
| `profile.nickname` | Kakao 프로필 닉네임 | UI 표시용 |
| `profile.profileImageUrl` | 큰 프로필 이미지 URL | UI 표시용 |
| `profile.thumbnailImageUrl` | 작은 프로필 이미지 URL | UI 표시용 |
| `profile.isEmailValid` | 이메일 유효 여부 | 이메일 사용 가능성 판단 |
| `profile.isEmailVerified` | 이메일 인증 여부 | 이메일 신뢰도 판단 |
| `profile.*NeedsAgreement` | 해당 항목 추가 동의 필요 여부 | `true`면 추가 동의 플로우 필요 |

Kakao `idToken` payload 주요 값:

| Claim | Meaning |
| --- | --- |
| `iss` | 발급자. `https://kauth.kakao.com` |
| `aud` | Kakao Native App Key |
| `sub` | Kakao 사용자 고유 식별자 |
| `email` | Kakao 이메일 |
| `nickname` | Kakao 닉네임 |
| `picture` | Kakao 프로필 이미지 |
| `iat` | 토큰 발급 시각 |
| `exp` | 토큰 만료 시각 |

권장 저장:

```json
{
  "provider": "kakao",
  "providerUserId": "idToken.sub 또는 profile.id",
  "emailAtSignup": "nullable",
  "displayName": "profile.nickname",
  "profileImageUrl": "profile.profileImageUrl"
}
```

## Backend Contract Draft

앱에서 백엔드로 보내는 요청 예시:

```json
{
  "provider": "kakao",
  "idToken": "eyJ...xxx",
  "accessToken": "optional",
  "authorizationCode": "optional",
  "clientProfile": {
    "providerUserId": "4918056590",
    "email": "user@example.com",
    "displayName": "윤해수",
    "profileImageUrl": "https://..."
  }
}
```

백엔드 응답 예시:

```json
{
  "accessToken": "service-access-token",
  "refreshToken": "service-refresh-token",
  "user": {
    "id": "service-user-id",
    "email": "user@example.com",
    "displayName": "윤해수",
    "profileImageUrl": "https://...",
    "linkedProviders": ["apple", "google", "kakao"]
  },
  "isNewUser": false
}
```

백엔드 DB 예시:

```txt
users
- id
- email nullable
- display_name nullable
- profile_image_url nullable
- created_at
- updated_at

social_accounts
- id
- user_id
- provider
- provider_user_id
- email_at_signup nullable
- raw_profile_snapshot json nullable
- created_at
- updated_at

unique(provider, provider_user_id)
```

## Important Notes

- provider token은 서비스 token이 아닙니다. 최종 앱 인증은 백엔드가 발급한 자체 token/session으로 처리합니다.
- 이메일은 provider마다 없거나 바뀌거나 relay일 수 있으므로 고유 식별자로 쓰지 않습니다.
- Apple은 최초 로그인 이후 `email`, `fullName`이 다시 내려오지 않을 수 있습니다.
- Google/Kakao도 이메일 동의가 빠지거나 추가 동의가 필요한 상황을 고려해야 합니다.
- 실제 token 원문은 앱 화면 디버그 목적 외에는 저장하지 않는 것이 좋습니다.
