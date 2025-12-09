import { google } from 'googleapis';
import type { EmailRecipient, RFQEmailData } from './emailService';
import { createRFQEmailTemplate } from './microsoftGraphEmailService';

export class GoogleGmailEmailService {
  private gmail: ReturnType<typeof google.gmail>;
  private senderEmail: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    this.senderEmail = process.env.SENDER_EMAIL || '';

    if (!clientId || !clientSecret || !refreshToken || !this.senderEmail) {
      throw new Error(
        'Missing required Google credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and SENDER_EMAIL environment variables.'
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob' // Redirect URI (not used for refresh token flow)
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async sendRFQNotification(
    recipient: EmailRecipient,
    rfqData: RFQEmailData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const htmlContent = createRFQEmailTemplate(rfqData, recipient.name);

      const message = this.createMessage({
        to: recipient.email,
        toName: recipient.name,
        subject: `Request for Quote - ${rfqData.requestNumber}`,
        html: htmlContent,
      });

      console.log(`\n📧 Sending RFQ email via Gmail API`);
      console.log(`To: ${recipient.name} <${recipient.email}>`);
      console.log(`From: ${this.senderEmail}`);
      console.log(`Subject: Request for Quote - ${rfqData.requestNumber}`);

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Email sent successfully to ${recipient.email}`);
      console.log(`   Message ID: ${response.data.id}`);

      return {
        success: true,
        messageId: response.data.id || `gmail-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };
    } catch (error) {
      console.error('❌ Error sending email via Gmail API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulkRFQNotifications(
    recipients: EmailRecipient[],
    rfqData: RFQEmailData[]
  ): Promise<{ sent: number; failed: number; results: any[] }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const data = rfqData[i];

      const result = await this.sendRFQNotification(recipient, data);

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      results.push({
        recipient: recipient.email,
        supplierId: recipient.supplierId,
        ...result,
      });
    }

    console.log(`\n📊 Bulk Email Summary: ${sent} sent, ${failed} failed\n`);

    return { sent, failed, results };
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = this.createMessage({
        to,
        subject,
        html,
      });

      console.log(`\n📧 Sending email via Gmail API`);
      console.log(`To: ${to}`);
      console.log(`From: ${this.senderEmail}`);
      console.log(`Subject: ${subject}`);

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`   Message ID: ${response.data.id}`);

      return {
        success: true,
        messageId: response.data.id || `gmail-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };
    } catch (error) {
      console.error('❌ Error sending email via Gmail API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createMessage({
    to,
    toName,
    subject,
    html,
  }: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
  }): string {
    const toHeader = toName ? `${toName} <${to}>` : to;
    
    const message = [
      `To: ${toHeader}`,
      `From: ${this.senderEmail}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      html,
    ].join('\n');

    // Encode the message in base64url format
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

