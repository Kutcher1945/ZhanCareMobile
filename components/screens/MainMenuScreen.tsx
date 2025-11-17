import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './MainMenuScreen.styles';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
}

interface MenuItemComponentProps extends MenuItem {
  isActive: boolean;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ 
  icon, 
  title, 
  color, 
  onPress, 
  isActive, 
  index 
}) => {
  const scaleValue = new Animated.Value(0.8);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 120),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.menuItemWrapper, 
        { 
          opacity: opacityValue,
          transform: [{ scale: scaleValue }] 
        }
      ]}
    >
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive 
            ? ['rgba(99, 102, 241, 0.25)', 'rgba(79, 70, 229, 0.15)', 'rgba(67, 56, 202, 0.08)']
            : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.menuItemGradient}
        >
          {/* Left accent bar for active item */}
          {isActive && <View style={[styles.activeAccent, { backgroundColor: color }]} />}
          
          {/* Icon container with glassmorphism */}
          <View style={[
            styles.menuIconContainer,
            { backgroundColor: `${color}20` }
          ]}>
            <View style={styles.iconGlassEffect} />
            <Ionicons 
              name={icon} 
              size={26} 
              color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'} 
              style={{ zIndex: 2 }}
            />
            {isActive && (
              <View style={[styles.iconGlow, { backgroundColor: `${color}40` }]} />
            )}
          </View>

          {/* Title */}
          <Text style={[
            styles.menuItemTitle,
            isActive && { color: '#FFFFFF', fontWeight: '700' }
          ]}>
            {title}
          </Text>

          {/* Active indicator */}
          {isActive && (
            <View style={styles.activeIndicator}>
              <View style={[styles.activeDot, { backgroundColor: color }]} />
            </View>
          )}

          {/* Shimmer effect */}
          <View style={styles.shimmerOverlay} />
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export default function MainMenuScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const backgroundAnimatedValue = new Animated.Value(0);

  useEffect(() => {
    // Animated background effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimatedValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundAnimatedValue, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems: MenuItem[] = [
    { id: 'profile', icon: 'person-circle', title: 'Профиль', color: '#6366F1', onPress: () => setActiveTab('profile') },
    { id: 'video', icon: 'videocam', title: 'Видео консультация', color: '#8B5CF6', onPress: () => setActiveTab('video') },
    { id: 'appointments', icon: 'calendar', title: 'Вызов на дом', color: '#06B6D4', onPress: () => setActiveTab('appointments') },
    { id: 'history', icon: 'document-text', title: 'Медицинская история', color: '#10B981', onPress: () => setActiveTab('history') },
    { id: 'chat', icon: 'chatbubble-ellipses', title: 'Чат с врачами', color: '#F59E0B', onPress: () => setActiveTab('chat') },
    { id: 'documents', icon: 'folder-open', title: 'Документы', color: '#EF4444', onPress: () => setActiveTab('documents') },
    { id: 'activity', icon: 'pulse', title: 'Активность', color: '#EC4899', onPress: () => setActiveTab('activity') },
  ];

  const getRoleGradient = (role: string): [string, string] => {
    switch (role) {
      case 'doctor':
        return ['#6366F1', '#4F46E5'];
      case 'admin':
        return ['#8B5CF6', '#7C3AED'];
      default:
        return ['#06B6D4', '#0891B2'];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Animated Background */}
      <Animated.View style={[
        styles.animatedBackground,
        {
          transform: [{
            translateX: backgroundAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 50],
            })
          }]
        }
      ]} />

      {/* Premium Sidebar */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155', '#475569']}
        style={styles.sidebar}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Glass Morphism Overlay */}
        <View style={styles.glassOverlay} />
        
        {/* Floating Background Elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle1, {
            transform: [{
              rotate: backgroundAnimatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }]
          }]} />
          <Animated.View style={[styles.floatingCircle2, {
            transform: [{
              rotate: backgroundAnimatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['360deg', '0deg'],
              })
            }]
          }]} />
          <Animated.View style={[styles.floatingCircle3, {
            transform: [{
              scale: backgroundAnimatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.2, 1],
              })
            }]
          }]} />
        </View>

        <SafeAreaView style={styles.sidebarContent}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={getRoleGradient(user?.role || 'patient')}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>Z</Text>
                <View style={styles.logoShimmer} />
              </LinearGradient>
            </View>
          </View>

          {/* User Profile Section */}
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <LinearGradient
                colors={getRoleGradient(user?.role || 'patient')}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) || 'U'}
                </Text>
                {/* Online Status Indicator */}
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                </View>
              </LinearGradient>
            </View>

            {/* Role Badge */}
            <View style={styles.roleBadge}>
              <LinearGradient
                colors={getRoleGradient(user?.role || 'patient')}
                style={styles.roleBadgeGradient}
              >
                <Ionicons 
                  name={user?.role === 'doctor' ? 'medical' : user?.role === 'admin' ? 'flash' : 'person'} 
                  size={12} 
                  color="#FFFFFF" 
                />
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'doctor' ? 'Доктор' : user?.role === 'admin' ? 'Админ' : 'Пациент'}
                </Text>
              </LinearGradient>
            </View>

            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Navigation Menu */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <MenuItemComponent
                key={item.id}
                {...item}
                isActive={activeTab === item.id}
                index={index}
              />
            ))}
          </ScrollView>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LinearGradient
              colors={['#EF4444', '#DC2626', '#B91C1C']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>Выйти</Text>
              <View style={styles.logoutShimmer} />
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}