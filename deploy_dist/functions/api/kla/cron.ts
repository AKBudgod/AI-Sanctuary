export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.ADMIN_SECRET_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("K'LA Daily SDR Routine Started Manually via Ping...", new Date().toISOString());

  try {
    // 1. Fetch ALL active user missions dynamically from the KV Database
    const activeKeys = await env.KLA_LEADS_KV.list({ prefix: 'mission:' });
    
    for (const key of activeKeys.keys) {
      const missionDataStr = await env.KLA_LEADS_KV.get(key.name);
      if (!missionDataStr) continue;

      try {
        const mission = JSON.parse(missionDataStr);
        if (mission.status !== 'Active') continue;
        
        console.log(`[AUTONOMOUS CRM] K'LA is executing mission for ${mission.email} - Target: ${mission.niche}`);

        const prospectReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/prospect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.ADMIN_SECRET_KEY}`
          },
          body: JSON.stringify({ niche: mission.niche, maxLeads: 5 }) // Small daily batch per user
        });

        if (!prospectReq.ok) continue;
        const { leads } = await prospectReq.json();

        let newLeadsFound = 0;
        let newEmailsSent = 0;

        for (const lead of leads) {
          const contacted = await env.KLA_LEADS_KV.get(`contacted:${lead.email}`);
          if (contacted) continue; // Anti-Spam protection

          newLeadsFound++;
          console.log(`Found uncontacted lead: ${lead.email}`);

          const sendReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.ADMIN_SECRET_KEY}`
            },
            body: JSON.stringify({ lead })
          });

          if (sendReq.ok) {
             newEmailsSent++;
             await env.KLA_LEADS_KV.put(`contacted:${lead.email}`, JSON.stringify({
               date: new Date().toISOString(),
               lead: lead,
               missionId: mission.id
             }));
             console.log(`Dispatch successful. MailChannels sent marketing mail to ${lead.email}`);
          }
        }

        // Live Dashboard Synchronization: Update the user's specific KV counters
        if (newLeadsFound > 0 || newEmailsSent > 0) {
          mission.leads += newLeadsFound;
          mission.sent += newEmailsSent;
          
          await env.KLA_LEADS_KV.put(key.name, JSON.stringify(mission));
          console.log(`[AUTONOMOUS CRM] Updated Dashboard counters for ${mission.email}. (+${newLeadsFound} leads, +${newEmailsSent} sent).`);
        }

      } catch (parseError) {
        console.error("Failed to parse mission data:", key.name);
      }
    }

    return new Response("Cron completed.", { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function scheduled(event: any, env: any, ctx: any) {
  // This is the CRON entry point for K'LA to run daily
  console.log("K'LA Daily SDR Routine Started...", new Date().toISOString());

  try {
    // 1. Fetch campaigns/niches to target (could be from KV or hardcoded for now)
    const niches = ['AI Startups', 'Web3 Gaming Studios'];

    for (const niche of niches) {
      console.log(`K'LA is mining data for: ${niche}`);

      // 2. Call the prospecting agent (internal fetch to avoid exposing the logic directly)
      const prospectReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.ADMIN_SECRET_KEY}`
        },
        body: JSON.stringify({ niche, maxLeads: 5 })
      });

      if (!prospectReq.ok) {
        console.error(`K'LA Failed to find leads for ${niche}:`, await prospectReq.text());
        continue;
      }

      const { leads } = await prospectReq.json();
      console.log(`K'LA found ${leads.length} leads for ${niche}`);

      // 3. For each lead, craft and send the email
      for (const lead of leads) {
        // Check KV to ensure we haven't emailed them before
        const contacted = await env.KLA_LEADS_KV.get(`contacted:${lead.email}`);
        if (contacted) {
          console.log(`K'LA skipping ${lead.email} - already contacted.`);
          continue;
        }

        // Draft and send email
        const sendReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.ADMIN_SECRET_KEY}`
          },
          body: JSON.stringify({ lead })
        });

        if (sendReq.ok) {
           console.log(`K'LA successfully emailed: ${lead.email}`);
           // Mark as contacted in KV to prevent future spam
           await env.KLA_LEADS_KV.put(`contacted:${lead.email}`, JSON.stringify({
             date: new Date().toISOString(),
             lead: lead
           }));
        } else {
           console.error(`K'LA failed to email ${lead.email}:`, await sendReq.text());
        }
      }
    }
  } catch (error: any) {
    console.error("K'LA Cron Job Error:", error.message);
  }
}
