import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { trackMessage } from './../lib/trackMessage.ts';
import { sendOpenAIRequest } from './../lib/openAi.ts';
import { sendTelegramMessage } from './../lib/telegram.ts';

import { RequestBodySchema } from './../lib/schemas.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

const replyIsRequired = (requestBody: RequestBodySchema) => {
  return requestBody.message.text.includes('@myasopivo_bot') || requestBody.update_id % 5 == 0;
};

Deno.serve(async (req: { json: Function }) => {
  const requestBody = await req.json();
  // Save the message to the database
  console.log('requestBody', requestBody);
  await trackMessage(supabase, requestBody);

  if (replyIsRequired(requestBody)) {
    try {
      const openAiResponse = await sendOpenAIRequest(supabase, requestBody);
      console.log('openAiResponse', openAiResponse);
      await sendTelegramMessage(requestBody.message.chat.id, openAiResponse.message);
    } catch (error) {
      console.error('Error sending request to OpenAI:', error);
    }
  }
  return new Response(JSON.stringify({}), {
    headers: {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
    },
  });
});
