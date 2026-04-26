import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, View, Share } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getChapterVerses, Verse } from '@/api/client';
import { useThemeColor } from '@/hooks/use-theme-color';

// Helper to parse "1,3,5-7,8" into an array [1, 3, 5, 6, 7, 8]
const parseVersesParam = (versesParam: string): number[] => {
  if (!versesParam) return [];
  const result: number[] = [];
  const parts = versesParam.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num)) result.push(num);
    }
  }
  return result;
};

// Helper to format [1,3,5,6,7,8] back into "1,3,5-7,8"
const formatVersesParam = (numbers: number[]): string => {
  if (numbers.length === 0) return '';
  const sorted = [...numbers].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      parts.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  parts.push(start === end ? `${start}` : `${start}-${end}`);
  return parts.join(',');
};

export default function ChapterScreen() {
  const { chapterId, bookName, bookAbbrev, chapterNumber, verses: versesParam } = useLocalSearchParams();
  const [versesList, setVersesList] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerses, setSelectedVerses] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (chapterId) {
      loadVerses(Number(chapterId));
    }
    return () => {
      Speech.stop();
    };
  }, [chapterId]);

  const loadVerses = async (cId: number) => {
    try {
      const data = await getChapterVerses(cId);
      setVersesList(data);
      
      // Auto-select verses if passed in URL
      if (typeof versesParam === 'string' && versesParam.length > 0) {
        const numbersToSelect = parseVersesParam(versesParam);
        const newSelection: Record<string, boolean> = {};
        data.forEach(v => {
          if (numbersToSelect.includes(v.number)) {
            newSelection[v.id] = true;
          }
        });
        setSelectedVerses(newSelection);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerseSelection = (verseId: string) => {
    setSelectedVerses(prev => {
      const newSelection = { ...prev };
      if (newSelection[verseId]) {
        delete newSelection[verseId];
      } else {
        newSelection[verseId] = true;
      }
      return newSelection;
    });
  };

  const getSelectedCount = () => Object.keys(selectedVerses).length;

  const getSelectedText = () => {
    return versesList
      .filter((v) => selectedVerses[v.id])
      .map((v) => `${v.number}. ${v.text}`)
      .join('\n');
  };

  const getSelectedNumbers = () => {
    return versesList
      .filter((v) => selectedVerses[v.id])
      .map((v) => v.number);
  };

  const handleShare = async () => {
    const selectedNums = getSelectedNumbers();
    const formattedRange = formatVersesParam(selectedNums);
    
    // Construct the share URL: http://localhost:8081/GN/452/2/1-4
    // Note: In a real app, you'd use a domain. We use a placeholder or read from constants.
    const shareUrl = `http://localhost:8081/${bookAbbrev}/${chapterId}/${chapterNumber}/${formattedRange}?bookName=${encodeURIComponent(String(bookName))}`;
    
    const textToShare = `${bookName} ${chapterNumber}:${formattedRange}\n\n${getSelectedText()}\n\nLeia mais em: ${shareUrl}`;
    
    try {
      await Share.share({
        message: textToShare,
      });
      setSelectedVerses({});
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

  const handleSpeechAll = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = versesList.map(v => `${v.number}. ${v.text}`).join('\n');
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
    const isSelected = !!selectedVerses[item.id];
    
    return (
      <TouchableOpacity
        style={[styles.verseRow, isSelected && styles.verseRowSelected]}
        onPress={() => toggleVerseSelection(item.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.verseNumber, isSelected && { color: tintColor }]} type="defaultSemiBold">
          {item.number}
        </ThemedText>
        <ThemedText style={[styles.verseText, isSelected && { fontWeight: '500' }]}>{item.text}</ThemedText>
      </TouchableOpacity>
    );
  };

  const selectedCount = getSelectedCount();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: typeof bookName === 'string' ? `${bookName} ${chapterNumber}` : 'Capítulo',
          headerRight: () => (
            <TouchableOpacity onPress={selectedCount > 0 ? handleSpeech : handleSpeechAll} style={{ marginRight: 15 }}>
              <IconSymbol name={isPlaying ? "stop.fill" : "play.fill"} size={24} color={tintColor} />
            </TouchableOpacity>
          )
        }} 
      />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={versesList}
          keyExtractor={(item) => item.id}
          renderItem={renderVerse}
          extraData={selectedVerses}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedCount > 0 && (
        <View style={styles.actionBar}>
          <ThemedText style={styles.actionText}>{selectedCount} selecionado(s)</ThemedText>
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
    backgroundColor: 'rgba(0, 150, 255, 0.2)', // Highlight selection more visibly
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
    bottom: 40,
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
    elevation: 10,
    zIndex: 100, // Ensure it sits on top of everything
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
