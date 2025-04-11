import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { trackMessage } from './../lib/trackMessage.ts';
import { RequestBodySchema } from './../lib/schemas.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: { json: Function }) => {
  try {
    const requestBody = (await req.json()) as RequestBodySchema;

    console.log(
      `[${requestBody.message.chat.id}] [${requestBody.update_id}] [${requestBody.message.from.username}] [${requestBody.message.text}]`,
    );
    await trackMessage(supabase, requestBody);

    console.log('message tracked');
  } catch (error) {
    console.error('Error parsing request body:', error);
  } finally {
    return new Response(JSON.stringify({}), {
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
    });
  }
});
