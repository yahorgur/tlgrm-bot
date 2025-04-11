import { Supabase, RequestBodySchema } from './schemas.ts';

export const trackMessage = async (supabase: Supabase, requestBody: RequestBodySchema) => {
  const chatId = requestBody.message.chat.id;
  const response = await supabase
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

  console.log('Inssert response code:', response.status);
  console.log('Inssert response error:', response.error);

  return;
};
