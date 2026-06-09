import { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { styles } from '../styles/styles';

const tableRows = [
  { id: 'table', title: 'UITableView', detail: 'FlatList 또는 SectionList' },
  { id: 'scroll', title: 'UIScrollView', detail: 'ScrollView' },
  { id: 'stack', title: 'VStack / HStack / ZStack', detail: 'View + flexDirection + absolute' },
  { id: 'form', title: 'Form', detail: 'TextInput, Switch, Pressable 조합' },
];

const sectionRows = [
  {
    title: 'SwiftUI 계열',
    data: ['VStack은 기본 View column', 'HStack은 flexDirection row', 'ZStack은 absolute 배치'],
  },
  {
    title: 'UIKit 계열',
    data: ['UITableView는 FlatList', 'UICollectionView는 FlatList numColumns', 'UIAlertController는 Modal'],
  },
];

const gridItems = [
  { id: 'photo', title: 'Photo', color: '#0f766e' },
  { id: 'chart', title: 'Chart', color: '#7c3aed' },
  { id: 'map', title: 'Map', color: '#0284c7' },
  { id: 'video', title: 'Video', color: '#ea580c' },
  { id: 'file', title: 'File', color: '#be123c' },
  { id: 'setting', title: 'Setting', color: '#475569' },
];

const pickerOptions = ['SwiftUI', 'UIKit', 'React Native', 'Expo'];
type IosDateTimePickerDisplay = 'default' | 'compact' | 'inline' | 'spinner';

const nativeTimeDisplayOptions: IosDateTimePickerDisplay[] = [
  'spinner',
  'compact',
  'inline',
  'default',
];
const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = Array.from({ length: 12 }, (_, index) => index * 5);
const wheelItemHeight = 44;

type TableRow = (typeof tableRows)[number];

const capabilityRows = [
  {
    title: 'JS만으로 충분',
    items: ['Stack layout', 'Table/List', 'Section', 'Grid', 'Form', 'Modal', 'Loading/Empty/Error'],
  },
  {
    title: '라이브러리 필요',
    items: ['Native picker', 'Map', 'Blur/Glass', 'Camera preview', 'Video player', 'Bottom sheet'],
  },
  {
    title: 'Native 설정 필요',
    items: ['권한 문구', '푸시 entitlement', '소셜 로그인 URL scheme', '위젯/라이브 액티비티'],
  },
];

export default function UIKitViewsScreen() {
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [selectedPickerValue, setSelectedPickerValue] = useState(pickerOptions[0]);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(30);
  const [nativeTimeDisplay, setNativeTimeDisplay] = useState<IosDateTimePickerDisplay>('spinner');
  const [nativeTime, setNativeTime] = useState(() => {
    const initialDate = new Date();
    initialDate.setHours(9, 30, 0, 0);
    return initialDate;
  });
  const [showModal, setShowModal] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tableRows;
    }

    return tableRows.filter((item) => {
      const text = `${item.title} ${item.detail}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [query]);

  const openNativePicker = () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS 전용 기능', 'ActionSheetIOS는 iOS에서만 네이티브 picker 형태로 표시됩니다.');
      return;
    }

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...pickerOptions, '취소'],
        cancelButtonIndex: pickerOptions.length,
        title: 'iOS ActionSheet Picker',
        message: 'RN JS에서 호출하지만 iOS 네이티브 액션시트로 표시됩니다.',
      },
      (buttonIndex) => {
        if (buttonIndex < pickerOptions.length) {
          setSelectedPickerValue(pickerOptions[buttonIndex]);
        }
      },
    );
  };

  const renderWheelColumn = (
    items: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    suffix: string,
  ) => (
    <View style={styles.wheelColumn}>
      <View pointerEvents="none" style={styles.wheelSelection} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={wheelItemHeight}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: items.indexOf(selectedValue) * wheelItemHeight }}
        contentContainerStyle={styles.wheelContent}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / wheelItemHeight);
          const nextValue = items[Math.max(0, Math.min(index, items.length - 1))];
          onSelect(nextValue);
        }}
      >
        {items.map((item) => {
          const isSelected = item === selectedValue;

          return (
            <Pressable
              key={item}
              style={styles.wheelItem}
              onPress={() => onSelect(item)}
            >
              <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
                {String(item).padStart(2, '0')}
                {suffix}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>JS-only UI</Text>
        <Text style={styles.title}>RN 뷰 표현 테스트</Text>
        <Text style={styles.description}>
          prebuild 설정을 추가하지 않고 JavaScript와 React Native 기본 뷰만으로 iOS에서 자주 쓰는
          화면 패턴을 재현합니다.
        </Text>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>VStack / HStack / ZStack</Text>
        <View style={styles.swiftVStack}>
          <Text style={styles.demoTitle}>VStack: View의 기본 column 배치</Text>
          <View style={styles.swiftHStack}>
            <Text style={styles.demoPill}>HStack</Text>
            <Text style={styles.demoPill}>row</Text>
            <Text style={styles.demoPill}>gap</Text>
          </View>
          <View style={styles.zStackStage}>
            <View style={styles.zStackBack} />
            <View style={styles.zStackMiddle} />
            <View style={styles.zStackFront}>
              <Text style={styles.zStackText}>ZStack</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>Form</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="목록 검색"
          placeholderTextColor="#8a96a8"
        />
        <View style={styles.formRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>토글 셀</Text>
            <Text style={styles.helper}>{enabled ? '활성화됨' : '비활성화됨'}</Text>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
        <View style={styles.formRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>Picker 셀</Text>
            <Text style={styles.helper}>선택값: {selectedPickerValue}</Text>
          </View>
          <View style={styles.pickerButtonGroup}>
            <PrimaryButton onPress={openNativePicker}>iOS Picker</PrimaryButton>
            <PrimaryButton onPress={() => setShowPickerModal(true)}>Modal Picker</PrimaryButton>
          </View>
        </View>
        <View style={styles.formRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>Time Picker 비교</Text>
            <Text style={styles.helper}>
              JS {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} /
              Native {String(nativeTime.getHours()).padStart(2, '0')}:
              {String(nativeTime.getMinutes()).padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.pickerButtonGroup}>
            <PrimaryButton onPress={() => setShowTimePickerModal(true)}>JS Wheel</PrimaryButton>
          </View>
        </View>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>Native DateTimePicker</Text>
        <Text style={styles.demoTitle}>
          Modal 없이 네이티브 picker 컴포넌트만 화면에 직접 렌더링한 상태입니다.
        </Text>
        <View style={styles.segmentRow}>
          {nativeTimeDisplayOptions.map((option) => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.segmentButton,
                nativeTimeDisplay === option && styles.segmentButtonSelected,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setNativeTimeDisplay(option)}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  nativeTimeDisplay === option && styles.segmentButtonTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.nativePickerOnlyFrame}>
          <DateTimePicker
            value={nativeTime}
            mode="time"
            display={Platform.OS === 'ios' ? nativeTimeDisplay : 'default'}
            locale="ko-KR"
            textColor="#0f172a"
            themeVariant="light"
            onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
              if (selectedDate) {
                setNativeTime(selectedDate);
              }
            }}
            style={styles.nativeTimePicker}
          />
        </View>
        <Text style={styles.timePickerValue}>
          {String(nativeTime.getHours()).padStart(2, '0')}:
          {String(nativeTime.getMinutes()).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>UITableView: FlatList</Text>
        <View style={styles.embeddedList}>
          <FlatList
            data={filteredRows}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없습니다.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.demoListRow, pressed && styles.postPressed]}
                onPress={() => setSelectedRow(item)}
              >
                <View>
                  <Text style={styles.demoRowTitle}>{item.title}</Text>
                  <Text style={styles.helper}>{item.detail}</Text>
                </View>
                <Text style={styles.chevronText}>›</Text>
              </Pressable>
            )}
          />
        </View>
        {selectedRow ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              선택됨: {selectedRow.title} → {selectedRow.detail}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>SectionList</Text>
        <SectionList
          sections={sectionRows}
          keyExtractor={(item, index) => `${item}-${index}`}
          scrollEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          )}
          renderItem={({ item }) => <Text style={styles.sectionItemText}>{item}</Text>}
        />
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>UICollectionView: Grid</Text>
        <FlatList
          data={gridItems}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={styles.gridTile}>
              <View style={[styles.gridIcon, { backgroundColor: item.color }]}>
                <Text style={styles.gridIconText}>{item.title.slice(0, 1)}</Text>
              </View>
              <Text style={styles.gridTitle}>{item.title}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>상태 화면</Text>
        <View style={styles.stateGrid}>
          <View style={styles.stateBox}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.stateText}>Loading</Text>
          </View>
          <View style={styles.stateBox}>
            <Text style={styles.emptySymbol}>∅</Text>
            <Text style={styles.stateText}>Empty</Text>
          </View>
          <View style={styles.stateBox}>
            <Text style={styles.errorSymbol}>!</Text>
            <Text style={styles.stateText}>Error</Text>
          </View>
        </View>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>Alert / Image / Card / Modal</Text>
        <Image
          style={styles.demoImage}
          source={{ uri: 'https://picsum.photos/seed/react-native-study/900/420' }}
        />
        <PrimaryButton
          onPress={() =>
            Alert.alert('RN 기본 Alert', 'JavaScript에서 호출하지만 iOS에서는 네이티브 Alert로 표시됩니다.', [
              { text: '취소', style: 'cancel' },
              { text: '확인' },
            ])
          }
        >
          Native Alert 열기
        </PrimaryButton>
        <PrimaryButton onPress={() => setShowModal(true)}>Modal 열기</PrimaryButton>
      </View>

      <View style={styles.viewDemoPanel}>
        <Text style={styles.sectionTitle}>가능 여부 판단</Text>
        {capabilityRows.map((group) => (
          <View key={group.title} style={styles.capabilityGroup}>
            <Text style={styles.demoRowTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <Text key={item} style={styles.capabilityItem}>
                • {item}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <Modal transparent visible={showModal} animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>UIAlertController / Sheet 대체</Text>
            <Text style={styles.modalBody}>
              RN의 Modal은 JS에서 제어할 수 있지만, iOS 고유 sheet detent나 네이티브
              presentation 세부 옵션은 별도 라이브러리 또는 네이티브 설정이 필요할 수 있습니다.
            </Text>
            <PrimaryButton onPress={() => setShowModal(false)}>닫기</PrimaryButton>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showPickerModal}
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Custom Picker</Text>
            {pickerOptions.map((option) => (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.pickerOption,
                  selectedPickerValue === option && styles.pickerOptionSelected,
                  pressed && styles.postPressed,
                ]}
                onPress={() => {
                  setSelectedPickerValue(option);
                  setShowPickerModal(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedPickerValue === option && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
            <PrimaryButton onPress={() => setShowPickerModal(false)}>닫기</PrimaryButton>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showTimePickerModal}
        animationType="slide"
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Wheel Time Picker</Text>
            <Text style={styles.modalBody}>
              RN core의 ScrollView와 snapToInterval로 만든 JS-only 휠 picker입니다.
            </Text>
            <View style={styles.timePickerFrame}>
              {renderWheelColumn(hours, selectedHour, setSelectedHour, '시')}
              {renderWheelColumn(minutes, selectedMinute, setSelectedMinute, '분')}
            </View>
            <Text style={styles.timePickerValue}>
              {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
            </Text>
            <PrimaryButton onPress={() => setShowTimePickerModal(false)}>완료</PrimaryButton>
          </View>
        </View>
      </Modal>

    </Screen>
  );
}
