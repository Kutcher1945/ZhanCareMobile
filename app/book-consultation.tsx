import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { consultationService } from '@/services/consultationService';
import { Doctor } from '@/types/user';
import { ConsultationType } from '@/types/consultation';

type BookingStep = 1 | 2 | 3 | 4;

export default function BookConsultationScreen() {
  console.log('BookConsultationScreen MOUNTED');
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Symptoms
  const [symptoms, setSymptoms] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Step 2: Doctor selection
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Step 3: Consultation type and time
  const [consultationType, setConsultationType] = useState<ConsultationType>('video');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep === 1) {
      if (!symptoms.trim()) {
        alert('Пожалуйста, опишите ваши симптомы');
        return;
      }
      // Fetch available doctors based on symptoms
      await fetchDoctors();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDoctor) {
        alert('Пожалуйста, выберите врача');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedTime) {
        alert('Пожалуйста, выберите время');
        return;
      }
      await createConsultation();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    } else {
      router.back();
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctors = await consultationService.getAvailableDoctors();
      setAvailableDoctors(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Не удалось загрузить список врачей');
    } finally {
      setLoading(false);
    }
  };

  const createConsultation = async () => {
    try {
      setLoading(true);

      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      await consultationService.createConsultation({
        symptoms,
        type: consultationType,
        is_urgent: isUrgent,
        scheduled_at: scheduledDateTime.toISOString(),
        doctor_id: selectedDoctor?.id,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('Не удалось создать консультацию');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            currentStep >= step && styles.progressStepActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Опишите ваши симптомы</Text>
      <Text style={styles.stepSubtitle}>
        Расскажите подробно о том, что вас беспокоит
      </Text>

      <TextInput
        style={styles.textArea}
        placeholder="Например: Головная боль, температура 38°C..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={6}
        value={symptoms}
        onChangeText={setSymptoms}
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsUrgent(!isUrgent);
        }}
      >
        <View style={styles.urgentToggleIcon}>
          <Ionicons
            name={isUrgent ? 'alert-circle' : 'alert-circle-outline'}
            size={24}
            color={isUrgent ? '#EF4444' : '#6B7280'}
          />
        </View>
        <View style={styles.urgentToggleText}>
          <Text style={[styles.urgentToggleTitle, isUrgent && styles.urgentToggleTitleActive]}>
            Срочная консультация
          </Text>
          <Text style={styles.urgentToggleSubtitle}>
            Врач ответит в течение 15 минут
          </Text>
        </View>
        <View
          style={[
            styles.urgentToggleCheckbox,
            isUrgent && styles.urgentToggleCheckboxActive,
          ]}
        >
          {isUrgent && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </Pressable>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Выберите врача</Text>
      <Text style={styles.stepSubtitle}>
        {availableDoctors?.length || 0} врачей доступны для консультации
      </Text>

      <ScrollView style={styles.doctorsList} showsVerticalScrollIndicator={false}>
        {(availableDoctors || []).map((doctor) => (
          <Pressable
            key={doctor.id}
            style={[
              styles.doctorCard,
              selectedDoctor?.id === doctor.id && styles.doctorCardSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDoctor(doctor);
            }}
          >
            <View style={styles.doctorAvatar}>
              <LinearGradient
                colors={['#3772ff', '#2c5bcc']}
                style={styles.doctorAvatarGradient}
              >
                <Text style={styles.doctorAvatarText}>
                  {doctor.first_name.charAt(0)}
                  {doctor.last_name.charAt(0)}
                </Text>
              </LinearGradient>
              {doctor.is_available && <View style={styles.doctorOnlineDot} />}
            </View>

            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                {doctor.first_name} {doctor.last_name}
              </Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
              {doctor.experience_years && (
                <Text style={styles.doctorExperience}>
                  Опыт: {doctor.experience_years} лет
                </Text>
              )}
            </View>

            <View
              style={[
                styles.doctorCheckbox,
                selectedDoctor?.id === doctor.id && styles.doctorCheckboxSelected,
              ]}
            >
              {selectedDoctor?.id === doctor.id && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => {
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '14:00', '15:00', '16:00', '17:00',
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Выберите тип и время</Text>
        <Text style={styles.stepSubtitle}>Как вы хотите провести консультацию?</Text>

        <View style={styles.consultationTypes}>
          {[
            { type: 'video' as ConsultationType, icon: 'videocam', label: 'Видео звонок' },
            { type: 'phone' as ConsultationType, icon: 'call', label: 'Телефон' },
            { type: 'chat' as ConsultationType, icon: 'chatbubbles', label: 'Чат' },
          ].map((item) => (
            <Pressable
              key={item.type}
              style={[
                styles.consultationTypeCard,
                consultationType === item.type && styles.consultationTypeCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setConsultationType(item.type);
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={32}
                color={consultationType === item.type ? '#3772ff' : '#6B7280'}
              />
              <Text
                style={[
                  styles.consultationTypeLabel,
                  consultationType === item.type && styles.consultationTypeLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Выберите время</Text>
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((time) => (
            <Pressable
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.timeSlotSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTime(time);
              }}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.timeSlotTextSelected,
                ]}
              >
                {time}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <Text style={styles.successTitle}>Консультация создана!</Text>
      <Text style={styles.successMessage}>
        Вы получите уведомление, когда врач будет готов начать консультацию
      </Text>

      <View style={styles.successDetails}>
        <View style={styles.successDetailRow}>
          <Ionicons name="person" size={20} color="#6B7280" />
          <Text style={styles.successDetailText}>
            {selectedDoctor?.first_name} {selectedDoctor?.last_name}
          </Text>
        </View>
        <View style={styles.successDetailRow}>
          <Ionicons name="calendar" size={20} color="#6B7280" />
          <Text style={styles.successDetailText}>
            {selectedDate.toLocaleDateString('ru-RU')} в {selectedTime}
          </Text>
        </View>
        <View style={styles.successDetailRow}>
          <Ionicons name="videocam" size={20} color="#6B7280" />
          <Text style={styles.successDetailText}>
            {consultationType === 'video' ? 'Видео звонок' : consultationType === 'phone' ? 'Телефон' : 'Чат'}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.successButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.replace('/(tabs)/');
        }}
      >
        <LinearGradient
          colors={['#3772ff', '#2c5bcc']}
          style={styles.successButtonGradient}
        >
          <Text style={styles.successButtonText}>Вернуться на главную</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {currentStep === 4 ? 'Готово' : 'Новая консультация'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {currentStep < 4 && renderProgressBar()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>

        {currentStep < 4 && (
          <View style={styles.footer}>
            <Pressable
              style={styles.nextButton}
              onPress={handleNext}
              disabled={loading}
            >
              <LinearGradient
                colors={['#3772ff', '#2c5bcc']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {loading ? 'Загрузка...' : currentStep === 3 ? 'Создать консультацию' : 'Далее'}
                </Text>
                {!loading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#3772ff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 150,
    marginBottom: 16,
  },
  urgentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  urgentToggleActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  urgentToggleIcon: {
    marginRight: 12,
  },
  urgentToggleText: {
    flex: 1,
  },
  urgentToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  urgentToggleTitleActive: {
    color: '#EF4444',
  },
  urgentToggleSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  urgentToggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentToggleCheckboxActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  doctorsList: {
    flex: 1,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  doctorCardSelected: {
    borderColor: '#3772ff',
    backgroundColor: '#EBF1FF',
  },
  doctorAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  doctorAvatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorOnlineDot: {
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
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  doctorCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorCheckboxSelected: {
    backgroundColor: '#3772ff',
    borderColor: '#3772ff',
  },
  consultationTypes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  consultationTypeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultationTypeCardActive: {
    borderColor: '#3772ff',
    backgroundColor: '#EBF1FF',
  },
  consultationTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  consultationTypeLabelActive: {
    color: '#3772ff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeSlotSelected: {
    borderColor: '#3772ff',
    backgroundColor: '#EBF1FF',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeSlotTextSelected: {
    color: '#3772ff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successDetailText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  successButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
