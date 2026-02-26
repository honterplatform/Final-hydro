import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { eventId, firstName, lastName, email, phone } = await req.json();

    if (!eventId) {
      return new Response(JSON.stringify({ error: 'eventId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the event to find notification emails
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, event_date, event_time, location, notification_emails')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If no notification emails configured, skip
    if (!event.notification_emails) {
      return new Response(JSON.stringify({ message: 'No notification emails configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse comma-separated emails
    const recipients = event.notification_emails
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ message: 'No valid recipients' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format date for email
    const dateStr = new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = event.event_time
      ? new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

    // Build email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #509E2E; margin-bottom: 4px;">New Event Signup</h2>
        <p style="color: #6b7280; margin-top: 0;">Someone just signed up for <strong>${event.title}</strong></p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Attendee Details</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          ${phone ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>` : ''}
        </div>

        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Event Details</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Event:</strong> ${event.title}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${dateStr}${timeStr ? ` at ${timeStr}` : ''}</p>
          ${event.location ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Location:</strong> ${event.location}</p>` : ''}
        </div>
      </div>
    `;

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'HydroBlok Events <onboarding@resend.dev>',
        to: recipients,
        subject: `New Signup: ${event.title} — ${firstName} ${lastName}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
