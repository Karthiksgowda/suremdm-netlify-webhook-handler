// This is the main entry point for the webhook handler
const { Buffer } = require('buffer');

// functions/webhook-handler.js
export default async (request) => {
  console.log('+webhook-handler.js');

  // Log the caller's IP address and domain information
  const ip = request.headers.get('x-nf-client-connection-ip');
  const domain = request.headers.get('host');
  const contentType = request.headers.get('content-type');
  const userAgent = request.headers.get('user-agent');
  
  console.log(`Request from IP: ${ip}, Domain: ${domain}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Method: ${request.method}`);

  // Parse the JSON body
  let body;
  try {
    // First, get the raw text to see what we're receiving
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    console.log('Raw body length:', rawBody.length);
    
    // Check if body is empty
    if (!rawBody || rawBody.trim() === '') {
      console.log('Empty request body received - this might be a connection test');
      return new Response('Webhook endpoint is working. Send JSON data with EventType and DeviceId.', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Try to parse JSON
    body = JSON.parse(rawBody);
  } catch (error) {
    console.error('Invalid JSON:', error);
    console.error('Error details:', error.message);
    return new Response(`Invalid JSON body. Error: ${error.message}`, { status: 400 });
  }

  // Simple processing: Log the payload and check for a required field
  console.log('Received webhook:', body);
  if (!body.EventType || !body.DeviceId) {
    return new Response('Missing required fields (event or data)', { status: 400 });
  }
   
  // Extract device ID from payload
  const deviceId = body.DeviceId;
  if (!deviceId) {
    return new Response('Missing deviceId in payload', { status: 400 });
  }

  // Your custom logic here 
  // (e.g., save to a database, send email, use SureMDM APIs to perform further actions on the device, etc.)
  // In this example, we are not verifying the event type. However, if multiple events are configured to invoke this handler, 
  // it would be prudent to execute code based on the EventType parameter.
  
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
    console.log('Received deviceData:', deviceData);
    if (!deviceData || !deviceData.data || !deviceData.data.rows || deviceData.data.rows.length === 0) {
      throw new Error('Device details not found in SureMDM API response');
    }
    
    console.log('Fetched device details:', deviceData);

    // Extract specific fields (adjust keys based on actual API response structure)
    const deviceName = deviceData.data.rows[0].DeviceName;
    const imei = deviceData.data.rows[0].IMEI;
    const macAddress = deviceData.data.rows[0].MacAddress;  // Fallback for 'mac'

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
        user: process.env.GMAIL_USERNAME, 
        pass: process.env.GMAIL_APP_PASSWORD 
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
      from: "Device Alert"  + process.env.GMAIL_SENDER_ADDRESS,
      to: process.env.SEND_TO_EMAIL_ADDERESS,
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
