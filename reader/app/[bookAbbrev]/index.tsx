import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getChapters, Chapter } from '@/api/client';

export default function BookScreen() {
  const { bookAbbrev, bookId, name } = useLocalSearchParams();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      loadChapters(Number(bookId));
    }
  }, [bookId]);

  const loadChapters = async (id: number) => {
    try {
      const data = await getChapters(id);
      setChapters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderChapter = ({ item }: { item: Chapter }) => (
    <TouchableOpacity
      style={styles.chapterCard}
      onPress={() => router.push(`/${bookAbbrev}/${item.id}/${item.number}?bookName=${name}`)}
    >
      <ThemedText style={styles.chapterNumber} type="defaultSemiBold">
        {item.number}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: typeof name === 'string' ? name : 'Capítulos' }} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChapter}
          numColumns={5}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  chapterCard: {
    flex: 1,
    margin: 6,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumber: {
    fontSize: 20,
  },
});
