import { Text, View } from 'react-native';

import Screen from '../components/Screen';
import { styles } from '../styles/styles';

export default function DetailScreen({ route }) {
  const { post } = route.params;

  return (
    <Screen>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>POST #{post.id}</Text>
        <Text style={styles.detailTitle}>{post.title}</Text>
        <Text style={styles.detailBody}>{post.body}</Text>
      </View>
    </Screen>
  );
}
