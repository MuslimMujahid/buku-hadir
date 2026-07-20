import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

describe("sendVerificationEmail", () => {
  const originalEnvironment = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnvironment };
    send.mockReset();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("sends the verification message through Resend", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "no-reply@example.com";
    process.env.RESEND_FROM_NAME = "Absensi";
    send.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const { sendVerificationEmail } = await import("./mail");
    // Reload the module so its lazy mailer cache is isolated per test.
    await sendVerificationEmail({
      to: "student@example.com",
      url: "https://absensi.example.com/verify?token=abc",
    });

    expect(send).toHaveBeenCalledWith({
      from: "Absensi <no-reply@example.com>",
      to: "student@example.com",
      subject: "Verifikasi alamat email Absensi",
      text: "Buka tautan berikut untuk memverifikasi email Anda: https://absensi.example.com/verify?token=abc",
      html: "<p>Silakan verifikasi alamat email Anda untuk menggunakan Absensi.</p><p><a href=\"https://absensi.example.com/verify?token=abc\">Verifikasi email</a></p>",
    });
  });

  it("logs provider failures without rejecting the caller", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "no-reply@example.com";
    const error = { name: "validation_error", message: "Invalid from address" };
    send.mockResolvedValue({ data: null, error });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    // Reload the module so its lazy mailer cache is isolated per test.
    const { sendVerificationEmail } = await import("./mail");
    await expect(
      sendVerificationEmail({ to: "student@example.com", url: "https://example.com/verify" }),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      "[mail] Verification email delivery failed",
      expect.objectContaining({ recipient: "student@example.com", error }),
    );
  });
});
