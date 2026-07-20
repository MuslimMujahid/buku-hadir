import { Resend } from "resend";

type VerificationEmailInput = {
  to: string;
  url: string;
};

type Mailer = {
  client: Resend;
  from: string;
};

let mailer: Mailer | undefined;

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be configured to send email.`);
  }
  return value;
}

function getMailer(): Mailer {
  if (mailer) {
    return mailer;
  }

  const apiKey = requiredEnvironment("RESEND_API_KEY");
  const fromEmail = requiredEnvironment("RESEND_FROM_EMAIL");
  const fromName = process.env.RESEND_FROM_NAME?.trim();

  mailer = {
    client: new Resend(apiKey),
    from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
  };
  return mailer;
}

export async function sendVerificationEmail({
  to,
  url,
}: VerificationEmailInput): Promise<void> {
  let configuredMailer: Mailer;
  try {
    configuredMailer = getMailer();
  } catch (error: unknown) {
    console.error("[mail] Verification email delivery failed", {
      recipient: to,
      error,
    });
    return;
  }

  try {
    const result = await configuredMailer.client.emails.send({
      from: configuredMailer.from,
      to,
      subject: "Verifikasi alamat email Absensi",
      text: `Buka tautan berikut untuk memverifikasi email Anda: ${url}`,
      html: `<p>Silakan verifikasi alamat email Anda untuk menggunakan Absensi.</p><p><a href="${url}">Verifikasi email</a></p>`,
    });

    if (result.error) {
      console.error("[mail] Verification email delivery failed", {
        recipient: to,
        error: result.error,
      });
    }
  } catch (error: unknown) {
    console.error("[mail] Verification email delivery failed", {
      recipient: to,
      error,
    });
  }
}
