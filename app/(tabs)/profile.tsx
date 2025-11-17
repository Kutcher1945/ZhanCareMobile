import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const profileStats = [
    { label: 'Визиты', value: '12', icon: 'calendar' as const },
    { label: 'Рецепты', value: '8', icon: 'document-text' as const },
    { label: 'Чаты', value: '24', icon: 'chatbubbles' as const },
  ];

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Личная информация',
      items: [
        {
          id: 'personal',
          icon: 'person-outline',
          title: 'Личные данные',
          subtitle: 'Имя, дата рождения, контакты',
          onPress: () => console.log('Personal info'),
          showChevron: true,
        },
        {
          id: 'medical',
          icon: 'medical-outline',
          title: 'Медицинская карта',
          subtitle: 'История болезней, аллергии',
          onPress: () => console.log('Medical info'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Настройки',
      items: [
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Уведомления',
          onPress: () => console.log('Notifications'),
          showChevron: true,
        },
        {
          id: 'security',
          icon: 'shield-checkmark-outline',
          title: 'Безопасность',
          onPress: () => console.log('Security'),
          showChevron: true,
        },
        {
          id: 'language',
          icon: 'language-outline',
          title: 'Язык',
          subtitle: 'Русский',
          onPress: () => console.log('Language'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Поддержка',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          title: 'Помощь и поддержка',
          onPress: () => console.log('Help'),
          showChevron: true,
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          title: 'О приложении',
          subtitle: 'Версия 1.0.0',
          onPress: () => console.log('About'),
          showChevron: true,
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#3772ff', '#2c5bcc']}
            style={styles.avatarLarge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarLargeText}>{user?.name?.charAt(0) || 'U'}</Text>
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </LinearGradient>

          <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>

          <Pressable style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Редактировать профиль</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon} size={24} color="#3772ff" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex !== section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={item.icon} size={22} color="#6B7280" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.showChevron && (
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Выйти</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#3772ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#283353',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3772ff',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3772ff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ebf1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
