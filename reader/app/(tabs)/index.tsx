import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getVersions, getBooks, Version, Book } from '@/api/client';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ReadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (selectedVersionId) {
      loadBooks(selectedVersionId);
    }
  }, [selectedVersionId]);

  const loadVersions = async () => {
    try {
      const data = await getVersions();
      setVersions(data);
      if (data.length > 0) {
        setSelectedVersionId(data[0].id);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const loadBooks = async (versionId: number) => {
    setLoading(true);
    try {
      const data = await getBooks(versionId);
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => router.push(`/book/${item.id}?name=${encodeURIComponent(item.name)}`)}
    >
      <ThemedText style={styles.bookAbbrev} type="defaultSemiBold">
        {item.abbreviation.toUpperCase()}
      </ThemedText>
      <ThemedText style={styles.bookName} numberOfLines={1}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Leitura</ThemedText>
        <View style={[styles.pickerContainer, { borderColor: textColor }]}>
          <Picker
            selectedValue={selectedVersionId}
            onValueChange={(itemValue) => setSelectedVersionId(itemValue)}
            style={{ color: textColor }}
            dropdownIconColor={textColor}
          >
            {versions.map((v) => (
              <Picker.Item key={v.id} label={v.name} value={v.id} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBook}
          numColumns={3}
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 24,
  },
  title: {
    marginBottom: 16,
    fontSize: 32,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  loader: {
    marginTop: 32,
  },
  listContainer: {
    padding: 16,
  },
  bookCard: {
    flex: 1,
    margin: 6,
    aspectRatio: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookAbbrev: {
    fontSize: 22,
    marginBottom: 4,
  },
  bookName: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
