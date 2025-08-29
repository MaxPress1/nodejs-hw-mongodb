import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

 const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   secure: false,   
   auth: {
     user: process.env.SMTP_USER,
     pass: process.env.SMTP_PASSWORD,
   },
 });

 console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASSWORD, process.env.SMTP_FROM);

 await transporter.verify();
 
export const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            to,
            subject,
            html,
            from: process.env.SMTP_FROM,
        });
    } catch (error) {
        console.log(error);
        throw createHttpError(
          500,
          'Failed to send the email, please try again later.',
        );
    }
};
