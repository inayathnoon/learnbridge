export type AlertPayload = {
  parentWhatsappNumber: string;
  childName: string;
  topicTitle: string;
  subsectionTitle: string;
};

export type AlertResult =
  | { success: true; messageId: string }
  | { success: false; error: string };
