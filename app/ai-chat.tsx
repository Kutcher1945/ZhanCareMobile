import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { analyzeImage, ChatMessage, sendMessageToMistral } from '@/utils/mistralApi';
import i18n from '@/utils/i18n';
import { styles } from './ai-chat.styles';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  showDoctorButton?: boolean;
}

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locale, setLocale] = useState<'ru' | 'kz' | 'en'>(i18n.locale as 'ru' | 'kz' | 'en');

  const suggestionChips = [
    'Головная боль и температура',
    'Боль в груди при дыхании',
    'Проблемы со сном',
    'Боль в животе',
  ];

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content:
          'Здравствуйте! Я ZhanBot, ваш медицинский AI-ассистент. Расскажите о своих симптомах, и я постараюсь помочь.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role: 'user',
      content: inputText,
      imageUrl: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let botResponse: string;

      if (imageToSend) {
        // Image analysis
        botResponse = await analyzeImage(
          imageToSend.split(',')[1], // Remove base64 prefix
          inputText || 'Что вы видите на этом изображении?',
          locale
        );
      } else {
        // Regular chat
        const chatMessages: ChatMessage[] = messages
          .slice(-10)
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        chatMessages.push({
          role: 'user',
          content: inputText,
        });

        botResponse = await sendMessageToMistral(chatMessages, locale);
      }

      // Check for doctor button tag
      const showDoctorButton = botResponse.includes('<show_doctor_button>true</show_doctor_button>');
      const cleanResponse = botResponse.replace(/<show_doctor_button>true<\/show_doctor_button>/g, '').trim();

      const botMessage: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role: 'bot',
        content: cleanResponse,
        timestamp: new Date(),
        showDoctorButton,
      };

      setMessages(prev => [...prev, botMessage]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role: 'bot',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBookDoctor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/book-consultation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3772ff" />

      {/* Header */}
      <LinearGradient colors={['#3772ff', '#2c5bcc']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>ZhanBot AI</Text>
            <View style={styles.statusContainer}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>В сети</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <Animatable.View
              key={message.id}
              animation="fadeInUp"
              duration={300}
              delay={index * 50}
              style={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.botRow]}
            >
              {message.role === 'bot' && (
                <View style={styles.botAvatarSmall}>
                  <Ionicons name="chatbubbles" size={16} color="#3772ff" />
                </View>
              )}

              <View style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.botBubble]}>
                {message.imageUrl && <Image source={{ uri: message.imageUrl }} style={styles.messageImage} resizeMode="contain" />}

                <Text style={[styles.messageText, message.role === 'user' ? styles.userText : styles.botText]}>
                  {message.content}
                </Text>

                {message.showDoctorButton && (
                  <Pressable onPress={handleBookDoctor} style={styles.doctorButton}>
                    <LinearGradient colors={['#3772ff', '#2c5bcc']} style={styles.doctorButtonGradient}>
                      <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.doctorButtonText}>Записаться к врачу</Text>
                    </LinearGradient>
                  </Pressable>
                )}

                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {message.role === 'user' && (
                <View style={styles.userAvatarSmall}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </View>
              )}
            </Animatable.View>
          ))}

          {isLoading && (
            <Animatable.View animation="fadeIn" style={[styles.messageRow, styles.botRow]}>
              <View style={styles.botAvatarSmall}>
                <Ionicons name="chatbubbles" size={16} color="#3772ff" />
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                <ActivityIndicator color="#3772ff" />
              </View>
            </Animatable.View>
          )}

          {/* Suggestion Chips */}
          {messages.length === 1 && !isLoading && (
            <Animatable.View animation="fadeInUp" delay={300} style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Популярные вопросы:</Text>
              <View style={styles.chipsContainer}>
                {suggestionChips.map((chip, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSuggestionPress(chip)}
                    style={styles.chip}
                    android_ripple={{ color: '#e6f0ff' }}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </Pressable>
                ))}
              </View>
            </Animatable.View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {selectedImage && (
            <Animatable.View animation="fadeIn" style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <Pressable onPress={() => setSelectedImage(null)} style={styles.removeImageButton}>
                <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              </Pressable>
            </Animatable.View>
          )}

          <View style={styles.inputRow}>
            <Pressable onPress={handleImagePick} style={styles.attachButton}>
              <Ionicons name="image-outline" size={24} color="#6B7280" />
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Опишите ваши симптомы..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            <Pressable
              onPress={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              style={[styles.sendButton, (isLoading || (!inputText.trim() && !selectedImage)) && styles.sendButtonDisabled]}
            >
              <LinearGradient colors={['#3772ff', '#2c5bcc']} style={styles.sendButtonGradient}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
