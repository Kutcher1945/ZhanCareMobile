import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'video' | 'home' | 'clinic';
}

export default function AppointmentsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const appointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Доктор Иванов И.И.',
      specialty: 'Терапевт',
      date: '15 ноября 2024',
      time: '14:30',
      status: 'upcoming',
      type: 'video',
    },
    {
      id: '2',
      doctorName: 'Доктор Смирнова А.В.',
      specialty: 'Кардиолог',
      date: '18 ноября 2024',
      time: '10:00',
      status: 'upcoming',
      type: 'clinic',
    },
    {
      id: '3',
      doctorName: 'Доктор Петров С.М.',
      specialty: 'Педиатр',
      date: '10 ноября 2024',
      time: '16:00',
      status: 'completed',
      type: 'home',
    },
  ];

  const filteredAppointments = appointments.filter(apt => {
    if (activeFilter === 'all') return true;
    return apt.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3772ff';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Предстоящий';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'home': return 'home';
      case 'clinic': return 'medical';
      default: return 'calendar';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои записи</Text>
        <Pressable style={styles.addButton}>
          <LinearGradient
            colors={['#3772ff', '#2c5bcc']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Pressable
            style={[styles.filterButton, activeFilter === 'upcoming' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('upcoming')}
          >
            <Text style={[styles.filterText, activeFilter === 'upcoming' && styles.filterTextActive]}>
              Предстоящие
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
              Все
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, activeFilter === 'completed' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={[styles.filterText, activeFilter === 'completed' && styles.filterTextActive]}>
              Завершенные
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Нет записей</Text>
            <Text style={styles.emptyStateText}>
              У вас пока нет {activeFilter === 'upcoming' ? 'предстоящих' : 'завершенных'} записей
            </Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <Pressable key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentIcon}>
                  <LinearGradient
                    colors={['#3772ff', '#2c5bcc']}
                    style={styles.appointmentIconGradient}
                  >
                    <Ionicons
                      name={getTypeIcon(appointment.type) as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                  <Text style={styles.specialty}>{appointment.specialty}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(appointment.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{appointment.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{appointment.time}</Text>
                </View>
              </View>

              {appointment.status === 'upcoming' && (
                <View style={styles.appointmentActions}>
                  <Pressable style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Отменить</Text>
                  </Pressable>
                  <Pressable style={styles.actionButtonPrimary}>
                    <LinearGradient
                      colors={['#3772ff', '#2c5bcc']}
                      style={styles.actionButtonPrimaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.actionButtonPrimaryText}>Присоединиться</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
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
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3772ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filters: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3772ff',
    borderColor: '#3772ff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentIcon: {
    marginRight: 12,
  },
  appointmentIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonPrimaryGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
