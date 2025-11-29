import { EmptyState } from '@/components/common/EmptyState';
import { AppointmentCardSkeleton, QuickActionSkeleton } from '@/components/common/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { consultationService } from '@/services/consultationService';
import { Consultation } from '@/types/consultation';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
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
  colors: [string, string];
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Promo banners data
const PROMO_BANNERS = [
  { id: '1', image: require('@/assets/images/promo_banner.png') },
  { id: '2', image: require('@/assets/images/promo_banner_2.png') },
  { id: '3', image: require('@/assets/images/promo_banner_3.png') },
];

const BANNER_WIDTH = width - 48; // Account for padding and margins
const BANNER_HEIGHT = 130;

export default function HomePage() {
  const { user, logout } = useAuth();
  const routerHook = useRouter();
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const bannerFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('HomePage mounted', user);
    updateGreeting();
    loadInitialData();

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

  const loadInitialData = async () => {
    try {
      const consultations = await consultationService.getMyConsultations({
        status: ['pending', 'scheduled', 'planned'],
      });
      // Get only the next 3 upcoming consultations
      setUpcomingConsultations(consultations.slice(0, 3));
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await loadInitialData();
    updateGreeting();

    setRefreshing(false);
  };

  const handleActionPress = (action: QuickActionCard) => {
    console.log('Quick action pressed:', action.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action.onPress();
  };

  const quickActions: QuickActionCard[] = [
    {
      id: 'video',
      icon: 'videocam',
      title: 'Видео звонок',
      colors: ['#3772ff', '#2c5bcc'],
      onPress: () => {
        routerHook.push('/book-consultation');
      },
    },
    {
      id: 'home',
      icon: 'home',
      title: 'Вызов на дом',
      colors: ['#283353', '#202942'],
      onPress: () => console.log('Home visit'),
    },
    {
      id: 'medical-history',
      icon: 'medical',
      title: 'Мед. карта',
      colors: ['#3772ff', '#3267e6'],
      onPress: () => console.log('Medical history'),
    },
    {
      id: 'med-tourism',
      icon: 'airplane',
      title: 'Туризм',
      colors: ['#2956bf', '#214499'],
      onPress: () => console.log('Med tourism'),
    },
    {
      id: 'documents',
      icon: 'document-text',
      title: 'Документы',
      colors: ['#3772ff', '#2c5bcc'],
      onPress: () => console.log('Documents'),
    },
    {
      id: 'activity',
      icon: 'refresh',
      title: 'Активность',
      colors: ['#283353', '#202942'],
      onPress: () => console.log('Activity'),
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const healthStats = [
    { label: 'Пульс', value: '72', unit: 'уд/мин', icon: 'heart', color: '#EF4444' },
    { label: 'Шаги', value: '8,432', unit: 'сегодня', icon: 'walk', color: '#10B981' },
    { label: 'Сон', value: '7.5', unit: 'часов', icon: 'moon', color: '#8B5CF6' },
  ];

  // Render banner item with 3D effect
  const renderBannerItem = ({ item }: { item: typeof PROMO_BANNERS[0] }) => (
    <View style={styles.bannerItem}>
      {/* 3D Shadow layers for depth */}
      <View style={styles.bannerShadowLayer1} />
      <View style={styles.bannerShadowLayer2} />

      {/* Main banner with gradient overlay for 3D effect */}
      <View style={styles.bannerWrapper}>
        <Image
          source={item.image}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {/* Gradient overlay for depth */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)']}
          style={styles.bannerGradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Light reflection for 3D gloss effect */}
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
          style={styles.bannerLightReflection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        {/* Premium Hero Header */}
        <LinearGradient
          colors={['#3772ff', '#2c5bcc']}
          style={styles.heroHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{greeting}!</Text>
                <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
              </View>

              <Pressable onPress={() => router.push('/profile')} style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F3F4F6']}
                    style={styles.avatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                  </LinearGradient>
                  <View style={styles.onlineDot} />
                </View>
              </Pressable>
            </View>

            {/* Search Bar */}
            <Pressable style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <Text style={styles.searchPlaceholder}>Поиск врачей, услуг...</Text>
              <View style={styles.searchIconRight}>
                <Ionicons name="options-outline" size={20} color="#6B7280" />
              </View>
            </Pressable>
          </Animated.View>
        </LinearGradient>

        {/* Promo Banners Carousel */}
        <Animated.View
          style={[
            styles.carouselSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FlatList
            ref={bannerFlatListRef}
            data={PROMO_BANNERS}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 48}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          />
        </Animated.View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsGrid}>
              {isLoading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <QuickActionSkeleton key={`skeleton-${index}`} />
                ))
              ) : (
                // Show actual quick actions
                quickActions.map((action, index) => (
                  <Pressable
                    key={action.id}
                    onPress={() => handleActionPress(action)}
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
                        <Ionicons name={action.icon} size={22} color="#FFFFFF" />
                      </View>
                      <View style={styles.quickActionTextContainer}>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Find Clinics Button */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable
            style={styles.findClinicsCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              routerHook.push('/(tabs)/clinics');
            }}
          >
            <LinearGradient
              colors={['#3772ff', '#2c5bcc']}
              style={styles.findClinicsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.findClinicsIcon}>
                <Ionicons name="map" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.findClinicsContent}>
                <Text style={styles.findClinicsTitle}>Найти клинику</Text>
                <Text style={styles.findClinicsText}>
                  Откройте карту клиник и выберите подходящую
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Upcoming Appointments */}
        {/* <Animated.View
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

          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 2 }).map((_, index) => (
              <AppointmentCardSkeleton key={`appointment-skeleton-${index}`} />
            ))
          ) : upcomingConsultations.length > 0 ? (
            // Show actual appointments
            upcomingConsultations.map((consultation) => {
              const doctorName = `${consultation.doctor_first_name || ''} ${consultation.doctor_last_name || ''}`.trim() || 'Доктор';
              const dateToShow = consultation.scheduled_at || consultation.created_at;

              return (
                <Pressable key={consultation.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentIcon}>
                    <LinearGradient
                      colors={['#3772ff', '#2c5bcc']}
                      style={styles.appointmentIconGradient}
                    >
                      <Ionicons
                        name={
                          consultation.type === 'video'
                            ? 'videocam'
                            : consultation.type === 'phone'
                            ? 'call'
                            : consultation.type === 'chat'
                            ? 'chatbubbles'
                            : 'medical'
                        }
                        size={24}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </View>

                  <View style={styles.appointmentInfo}>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Text style={styles.specialty}>{consultation.doctor_specialization || 'Специалист'}</Text>
                    <View style={styles.appointmentTime}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.timeText}>
                        {formatDate(dateToShow)} в {formatTime(dateToShow)}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </Pressable>
              );
            })
          ) : (
            // Show empty state when no appointments
            <EmptyState
              icon="calendar-outline"
              title="Нет запланированных приемов"
              message="У вас пока нет предстоящих визитов к врачу"
              actionText="Записаться на прием"
              onAction={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/book-consultation');
              }}
            />
          )}
        </Animated.View> */}

        {/* Health Stats */}
        {/* <Animated.View
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
        </Animated.View> */}

        {/* Services Banner */}
        {/* <Animated.View
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
        </Animated.View> */}
    </SafeAreaView>
  );
}
