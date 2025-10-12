import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});


export const sendEmail = async (option :{to: string, subject: string, html: string}) => {
    const mailOptions = {
        from:`"Foda e-commerce" <${process.env.EMAIL_USER}>`,
        to: option.to,
        subject: option.subject,
        html: option.html
    };
    await transporter.sendMail(mailOptions);
}