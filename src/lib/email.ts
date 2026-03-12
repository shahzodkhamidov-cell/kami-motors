import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface FinancingEmailData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  carYear: number;
  carMake: string;
  carModel: string;
  carPrice: number;
  downPayment: number;
  monthlyIncome: number;
  creditScoreRange: string;
  employmentStatus: string;
  applicationId: string;
}

export async function sendFinancingNotification(data: FinancingEmailData) {
  const notifyEmail = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;

  if (!notifyEmail || !process.env.SMTP_USER) {
    console.log("Email not configured, skipping notification");
    return;
  }

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Financing Application</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Kami Motors</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #22c55e; border-bottom: 1px solid #333; padding-bottom: 10px;">Vehicle</h2>
        <p><strong>${data.carYear} ${data.carMake} ${data.carModel}</strong></p>
        <p>Asking Price: ${formatCurrency(data.carPrice)}</p>

        <h2 style="color: #22c55e; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 24px;">Applicant</h2>
        <p><strong>Name:</strong> ${data.applicantName}</p>
        <p><strong>Email:</strong> ${data.applicantEmail}</p>
        <p><strong>Phone:</strong> ${data.applicantPhone}</p>

        <h2 style="color: #22c55e; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 24px;">Financial Info</h2>
        <p><strong>Employment:</strong> ${data.employmentStatus}</p>
        <p><strong>Monthly Income:</strong> ${formatCurrency(data.monthlyIncome)}</p>
        <p><strong>Credit Score:</strong> ${data.creditScoreRange}</p>
        <p><strong>Down Payment:</strong> ${formatCurrency(data.downPayment)}</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/admin/applications/${data.applicationId}"
             style="background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Full Application
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Kami Motors" <${process.env.SMTP_USER}>`,
    to: notifyEmail,
    subject: `New Financing Application - ${data.carYear} ${data.carMake} ${data.carModel}`,
    html,
  });
}
