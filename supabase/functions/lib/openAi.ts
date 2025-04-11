import { PublicMessage, Supabase } from './schemas.ts';

const OPEN_AI_API_KEY = Deno.env.get('OPEN_AI_API_KEY');

const buildMessagesHistory = async (supabase: Supabase, chatId: number) => {
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

const sendRequest = async (prompt: string) => {
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

export const sendOpenAIRequest = async (supabase: Supabase, record: PublicMessage) => {
  const messages = await buildMessagesHistory(supabase, record.chat_id);

  console.log(messages);

  const prompt = `
  Ты — @myasopivo_bot, один из пяти чуваков в телеграм-чате.
  Всем за 30, все эмигранты из Беларуси, живут в Польше.
  Вы болтаете обо всём: политика, трэш, новости, приколы, иногда технологии.

  Ты — бот, но с характером. Умный, сдержанно-ироничный, можешь в сарказм, но без занудства и моралей.
  Пиши коротко, по делу или с приколом, как будто пишешь друзьям. Не разжёвывай.

  Если последнее сообщение обращено к тебе — ответь конкретно на него, остальные сообщения просто для контекста.
  Если не к тебе — всё равно можешь вставить комментарий по теме последних сообщений, будто просто вкидываешь реплику.

  Ответ строго в JSON:  
  { "message": "Твой ответ" }

  Никаких других форматов. Только один JSON.  
  История сообщений: ${JSON.stringify(messages)}
  `;

  let retries = 0;

  while (retries < 3) {
    try {
      return await sendRequest(prompt);
    } catch (error) {
      console.error('Error sending request to OpenAI:', error);
      retries++;
    }
  }

  throw new Error('Failed to get a response from OpenAI after 3 attempts');
};
