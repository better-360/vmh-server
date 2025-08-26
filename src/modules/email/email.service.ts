// mail.service.ts
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private resendMailer:Resend;
    constructor(
      private readonly configService: ConfigService
    ) {
      this.resendMailer = new Resend(
        this.configService.get<string>('RESEND_API_KEY')
      );
    }

  async sendMail(receiver_email: string, email_subject: string, email_body: string) {
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [receiver_email],
      subject: email_subject,
      html: email_body,
    });
  }

  //OK
  async sendEmailVerifyMail(receiver_email: string, fullName: string, verifyLink: string) {
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [receiver_email],
      subject: 'Verify Your Email Address for Registate',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify Your Email Address for Registate</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Please verify your email address to complete your Registate account setup.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Please Verify Your Email Address</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">Thanks for signing up with Registate! To complete your account setup and ensure you receive important updates, please verify your email address by clicking the button below.</p>
                            <p style="margin: 0 0 25px 0;">This link will confirm that we have the right email address for you.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="${verifyLink}" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 280px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">If the button above doesn't work, copy and paste the following link into your web browser:</p>
                            <p style="margin: 0 0 15px 0; word-break: break-all;"><a href="${verifyLink}" target="_blank" style="color: #1540FF; text-decoration: underline;">${verifyLink}</a></p>
                            <p style="margin: 0;">If you didn't sign up for Registate, please ignore this email.</p>
                        </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
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
    });
  }

//OK
async sendWelcomeMail(email: string, fullName: string, password:string) {
    await this.resendMailer.emails.send({
      from: 'Virtual Mailbox <help@m.registate.com>',
      to: [email],
      subject: 'Welcome to VMH!',
      html:`<html lang="en">
      <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to VMH!</title>
        <style type="text/css">
        /* Genel Reset Stilleri */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Arka planla aynı renk */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Outlook için gizle */
            visibility: hidden;
        }

        /* Mobil Cihazlar İçin Stiller */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Your journey to launching! Access your dashboard.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://vmh.thedice.ai/logo.svg" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Welcome to Registate!</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">Thank you for choosing VMH.  We're excited to have you on board!</p>
                            <p style="margin: 0 0 25px 0;">Ready to get started? Access your dashboard to begin the process.</p>
                            <p style="margin: 0 0 25px 0;">Here are your login details:</p>
                            <ul style="margin: 0 0 25px 20px; padding: 0;">
                                <li style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</li>
                                <li style="margin-bottom: 10px;"><strong>Password:</strong> ${password}</li>
                            </ul>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://vmh.thedice.ai/login" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Login to Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>
                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`
    })
  }

  //OK
async sendPasswordResetEmail(email: string, fullName, resetLink: string) {
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'Password Reset Request',
      html: `<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Registate Password</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Follow the link inside to securely reset your Registate account password.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Reset Your Password</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">We received a request to reset the password for your Registate account. Click the button below to set a new password.</p>
                            <p style="margin: 0 0 25px 0;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="${resetLink}" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Reset Your Password</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>
                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">For security reasons, this link will expire in 60 minutes. If you need help, please <a href="https://registate.com" target="_blank" style="color: #1540FF; text-decoration: underline;">contact support</a>.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                       <p style="margin: 0 0 10px 0;">You received this email because a password reset was requested for your account.</p>
                        <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>

                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`,
    });
  }


// OK
async sendNewTaskMail(email: string, fullName: string, task_name: string){
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'New Task Assigned',
      html:`<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Action Required: New Task Assigned</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        A new task requires your attention in your Registate dashboard. Please log in to complete it.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Action Required: New Task Assigned</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">A new task has been assigned to you in your Registate dashboard and requires your attention.</p>
                            <p style="margin: 0 0 15px 0;"><strong>Task:</strong>${task_name}</p>
                            <p style="margin: 0 0 25px 0;">Please log in to your dashboard to view the full details and complete the required actions (e.g., provide information, upload documents).</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard/tasks" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">View Task Details</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">If you have any questions about this task, please <a href="https://app.registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">contact our support team</a>.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>

                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`
    })
}

  //OK
async sendTicketResolvedMail(email: string, fullName: string, ticket_subject: string,ticket_number: string){
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'Ticket Resolved',
      html:`<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Your Support Ticket Has Been Resolved</title>
    <style type="text/css">
        /* General Reset Styles */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            border-collapse: collapse;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f4f4f4;
        }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4;
            /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }

            .content-cell {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }

            .button-td,
            .button-a {
                width: 100% !important;
            }

            .button-a {
                text-align: center !important;
            }
        }
    </style>
</head>

<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader"
        style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        We've resolved your recent support request #${ticket_number}. View details or provide feedback.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;"
                    class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp"
                                alt="Registate Logo" width="180"
                                style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left"
                            style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;"
                            class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Your
                                Support Ticket Has Been Resolved</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">Good news! Your support ticket regarding "${ticket_subject}"
                                (Ticket ID: #${ticket_number}) has been marked as resolved by our team.</p>
                            <p style="margin: 0 0 25px 0;">You can view the details of the resolution and the full
                                conversation history by clicking the button below.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td"
                                style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard/support" target="_blank"
                                            style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;"
                                            class="button-a">View Ticket Details</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center"
                            style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;"
                            class="content-cell">
                            <p style="margin: 0;">If you feel the issue is not fully resolved, simply reply to ticket to
                                automatically reopen the ticket. Alternatively, you can always <a
                                    href="https://registate.com" target="_blank"
                                    style="color: #1540FF; text-decoration: underline;">contact our support team</a>
                                again.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center"
                            style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;"
                            class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank"
                                    style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank"
                                    style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    })
}

  //OK
async sendnewDocumentMail(email: string, fullName: string, document_name: string){
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'New Document Uploaded',
      html:`<html lang="en">
      <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>New Document Uploaded to Your Dashboard</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        A new document from Registate is available in your account dashboard.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">New Document Available</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">A new document has been uploaded to your Registate account dashboard by our team.</p>
                            <p style="margin: 0 0 15px 0;"><strong>Document Name:</strong>${document_name}</p>
                            <p style="margin: 0 0 25px 0;">You can view and download this document by logging into your dashboard.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Access Your Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">If you have any questions, feel free to <a href="https://app.registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">contact our support team</a>.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
                </td>
        </tr>
    </table>
    </body>
    </html>`
    })
}


async sendCompanyFormationPaymentRequiredMail(email: string, fullName: string) {
    await this.resendMailer.emails.send({
      from: 'Registate <help@m.registate.com>',
      to: [email],
      subject: 'Company Formation Payment Required',
      html: `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Action Required: Payment Needed to Continue</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Complete your payment to continue your U.S. company formation with Registate.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Action Required: Payment Needed</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">You're making great progress toward forming your business in the U.S.! That said, it looks like your application is currently incomplete.</p>
                            <p style="margin: 0 0 25px 0;">To move forward, please complete your payment at your earliest convenience.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="http://app.registate.com/dashboard" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Complete Payment Now</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">If you have any questions or believe this is an error, please <a href="http://registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">contact our support team</a>.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>


                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`,
    });
}

async sendCompanyFormationSuccessMail(email: string, fullName: string,company_name:string) {
    await this.resendMailer.emails.send({
      from: 'Registate <help@m.registate.com>',
      to: [email],
      subject: 'Company Formed Successfly',
      html: `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Congratulations! Your Company is Officially Formed!</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
            .company-name-box { padding: 15px !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        It's official! Your U.S. company is formed. View your documents now.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px 10px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #0F2028; text-align: center;">Congratulations!</h1>
                            <p style="margin: 0 0 15px 0; text-align: center;">Hi ${fullName},</p>
                            <p style="margin: 0 0 20px 0; text-align: center;">We are thrilled to announce that your U.S. company formation is complete!</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 10px 40px;" class="content-cell">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 20px; border: 1px solid #9EE257; background-color: #f0fdf4; border-radius: 8px;" class="company-name-box">
                                        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #0F2028;">Your company:</p>
                                        <p style="margin: 5px 0 0 0; font-family: Arial, sans-serif; font-size: 22px; line-height: 28px; color: #1540FF; font-weight: bold;">${company_name}</p>
                                        <p style="margin: 5px 0 0 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #0F2028;">is officially formed!</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                     <tr>
                        <td align="left" style="padding: 20px 40px 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028; text-align: center;" class="content-cell">
                            <p style="margin: 0 0 25px 0;">Your official formation documents are now available for download in your Registate dashboard.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard/" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">View Your Documents</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">If you have any questions, feel free to <a href="https://app.registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">contact our support team</a>.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
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
    });
}

async sendTaskReminderMail(email: string, fullName: string, task_name: string){
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'Reminder: Action Required on Your Task',
      html:`<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reminder: Action Required on Your Task</title>
    <style type="text/css">
        /* General Reset Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Hidden Preheader Style */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Match background color */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Hide for Outlook */
            visibility: hidden;
        }

        /* Mobile Specific Styles */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Just a reminder - the task "${task_name}" in your Registate dashboard requires your attention.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Reminder: Action Required</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">This is a friendly reminder that the task assigned to you 3 days ago in your Registate dashboard still requires your attention.</p>
                            <p style="margin: 0 0 15px 0;"><strong>Task:</strong>${task_name}</p>
                            <p style="margin: 0 0 25px 0;">Completing this task promptly is important to keep your services moving forward without delay. Please log in to your dashboard as soon as possible to view the details and complete the required actions.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard/tasks" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 250px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">View Pending Task</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">If you have any questions or need assistance with this task, please <a href="https://registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">contact our support team</a>.</p>
                        </td>
                    </tr>


                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>


                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`
    })
}

async sendCompanyCreateReminderMail(email: string, fullName: string){
    await this.resendMailer.emails.send({
      from: 'Registate <notify@m.registate.com>',
      to: [email],
      subject: 'Ready to Launch Your U.S. Company',
      html:`<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Ready to Launch Your U.S. Company?</title>
    <style type="text/css">
        /* Genel Reset Stilleri */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

        /* Gizli Preheader Stili */
        .preheader {
            display: none;
            font-size: 1px;
            color: #f4f4f4; /* Arka planla aynı renk */
            line-height: 1px;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
            mso-hide: all; /* Outlook için gizle */
            visibility: hidden;
        }

        /* Mobil Cihazlar İçin Stiller */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
            .button-td, .button-a { width: 100% !important; }
            .button-a { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">

    <span class="preheader" style="display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden;">
        Take the next step towards your U.S. business goals with Registate's easy setup process.
    </span>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" class="email-container">

                    <tr>
                        <td align="center" style="padding: 30px 20px 20px 20px; background-color: #ffffff;">
                            <img src="https://registate.com/wp-content/uploads/2023/07/Image-36-1.webp" alt="Registate Logo" width="180" style="display: block; border: 0; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555; max-width: 180px;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0F2028;" class="content-cell">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #0F2028;">Don't Let Your U.S. Business Dream Wait!</h1>
                            <p style="margin: 0 0 15px 0;">Hi ${fullName},</p>
                            <p style="margin: 0 0 15px 0;">We noticed you signed up for Registate but haven't started the company formation process yet. Are you ready to take the exciting step of launching your business in the United States?</p>
                            <p style="margin: 0 0 15px 0;">Registate makes it simple. We handle the complexities – from <strong style="color: #1540FF;">company formation</strong> and securing a <strong style="color: #1540FF;">registered agent</strong> to obtaining your <strong style="color: #1540FF;">EIN</strong> and managing <strong style="color: #1540FF;">annual reports</strong>. Everything you need is streamlined on our platform.</p>
                            <p style="margin: 0 0 25px 0;">Why wait? Turn your vision into reality today. Click below to easily start your company formation process.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px;" class="content-cell">
                            <table border="0" cellspacing="0" cellpadding="0" class="button-td" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #1540FF;">
                                        <a href="https://app.registate.com/dashboard" target="_blank" style="background-color: #1540FF; border: 1px solid #1540FF; border-radius: 8px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 300px; -webkit-text-size-adjust: none; mso-hide: all;" class="button-a">Start Your Company Formation</a>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>

                     <tr>
                        <td align="center" style="padding: 0px 40px 30px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;" class="content-cell">
                            <p style="margin: 0;">Need help or have questions? Our <a href="https://registate.com/" target="_blank" style="color: #1540FF; text-decoration: underline;">support team</a> is ready to assist you.</p>
                        </td>
                    </tr>

                   <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f4f4f4; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #555555;" class="content-cell">
                            <p style="margin: 0 0 10px 0;">Registate LLC<br>https://app.registate.com/</p>
                            <p style="margin: 0;">
                                <a href="https://app.registate.com/unsubscribe/" target="_blank" style="color: #555555; text-decoration: underline;">Unsubscribe</a>
                                |
                                <a href="https://app.registate.com/privacy-policy/" target="_blank" style="color: #555555; text-decoration: underline;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>

                </table>
                </td>
        </tr>
    </table>
    </body>
</html>
`
    })
}

}