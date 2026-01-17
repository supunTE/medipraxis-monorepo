import { tokens } from "./../../../node_modules/@tanstack/router-devtools-core/src/tokens";
import axios from "axios";
import { TemplateMessagePayload } from "./types";

export class WhatsAppClient {
  async sendTemplateMessage(
    to: string,
    template: TemplateMessagePayload,
    phoneID?: string,
    token?: string
  ): Promise<void> {
    debugger;
    try {
      console.log(`https://graph.facebook.com/v20.0/${phoneID}/messages`);
      debugger;
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneID}/messages`,
        // `https://graph.facebook.com/v20.0/997165740137495/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Authorization: `Bearer EAARjDwQjGOcBQdfWLtfJXspzjmqNpzPG05Ymf3JHY2NoLFMy9fipLBc62FxtV0FqV02CRbq85oUdbuZBmjqSZBi2N8AU7D6mZBQm0rkCVdijcy7ggZAbLS5BocsUa2FDJzajTLGQzXRUkxFjmN3Xd7XOg6okjZBrEYvDtyM8PbsOjSSlTUaLjjYmz2ZCoRjKmIxf1Unwknqzk8GVK34uGHFWpMjZCf9fySo7x6oEbxlBoSY1azIpuyR9v71ZCgxJDwOKoC5LBwh0Wj94tPQUwGFZAAjhowtSBrSSKxwZDZD`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("Error sending WhatsApp message:", error);
      throw error;
    }
  }
}
