import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS & Preflight middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerKey: !!process.env.GEMINI_API_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY
    });
  });

  // Groq Cloud AI Proxy API
  app.all(["/api/groq/generate", "/api/groq/generate/"], async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    if (req.method !== "POST") {
      return res.status(200).json({ status: "ready", service: "pure-scan-groq-proxy" });
    }

    try {
      const { contents, config, customApiKey, model } = req.body || {};
      const apiKey = customApiKey?.trim() || process.env.GROQ_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "No Groq Cloud API key found. Please enter your free Groq API key from https://console.groq.com/keys in Settings."
        });
      }

      // Convert contents to OpenAI/Groq message format
      const messages: any[] = [];
      let hasImage = false;

      if (typeof contents === "string") {
        messages.push({ role: "user", content: contents });
      } else if (Array.isArray(contents)) {
        for (const item of contents) {
          if (typeof item === "string") {
            messages.push({ role: "user", content: item });
            continue;
          }
          const role = item.role === "model" ? "assistant" : "user";
          const parts = item.parts || [];
          const hasInlineData = parts.some((p: any) => !!p.inlineData);

          if (hasInlineData) {
            hasImage = true;
            const contentParts: any[] = [];
            for (const p of parts) {
              if (p.inlineData) {
                const mimeType = p.inlineData.mimeType || "image/jpeg";
                const rawData = p.inlineData.data || "";
                const dataUrl = rawData.startsWith("data:") ? rawData : `data:${mimeType};base64,${rawData}`;
                contentParts.push({
                  type: "image_url",
                  image_url: { url: dataUrl }
                });
              } else if (p.text) {
                contentParts.push({
                  type: "text",
                  text: p.text
                });
              }
            }
            messages.push({ role, content: contentParts });
          } else {
            const fullText = parts.map((p: any) => p.text || "").join("\n");
            messages.push({ role, content: fullText });
          }
        }
      }

      // System prompt injection for Groq to guarantee clinical intelligence, accuracy, and scoring parity with Gemini
      let groqSystemPrompt = `You are PureScan AI — an expert clinical biochemist, food scientist, regulatory toxicologist, and commercial marketing auditor powered by Groq LPU high-speed AI with deep forensic OCR and demographic intelligence capabilities.

CRITICAL FORENSIC OCR INSTRUCTIONS FOR BLURRY, GRAINY, REFLECTIVE & LOW-QUALITY PACKAGING:
1. You are equipped to analyze and reconstruct text from blurry, motion-blurred, out-of-focus, low-resolution, glare-affected, curved, or shadowed food packaging photos.
2. Even if characters are faint, soft-edged, pixelated, or partially obscured:
   - Carefully trace character strokes, typography layout, and context clues.
   - Reconstruct partial or truncated chemical and ingredient names using biochemical knowledge (e.g. "so... lec..." -> "Soy Lecithin", "potas... sorb..." -> "Potassium Sorbate", "high fruc... corn syr..." -> "High Fructose Corn Syrup", "monos... glut..." -> "Monosodium Glutamate", "red ... 40" -> "Allura Red AC (Red 40)").
   - Reconstruct Nutrition Facts numbers from column positions, line order, standard serving ratios, and units ('g', 'mg', '% DV', 'kcal').
   - NEVER return empty results or "Cannot read label" for blurry images. Always extract maximum verifiable data and provide full clinical scoring.

ADVANCED CLINICAL & DEMOGRAPHIC TARGETING INTELLIGENCE:
When evaluating the product, you MUST execute an in-depth 4-pillar analysis:

1. TARGET DEMOGRAPHIC FORENSICS & PREDATORY MARKETING DETECTION:
   - Identify precisely WHO the product is formulated and marketed to:
     * "Children & Toddlers (Ages 2-10)" (e.g., confectionery, breakfast cereals, fruit snacks, juice drinks, chocolate spreads, snack puffs)
     * "Teens & Adolescents / Gamers" (e.g., high-caffeine energy drinks, extreme spicy chips, instant noodles, sodas)
     * "Fitness & Gym Athletes" (e.g., protein bars, pre-workouts, whey supplements, electrolyte drinks, protein cookies)
     * "Diabetics / Keto / Low-Carb Seekers" (e.g., "zero sugar" snacks, sugar-free syrups, keto bars)
     * "Weight-Loss & Slimming Dieters" (e.g., "fat-free" yogurts, meal replacement shakes, diet bars)
     * "Busy Working Adults / Students" (e.g., ready meals, canned foods, instant ramen, energy shots)
     * "Seniors & Geriatric Health" (e.g., bone-density supplements, high-calcium drinks, nutritional shakes)
     * "General Consumer & Family" (e.g., cooking oils, flour, table salt, whole dairy)
   - Expose Predatory Marketing & Deceptive Health Halos:
     * Check if the packaging uses child-enticing imagery, cartoon mascots, bright saturated colors, toy tie-ins, or "school lunchbox" claims to push hyper-palatable sugar or synthetic dyes on developing brains.
     * Check if "Fitness" or "High Protein" products conceal hydrogenated seed oils, 15-20g sugar alcohols (maltitol causing GI distress), or cheap soy fillers.
     * Check if "Zero Sugar" or "Keto" products secretly use Maltodextrin (Glycemic Index 110, far higher than table sugar) or high-dose artificial sweeteners (sucralose/aspartame) that disrupt gut microbiota and insulin sensitivity.
     * Check if "Natural" or "Fruit" products use <2% real fruit powder with 40% added cane sugar, artificial flavors, and Red 40 / Yellow 5 petroleum dyes.

2. TARGET-CALIBRATED NUTRITIONAL SCORING ALGORITHM (Start at Base Score = 100):
   - DEMOGRAPHIC VULNERABILITY & PREDATORY TARGETING PENALTY:
     * If product targets CHILDREN or TODDLERS while containing synthetic dyes (Red 40, Yellow 5/6, Blue 1), high fructose corn syrup, titanium dioxide, or >12g added sugars: Deduct an ADDITIONAL 15-20 points (pediatric neurological & metabolic sensitivity penalty).
     * If product targets DIABETICS or KETO seekers while containing hidden high-glycemic starches (maltodextrin, dextrose, glucose syrup): Deduct an ADDITIONAL 15-20 points (predatory deceptive formulation penalty).
     * If product targets FITNESS/HEALTH consumers with deceptive claims while containing trans fats, hydrogenated oils, or excessive artificial sweeteners: Deduct 10-15 points.
   - ULTRA-PROCESSING PENALTY (NOVA Classification):
     * NOVA 4 (Ultra-Processed Food formulation containing cosmetic industrial additives like emulsifiers, thickeners, synthetic colors, flavor enhancers): Deduct 10-15 points.
     * NOVA 3 (Processed Food): Deduct 5 points.
     * NOVA 1 & 2 (Unprocessed / Minimally Processed or Culinary Ingredient): Award +5 bonus points (max 100).
   - INGREDIENT & ADDITIVE TOXICOLOGY DEDUCTIONS:
     * High Risk Additive / Severe Concern (Trans/Hydrogenated Fats, High Fructose Corn Syrup, Red 40, Yellow 5, Titanium Dioxide, BHA/BHT, Sodium Nitrite, Potassium Bromate): Deduct 20-25 points each.
     * Medium Risk Additive / High Sugar or Sodium (Artificial Sweeteners, Maltodextrin, Carrageenan, Palm Oil, Sodium Benzoate, Potassium Sorbate, Added Sugars >15g, Sodium >500mg): Deduct 10-15 points each.
     * Low Risk Additive / Processing Concern (Natural Flavors, Citric Acid, Sunflower Oil, Xanthan/Guar Gum, Soy Lecithin, Added Sugars 5-10g): Deduct 3-5 points each.
   - CRITICAL ALLERGEN VIOLATION / BANNED CARCINOGEN: Set Score = 0, Grade = 'F'.

3. CALCULATE GRADE FROM FINAL CALIBRATED SCORE:
   - Score 85 to 100 => Grade 'A' (Pristine / Wholesome)
   - Score 70 to 84 => Grade 'B' (Favorable Profile)
   - Score 50 to 69 => Grade 'C' (Moderate Caution)
   - Score 30 to 49 => Grade 'D' (High Chemical / Additive Load)
   - Score 0 to 29 => Grade 'F' (Critical Hazard / Deceptive UPF)

4. Output strictly valid JSON matching the exact schema requested, without markdown backticks or extra text outside JSON.`;

      if (config?.responseSchema) {
        groqSystemPrompt += `\n\nREQUIRED JSON OUTPUT SCHEMA:
{
  "productName": "Name of product or generic category",
  "grade": "A" | "B" | "C" | "D" | "F",
  "score": number between 0 and 100,
  "confidenceScore": number between 0 and 100,
  "targetAudience": "Identified demographic (e.g. Children & Toddlers | Teens & Adolescents | Fitness & Gym Athletes | Diabetics / Keto | Weight-Loss Dieters | Busy Adults | General Consumer)",
  "targetMarketingAnalysis": "Forensic audit of marketing deception, false health halos, and demographic exploitation",
  "demographicRiskAlert": "Clinical and physiological consequence specifically for the targeted demographic",
  "novaGroup": 1 | 2 | 3 | 4,
  "processingLevel": "Unprocessed / Whole Food" | "Processed Culinary" | "Processed" | "Ultra-Processed (NOVA 4)",
  "glycemicImpact": "Low (Steady Energy)" | "Moderate" | "High (Rapid Spike)" | "Extreme (Volatile Glucose Surge)",
  "endocrineOrMetabolicAlerts": [
    "Specific metabolic or endocrine risk (e.g. Pediatric Neuro-Behavioral Agitation, Gut Barrier Permeability Disruption, Acute Insulin Surges, Hepatic Steatosis Predisposition)"
  ],
  "demographicSafety": {
    "children": "safe" | "caution" | "avoid",
    "diabetics": "safe" | "caution" | "avoid",
    "fitness": "safe" | "caution" | "avoid",
    "general": "safe" | "caution" | "avoid"
  },
  "scoreExplanation": "Concise scientific breakdown explaining how the score was calculated including target demographic vulnerability penalties",
  "riskyIngredients": [
    {
      "name": "Name of additive/ingredient",
      "risk": "low" | "medium" | "high",
      "description": "Detailed biochemical description of what this ingredient is",
      "implications": "Clinical health impact, metabolic consequences, or allergy concerns"
    }
  ],
  "alternative": {
    "name": "Healthier alternative product name",
    "reason": "Clear nutritional reason to swap to this alternative"
  }
}
You MUST output ONLY a valid JSON object matching these exact keys.`;
      }

      if (!messages.some((m: any) => m.role === "system")) {
        messages.unshift({ role: "system", content: groqSystemPrompt });
      }

      const isJsonRequested = config?.responseMimeType === "application/json";
      if (isJsonRequested && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (typeof lastMsg.content === "string") {
          if (!lastMsg.content.toLowerCase().includes("json")) {
            lastMsg.content += "\nRespond strictly in valid JSON format matching the required keys.";
          }
        } else if (Array.isArray(lastMsg.content)) {
          const textPart = lastMsg.content.find((p: any) => p.type === "text");
          if (textPart && !textPart.text.toLowerCase().includes("json")) {
            textPart.text += "\nRespond strictly in valid JSON format matching the required keys.";
          }
        }
      }

      // Filter out permanently decommissioned models
      const isDecommissioned = (m?: string) =>
        !m ||
        m.includes("mixtral") ||
        m.includes("decommissioned") ||
        m.includes("gemma");

      // Build candidate list with multi-model redundancy for rate-limit immunity
      const visionModels = [
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-90b-vision-preview",
        "qwen/qwen3.8-27b",
        "qwen/qwen3.6-27b",
        "openai/gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant"
      ];

      const textModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-120b",
        "qwen/qwen3.6-27b",
        "openai/gpt-oss-20b"
      ];

      let candidateModels: string[] = [];
      if (model && !isDecommissioned(model)) {
        candidateModels.push(model);
      }

      if (hasImage) {
        candidateModels.push(...visionModels, ...textModels);
      } else {
        candidateModels.push(...textModels);
      }

      // Deduplicate and filter out decommissioned models
      candidateModels = Array.from(new Set(candidateModels)).filter(m => !isDecommissioned(m));

      let lastError: any = null;
      for (const m of candidateModels) {
        try {
          // Check if this model supports image input; if not, strip image parts
          const isVisionCapable = m.includes("scout") || m.includes("qwen") || m.includes("vision") || m.includes("llava");
          let payloadMessages = messages;

          if (hasImage && !isVisionCapable) {
            payloadMessages = messages.map((msg: any) => {
              if (Array.isArray(msg.content)) {
                const textOnlyParts = msg.content
                  .filter((p: any) => p.type === "text" || !p.type)
                  .map((p: any) => typeof p === "string" ? p : p.text || "")
                  .join("\n");
                return { role: msg.role, content: textOnlyParts || "Analyze ingredient text" };
              }
              return msg;
            });
          }

          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: m,
              messages: payloadMessages,
              temperature: 0.1,
              max_tokens: 4096,
              ...(isJsonRequested ? { response_format: { type: "json_object" } } : {})
            })
          });

          if (!groqRes.ok) {
            const errData: any = await groqRes.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `Groq API returned HTTP ${groqRes.status}`;

            if (groqRes.status === 401 || groqRes.status === 403 || errMsg.includes("Invalid API Key")) {
              return res.status(401).json({
                error: "Your Groq Cloud API key is invalid or unauthorized. Please verify your free API key at https://console.groq.com/keys and update it in Settings."
              });
            }

            if (groqRes.status === 429) {
              console.warn(`[Groq Rate Limit] Model ${m} rate-limited (429). Rotating to alternative Groq model...`);
              await new Promise((r) => setTimeout(r, 400));
              lastError = new Error(errMsg);
              continue;
            }

            lastError = new Error(errMsg);
            console.warn(`[Groq Server] Model ${m} returned ${groqRes.status}: ${errMsg}`);
            continue;
          }

          const data: any = await groqRes.json();
          const text = data.choices?.[0]?.message?.content || "";
          return res.json({
            text,
            usageMetadata: {
              promptTokenCount: data.usage?.prompt_tokens || 0,
              candidatesTokenCount: data.usage?.completion_tokens || 0,
              totalTokenCount: data.usage?.total_tokens || 0
            },
            modelUsed: data.model || m
          });
        } catch (err: any) {
          lastError = err;
          console.warn(`[Groq Server] Exception with model ${m}:`, err?.message);
        }
      }

      return res.status(500).json({
        error: lastError?.message || "Failed to communicate with Groq Cloud AI. Please check your API key and connection."
      });
    } catch (err: any) {
      console.error("Groq API server exception:", err);
      return res.status(500).json({ error: err?.message || "Internal server error calling Groq Cloud API" });
    }
  });

  // Gemini Proxy API
  app.all(["/api/gemini/generate", "/api/gemini/generate/"], async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    if (req.method !== "POST") {
      return res.status(200).json({ status: "ready", service: "pure-scan-gemini-proxy" });
    }

    try {
      const { contents, config, customApiKey, model } = req.body || {};
      const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "No Gemini API key available. Please add a valid API key in Settings."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      // Prioritize ultra-fast & reliable models for sub-second real-time responsiveness
      const preferredModel = (model && model.startsWith("gemini") && !model.includes("2.5") && !model.includes("2.0")) 
        ? model 
        : "gemini-3.5-flash-lite";

      const candidateModels = [
        preferredModel === "gemini-3.8-flash" ? "gemini-3.5-flash-lite" : preferredModel,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-flash-latest"
      ];
      const uniqueModels = Array.from(new Set(candidateModels));

      let lastError: any = null;
      for (const m of uniqueModels) {
        try {
          // Optimize model config for minimal latency & maximum speed without losing clinical intelligence
          const callConfig: any = { ...config };
          const supportsThinkingLevel = m.startsWith("gemini-3") || m.startsWith("gemini-4");

          if (supportsThinkingLevel) {
            // Default to ThinkingLevel.MEDIUM (balanced middle-to-high clinical reasoning) unless explicitly specified
            if (!callConfig.thinkingConfig) {
              callConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
            }
          } else {
            delete callConfig.thinkingConfig;
          }

          // Dynamically scale timeout to allow thorough reasoning for MEDIUM and HIGH thinking levels
          const requestedThinking = callConfig.thinkingConfig?.thinkingLevel;
          const isDeepThinking = requestedThinking === ThinkingLevel.HIGH || requestedThinking === ThinkingLevel.MEDIUM || requestedThinking === 'HIGH' || requestedThinking === 'MEDIUM';
          const timeoutMs = isDeepThinking ? 11000 : 4500;

          const modelPromise = ai.models.generateContent({
            model: m,
            contents,
            config: callConfig
          });

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Timeout after ${timeoutMs}ms waiting for ${m}`));
            }, timeoutMs);
          });

          const response = await Promise.race([modelPromise, timeoutPromise]);

          return res.json({
            text: response.text || "",
            usageMetadata: response.usageMetadata || null,
            modelUsed: m
          });
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Proxy] Model ${m} attempt failed:`, err?.message);
          
          let parsedErrMsg = err?.message || "";
          try {
            const parsed = JSON.parse(parsedErrMsg);
            if (parsed?.error?.message) {
              parsedErrMsg = parsed.error.message;
            }
          } catch {
            // Not JSON formatted string
          }

          // If it's permission denied, invalid key, or leaked key, trying other models won't help
          if (
            err?.status === 400 ||
            err?.status === 401 ||
            err?.status === 403 ||
            parsedErrMsg.includes("API key not valid") ||
            parsedErrMsg.includes("PERMISSION_DENIED") ||
            parsedErrMsg.includes("permission denied") ||
            parsedErrMsg.includes("insufficient authentication scopes") ||
            parsedErrMsg.includes("API_KEY_INVALID") ||
            parsedErrMsg.includes("leaked")
          ) {
            break;
          }
        }
      }

      let errorMsg = lastError?.message || "Failed to call the Gemini API.";
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch {
        // Keep errorMsg
      }

      if (
        errorMsg.includes("API key was reported as leaked") ||
        errorMsg.includes("API key not valid") ||
        errorMsg.includes("API_KEY_INVALID") ||
        errorMsg.includes("PERMISSION_DENIED") ||
        errorMsg.includes("permission denied")
      ) {
        errorMsg = "Your Gemini API key is invalid or unauthorized. Please verify your free Gemini API key and update it in Settings.";
      } else if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota")) {
        errorMsg = "Gemini API rate limit reached (free tier allows 15 RPM). Please wait 30 seconds and try again, or check your quota.";
      }

      let statusCode = 500;
      if (
        lastError?.status &&
        typeof lastError.status === "number" &&
        lastError.status >= 400 &&
        lastError.status < 600
      ) {
        statusCode = lastError.status === 405 ? 502 : lastError.status;
      }

      return res.status(statusCode).json({ error: errorMsg });
    } catch (err: any) {
      console.error("Gemini API server exception:", err);
      return res.status(500).json({ error: err?.message || "Internal server error calling Gemini API" });
    }
  });

  // Catch-all for unknown /api/* requests so they NEVER fall through to Vite (preventing Vite 405 HTML responses)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
