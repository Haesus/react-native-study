import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { postsEndpoint } from '../constants/api';
import { styles } from '../styles/styles';

export default function ApiScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(postsEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const nextPosts = await response.json();
      setPosts(nextPosts);
    } catch (error) {
      setErrorMessage(error.message || 'API 호출에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <Screen>
      <Text style={styles.screenTitle}>API 연결</Text>
      <Text style={styles.description}>
        JSONPlaceholder에서 글 목록을 가져와 네트워크 상태와 목록 렌더링을 확인합니다.
      </Text>

      <View style={styles.listPanel}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.helper}>불러오는 중</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <PrimaryButton onPress={loadPosts}>다시 시도</PrimaryButton>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.postItem, pressed && styles.postPressed]}
                onPress={() => navigation.navigate('Detail', { post: item })}
              >
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postBody} numberOfLines={2}>
                  {item.body}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
