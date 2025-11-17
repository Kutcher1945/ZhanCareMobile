import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

interface Message {
  id: string;
  doctorName: string;
  specialty: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export default function MessagesScreen() {
  const messages: Message[] = [
    {
      id: '1',
      doctorName: 'Доктор Иванов И.И.',
      specialty: 'Терапевт',
      lastMessage: 'Добрый день! Результаты анализов готовы',
      timestamp: '10:30',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      doctorName: 'Доктор Смирнова А.В.',
      specialty: 'Кардиолог',
      lastMessage: 'Не забудьте принять лекарства',
      timestamp: 'Вчера',
      unread: 1,
      online: false,
    },
    {
      id: '3',
      doctorName: 'Доктор Петров С.М.',
      specialty: 'Педиатр',
      lastMessage: 'Спасибо за консультацию!',
      timestamp: '2 дня назад',
      unread: 0,
      online: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Сообщения</Text>
        <Pressable style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#6B7280" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>Поиск сообщений...</Text>
        </View>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {messages.map((message) => (
          <Pressable key={message.id} style={styles.messageCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#3772ff', '#2c5bcc']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{message.doctorName.charAt(0)}</Text>
                {message.online && <View style={styles.onlineDot} />}
              </LinearGradient>
            </View>

            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <Text style={styles.doctorName}>{message.doctorName}</Text>
                  <Text style={styles.specialty}>{message.specialty}</Text>
                </View>
                <Text style={styles.timestamp}>{message.timestamp}</Text>
              </View>

              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.lastMessage,
                    message.unread > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {message.lastMessage}
                </Text>
                {message.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{message.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable style={styles.fab}>
        <LinearGradient
          colors={['#3772ff', '#2c5bcc']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: '#6B7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#111827',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#3772ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#3772ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
