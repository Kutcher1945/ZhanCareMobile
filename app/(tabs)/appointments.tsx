import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { consultationService } from '@/services/consultationService';
import { Consultation, ConsultationStatus } from '@/types/consultation';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

type FilterType = 'all' | 'upcoming' | 'completed';

export default function AppointmentsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);

      let statusFilters: ConsultationStatus[] = [];
      if (activeFilter === 'upcoming') {
        statusFilters = ['pending', 'scheduled', 'planned'];
      } else if (activeFilter === 'completed') {
        statusFilters = ['completed'];
      }

      const data = await consultationService.getMyConsultations({
        status: statusFilters.length > 0 ? statusFilters : undefined,
      });

      setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchConsultations();
    setRefreshing(false);
  };

  const filteredAppointments = consultations;

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case 'pending':
      case 'scheduled':
      case 'planned':
        return '#3772ff';
      case 'ongoing':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
      case 'missed':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'scheduled':
      case 'planned':
        return 'Запланировано';
      case 'ongoing':
        return 'Идет';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      case 'missed':
        return 'Пропущено';
      default:
        return status;
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return 'videocam';
      case 'phone':
        return 'call';
      case 'chat':
        return 'chatbubbles';
      default:
        return 'calendar';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelConsultation = async (id: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await consultationService.cancelConsultation(id);
      await fetchConsultations();
    } catch (error) {
      console.error('Error cancelling consultation:', error);
    }
  };

  const handleJoinConsultation = async (consultation: Consultation) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Navigate to video call screen with meeting_id
      console.log('Join consultation:', consultation.meeting_id);
    } catch (error) {
      console.error('Error joining consultation:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои записи</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/book-consultation');
          }}
        >
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3772ff"
            colors={['#3772ff']}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3772ff" />
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Нет записей</Text>
            <Text style={styles.emptyStateText}>
              У вас пока нет {activeFilter === 'upcoming' ? 'предстоящих' : 'завершенных'} записей
            </Text>
          </View>
        ) : (
          filteredAppointments.map((consultation) => {
            const doctorName = `${consultation.doctor_first_name || ''} ${consultation.doctor_last_name || ''}`.trim() || 'Доктор';
            const dateToShow = consultation.scheduled_at || consultation.created_at;

            return (
              <Pressable key={consultation.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentIcon}>
                    <LinearGradient
                      colors={['#3772ff', '#2c5bcc']}
                      style={styles.appointmentIconGradient}
                    >
                      <Ionicons
                        name={getTypeIcon(consultation.type) as any}
                        size={24}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Text style={styles.specialty}>{consultation.doctor_specialization || 'Специалист'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(consultation.status)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(consultation.status) }]}>
                      {getStatusText(consultation.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{formatDate(dateToShow)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{formatTime(dateToShow)}</Text>
                  </View>
                </View>

                {consultation.symptoms && (
                  <View style={styles.symptomsContainer}>
                    <Text style={styles.symptomsLabel}>Симптомы:</Text>
                    <Text style={styles.symptomsText} numberOfLines={2}>{consultation.symptoms}</Text>
                  </View>
                )}

                {(consultation.status === 'pending' || consultation.status === 'scheduled' || consultation.status === 'planned') && (
                  <View style={styles.appointmentActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleCancelConsultation(consultation.id)}
                    >
                      <Text style={styles.actionButtonText}>Отменить</Text>
                    </Pressable>
                    {consultation.status === 'scheduled' && (
                      <Pressable
                        style={styles.actionButtonPrimary}
                        onPress={() => handleJoinConsultation(consultation)}
                      >
                        <LinearGradient
                          colors={['#3772ff', '#2c5bcc']}
                          style={styles.actionButtonPrimaryGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.actionButtonPrimaryText}>Присоединиться</Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  symptomsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
});
