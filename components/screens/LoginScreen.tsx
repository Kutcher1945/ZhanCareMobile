import api from '@/utils/api';
import i18n from '@/utils/i18n';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Checkbox } from 'react-native-paper';
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
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [locale, setLocale] = useState(i18n.locale);

  const colorScheme = useColorScheme();
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleLogin = async () => {
    const newErrors = { email: '', password: '' };
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

    try {
      const user = await loginUser(email, password);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Успех', `Добро пожаловать, ${user.first_name || ''}!`);

      const redirectTo = user.role === 'doctor' ? '/doctor' : '/(tabs)';
      router.replace(redirectTo as any); // ✅ TypeScript-safe
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        i18n.t('somethingWentWrong');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ошибка входа', message);
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
    focused === field && { borderColor: '#3A50FF' },
    colorScheme === 'dark' && { backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#333' }
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}
    >
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
          source={require('@/assets/images/logosaas_new2.png')}
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
              color="#001E80"
            />
            <Text style={styles.checkboxLabel}>
              {i18n.t('agreementPrefix')}{' '}
              <Text style={styles.link}>{i18n.t('tos')}</Text>{' '}
              {i18n.t('and')}{' '}
              <Text style={styles.link}>{i18n.t('privacy')}</Text>.
            </Text>
          </View>
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
            <Pressable onPress={() => console.log('Forgot Password')}>
              <Text style={styles.link}>{i18n.t('forgotPassword')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.link}>{i18n.t('register')}</Text>
            </Pressable>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} style={styles.orContainer}>
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
        </Animatable.View>

        <Animatable.Text animation="fadeIn" delay={800} style={styles.contact}>
          {i18n.t('contact')}
        </Animatable.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
