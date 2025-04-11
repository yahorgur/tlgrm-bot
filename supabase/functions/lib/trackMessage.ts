import { Supabase, RequestBodySchema } from './schemas.ts';

export const trackMessage = async (supabase: Supabase, requestBody: RequestBodySchema) => {
  const chatId = requestBody.message.chat.id;
  await supabase
    .from('messages')
    .insert([
      {
        author: requestBody.message.from.username,
        message: requestBody.message.text,
        update_id: requestBody.update_id,
        chat_id: chatId,
      },
    ])
    .select('*')
    .single();
};
