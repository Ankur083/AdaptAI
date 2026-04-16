import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Clean up potential spaces in the password caused by copy-pasting
    const pass = process.env.EMAIL_PASSWORD?.replace(/\s/g, '');
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: pass,
        }
    });

    // Define the email options
    const mailOptions = {
        from: `AdaptiveLearn <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
