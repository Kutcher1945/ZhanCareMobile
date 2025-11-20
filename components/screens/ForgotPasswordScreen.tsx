import api from '@/utils/api';
import i18n from '@/utils/i18n';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { VideoView, useVideoPlayer } from 'expo-video';
import { styles } from './ForgotPasswordScreen.styles';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({ email: '', code: '', password: '', general: '' });
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakeCode, setShakeCode] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [locale, setLocale] = useState(i18n.locale);

  const videoPlayer = useVideoPlayer(require('@/assets/videos/hero-video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'kz' : 'ru';
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  const dynamicInputStyle = (field: string) => [
    styles.input,
    focused === field && { borderColor: '#3A50FF', borderWidth: 2 }
  ];

  const handleSendCode = async () => {
    if (!email) {
      setErrors({ ...errors, email: i18n.t('requiredEmail') });
      setShakeEmail(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShakeEmail(false), 500);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setErrors({ email: '', code: '', password: '', general: '' });

    try {
      await api.post('/auth/forgot-password/', { email });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('code');
    } catch (err: any) {
      let message = i18n.t('somethingWentWrong');
      if (err?.response?.status === 404) {
        message = 'Пользователь с таким email не найден';
      } else if (err?.response?.data?.error) {
        message = err.response.data.error;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ email: '', code: '', password: '', general: message });
      setShakeEmail(true);
      setTimeout(() => setShakeEmail(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      setErrors({ ...errors, code: i18n.t('resetCodeRequired') });
      setShakeCode(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShakeCode(false), 500);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setErrors({ email: '', code: '', password: '', general: '' });

    try {
      await api.post('/auth/verify-reset-code/', { email, reset_code: resetCode });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('password');
    } catch (err: any) {
      let message = i18n.t('invalidResetCode');
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ email: '', code: '', password: '', general: message });
      setShakeCode(true);
      setTimeout(() => setShakeCode(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors = { email: '', code: '', password: '', general: '' };
    let hasError = false;

    if (!newPassword) {
      newErrors.password = i18n.t('newPasswordRequired');
      setShakePassword(true);
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.password = i18n.t('passwordTooShort');
      setShakePassword(true);
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.password = i18n.t('confirmPasswordRequired');
      setShakePassword(true);
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.password = i18n.t('passwordsDontMatch');
      setShakePassword(true);
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShakePassword(false), 500);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setErrors({ email: '', code: '', password: '', general: '' });

    try {
      await api.post('/auth/reset-password/', {
        email,
        reset_code: resetCode,
        new_password: newPassword,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message and navigate back to login
      setErrors({ email: '', code: '', password: '', general: i18n.t('passwordUpdated') });
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (err: any) {
      let message = i18n.t('somethingWentWrong');
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ email: '', code: '', password: '', general: message });
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
      <Text style={styles.description}>{i18n.t('resetPasswordDescription')}</Text>

      <Animatable.View animation={shakeEmail ? 'shake' : undefined}>
        <TextInput
          style={dynamicInputStyle('email')}
          placeholder={i18n.t('emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused('')}
        />
      </Animatable.View>
      {errors.email ? (
        <Animatable.Text animation="fadeIn" style={styles.error}>{errors.email}</Animatable.Text>
      ) : null}

      {errors.general ? (
        <Animatable.View animation="shake" style={styles.generalErrorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ff3b30" />
          <Animatable.Text animation="fadeIn" style={styles.generalError}>
            {errors.general}
          </Animatable.Text>
        </Animatable.View>
      ) : null}

      <Pressable
        onPress={handleSendCode}
        disabled={loading}
        android_ripple={{ color: '#001E80' }}
        style={{ opacity: loading ? 0.6 : 1, marginTop: 16 }}
      >
        <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{i18n.t('sendResetCode')}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );

  const renderCodeStep = () => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
      <Text style={styles.description}>{i18n.t('resetCodeSent')}</Text>
      <Text style={styles.description}>{i18n.t('enterResetCode')}</Text>

      <Animatable.View animation={shakeCode ? 'shake' : undefined}>
        <TextInput
          style={dynamicInputStyle('code')}
          placeholder={i18n.t('resetCodePlaceholder')}
          value={resetCode}
          onChangeText={setResetCode}
          autoCapitalize="characters"
          placeholderTextColor="#999"
          onFocus={() => setFocused('code')}
          onBlur={() => setFocused('')}
          maxLength={6}
        />
      </Animatable.View>
      {errors.code ? (
        <Animatable.Text animation="fadeIn" style={styles.error}>{errors.code}</Animatable.Text>
      ) : null}

      {errors.general ? (
        <Animatable.View animation="shake" style={styles.generalErrorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ff3b30" />
          <Animatable.Text animation="fadeIn" style={styles.generalError}>
            {errors.general}
          </Animatable.Text>
        </Animatable.View>
      ) : null}

      <Pressable
        onPress={handleVerifyCode}
        disabled={loading}
        android_ripple={{ color: '#001E80' }}
        style={{ opacity: loading ? 0.6 : 1, marginTop: 16 }}
      >
        <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{i18n.t('verifyCode')}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );

  const renderPasswordStep = () => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
      <Text style={styles.description}>{i18n.t('enterNewPassword')}</Text>

      <Animatable.View animation={shakePassword ? 'shake' : undefined}>
        <TextInput
          style={dynamicInputStyle('password')}
          placeholder={i18n.t('newPasswordPlaceholder')}
          secureTextEntry={secureText}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#999"
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused('')}
        />
        <Pressable style={styles.eyeIcon} onPress={() => setSecureText(prev => !prev)}>
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="#666" />
        </Pressable>
      </Animatable.View>

      <Animatable.View animation={shakePassword ? 'shake' : undefined}>
        <TextInput
          style={dynamicInputStyle('confirmPassword')}
          placeholder={i18n.t('confirmNewPassword')}
          secureTextEntry={secureConfirmText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#999"
          onFocus={() => setFocused('confirmPassword')}
          onBlur={() => setFocused('')}
        />
        <Pressable style={styles.eyeIcon} onPress={() => setSecureConfirmText(prev => !prev)}>
          <Ionicons name={secureConfirmText ? 'eye-off' : 'eye'} size={24} color="#666" />
        </Pressable>
      </Animatable.View>

      {errors.password ? (
        <Animatable.Text animation="fadeIn" style={styles.error}>{errors.password}</Animatable.Text>
      ) : null}

      {errors.general ? (
        <Animatable.View animation="shake" style={errors.general === i18n.t('passwordUpdated') ? styles.successContainer : styles.generalErrorContainer}>
          <Ionicons name={errors.general === i18n.t('passwordUpdated') ? 'checkmark-circle' : 'alert-circle'} size={20} color={errors.general === i18n.t('passwordUpdated') ? '#4caf50' : '#ff3b30'} />
          <Animatable.Text animation="fadeIn" style={errors.general === i18n.t('passwordUpdated') ? styles.successText : styles.generalError}>
            {errors.general}
          </Animatable.Text>
        </Animatable.View>
      ) : null}

      <Pressable
        onPress={handleResetPassword}
        disabled={loading}
        android_ripple={{ color: '#001E80' }}
        style={{ opacity: loading ? 0.6 : 1, marginTop: 16 }}
      >
        <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{i18n.t('updatePassword')}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {/* Background Video */}
      <VideoView
        player={videoPlayer}
        style={styles.videoBackground}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Blur Overlay */}
      <BlurView intensity={20} style={styles.overlay} tint="dark" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={toggleLocale} style={styles.languageToggle}>
            <Text style={styles.languageToggleText}>
              {locale === 'ru' ? '🇰🇿 KZ' : '🇷🇺 RU'}
            </Text>
          </Pressable>
        </View>

        <Animatable.Image
          animation="fadeInDown"
          duration={800}
          delay={100}
          source={require('@/assets/images/logosaas.png')}
          style={styles.logo}
        />

        <Animatable.Text animation="fadeIn" delay={200} style={styles.title}>
          {i18n.t('resetPasswordTitle')}
        </Animatable.Text>

        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}

        <Animatable.View animation="fadeIn" delay={400} style={styles.linkContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>{i18n.t('backToLogin')}</Text>
          </Pressable>
        </Animatable.View>

        <Animatable.Text animation="fadeIn" delay={500} style={styles.contact}>
          {i18n.t('contact')}
        </Animatable.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
