import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  View
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './HomePage.styles';

const { width } = Dimensions.get('window');

interface QuickActionCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  colors: [string, string];
  onPress: () => void;
}

interface UpcomingAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'home' | 'clinic';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomePage() {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('HomePage mounted', user);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const quickActions: QuickActionCard[] = [
    {
      id: 'video',
      icon: 'videocam',
      title: 'Видео',
      subtitle: 'Консультация',
      colors: ['#3772ff', '#2c5bcc'],
      onPress: () => console.log('Video consultation'),
    },
    {
      id: 'home',
      icon: 'home',
      title: 'Вызов на дом',
      subtitle: 'Врач домой',
      colors: ['#283353', '#202942'],
      onPress: () => console.log('Home visit'),
    },
    {
      id: 'medical-history',
      icon: 'medical',
      title: 'Мед. история',
      subtitle: 'История болезней',
      colors: ['#3772ff', '#3267e6'],
      onPress: () => console.log('Medical history'),
    },
    {
      id: 'med-tourism',
      icon: 'airplane',
      title: 'Мед Туризм',
      subtitle: 'Лечение за рубежом',
      colors: ['#2956bf', '#214499'],
      onPress: () => console.log('Med tourism'),
    },
    {
      id: 'documents',
      icon: 'document-text',
      title: 'Документы',
      subtitle: 'Мед. документы',
      colors: ['#3772ff', '#2c5bcc'],
      onPress: () => console.log('Documents'),
    },
    {
      id: 'activity',
      icon: 'refresh',
      title: 'Активность',
      subtitle: 'История',
      colors: ['#283353', '#202942'],
      onPress: () => console.log('Activity'),
    },
  ];

  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: '1',
      doctorName: 'Доктор Иванов',
      specialty: 'Терапевт',
      date: '15 ноября',
      time: '14:30',
      type: 'video',
    },
  ];

  const healthStats = [
    { label: 'Пульс', value: '72', unit: 'уд/мин', icon: 'heart', color: '#EF4444' },
    { label: 'Шаги', value: '8,432', unit: 'сегодня', icon: 'walk', color: '#10B981' },
    { label: 'Сон', value: '7.5', unit: 'часов', icon: 'moon', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
            </View>

            <Pressable onPress={() => console.log('Navigate to profile')} style={styles.avatarContainer}>
              <LinearGradient
                colors={['#3772ff', '#2c5bcc']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                <View style={styles.onlineDot} />
              </LinearGradient>
            </Pressable>
          </View>

          {/* Search Bar */}
          <Pressable style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Поиск врачей, услуг...</Text>
          </Pressable>
        </Animated.View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Pressable
                  key={action.id}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.quickActionCard,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <LinearGradient
                    colors={action.colors}
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.quickActionIcon}>
                      <Ionicons name={action.icon} size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.quickActionTextContainer}>
                      <Text style={styles.quickActionTitle}>{action.title}</Text>
                      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ближайшие приемы</Text>
              <Pressable>
                <Text style={styles.seeAllText}>Все</Text>
              </Pressable>
            </View>

            {upcomingAppointments.map((appointment) => (
              <Pressable key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentIcon}>
                  <LinearGradient
                    colors={['#3772ff', '#2c5bcc']}
                    style={styles.appointmentIconGradient}
                  >
                    <Ionicons
                      name={
                        appointment.type === 'video'
                          ? 'videocam'
                          : appointment.type === 'home'
                          ? 'home'
                          : 'medical'
                      }
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </View>

                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                  <Text style={styles.specialty}>{appointment.specialty}</Text>
                  <View style={styles.appointmentTime}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.timeText}>
                      {appointment.date} в {appointment.time}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Health Stats */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Здоровье сегодня</Text>
          <View style={styles.healthStatsContainer}>
            {healthStats.map((stat, index) => (
              <View key={index} style={styles.healthStatCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statUnit}>{stat.unit}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Services Banner */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable style={styles.banner}>
            <LinearGradient
              colors={['#283353', '#1e263e']}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerContent}>
                <Ionicons name="shield-checkmark" size={40} color="#3772ff" />
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Премиум подписка</Text>
                  <Text style={styles.bannerSubtitle}>
                    Неограниченные консультации
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
