import { useState, useCallback } from 'react';
import { StyleSheet, TextInput, FlatList, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { searchVerses, Verse } from '@/api/client';
import { useThemeColor } from '@/hooks/use-theme-color';
import debounce from 'lodash.debounce';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Debounce the search to avoid spamming the API
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const data = await searchVerses(searchQuery);
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar dados.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleTextChange = (text: string) => {
    setQuery(text);
    performSearch(text);
  };

  const renderVerse = ({ item }: { item: Verse }) => (
    <ThemedView style={styles.verseCard}>
      <ThemedText style={styles.verseReference} type="defaultSemiBold">
        {item.id}
      </ThemedText>
      <ThemedText style={styles.verseText}>{item.text}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Bíblia Sagrada</ThemedText>
        <TextInput
          style={[
            styles.searchInput,
            { color: textColor, borderColor: tintColor, backgroundColor: bgColor === '#fff' ? '#f0f0f0' : '#1e1e1e' }
          ]}
          placeholder="Pesquisar versículo (ex: Jesus, amor...)"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleTextChange}
          autoCapitalize="none"
        />
      </View>

      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color={tintColor} />
      )}

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      {!loading && !error && query.length > 0 && results.length === 0 ? (
        <ThemedText style={styles.emptyText}>Nenhum versículo encontrado.</ThemedText>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderVerse}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
      />
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
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    opacity: 0.6,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  verseCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  verseReference: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
  },
});
