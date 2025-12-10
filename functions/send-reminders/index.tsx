import * as React from 'react';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { render } from '@react-email/render';
import { ReminderEmail } from './template';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_TOKEN!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const mailer = new MailerSend({ apiKey: MAILERSEND_API_KEY });

export default async function handler() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .select('id, name, times, user_id, start_date, end_date')
      .or(`end_date.is.null,start_date.lte.${today},end_date.gte.${today}`);

    if (medsError) throw medsError;
    if (!meds?.length) {
      return { statusCode: 200, body: 'No meds today' };
    }

    const byUser: Record<string, typeof meds> = {};
    meds.forEach((m) => {
      if (!byUser[m.user_id]) byUser[m.user_id] = [];
      byUser[m.user_id].push(m);
    });

    const results: any[] = [];

    for (const [userId, userMeds] of Object.entries(byUser)) {
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (profError || !profile?.email) {
        console.warn(`Skipping user ${userId}: ${profError?.message || 'no email'}`);
        continue;
      }

      const html = await render(
        <ReminderEmail
          name={profile.name || 'there'}
          date={today}
          meds={userMeds.map((m) => ({ name: m.name, times: m.times }))}
        />
      )

      const sentFrom = new Sender('no-reply@test-ywj2lpndx0jg7oqz.mlsender.net', 'MediCare');
      const recipients = [new Recipient(profile.email, profile.name || '')];
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`Your meds for ${today}`)
        .setHtml(html);

      try {
        await mailer.email.send(emailParams);
        console.log(`✅ Email sent to ${profile.email}`);
        results.push({ userId, status: 'success', email: profile.email });
      } catch (sendError: any) {
        console.error(`❌ Failed to send to ${profile.email}:`, sendError);
        results.push({ userId, status: 'error', error: sendError.message });
      }
    }

    return { statusCode: 200, body: JSON.stringify({ results }) };
  } catch (err: any) {
    console.error('Handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}