import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { News, fetchNewsById, fetchAnnouncementById } from '../../../services/newsService';

// Direkt renk tanımları
const colors = {
  primary: '#2ecc71',
  secondary: '#27ae60',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  darkGray: '#7f8c8d',
  gray: '#bdc3c7',
  lightGray: '#ecf0f1',
  error: '#e74c3c',
};

const NewsDetailScreen = () => {
  const { id, type } = useLocalSearchParams<{ id: string, type?: string }>();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAnnouncement = type === 'announcement';

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        
        // ID'ye göre içeriği çek (duyuru veya haber)
        const response = isAnnouncement 
          ? await fetchAnnouncementById(id as string)
          : await fetchNewsById(id as string);
        
        if (response.success && response.data) {
          setNewsItem(response.data);
          setError('');
        } else {
          setError(isAnnouncement ? 'Duyuru bulunamadı' : 'Haber bulunamadı');
        }
      } catch (err) {
        console.error(`Error fetching ${isAnnouncement ? 'announcement' : 'news'} detail:`, err);
        setError(`${isAnnouncement ? 'Duyuru' : 'Haber'} yüklenirken bir hata oluştu`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetail();
    }
  }, [id, isAnnouncement]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isAnnouncement ? 'Duyuru Detayı' : 'Haber Detayı'}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !newsItem) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isAnnouncement ? 'Duyuru Detayı' : 'Haber Detayı'}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorText}>{error || 'İçerik bulunamadı'}</Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListText}>{isAnnouncement ? 'Duyurulara Dön' : 'Haberlere Dön'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {newsItem.title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {newsItem.image_url && (
          <Image
            source={{ uri: newsItem.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          {!isAnnouncement && newsItem.Sports && (
            <View style={styles.categoryContainer}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{newsItem.Sports.name}</Text>
              </View>
            </View>
          )}

          <Text style={styles.title}>{newsItem.title}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.date}>
              {new Date(newsItem.published_date || newsItem.created_at || newsItem.createdAt || '').toLocaleDateString()}
            </Text>
            
            {!isAnnouncement && newsItem.source && (
              <View style={styles.sourceContainer}>
                <Text style={styles.sourceLabel}>Kaynak: </Text>
                <Text style={styles.source}>{newsItem.source}</Text>
              </View>
            )}
            
            {!isAnnouncement && newsItem.source_url && (
              <TouchableOpacity style={styles.visitSourceButton}>
                <Text style={styles.visitSourceText}>Kaynağı Ziyaret Et</Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.content}>{newsItem.content}</Text>
          
          {!isAnnouncement && newsItem.tags && newsItem.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Etiketler:</Text>
              <View style={styles.tagsList}>
                {newsItem.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  contentContainer: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: colors.darkGray,
    marginRight: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  sourceLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  source: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  visitSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  visitSourceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  backToListButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backToListText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default NewsDetailScreen;
