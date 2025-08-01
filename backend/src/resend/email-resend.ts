import { Resend } from 'resend';

export const sendVeriTokenEmail = async ( email: string, token: string ) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Hello World',
            html: `<p>Your token <strong>${token}</strong>!</p>`,
        });

        if (error) {
            console.error('Resend error:', error);
            return;
        }

        console.log('Email sent:', data?.id);
    } catch (error) {
        console.error('Unexpected error sending email:', error);
    }
}

export const sendSuccessVerifyUser = async (email: string) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Hello World',
            html: `<p>Your account is verified!</p>`,
        });

        if (error) {
            console.error('Resend error:', error);
            return;
        }

        console.log('Email sent:', data?.id);
    } catch (error) {
        console.error('Unexpected error sending email:', error);
    }
}