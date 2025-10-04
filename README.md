# Webhook Handler for SureMDM and Gmail

A Netlify Function that processes webhooks, fetches device details from SureMDM API, and sends an email via Gmail.

## Setup
1. Clone: `git clone https://github.com/your-username/webhook-handler.git`
2. Install: `cd webhook-handler && npm install`
3. Deploy to Netlify:
   - Connect repo in Netlify Dashboard > New site from Git.
   - Set Functions directory: `functions`.
4. Add environment variables in Netlify:
   - `SUREMDM_API_KEY`: Your SureMDM API key.
   - `GMAIL_USER`: Your Gmail address.
   - `GMAIL_PASS`: Gmail App Password (generate at https://myaccount.google.com/apppasswords).
   - `SEND_TO_EMAIL_ADDRESS`: Recipient email address.
   - `SEND_FROM_EMAIL_ADDRESS`: Sender email address.

## Usage
1. POST to the webhook handler endpoint: `https://your-site.netlify.app/.netlify/functions/webhook-handler`
2. The webhook handler will fetch device details from SureMDM API and send an email to the recipient.

## Test
POST to `https://your-site.netlify.app/.netlify/functions/webhook-handler`:
```json
{
  "EventType": "test-event",
  "DeviceId": "your-device-id"
}