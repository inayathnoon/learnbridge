type TemplateMessage = {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: object[];
};

type SendResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "en_US",
  components = [],
}: TemplateMessage): Promise<SendResult> {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return { success: false, error: "Missing Meta WhatsApp env vars" };
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: data?.error?.message ?? `HTTP ${res.status}`,
    };
  }

  return {
    success: true,
    messageId: data?.messages?.[0]?.id ?? "",
  };
}
