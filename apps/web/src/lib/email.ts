import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST!,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
})

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('[Email] SMTP connection failed:', error.message)
  } else {
    console.log('[Email] SMTP server is ready')
  }
})

export async function sendInviteEmail({
  to,
  firstName,
  estateName,
  inviteUrl,
}: {
  to:          string
  firstName:   string
  estateName:  string
  inviteUrl:   string
}) {
  console.log('[Email] Sending invite to:', to)
  console.log('[Email] Invite URL:', inviteUrl)

  const baseUrl = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`

  const info = await transporter.sendMail({
    from:     process.env.SMTP_FROM,
    to,
    subject:  `You have been invited to join ${estateName} on EstateIQ`,
    // Plain text fallback
    text: `
Hello ${firstName},

You have been added as a resident of ${estateName} on EstateIQ.

Click the link below to set up your password and activate your account:
${inviteUrl}

This link expires in 48 hours.

If you did not expect this invitation, you can ignore this email.

— EstateIQ
    `.trim(),
    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #e5e7eb">

          <!-- Logo -->
          <tr>
            <td style="padding:24px 32px 0;text-align:center">
              <img src="${logoUrl}" alt="EstateIQ" width="231" height="66" style="display:block;margin:0 auto;max-width:231px;height:auto;border-radius:4px"/>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px">
              <h2 style="font-size:20px;color:#111827;font-weight:600;margin:0 0 8px">
                Hello, ${firstName}
              </h2>
              <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 24px">
                You have been added as a resident of
                <strong style="color:#111827">${estateName}</strong>
                on EstateIQ. Click the button below to set up your
                password and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                <tr>
                  <td style="background:#16a34a;border-radius:4px;padding:0">
                    <a href="${inviteUrl}"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:4px">
                      Set up my account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="font-size:13px;color:#9ca3af;margin:0 0 8px">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0 0 24px;background:#f9fafb;padding:10px 12px;border-radius:4px;border:1px solid #e5e7eb">
                ${inviteUrl}
              </p>

              <p style="font-size:13px;color:#9ca3af;margin:0">
                This link expires in 48 hours. If you did not expect
                this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center">
              <p style="font-size:12px;color:#9ca3af;margin:0">
                EstateIQ · Smart estate management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    // These headers improve deliverability significantly
    headers: {
      'X-Mailer':          'EstateIQ Mailer',
      'X-Priority':        '3',
      'X-MSMail-Priority': 'Normal',
      'Importance':        'Normal',
    },
  })

  console.log('[Email] Sent successfully. Message ID:', info.messageId)
}

export async function sendPasswordResetEmail({
  to, name, resetUrl,
}: {
  to: string; name: string; resetUrl: string
}) {
  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to,
    subject: 'Reset your EstateIQ password',
    text:    `Hello ${name},\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <div style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;font-size:24px;margin:0">EstateIQ</h1>
        </div>
        <h2 style="color:#111827">Reset your password</h2>
        <p style="color:#4b5563;line-height:1.6">Hello ${name},<br/><br/>
        Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#16a34a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
            Reset password
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}