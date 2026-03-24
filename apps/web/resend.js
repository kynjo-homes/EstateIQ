import nodemailer from 'nodemailer'

// ── Edit these values directly ──────────────────────────
const config = {
  host:   'eu1.workspace.org',      // your SMTP host
  port:   465,                         // 587 or 465
  secure: true,                       // true if port 465
  user:   'devops@bubblebarrel.dev',   // full email address
  pass:   'abc@123##',       // your email password
  from:   'EstateIQ <devops@bubblebarrel.dev>',
  to:     'gocitek@gmail.com',     // where to send the test
}
// ────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host:   config.host,
  port:   config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

console.log('Testing SMTP connection...')
console.log('Host:', config.host)
console.log('Port:', config.port)
console.log('User:', config.user)
console.log('')

// Step 1 — verify connection
try {
  await transporter.verify()
  console.log('✓ SMTP connection successful')
} catch (err) {
  console.error('✗ Connection failed:', err.message)
  console.error('')
  console.error('Common fixes:')
  console.error('  - Wrong password → copy-paste it, do not retype')
  console.error('  - Wrong host → check your mail provider control panel')
  console.error('  - Port 465 needs secure: true')
  console.error('  - Port 587 needs secure: false')
  console.error('  - Gmail needs an App Password, not your regular password')
  process.exit(1)
}

// Step 2 — send a test email
console.log('')
console.log('Sending test email to:', config.to)

try {
  const info = await transporter.sendMail({
    from:    config.from,
    to:      config.to,
    subject: 'EstateIQ SMTP test',
    text:    'If you received this, your SMTP settings are working correctly.',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="background:#16a34a;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px">
          <h1 style="color:#fff;margin:0;font-size:20px">EstateIQ</h1>
        </div>
        <h2 style="color:#111827">SMTP test successful</h2>
        <p style="color:#4b5563">
          If you received this email your SMTP settings are configured correctly
          and EstateIQ can send emails from your server.
        </p>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px">
          Sent from: ${config.user}<br/>
          Host: ${config.host}:${config.port}
        </p>
      </div>
    `,
  })

  console.log('✓ Test email sent successfully')
  console.log('  Message ID:', info.messageId)
  console.log('  Check your inbox at:', config.to)
} catch (err) {
  console.error('✗ Failed to send email:', err.message)
  process.exit(1)
}