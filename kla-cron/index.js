export default {
  async scheduled(event, env, ctx) {
    console.log("Pinged K'LA the SDR Agent on 14:00 UTC schedule");
    const res = await fetch("https://ai-sanctuary.pages.dev/api/kla/cron", {
      method: "POST",
      headers: {
        "Authorization": `Bearer sanctuary_admin_a6d313036d937828f5beba51c7b4576ac51de23767e43e6b`
      }
    });

    if (res.ok) {
      console.log("K'LA Daily Missions executed successfully.");
    } else {
      console.error("K'LA Execution Failed:", await res.text());
    }
  }
};
