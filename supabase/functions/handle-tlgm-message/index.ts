import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { sendRequest } from './../lib/ai.ts';
import { sendTelegramMessage } from './../lib/telegram.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { trackMessage } from './../lib/trackMessage.ts';

import { PublicMessage, RequestBodySchema } from './../lib/schemas.ts';

const replyIsRequired = (record: PublicMessage) => {
  return record.message.includes('@myasopivo_bot') || record.update_id % 3 == 0;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: { json: Function }) => {
  const body = await req.json();
  const record: PublicMessage = body.record;
  console.log(JSON.stringify(record));

  if (record.author === '@myasopivo_bot') {
    return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });
  }

  if (replyIsRequired(record)) {
    const aiResponse = await sendRequest(supabase, record);
    console.log('aiResponse', aiResponse);
    await sendTelegramMessage(record.chat_id, aiResponse.message);
    await trackMessage(supabase, {
      message: {
        from: {
          username: '@myasopivo_bot',
        },
        text: aiResponse.message,
        chat: {
          id: record.chat_id,
        },
      },
      update_id: record.update_id.toString() + '1',
    } as RequestBodySchema);
  }

  return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });
});
