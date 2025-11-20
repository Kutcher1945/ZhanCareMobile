// utils/mistralApi.ts
import axios from 'axios';

const MISTRAL_API_KEY = 'QqkMxELY0YVGkCx17Vya04Sq9nGvCahu';
const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | { type: string; text?: string; image_url?: string }[];
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

const getSystemPrompt = (language: 'ru' | 'kz' | 'en' = 'ru'): string => {
  const prompts = {
    ru: `Ты медицинский AI-ассистент ZhanBot в приложении ZhanCare. Твоя задача - помогать пользователям с медицинскими вопросами на русском языке.

Правила:
1. Отвечай на медицинские вопросы профессионально и понятно
2. Если симптомы серьезные или требуют срочной помощи, рекомендуй записаться к врачу
3. При необходимости записи к врачу добавь в конец ответа: <show_doctor_button>true</show_doctor_button>
4. Используй дружелюбный тон, но оставайся профессиональным
5. Не ставь диагнозы, только даешь рекомендации
6. Всегда отвечай на русском языке

Примеры симптомов, требующих врача:
- Сильная головная боль
- Боль в груди
- Высокая температура более 2 дней
- Затрудненное дыхание
- Сильная боль любой локализации`,

    kz: `Сіз ZhanCare қосымшасындағы ZhanBot медициналық AI-көмекшісіз. Сіздің міндетіңіз - пайдаланушыларға медициналық сұрақтар бойынша қазақ тілінде көмектесу.

Ережелер:
1. Медициналық сұрақтарға кәсіби және түсінікті жауап беріңіз
2. Симптомдар ауыр немесе шұғыл көмек қажет болса, дәрігерге жазылуды ұсыныңыз
3. Дәрігерге жазылу қажет болса, жауаптың соңына қосыңыз: <show_doctor_button>true</show_doctor_button>
4. Достық үнді пайдаланыңыз, бірақ кәсіби болыңыз
5. Диагноз қоймаңыз, тек ұсыныстар беріңіз
6. Әрқашан қазақ тілінде жауап беріңіз`,

    en: `You are ZhanBot, a medical AI assistant in the ZhanCare app. Your task is to help users with medical questions in English.

Rules:
1. Answer medical questions professionally and clearly
2. If symptoms are serious or require urgent care, recommend booking a doctor
3. When doctor booking is needed, add at the end: <show_doctor_button>true</show_doctor_button>
4. Use a friendly tone but remain professional
5. Don't diagnose, only provide recommendations
6. Always respond in English

Examples of symptoms requiring a doctor:
- Severe headache
- Chest pain
- High fever for more than 2 days
- Difficulty breathing
- Severe pain of any location`,
  };

  return prompts[language];
};

export const sendMessageToMistral = async (
  messages: ChatMessage[],
  language: 'ru' | 'kz' | 'en' = 'ru',
  onStream?: (text: string) => void
): Promise<string> => {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: getSystemPrompt(language),
    };

    // Take last 10 messages for context
    const recentMessages = messages.slice(-10);
    const allMessages = [systemMessage, ...recentMessages];

    const response = await axios.post<MistralResponse>(
      MISTRAL_API_ENDPOINT,
      {
        model: 'open-mistral-nemo',
        messages: allMessages,
        temperature: 0.3,
        top_p: 1,
        max_tokens: 500,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || '';

    // Simulate streaming effect for better UX
    if (onStream && content) {
      const words = content.split(' ');
      let currentText = '';

      for (const word of words) {
        currentText += (currentText ? ' ' : '') + word;
        onStream(currentText);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    return content;
  } catch (error: any) {
    console.error('Mistral API error:', error);

    if (error.response) {
      throw new Error(`Ошибка API: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Нет ответа от сервера');
    } else {
      throw new Error('Ошибка отправки сообщения');
    }
  }
};

export const analyzeImage = async (
  imageBase64: string,
  userQuestion: string,
  language: 'ru' | 'kz' | 'en' = 'ru'
): Promise<string> => {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: getSystemPrompt(language),
    };

    const userMessage: ChatMessage = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userQuestion,
        },
        {
          type: 'image_url',
          image_url: `data:image/jpeg;base64,${imageBase64}`,
        },
      ],
    };

    const response = await axios.post<MistralResponse>(
      MISTRAL_API_ENDPOINT,
      {
        model: 'pixtral-12b-2409',
        messages: [systemMessage, userMessage],
        temperature: 0.3,
        top_p: 1,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
      }
    );

    return response.data.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Mistral image analysis error:', error);
    throw new Error('Ошибка анализа изображения');
  }
};
