/**
 * Transactional email through Resend.
 *
 * When RESEND_API_KEY is missing (local development, preview without secrets),
 * the message is logged instead of being sent so the flow stays testable.
 */

export interface MailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export function mailerConfigured() {
  return Boolean(String(useRuntimeConfig().resendApiKey || '').trim())
}

export function mailFrom() {
  return String(useRuntimeConfig().resendFrom || '').trim() || 'QVault <noreply@qvault.hqmerchant.xyz>'
}

export async function sendMail(input: MailInput): Promise<{ sent: boolean; dev: boolean }> {
  const apiKey = String(useRuntimeConfig().resendApiKey || '').trim()
  const from = mailFrom()

  if (!apiKey) {
    // Never log secrets: only the recipient, subject and plain-text body.
    console.info(`[mail:dev] from=${from} to=${input.to} subject=${input.subject}`)
    console.info(input.text || input.html)
    return { sent: false, dev: true }
  }

  let response: Response
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    })
  } catch (error) {
    console.error('[mail] Resend unreachable', error instanceof Error ? error.name : 'unknown')
    throw createError({ statusCode: 502, message: 'Envoi de l’e-mail impossible. Réessayez plus tard.' })
  }

  if (!response.ok) {
    // Correlate the log line with the Resend response without exposing content.
    const reference = crypto.randomUUID()
    console.error(`[mail:${reference}]`, response.status)
    throw createError({ statusCode: 502, message: `Envoi de l’e-mail impossible. (réf. ${reference})` })
  }

  return { sent: true, dev: false }
}

export function verificationEmail(input: { link: string; username: string; locale?: string }) {
  const { link, username } = input
  const english = input.locale === 'en'

  const subject = english
    ? 'Confirm your QVault email address'
    : 'Confirmez votre adresse e-mail QVault'

  const text = english
    ? `Hello ${username},\n\nConfirm your email address to activate your QVault account:\n${link}\n\nThis link is valid for 24 hours and can be used once. If you did not sign up, ignore this email.`
    : `Bonjour ${username},\n\nConfirmez votre adresse e-mail pour activer votre compte QVault :\n${link}\n\nCe lien est valable 24 heures et à usage unique. Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail.`

  const heading = english ? 'Confirm your email address' : 'Confirmez votre adresse e-mail'
  const intro = english
    ? `Hello ${username}, confirm your email address to activate your QVault account.`
    : `Bonjour ${username}, confirmez votre adresse e-mail pour activer votre compte QVault.`
  const cta = english ? 'Confirm my email' : 'Confirmer mon e-mail'
  const note = english
    ? 'This link is valid for 24 hours and can be used once. If you did not sign up, ignore this email.'
    : 'Ce lien est valable 24 heures et à usage unique. Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail.'

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f3;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1c1f1a">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e3e5e0;border-radius:12px">
            <tr><td style="padding:28px">
              <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#2b7fff;font-weight:600">QVault</p>
              <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3">${heading}</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b4f47">${intro}</p>
              <p style="margin:0 0 24px">
                <a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#2b7fff;color:#ffffff;font-weight:600;text-decoration:none">${cta}</a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b6f66">${note}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8e85;word-break:break-all">${link}</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, text, html }
}
