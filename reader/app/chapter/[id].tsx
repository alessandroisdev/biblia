import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, View, Share } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getChapterVerses, Verse } from '@/api/client';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ChapterScreen() {
  const { id, bookName, chapterNumber } = useLocalSearchParams();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (id) {
      loadVerses(Number(id));
    }
    return () => {
      // Stop speech if navigating away
      Speech.stop();
    };
  }, [id]);

  const loadVerses = async (chapterId: number) => {
    try {
      const data = await getChapterVerses(chapterId);
      setVerses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerseSelection = (verseId: string) => {
    const newSelection = new Set(selectedVerseIds);
    if (newSelection.has(verseId)) {
      newSelection.delete(verseId);
    } else {
      newSelection.add(verseId);
    }
    setSelectedVerseIds(newSelection);
  };

  const getSelectedText = () => {
    // Return selected verses in order
    return verses
      .filter((v) => selectedVerseIds.has(v.id))
      .map((v) => `${v.number}. ${v.text}`)
      .join('\n');
  };

  const handleShare = async () => {
    const textToShare = `${bookName} ${chapterNumber}\n\n${getSelectedText()}`;
    try {
      await Share.share({
        message: textToShare,
      });
      // Clear selection after share?
      setSelectedVerseIds(new Set());
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const handleSpeech = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = getSelectedText();
    if (!textToSpeak) return;

    setIsPlaying(true);
    Speech.speak(textToSpeak, {
      language: 'pt-BR',
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const renderVerse = ({ item }: { item: Verse }) => {
    const isSelected = selectedVerseIds.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.verseRow, isSelected && styles.verseRowSelected]}
        onPress={() => toggleVerseSelection(item.id)}
      >
        <ThemedText style={[styles.verseNumber, isSelected && { color: tintColor }]} type="defaultSemiBold">
          {item.number}
        </ThemedText>
        <ThemedText style={styles.verseText}>{item.text}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `${bookName} ${chapterNumber}` }} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => item.id}
          renderItem={renderVerse}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedVerseIds.size > 0 && (
        <View style={styles.actionBar}>
          <ThemedText style={styles.actionText}>{selectedVerseIds.size} selecionado(s)</ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSpeech}>
              <IconSymbol name={isPlaying ? "stop.fill" : "play.fill"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <IconSymbol name="square.and.arrow.up" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 100, // Make room for action bar
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
  },
  verseRowSelected: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  verseNumber: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.6,
  },
  verseText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
  },
  actionBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 8,
  }
});
