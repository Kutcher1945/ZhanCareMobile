import api from '@/utils/api';
import i18n from '@/utils/i18n';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ActivityIndicator,
  Alert,
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
import { Checkbox } from 'react-native-paper';
import { VideoView, useVideoPlayer } from 'expo-video';
import { styles } from './LoginScreen.styles';

// 🔑 Optional: helper for login logic
const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login/', { email, password });
  const { access_token, refresh_token, user } = response.data;

  await AsyncStorage.setItem('access_token', access_token);
  await AsyncStorage.setItem('refresh_token', refresh_token);
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return user;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [locale, setLocale] = useState(i18n.locale);

  const videoPlayer = useVideoPlayer(require('@/assets/videos/hero-video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    const newErrors = { email: '', password: '', general: '' };
    let hasError = false;

    if (!email) {
      newErrors.email = i18n.t('requiredEmail');
      setShakeEmail(true);
      hasError = true;
    }
    if (!password) {
      newErrors.password = i18n.t('requiredPassword');
      setShakePassword(true);
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setShakeEmail(false);
        setShakePassword(false);
      }, 500);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setErrors({ email: '', password: '', general: '' }); // Clear previous errors

    try {
      const user = await loginUser(email, password);

      // Update AuthContext
      await login({
        id: user.id || '1',
        name: user.first_name || user.name || 'User',
        email: user.email || email,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const redirectTo = user.role === 'doctor' ? '/doctor' : '/(tabs)';
      router.replace(redirectTo as any); // ✅ TypeScript-safe
    } catch (err: any) {
      let message = i18n.t('somethingWentWrong');

      // Check for authentication errors (401 or 400 with invalid credentials)
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        message = i18n.t('invalidCredentials');
      } else if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (err?.response?.data?.non_field_errors?.[0]) {
        message = err.response.data.non_field_errors[0];
      } else if (err?.message) {
        message = err.message;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Show error inline instead of Alert
      setErrors({ email: '', password: '', general: message });
      setShakeEmail(true);
      setShakePassword(true);
      setTimeout(() => {
        setShakeEmail(false);
        setShakePassword(false);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'kz' : 'ru';
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  const dynamicInputStyle = (field: string) => [
    styles.input,
    focused === field && { borderColor: '#3A50FF', borderWidth: 2 }
  ];

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
        <View style={styles.languageToggle}>
          <Pressable onPress={toggleLocale}>
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

        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
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

          <Animatable.View animation={shakePassword ? 'shake' : undefined}>
            <TextInput
              style={dynamicInputStyle('password')}
              placeholder={i18n.t('passwordPlaceholder')}
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
            />
            <Pressable style={styles.eyeIcon} onPress={() => setSecureText(prev => !prev)}>
              <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="#666" />
            </Pressable>
          </Animatable.View>
          {errors.password ? (
            <Animatable.Text animation="fadeIn" style={styles.error}>{errors.password}</Animatable.Text>
          ) : null}

          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
              color="#fff"
              uncheckedColor="rgba(255, 255, 255, 0.7)"
            />
            <Text style={styles.checkboxLabel}>
              {i18n.t('agreementPrefix')}{' '}
              <Text style={styles.link}>{i18n.t('tos')}</Text>{' '}
              {i18n.t('and')}{' '}
              <Text style={styles.link}>{i18n.t('privacy')}</Text>.
            </Text>
          </View>

          {errors.general ? (
            <Animatable.View animation="shake" style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Animatable.Text animation="fadeIn" style={styles.generalError}>
                {errors.general}
              </Animatable.Text>
            </Animatable.View>
          ) : null}
        </Animatable.View>

        <View style={styles.divider} />

        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            android_ripple={{ color: '#001E80' }}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{i18n.t('login')}</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.linkRow}>
            <Pressable onPress={() => router.push('/forgot-password')}>
              <Text style={styles.link}>{i18n.t('forgotPassword')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.link}>{i18n.t('register')}</Text>
            </Pressable>
          </View>
        </Animatable.View>

        {/* <Animatable.View animation="fadeInUp" delay={600} style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>{i18n.t('or')}</Text>
          <View style={styles.line} />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Pressable onPress={() => console.log('Google Login')} android_ripple={{ color: '#001E80' }}>
            <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="google" size={16} color="#fff" />
                <View style={{ width: 8 }} />
                <Text style={styles.buttonText}>{i18n.t('loginWithGoogle')}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animatable.View> */}

        <Animatable.Text animation="fadeIn" delay={800} style={styles.contact}>
          {i18n.t('contact')}
        </Animatable.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
