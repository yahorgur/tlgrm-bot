import { RequestBodySchema, Supabase } from './schemas.ts';

const OPEN_AI_API_KEY = Deno.env.get('OPEN_AI_API_KEY');

const buildMessagesHisyory = async (supabase: Supabase, chatId: number) => {
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .limit(10)
    .order('update_id', {
      ascending: false,
    });

  const messagesForOpenAi = [];
  for (const message of messages.reverse()) {
    messagesForOpenAi.push({
      username: message.author,
      message: message.message,
    });
  }

  return messagesForOpenAi;
};

const seneRequest = async (prompt: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  const bodyResponse = await response.json();
  console.log(bodyResponse);

  const possibleJson = bodyResponse.choices[0].message.content;
  const match = possibleJson.match(/{[^}]*}/);

  return JSON.parse(match[0]);
};

export const sendOpenAIRequest = async (supabase: Supabase, requestBody: RequestBodySchema) => {
  const messages = await buildMessagesHisyory(supabase, requestBody.message.chat.id);

  const prompt = `
    Ты — участник телеграм-чата на 5 человек,
    все — мужчины за 30,
    эмигранты из Беларуси,
    которые живут в Польше и работают программистами.
    Вы обсуждаете политику, мировые события, трэш, технологии,
    программирование и иногда просто прикалываетесь.
    Ты — бот, но должен чувствоваться как живой участник, с характером.
    Когда ты отвечаешь, делай это умно, уместно, иногда саркастично, но не токсично.
    Не разжёвывай, пиши как будто общаешься с ровесниками.
    Твой username @myasopivo_bot.
    Если последнее сообщение обращенно к тебе ответь на него. Ответ нужен на последнее сообщение.
    Если не к тебе, то просто игнорируй.
    Остальные сообщение тебе нужны для контекста.
    Ответ возвращай строго в формате JSON: { \"message\": \"Текст твоего сообщения\" }. Ничего кроме этого. Нельзя присылайть два json
    Не добавляй ничего кроме JSON. Используй информацию из последних 10 сообщений: ${JSON.stringify(
      messages,
    )}
  `;

  let retries = 0;

  while (retries < 3) {
    try {
      return await seneRequest(prompt);
    } catch (error) {
      console.error('Error sending request to OpenAI:', error);
      retries++;
    }
  }

  throw new Error('Failed to get a response from OpenAI after 3 attempts');
};
