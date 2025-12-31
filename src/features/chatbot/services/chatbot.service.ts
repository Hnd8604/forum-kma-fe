import { ChatBotRequest, ChatBotResponse } from '../types/chatbot.types';

const CHATBOT_API_URL = import.meta.env.VITE_CHAT_BOT_URL;

export const chatbotService = {
    async sendMessage(request: ChatBotRequest): Promise<ChatBotResponse> {
        try {
            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChatBotResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            throw error;
        }
    },
};
