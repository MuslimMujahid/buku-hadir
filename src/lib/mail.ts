import nodemailer, { type Transporter } from "nodemailer";

type VerificationEmailInput = {
  to: string;
  url: string;
};

let transporter: Transporter | undefined;

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be configured to send email.`);
  }
  return value;
}

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = requiredEnvironment("SMTP_HOST");
  const portValue = requiredEnvironment("SMTP_PORT");
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535.");
  }

  const username = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL?.trim() || process.env.FROM_EMAIL?.trim();
  if (!fromEmail) {
    throw new Error("SMTP_FROM_EMAIL must be configured to send email.");
  }

  const fromName =
    process.env.SMTP_FROM_NAME?.trim() || process.env.FROM_NAME?.trim();

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE?.trim().toLowerCase() === "true",
    ...(username && password
      ? { auth: { user: username, pass: password } }
      : {}),
  });

  transporter.options.from = fromName
    ? `"${fromName}" <${fromEmail}>`
    : fromEmail;
  return transporter;
}

export async function sendVerificationEmail({
  to,
  url,
}: VerificationEmailInput): Promise<void> {
  let mailer: Transporter;
  try {
    mailer = getTransporter();
  } catch (error: unknown) {
    console.error("[mail] Verification email delivery failed", {
      recipient: to,
      error,
    });
    return;
  }
  const from = mailer.options.from;

  void mailer
    .sendMail({
      from,
      to,
      subject: "Verifikasi alamat email Absensi",
      text: `Buka tautan berikut untuk memverifikasi email Anda: ${url}`,
      html: `<p>Silakan verifikasi alamat email Anda untuk menggunakan Absensi.</p><p><a href="${url}">Verifikasi email</a></p>`,
    })
    .catch((error: unknown) => {
      console.error("[mail] Verification email delivery failed", {
        recipient: to,
        error,
      });
    });
}
