// LoginScreen.tsx (Enhanced with Accessibility, Pressable, and Transitions)
import i18n from '@/utils/i18n';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [locale, setLocale] = useState(i18n.locale);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();

  const handleLogin = () => {
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = i18n.t('requiredEmail');
    if (!password) newErrors.password = i18n.t('requiredPassword');
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  const toggleLocale = () => {
    const newLocale = locale === 'ru' ? 'kz' : 'ru';
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.languageToggle}>
          <Pressable onPress={toggleLocale} accessibilityRole="button" accessibilityLabel="Switch Language">
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
          accessible accessibilityLabel="ZhanCare logo"
        />

        <Animatable.Text animation="fadeIn" delay={200} style={styles.description}>
          {i18n.t('loginScreenDescription')}
        </Animatable.Text>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <TextInput
            style={[styles.input, focused === 'email' && { borderColor: '#3A50FF' }]}
            placeholder={i18n.t('emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            accessible
            accessibilityLabel="Email input"
            returnKeyType="next"
            textContentType="emailAddress"
            autoComplete="email"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <View>
            <TextInput
              style={[styles.input, focused === 'password' && { borderColor: '#3A50FF' }]}
              placeholder={i18n.t('passwordPlaceholder')}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              accessible
              accessibilityLabel="Password input"
              returnKeyType="done"
              textContentType="password"
              autoComplete="password"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel="Toggle password visibility"
            >
              <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#999" />
            </Pressable>
          </View>
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}

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
            accessibilityRole="button"
            accessibilityLabel="Login"
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
            <Text style={styles.link}>{i18n.t('forgotPassword')}</Text>
            <Text style={styles.link}>{i18n.t('register')}</Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>{i18n.t('or')}</Text>
          <View style={styles.line} />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Pressable
            onPress={() => console.log('Google Login')}
            android_ripple={{ color: '#001E80' }}
            accessibilityRole="button"
            accessibilityLabel="Login with Google"
          >
            <LinearGradient colors={['#001E80', '#3A50FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FontAwesome name="google" size={16} color="#fff" />
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