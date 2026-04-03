import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getContactTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter
  const host = process.env.MAILER_SMTP_HOST
  const user = process.env.MAILER_SMTP_USER
  const pass = process.env.MAILER_SMTP_PASS
  if (!host || !user || !pass) return null

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.MAILER_SMTP_PORT ?? 465),
    secure: process.env.MAILER_SMTP_SECURE !== 'false',
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })

  transporter.verify((err) => {
    if (err) {
      console.error('[ContactMailer] SMTP verify failed:', err.message)
    }
  })

  return transporter
}

function inboxTo(): string {
  return process.env.CONTACT_INBOX_EMAIL?.trim() || 'contact@kynjo.homes'
}

export async function sendContactFormEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  const t = getContactTransporter()
  if (!t) {
    const err = new Error('Contact mailer is not configured')
    ;(err as Error & { code?: string }).code = 'MAILER_UNCONFIGURED'
    throw err
  }

  const from = process.env.MAILER_SMTP_FROM ?? `Kynjo.Homes <${inboxTo()}>`
  const safeName = name || 'Visitor'

  await t.sendMail({
    from,
    to: inboxTo(),
    replyTo: email,
    subject: `[Kynjo.Homes] Contact: ${safeName}`,
    text: [
      `Name: ${safeName}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:560px;line-height:1.5;color:#374151">
        <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(safeName)}</p>
        <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p style="margin:0 0 8px;font-weight:600;color:#111827">Message</p>
        <div style="white-space:pre-wrap;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb">${escapeHtml(message)}</div>
      </div>
    `,
    headers: {
      'X-Mailer': 'Kynjo.Homes Contact Form',
    },
  })
}

export async function sendNewsletterSignupEmail(subscriberEmail: string) {
  const t = getContactTransporter()
  if (!t) {
    const err = new Error('Contact mailer is not configured')
    ;(err as Error & { code?: string }).code = 'MAILER_UNCONFIGURED'
    throw err
  }

  const from = process.env.MAILER_SMTP_FROM ?? `Kynjo.Homes <${inboxTo()}>`

  await t.sendMail({
    from,
    to: inboxTo(),
    subject: `[Kynjo.Homes] Newsletter signup: ${subscriberEmail}`,
    text: `New newsletter subscriber: ${subscriberEmail}\n\nSubmitted at: ${new Date().toISOString()}`,
    html: `
      <p style="font-family:sans-serif;color:#374151">New newsletter subscriber:</p>
      <p style="font-family:sans-serif"><a href="mailto:${escapeHtml(subscriberEmail)}">${escapeHtml(subscriberEmail)}</a></p>
      <p style="font-size:12px;color:#9ca3af">${escapeHtml(new Date().toISOString())}</p>
    `,
    headers: {
      'X-Mailer': 'Kynjo.Homes Newsletter',
    },
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
