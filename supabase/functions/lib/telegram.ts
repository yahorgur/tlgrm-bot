const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

export const sendTelegramMessage = async (chatId: number, message: string) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Telegram API error: ${res.status} - ${errorText}`);
  }
  const data = await res.json();
  console.log('Message sent:', data);
};
