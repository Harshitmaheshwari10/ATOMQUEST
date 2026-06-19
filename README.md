# Vaidya — Plagiarism Detector for Ayurvedic Research

> Semantic analysis built specifically for Ayurvedic research content. Understands transliteration variants, classical text references, and domain-specific paraphrasing patterns — not just string matching.

**Live Demo:** https://ayurveda-detector.vercel.app

---

## What It Does

Mainstream plagiarism tools fail on Ayurvedic research for three reasons:

1. They can't distinguish between copying a 2019 journal article and citing a 3000-year-old classical text
2. They miss paraphrased content where "ashwagandha" becomes "Withania somnifera"
3. They don't understand that restating classical knowledge is tradition, not plagiarism

Vaidya is built to handle all three.

### Features
- **Text input** — paste any research article or abstract
- **URL input** — enter a public journal URL and the server fetches the content
- **Risk scoring** — Overall risk (High / Medium / Low) with a 0–100 score
- **Flagged findings** — every finding includes confidence level, flagged excerpt, plain-English reason, possible source, and recommended action
- **Classical text detection** — Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam references flagged separately, not treated as plagiarism
- **Transliteration awareness** — recognizes ashwagandha, ashvagandha, and Withania somnifera as the same term

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Vercel Serverless Functions |
| Detection | Rule-based pattern matching engine |
| Hosting | Vercel (free tier) |
| Styling | Vanilla CSS with custom design tokens |

### Why rule-based detection?
LLM APIs introduce rate limits, billing, and availability issues. A curated rule-based engine gives deterministic, instant, always-available results — critical for a tool researchers need to trust. LLM-based semantic similarity is planned for v2.

---

## Project Structure

```
ayurveda-detector/
├── api/
│   └── analyze.js        # Serverless function — detection engine
├── src/
│   ├── App.jsx           # Main React component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/ayurveda-detector.git
cd ayurveda-detector
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ayurveda-detector.git
git push -u origin main

# 2. Go to vercel.com → New Project → Import repo
# 3. Vercel auto-detects Vite — click Deploy
# 4. Done — live in ~1 minute. No env variables needed.
```

---

## Test Inputs

### Sample paragraphs

**Ashwagandha (high findings expected):**
```
Ashwagandha (Withania somnifera) is a well-known adaptogenic herb used in Ayurvedic medicine
for centuries. According to Charaka Samhita, Ashwagandha is classified under Balya (strength
promoting) and Brimhaniya (nourishing) groups of herbs. Daily supplementation of 300mg of root
extract over 60 days attenuated cortisol levels in stressed adults by approximately 27.9%
compared to placebo.
```

**Triphala (classical refs + paraphrasing):**
```
Triphala consisting of Terminalia chebula, Terminalia bellirica and Emblica officinalis
demonstrates antioxidant properties through free radical scavenging activity. It is a rasayana
formulation with tridosha balancing properties affecting vata dosha, pitta dosha and kapha dosha.
```

**Brahmi (medium confidence findings):**
```
Brahmi (Bacopa monnieri) is a medhya rasayana herb described in classical Ayurvedic texts.
It contains bacosides which enhance neural transmission. Studies show significant improvement
in word recall after 12 weeks of supplementation with standardized extract.
```

### Sample URLs
```
https://pmc.ncbi.nlm.nih.gov/articles/PMC5567597/
https://pmc.ncbi.nlm.nih.gov/articles/PMC3252722/
https://pmc.ncbi.nlm.nih.gov/articles/PMC8211421/
```

---

## Detection Engine

The engine checks for 25+ patterns across four categories:

| Type | Confidence | Meaning |
|---|---|---|
| Likely copied | High | Phrase closely matches published research verbatim |
| Paraphrased without citation | Medium | Phrasing appears in multiple papers without attribution |
| Classical reference — verify citation | Low (blue) | Classical text referenced — ensure it is cited |
| Common knowledge | Low | Standard terminology, no action needed |

---

## What It Doesn't Do

- Does not replace Turnitin or iThenticate
- Does not handle paywalled content
- Does not detect AI-generated text
- Does not compare Sanskrit-to-Sanskrit
- Does not store submitted content

---

*Vaidya (वैद्य) — Sanskrit for physician, one who possesses knowledge.*
