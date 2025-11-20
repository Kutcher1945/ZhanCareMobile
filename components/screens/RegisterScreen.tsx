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
import { styles } from './RegisterScreen.styles';

type FormFields = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type I18nKeys = keyof typeof i18n.translations['ru'];

export default function RegisterScreen() {
  const t = i18n.t;
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<FormFields>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [checked, setChecked] = useState(false);
  const [locale, setLocale] = useState(i18n.locale);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields | 'agreement' | 'general', string>>>({});
  const [shake, setShake] = useState<Partial<Record<keyof FormFields, boolean>>>({});

  const videoPlayer = useVideoPlayer(require('@/assets/videos/hero-video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'kz' : 'ru';
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  const validate = () => {
    const errs: typeof errors = {};
    const sh: typeof shake = {};

    if (!form.last_name.trim()) {
      errs.last_name = t('lastName') + ' ' + t('nameRequired');
      sh.last_name = true;
    }
    if (!form.first_name.trim()) {
      errs.first_name = t('firstName') + ' ' + t('nameRequired');
      sh.first_name = true;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = t('invalidEmail');
      sh.email = true;
    }
    if (!form.password || form.password.length < 6) {
      errs.password = t('passwordTooShort');
      sh.password = true;
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = t('passwordsDontMatch');
      sh.confirmPassword = true;
    }
    if (!checked) {
      errs.agreement = t('agreementRequired');
    }

    setShake(sh);
    if (Object.keys(errs).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setShake({}), 500);
    }

    return errs;
  };

  const handleRegister = async () => {
    Haptics.selectionAsync();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { email, password, phone, first_name, last_name } = form;

      const response = await api.post('/auth/register/', {
        email,
        password,
        phone: phone || null,
        first_name,
        last_name,
      });

      const { access_token, refresh_token, user } = response.data;

      if (access_token) await AsyncStorage.setItem('access_token', access_token);
      if (refresh_token) await AsyncStorage.setItem('refresh_token', refresh_token);
      if (user) await AsyncStorage.setItem('user', JSON.stringify(user));

      // Update AuthContext
      await login({
        id: user.id || '1',
        name: user.first_name || user.name || 'User',
        email: user.email || email,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const redirectTo = user?.role === 'doctor' ? '/doctor' : '/(tabs)';
      router.replace(redirectTo as any);
    } catch (err: any) {
      let message = t('somethingWentWrong');

      if (err?.response?.status === 409) {
        message = 'Пользователь с таким email или телефоном уже существует';
      } else if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (err?.response?.data?.non_field_errors?.[0]) {
        message = err.response.data.non_field_errors[0];
      } else if (err?.message) {
        message = err.message;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ general: message });
      Object.keys(form).forEach(key => {
        setShake(prev => ({ ...prev, [key]: true }));
      });
      setTimeout(() => setShake({}), 500);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focused === field && { borderColor: '#3A50FF', borderWidth: 2 }
  ];

  const renderInput = (
    field: keyof FormFields,
    placeholderKey: I18nKeys,
    keyboardType?: any,
    secure?: boolean
  ) => (
    <Animatable.View animation={shake[field] ? 'shake' : undefined}>
      <TextInput
        style={inputStyle(field)}
        placeholder={t(placeholderKey)}
        placeholderTextColor="#999"
        value={form[field]}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused('')}
        textContentType={secure ? 'password' : 'none'}
        autoComplete={field === 'email' ? 'email' : 'off'}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        secureTextEntry={secure && (field === 'password' ? secureText : secureConfirmText)}
      />
      {secure && field === 'password' && (
        <Pressable style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="#666" />
        </Pressable>
      )}
      {secure && field === 'confirmPassword' && (
        <Pressable style={styles.eyeIcon} onPress={() => setSecureConfirmText(!secureConfirmText)}>
          <Ionicons name={secureConfirmText ? 'eye-off' : 'eye'} size={24} color="#666" />
        </Pressable>
      )}
      {errors[field] && (
        <Animatable.Text animation="fadeIn" style={styles.error}>
          {errors[field]}
        </Animatable.Text>
      )}
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

        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          {renderInput('last_name', 'lastName')}
          {renderInput('first_name', 'firstName')}
          {renderInput('email', 'emailPlaceholder', 'email-address')}
          {renderInput('phone', 'phone', 'phone-pad')}
          {renderInput('password', 'passwordPlaceholder', undefined, true)}
          {renderInput('confirmPassword', 'confirmPassword', undefined, true)}

          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
              color="#fff"
              uncheckedColor="rgba(255, 255, 255, 0.7)"
            />
            <Text style={styles.checkboxLabel}>
              {t('agreementPrefix')} <Text style={styles.link}>{t('tos')}</Text> {t('and')}{' '}
              <Text style={styles.link}>{t('privacy')}</Text>.
            </Text>
          </View>
          {errors.agreement && (
            <Animatable.Text animation="fadeIn" style={styles.error}>
              {errors.agreement}
            </Animatable.Text>
          )}

          {errors.general && (
            <Animatable.View animation="shake" style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Animatable.Text animation="fadeIn" style={styles.generalError}>
                {errors.general}
              </Animatable.Text>
            </Animatable.View>
          )}
        </Animatable.View>

        <View style={styles.divider} />

        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            android_ripple={{ color: '#001E80' }}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <LinearGradient
              colors={['#001E80', '#3A50FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('signUp')}</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.linkRow}>
            <Text style={styles.footerText}>{t('alreadyHaveAccount')} </Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.link}>{t('signIn')}</Text>
            </Pressable>
          </View>
        </Animatable.View>

        {/* <Animatable.View animation="fadeInUp" delay={600} style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>{t('or')}</Text>
          <View style={styles.line} />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Pressable onPress={() => console.log('Register with Google')} android_ripple={{ color: '#001E80' }}>
            <LinearGradient
              colors={['#001E80', '#3A50FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="google" size={16} color="#fff" />
                <View style={{ width: 8 }} />
                <Text style={styles.buttonText}>{t('registerWithGoogle')}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animatable.View> */}

        <Animatable.Text animation="fadeIn" delay={800} style={styles.contact}>
          {t('contact')}
        </Animatable.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
