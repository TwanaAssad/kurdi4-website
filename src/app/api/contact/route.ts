import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['info@kurd4.org'],
      subject: `New Contact Form Submission: ${subject}`,
      replyTo: email,
      html: `
        <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #563a4a;">پەیامی نوێ لە ماڵپەڕەوە</h2>
          <p><strong>ناو:</strong> ${name}</p>
          <p><strong>ئیمەیڵ:</strong> ${email}</p>
          <p><strong>بابەت:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>نامە:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
