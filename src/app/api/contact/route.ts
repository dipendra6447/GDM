import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inquiries } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, company, serviceType, budget, timeline, message } = body;

    // Basic validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message or project details are required' },
        { status: 400 }
      );
    }

    // Insert into DB
    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        serviceType: serviceType || 'general',
        budget: budget || 'not_specified',
        timeline: timeline || 'not_specified',
        message: message.trim(),
        status: 'new',
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been submitted successfully! Our team will reach out to you within 2 hours.',
        data: newInquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting contact inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
