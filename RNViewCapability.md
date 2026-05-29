# React Native View Capability Notes

이 문서는 SwiftUI/UIKit에서 자주 쓰는 뷰 패턴을 React Native JavaScript 레이어에서 어떻게 표현하는지 정리한 메모입니다. 현재 앱의 `RN 뷰 테스트` 화면에서 대부분의 항목을 직접 확인할 수 있습니다.

## JS만으로 바로 가능한 영역

| iOS/Swift 개념 | React Native 구현 | 비고 |
| --- | --- | --- |
| `VStack` | `View` 기본 배치 | RN의 기본 `flexDirection`은 `column`입니다. |
| `HStack` | `View` + `flexDirection: 'row'` | `gap`, `justifyContent`, `alignItems`로 정렬합니다. |
| `ZStack` | `View` + `position: 'absolute'` | 겹침, 배지, 오버레이 표현이 가능합니다. |
| `ScrollView` | `ScrollView` | 적은 양의 스크롤 콘텐츠에 적합합니다. |
| `UITableView` | `FlatList` | 긴 목록은 `ScrollView`보다 `FlatList`가 적합합니다. |
| grouped table/section | `SectionList` | 섹션 헤더와 셀 구조를 구현할 수 있습니다. |
| `UICollectionView` grid | `FlatList` + `numColumns` | 복잡한 masonry 레이아웃은 별도 구현 또는 라이브러리가 낫습니다. |
| `Form` | `TextInput`, `Switch`, `Pressable` 조합 | iOS Form과 똑같은 기본 외형은 직접 스타일링해야 합니다. |
| iOS action sheet picker | `ActionSheetIOS` | iOS 전용 네이티브 액션시트는 별도 라이브러리 없이 호출할 수 있습니다. |
| wheel time picker | `ScrollView` + `snapToInterval` | 간단한 휠 선택 UI는 JS만으로 직접 만들 수 있습니다. |
| native date/time picker | `@react-native-community/datetimepicker` | Modal 없이 화면에 직접 렌더링할 수 있고, iOS는 `spinner`, `compact`, `inline`, `default` display 옵션을 제공합니다. |
| system alert | `Alert.alert` | JS에서 호출하지만 iOS에서는 네이티브 alert UI로 표시됩니다. |
| alert/sheet 기본형 | `Modal` | 간단한 모달은 JS만으로 가능합니다. |
| loading/empty/error | `ActivityIndicator`, `Text`, `View` | 앱 공통 상태 UI로 만들기 쉽습니다. |

## 라이브러리가 필요한 경우

| 필요한 기능 | 이유 |
| --- | --- |
| date/time picker 세부 제어 | RN core에는 날짜/시간 전용 native picker가 없습니다. JS로 직접 만들거나 라이브러리를 사용합니다. |
| wheel picker/dropdown picker | 앱 공통 UI로 직접 만들 수 있지만, 플랫폼별 고급 picker는 전용 라이브러리를 주로 씁니다. |
| 지도 | `react-native-maps` 또는 Expo Maps 같은 별도 모듈이 필요합니다. |
| blur/glass effect | `expo-blur`, `expo-glass-effect` 같은 모듈이 필요합니다. |
| 고성능 이미지/비디오 | Expo Image/Video 또는 전용 라이브러리를 쓰는 편이 좋습니다. |
| bottom sheet, pager, tab 고급 제스처 | 기본 `Modal`/`View`로 만들 수는 있지만 품질과 제스처 완성도를 위해 라이브러리를 주로 씁니다. |
| 차트, 캔버스, 드로잉 | SVG/Skia/차트 라이브러리가 필요합니다. |

## 네이티브 설정 또는 prebuild가 필요한 경우

| 필요한 기능 | 이유 |
| --- | --- |
| 권한 문구 변경 | iOS `Info.plist`, Android manifest에 반영되어야 합니다. Expo는 `app.json` plugin/prebuild로 동기화합니다. |
| 푸시 entitlement | iOS capability/provisioning profile에 반영되어야 합니다. |
| 소셜 로그인 URL scheme | iOS/Android native 설정에 scheme이 들어가야 앱 복귀가 가능합니다. |
| 위젯, Live Activity, App Clip | 앱 확장 target이 필요해서 JS 화면만으로는 부족합니다. |
| 일부 네이티브 presentation 옵션 | UIKit/SwiftUI의 세부 sheet detent, interactive transition 등을 완전히 동일하게 쓰려면 네이티브 코드 또는 전용 라이브러리가 필요합니다. |

## 현재 판단

일반적인 앱 화면의 대부분은 RN의 JavaScript 코드만으로 표현 가능합니다. 목록, 섹션, 폼, 카드, 스크롤, 그리드, 모달, 상태 화면은 RN의 기본 컴포넌트 조합으로 충분합니다.

다만 “화면을 그리는 것”과 “기기/OS에 등록되는 기능”은 다릅니다. 카메라, 푸시, 소셜 로그인처럼 OS 권한이나 capability가 필요한 기능은 JS 화면 구현과 별개로 native 설정이 필요하고, Expo 프로젝트에서는 보통 config plugin과 prebuild/EAS 빌드 과정을 통해 반영합니다.
