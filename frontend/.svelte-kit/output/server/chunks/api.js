const API_BASE_URL = "https://dm-events-backend-858373640437.us-central1.run.app/api";
console.log("🔧 Entorno:", "production");
console.log("🌐 API URL:", API_BASE_URL);
const open5eApi = {
  searchMonsters: async (query) => {
    const searchQuery = query.trim().toLowerCase();
    const response = await fetch(
      `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(searchQuery)}&limit=50`
    );
    if (!response.ok) throw new Error("Error buscando criaturas");
    const data = await response.json();
    if (data.results) {
      data.results = data.results.filter((m) => {
        const name = m.name.toLowerCase();
        const type = m.type?.toLowerCase() || "";
        return name.includes(searchQuery) || type.includes(searchQuery);
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(searchQuery);
        const bStarts = bName.startsWith(searchQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.length - bName.length;
      }).slice(0, 20);
    }
    return data;
  },
  getMonster: async (slug) => {
    const response = await fetch(`https://api.open5e.com/v1/monsters/${slug}/`);
    if (!response.ok) throw new Error("Error obteniendo criatura");
    return response.json();
  },
  monsterToCombatant: (monster, initiative) => ({
    type: "creature",
    name: monster.name,
    initiative,
    maxHp: monster.hit_points,
    currentHp: monster.hit_points,
    armorClass: monster.armor_class,
    isNpc: true,
    creatureSource: "open5e"
  }),
  searchConditions: async (query) => {
    const response = await fetch(
      `https://api.open5e.com/v1/conditions/?search=${encodeURIComponent(query)}&limit=5`
    );
    if (!response.ok) throw new Error("Error buscando condiciones");
    return response.json();
  },
  getCondition: async (slug) => {
    const response = await fetch(`https://api.open5e.com/v1/conditions/${slug}/`);
    if (!response.ok) throw new Error("Error obteniendo condición");
    return response.json();
  },
  cleanDescription: (html, maxLength = 150) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    let text = temp.textContent || temp.innerText || "";
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }
    return text;
  }
};
export {
  open5eApi as o
};
