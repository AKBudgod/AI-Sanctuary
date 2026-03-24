async function fetchModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    const data = await res.json();
    const matches = data.data.filter(m => m.id.toLowerCase().includes("black-forest") || m.id.toLowerCase().includes("dall"));
    console.log("Models found:");
    matches.forEach(m => console.log(`- ${m.id}: ${m.name}`));
  } catch (err) {
    console.error(err);
  }
}
fetchModels();
