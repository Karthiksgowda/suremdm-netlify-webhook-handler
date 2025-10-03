// This is the main entry point for the webhook handler

const { Buffer } = require('buffer');

// functions/webhook-handler.js
export default async (request) => {
  console.log('+webhook-handler.js');
  //console.log(request);
  // Handle only POST requests
  // if (request.method !== 'POST') {
  //   return new Response('Method not allowed', { status: 405 });
  // }

  // Parse the JSON body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid JSON:', error);
    return new Response('Invalid JSON body', { status: 400 });
  }

  // Simple processing: Log the payload and check for a required field
  console.log('Received webhook:', body);
  if (!body.EventType || !body.DeviceId) {
    return new Response('Missing required fields (event or data)', { status: 400 });
  }

  // Your custom logic here (e.g., save to a database, send email, etc.)
 // Extract device ID from payload (adjust key if different, e.g., body.data.imei)
  const deviceId = body.DeviceId;
  if (!deviceId) {
    return new Response('Missing deviceId in payload', { status: 400 });
  }

  var apiUrl;

  try {
    // Fetch device details from SureMDM API
    const authHeader = "Basic " + Buffer.from(process.env.SUREMDM_API_USERNAME + ":" + process.env.SUREMDM_API_PASSWORD).toString("base64");

    apiUrl = process.env.SUREMDM_API_URL + "/v2/device/" + deviceId;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        ApiKey: process.env.SUREMDM_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SureMDM API error: ${response.status} ${response.statusText}`);
    }

    const deviceData = await response.json();

    console.log('Fetched device details:', deviceData);

    // Extract specific fields (adjust keys based on actual API response structure)
    const deviceName = deviceData.data.rows[0].DeviceName;
    const imei = deviceData.data.rows[0].IMEI;
    const macAddress = deviceData.data.rows[0].MacAddress;  // Fallback for 'mac'

    // Your custom logic here (e.g., save to DB, send notification)
    // For now, include fetched data in response
    const responseData = {
      message: 'Webhook received and device details fetched successfully',
      receivedEvent: body.EventType,
      deviceId: deviceId,
      //deviceData: deviceData,
      apiUrl: apiUrl,
      deviceDetails: {
        name: deviceName,
        imei: imei,
        macAddress: macAddress
      },
      timestamp: new Date().toISOString()
    };

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USERNAME, // || "osparhartest@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD // "hbtv adrd haew egwo"
      }
    });

    const emailBody = `
      Webhook Event: ${body.EventType}
      Device ID: ${deviceId}
      Device Name: ${deviceName}
      IMEI: ${imei}
      MAC Address: ${macAddress}
      Timestamp: ${new Date().toISOString()}
    `;

    await transporter.sendMail({
      from: `"Device Alert" <osparhartest@gmail.com>`,
      to: 'onkar@42gears.com',
      subject: `Device Alert: ${deviceName}`,
      text: emailBody,
      html: `<pre>${emailBody}</pre>`
    });

    console.log('Email sent via Gmail!');
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    } catch (error) {
    console.error('Error fetching from SureMDM API:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};