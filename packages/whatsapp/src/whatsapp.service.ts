import { appointmentConfirmationTemplate } from "./templates";
import { WhatsAppClient } from "./whatsapp.client";

export class WhatsAppService {
  constructor(private client: WhatsAppClient) {}

  async sendAppointmentConfirmation(
    phone: string,
    data: {
      clientName: string;
      practitionerName: string;
      date: string;
      time: string;
      apptNumber: string;
      apptLink: string;
    }
  ) {
    const phoneId = "997165740137495";
    const token =
      "EAARjDwQjGOcBQSLSlZAAq8uNFmx8aLIks8LVZBYkLVskiZAfd2lRsf6y4ZCKYo1qWpOyXLl159En9u0dGUj2CN2TntalUegmCP0zxlsHnXw5Ru7ZBXmn6R9sLFBz51RgCnVeGBqK50fu8hs334pplITH3LDhZCOFln4epca66VgeG0cOwhZClfPVwFW0xoBCPyM51VZAAFzfRyTmJl7UYvVWngirbZCTLgjXjwxSCiI4600dyIJEZAFRKYI0ZBK8eyEf7h7pLPEGaXmDz9ADTaerx5bKgaFKyramubkBgZDZD";
    const template = appointmentConfirmationTemplate(data);
    await this.client.sendTemplateMessage(phone, template, phoneId, token);
  }
}
