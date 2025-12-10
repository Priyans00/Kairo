import * as React from 'react';
import { Html } from '@react-email/html';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';

interface ReminderEmailProps {
  name: string;
  date: string;
  meds: Array<{ name: string; times: string[] }>;
}

export function ReminderEmail({ name, date, meds }: ReminderEmailProps) {
  // Determine greeting based on time of day
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Html lang="en">
      <Container style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px' }}>
        <Heading style={{ color: '#2563EB' }}>{greeting()}, {name}!</Heading>
        <Text style={{ marginBottom: '20px', fontSize: '16px' }}>
          Here's your medication schedule for <strong>{date}</strong>:
        </Text>

        {meds.map((med) => (
          <Section key={med.name} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '5px' }}>
            <Text style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{med.name}</Text>
            <Text style={{ fontSize: '14px' }}>🕒 {med.times.join(', ')}</Text>
          </Section>
        ))}

        <Button
            href="https://kairomed.vercel.app/protected"
            style={{
                backgroundColor: '#2563EB',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
            }}
        >
        View Your Dashboard
        </Button>
          

        <Text style={{ marginTop: '30px', fontSize: '12px', color: '#777' }}>
          This is an automated reminder. Have a healthy day! 😊
        </Text>
        
        <Text style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
          If you no longer wish to receive these reminders, you can update your notification settings in your profile.
        </Text>
      </Container>
    </Html>
  );
}
