import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MENU_ITEMS } from "./src/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent helper for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Fallback heuristic for chef specials in case API is unavailable or has no key
function getLocalFallbackSpecials(weather: string, timeOfDay: string) {
  let specialIds: string[] = [];
  let theme = "";
  let explanation = "";

  if (weather === "lluvioso" || weather === "frio") {
    theme = "Abrazo Cálido Waslaleño 🌧️";
    if (timeOfDay === "manana") {
      theme = "Amargor Suave & Abrigo 🌅";
      explanation = "Con cielos grises en Waslala, nada como un Capuccino Sencillo caliente y Tostones con Queso recién sacados de la paila.";
      specialIds = ["capuccino-sencillo", "tostones-queso", "capuccino-doble", "dirty-chai-tea", "quesadillas-pollo"];
    } else if (timeOfDay === "tarde") {
      theme = "Cafetería y Tarde Lluviosa ☕";
      explanation = "Tarde nublada y lluviosa. Refúgiate con un reconfortante Café Mocaccino caliente y unas deliciosas Quesadillas de Pollo doradas.";
      specialIds = ["mocaccino", "quesadillas-pollo", "dirty-chai-tea", "capuccino-sencillo", "tostones-queso", "frappe-oreo"];
    } else {
      theme = "Noche de Lluvia y Sabor 🔥";
      explanation = "Para abrigar la noche fresca, te consentimos con el calor de un Rib Eye Premium y un cremoso Capuccino Doble.";
      specialIds = ["rib-eye", "capuccino-doble", "tostones-queso", "new-york", "dirty-chai-tea", "extra-papas"];
    }
  } else {
    // Soleado / Caluroso
    if (timeOfDay === "manana") {
      theme = "Mañana Radiante Waslala ☀️";
      explanation = "Para iniciar este día soleado con frescura y energía, degusta un refrescante Iced Latte Clásico y Hamburguesa de Res.";
      specialIds = ["iced-latte", "hamburguesa-res", "limonada-hierbabuena", "salchipapas", "tostones-queso"];
    } else if (timeOfDay === "tarde") {
      theme = "Delicias Frías para la Tarde 🍧";
      explanation = "¡El sol de Waslala está radiante! Date un gran gusto helado con el inigualable Frappuccino de Oreos de la Casa.";
      specialIds = ["frappe-oreo", "frappe-caramelo", "salchipapas", "limonada-frutos-rojos", "quesadillas-pollo"];
    } else {
      theme = "Sabor y Brisa Nocturna 🌙";
      explanation = "Disfruta de la noche con una refrescante Limonada de Frutos Rojos y nuestro exquisito New York Strip.";
      specialIds = ["limonada-frutos-rojos", "new-york", "extra-papas", "hamburguesa-res", "limonada-hierbabuena"];
    }
  }
  return { theme, explanation, specialIds };
}

// Simple in-memory caches to save API quota and speed up response times
const specialsCache = new Map<string, any>();
const recommendationsCache = new Map<string, any>();

// Class-level local heuristic recommendations in case Gemini is offline or rate-limited
function getLocalRecommendations(cartItems: any[]): { recommendations: string[], reason: string } {
  const currentIds = new Set(cartItems.map((it: any) => it.id));
  
  // Classify items in cart
  const hasFood = cartItems.some((it: any) => it.category === "comidas");
  const hasDrink = cartItems.some((it: any) => it.category === "bebidas");

  let recs: string[] = [];
  let reason = "";

  if (hasFood && !hasDrink) {
    // Recommend matching beverages
    recs = ["limonada-hierbabuena", "iced-latte", "capuccino-sencillo", "americano", "batido-fresa"];
    reason = "Para acompañar tus platillos, nada como un elíxir fresco o un café de altura.";
  } else if (hasDrink && !hasFood) {
    // Recommend matching foods
    recs = ["tostones-queso", "quesadillas-pollo", "salchipapas", "hamburguesa-res"];
    reason = "El maridaje ideal para consentir tu paladar con sabor waslaleño.";
  } else {
    // Has both, recommend sweet treat or extra
    recs = ["frappe-oreo", "extra-papas", "frappe-caramelo", "salchipapas"];
    reason = "El broche de oro dulce o extra crujiente para tu pedido perfecto.";
  }

  // Filter out items already in the cart and limit to 2 suggestions
  const filteredRecs = recs.filter(id => !currentIds.has(id)).slice(0, 2);

  // If we ended up with nothing (unlikely), grab some static ones
  if (filteredRecs.length === 0) {
    const backupList = ["tostones-queso", "limonada-hierbabuena", "capuccino-sencillo"];
    const backup = backupList.filter(id => !currentIds.has(id)).slice(0, 2);
    return {
      recommendations: backup,
      reason: "Las mejores recomendaciones de la casa elegidas para ti hoy."
    };
  }

  return {
    recommendations: filteredRecs,
    reason
  };
}

// API route first, before Vite middleware
app.post("/api/ai-specials", async (req, res) => {
  const { weather, timeOfDay } = req.body;
  const currentWeather = weather || "soleado";
  const currentTimeOfDay = timeOfDay || "manana";
  const cacheKey = `${currentWeather}_${currentTimeOfDay}`;

  // Serve from memory cache if available to resolve instantly and save quota
  if (specialsCache.has(cacheKey)) {
    return res.json(specialsCache.get(cacheKey));
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to default chef specials.");
      const fallback = getLocalFallbackSpecials(currentWeather, currentTimeOfDay);
      return res.json({ ...fallback, isFallback: true });
    }

    // Format menu items with absolute minimal keys to save tokens
    const menuSummary = MENU_ITEMS.map(it => 
      `{id:"${it.id}",name:"${it.name}",price:C$${it.price},category:"${it.category}",sub:"${it.subcategory}",desc:"${it.description}"}`
    ).join("\n");

    const systemPrompt = `Eres el Maestro Chef del prestigioso restaurante "Amor y Café" en Waslala, Nicaragua.
Nuestra especialidad es preparar recomendaciones especiales artesanales y de repostería/cortes sugeridas a los clientes según el clima del día y la hora.

Clima de hoy en Waslala: ${currentWeather}
Momento del día: ${currentTimeOfDay}

Lista de productos de la carta disponibles:
${menuSummary}

Instrucciones exactas:
1. Selecciona entre 5 y 6 productos de la lista anterior que armen nuestras mejores sugerencias para el día.
   - Si el clima es 'lluvioso' o 'frio' en Waslala, selecciona bebidas calientes reconfortantes (capuccino, mocaccino, dirty chai) y platos calientes ricos enteros o snacks (tostones con queso, quesadillas, carne).
   - Si el clima es 'soleado' o agradable, selecciona bebidas frías y frappés deliciosos con platillos atractivos y snacks de paila.
   - Si es temprano 'manana', sugiere un café caliente/helado y desayuno o antojitos de mañana.
   - Si es tarde 'tarde', prioriza frappés, repostería, capuccino y snacks de media tarde.
   - Si es noche 'noche', prefiere platos fuertes de filete o pollo, cortes premium y bebidas de noche.
2. Crea una temática alegre y entrañable que hable de amor y café de máximo 5 palabras (campo: "theme") en español, combinando el ambiente y el norte nicaragüense.
3. Escribe un mensaje súper acogedor de máximo 22 palabras (campo: "explanation") en español explicando por qué estas sugerencias son ideales para disfrutar hoy.

Regresa estrictamente un objeto JSON con las siguientes propiedades:
{
  "theme": "string",
  "explanation": "string",
  "specialIds": ["string", "string", "string", "string", "string"]
}`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 12000)
    );

    const apiPromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            explanation: { type: Type.STRING },
            specialIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["theme", "explanation", "specialIds"],
        }
      }
    });

    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    const resultText = response?.text || "{}";
    const data = JSON.parse(resultText);

    let selectedIds = data.specialIds || [];
    // Ensure all returned ids actually exist
    selectedIds = selectedIds.filter((id: string) => MENU_ITEMS.some(it => it.id === id));

    if (selectedIds.length === 0) {
      throw new Error("No valid IDs selected.");
    }

    const payload = {
      theme: data.theme || "Selección de la Casa",
      explanation: data.explanation || "Hecho con amor y frescura para consentir tu paladar hoy.",
      specialIds: selectedIds.slice(0, 6),
      isFallback: false
    };

    // Cache the successful result
    specialsCache.set(cacheKey, payload);

    res.json(payload);

  } catch (error) {
    // Sanitized logging to prevent raw error signature leaks in standard console streams
    console.log("[Specials] Status: Served via warm local specials fallback.");
    const fallback = getLocalFallbackSpecials(currentWeather, currentTimeOfDay);
    res.json({
      ...fallback,
      isFallback: true
    });
  }
});

// API route first, before Vite middleware
app.post("/api/recommendations", async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.json({ recommendations: [], reason: "" });
  }

  // Create a sorting key based on active items in cart to hit cache
  const itemIdsKey = cartItems.map((it: any) => it.id).sort().join(",");
  if (recommendationsCache.has(itemIdsKey)) {
    return res.json(recommendationsCache.get(itemIdsKey));
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Using local chef recommendations.");
      const localRec = getLocalRecommendations(cartItems);
      return res.json({
        recommendations: localRec.recommendations,
        reason: localRec.reason,
        isFallback: true
      });
    }

    // Format current cart for the model
    const cartSummary = cartItems.map((item: any) => 
      `- ${item.id} (${item.category === "comidas" ? "Comida" : "Bebida"})`
    ).join("\n");

    // Format menu items with absolute minimal keys to save tokens and speed up inference
    const menuSummary = MENU_ITEMS.map(it => 
      `{id:"${it.id}",name:"${it.name}",category:"${it.category}",sub:"${it.subcategory}"}`
    ).join("\n");

    const systemPrompt = `Eres el sumiller experto de "Amor y Café" en Waslala. Sugiere la combinación o maridaje perfecto para el carrito actual.

Menú:
${menuSummary}

Carrito del cliente:
${cartSummary}

Reglas:
1. Si llevan solo comida, sugiere 1 o 2 bebidas idóneas.
2. Si llevan solo bebidas, sugiere 1 o 2 snacks/comidas de antojo (tostones, quesadillas, etc.).
3. Si llevan ambos, sugiere un postre (frappé oreo) o acompañamiento (papas/tostones).
4. No recomiendes artículos que ya estén en su carrito.
5. El texto 'reason' DEBE ser extremadamente conciso (máximo 1 frase de hasta 10 palabras), con mucha calidez waslaleña.`;

    // Create a timeout promise to reject if Gemini is too slow (e.g. under high load)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 12000)
    );

    const apiPromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "IDs de productos sugeridos de la lista."
            },
            reason: {
              type: Type.STRING,
              description: "Una oracion muy calida de maximo 10 palabras para tentar al usuario."
            }
          },
          required: ["recommendations", "reason"],
        }
      }
    });

    const response = await Promise.race([apiPromise, timeoutPromise]) as any;

    const resultText = response?.text || "{}";
    const data = JSON.parse(resultText);

    const resultJson = {
      recommendations: data.recommendations || [],
      reason: data.reason || "El toque ideal para completar tu pedido en Amor y Café.",
      isFallback: false
    };

    // Store in memory cache to avoid exhausting key daily limits
    if (recommendationsCache.size > 400) {
      recommendationsCache.clear();
    }
    recommendationsCache.set(itemIdsKey, resultJson);

    res.json(resultJson);

  } catch (error) {
    // Sanitized logging to prevent raw error signature leaks in standard console streams
    console.log("[Recommendations] Status: Served via local heuristic maridaje suggestions.");
    const localRec = getLocalRecommendations(cartItems);
    res.json({
      recommendations: localRec.recommendations,
      reason: localRec.reason,
      isFallback: true
    });
  }
});

// Setup Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
