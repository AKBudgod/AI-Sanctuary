export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.ADMIN_API_KEY}`) {
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
            'Authorization': `Bearer ${env.ADMIN_API_KEY}`
          },
          body: JSON.stringify({ niche: mission.niche, maxLeads: 20 }) // Increased batch size for revenue sprint
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
              'Authorization': `Bearer ${env.ADMIN_API_KEY}`
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
    const systemEmail = 'weedj747@gmail.com';
    const missionId = `system_sanctuary_marketing`;
    
    // Ensure System Mission exists in KV
    let missionDataStr = await env.KLA_LEADS_KV.get(`mission:${systemEmail}:${missionId}`);
    let mission = missionDataStr ? JSON.parse(missionDataStr) : {
      id: missionId,
      email: systemEmail,
      niche: 'Global Platform Growth',
      leads: 0,
      sent: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      isSystem: true
    };

    const niches = ['AI Startups', 'SaaS Founders', 'Web3 Growth Leads', 'Digital Marketing Agencies', 'AI Influencers'];
    
    for (const niche of niches) {
      console.log(`K'LA is mining data for: ${niche}`);

      const prospectReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.ADMIN_API_KEY}`
        },
        body: JSON.stringify({ niche, maxLeads: 20 })
      });

      if (!prospectReq.ok) continue;
      const { leads } = await prospectReq.json();
      
      for (const lead of leads) {
        const contacted = await env.KLA_LEADS_KV.get(`contacted:${lead.email}`);
        if (contacted) continue;

        const sendReq = await fetch('https://ai-sanctuary.pages.dev/api/kla/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.ADMIN_API_KEY}`
          },
          body: JSON.stringify({ lead })
        });

        if (sendReq.ok) {
           mission.leads++;
           mission.sent++;
           await env.KLA_LEADS_KV.put(`contacted:${lead.email}`, JSON.stringify({
             date: new Date().toISOString(),
             lead: lead
           }));
           // Update mission stats incrementally
           await env.KLA_LEADS_KV.put(`mission:${systemEmail}:${missionId}`, JSON.stringify(mission));
        }
      }
    }
    
    mission.status = 'Standby';
    await env.KLA_LEADS_KV.put(`mission:${systemEmail}:${missionId}`, JSON.stringify(mission));
  } catch (error: any) {
    console.error("K'LA Cron Job Error:", error.message);
  }
}
