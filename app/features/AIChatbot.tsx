import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, Bot } from 'lucide-react-native';
import { MotiView } from 'moti';
import appTheme from '../../styles/theme';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function AIChatbot() {
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initial greeting
    setMessages([
      { id: '1', text: "Hi! I'm your AI Eye Care Assistant. You can describe your symptoms or ask me general questions about eye health.", sender: 'bot' }
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [userMessage, ...prev]);
    setInput('');
    setIsTyping(true);

    try {
      const functions = getFunctions();
      const chat = httpsCallable< { message: string }, { results: { condition: string, recommendation: string }[] }>(functions, 'chat');
      const response = await chat({ message: userMessage.text }); // use userMessage.text instead of input
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        const topResult = response.data.results[0];
        const botMessage: Message = { 
          id: Date.now().toString(), 
          text: `Based on your symptoms, it could be ${topResult.condition}. ${topResult.recommendation}\n\nDisclaimer: This is not a diagnosis.`, 
          sender: 'bot' 
        };
        setMessages(prev => [botMessage, ...prev]);
      } else {
        const botMessage: Message = { 
          id: Date.now().toString(), 
          text: "I'm not sure what those symptoms indicate. It's best to consult an eye care professional.", 
          sender: 'bot' 
        };
        setMessages(prev => [botMessage, ...prev]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { id: Date.now().toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' };
      setMessages(prev => [errorMessage, ...prev]);
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing' }}
        style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble
        ]}
    >
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
    </MotiView>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    messageList: { flex: 1, padding: SIZES.padding },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: SIZES.padding, borderTopWidth: 1, borderTopColor: '#E5E5EA', backgroundColor: COLORS.surface },
    textInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: SIZES.radius, padding: SIZES.padding, marginRight: SIZES.base, ...FONTS.body, color: COLORS.text, paddingTop: SIZES.padding },
    sendButton: { backgroundColor: COLORS.primary, padding: SIZES.padding, borderRadius: 50, ...SHADOWS.light, alignItems: 'center', justifyContent: 'center' },
    messageBubble: { maxWidth: '80%', padding: SIZES.padding, borderRadius: SIZES.radius, marginBottom: SIZES.base },
    userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    botBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, ...SHADOWS.light },
    userText: { ...FONTS.body, color: COLORS.surface },
    botText: { ...FONTS.body, color: COLORS.text },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', padding: SIZES.base, marginLeft: SIZES.padding, marginBottom: SIZES.padding },
    typingText: { ...FONTS.body, color: COLORS.textSecondary, marginLeft: SIZES.base, fontStyle: 'italic' }
  });

  return (
    <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted
        ListHeaderComponent={
            isTyping ? (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.typingIndicator}>
                <Bot size={20} color={COLORS.primary} />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </MotiView>
            ) : null
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about eye health..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={500}
        />
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={isTyping}>
          <Send size={24} color={COLORS.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
