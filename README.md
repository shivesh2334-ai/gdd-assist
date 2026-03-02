# GDD-Assist: Clinical Decision Support for Global Developmental Delay

A comprehensive, AI-powered clinical decision support tool for healthcare professionals assessing and managing children with Global Developmental Delay (GDD). Built with Next.js and deployable to Vercel in minutes.

---

## Clinical Basis

Based on **North American consensus guidelines**:

- **Shevell M, Ashwal S, et al.** — "Practice Parameter: Evaluation of the Child with Global Developmental Delay." *Neurology.* 2003;60(3):367-380. (**AAN/CNS Consensus Guideline**)
- **Moeschler JB, Shevell M; AAP Committee on Genetics** — "Comprehensive Evaluation of the Child with Intellectual Disabilities or Global Developmental Delays." *Pediatrics.* 2014;134(3):e903-918.
- **Miller DT, et al.** — "Consensus Statement: Chromosomal Microarray is a First-Tier Clinical Diagnostic Test." *Am J Hum Genet.* 2010;86(5):749-764.

---

## Features

### 💬 AI Clinical Assistant
- Powered by Claude (Anthropic) with embedded GDD knowledge base
- Answers complex clinical questions about assessment and management
- Tailored to individual patient presentations
- Quick-prompt chips for common clinical scenarios

### 🔬 Investigation Framework
Four evidence-based investigation categories:
1. **Genetics** — CMA, Fragile X, WES/WGS, methylation studies
2. **Neuroimaging** — MRI brain, MR spectroscopy, DTI
3. **Electrophysiology** — EEG, ABR/BAER, VEP, NCS/EMG, ERG
4. **Biochemical/Metabolic** — Tiered metabolic workup, CSF analysis

- **Tier 1**: Recommended for ALL children with unexplained GDD
- **Tier 2**: Clinically directed, based on history/examination/Tier 1 results
- Treatable conditions highlighted
- Urgency levels (Urgent / Soon / Routine)

### 📈 Developmental Milestones
- Motor, Language, and Cognitive domains
- Typical ages and concern thresholds
- Assessment tool reference (Bayley-IV, ASQ-3, Vineland-3, MCHAT-R)

### 🚨 Red Flags Dashboard
- Clinical warning signs requiring urgent action
- Etiological breakdown (genetic, structural, metabolic, etc.)
- Comorbidity prevalence data
- Management essentials quick reference

---

## Deployment on Vercel

### Prerequisites
- Node.js 18+
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Vercel account ([free tier works](https://vercel.com))

### Option A: Deploy via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Clone/copy this project and install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Test locally
npm run dev
# Open http://localhost:3000

# 5. Deploy to Vercel
vercel
# Follow prompts; add ANTHROPIC_API_KEY as environment variable when asked
```

### Option B: Deploy via Vercel Dashboard

1. Push this project to a GitHub/GitLab repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = `your_api_key_here`
5. Click **Deploy**

### Setting the API Key as a Vercel Secret (CLI)

```bash
# Add secret
vercel env add ANTHROPIC_API_KEY production

# Or via Vercel dashboard:
# Project Settings → Environment Variables → Add Variable
```

---

## Local Development

```bash
# Install dependencies
npm install

# Add your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Project Structure

```
gdd-assistant/
├── pages/
│   ├── _app.js              # Next.js App wrapper
│   ├── index.js             # Main application UI
│   └── api/
│       └── chat.js          # Anthropic API endpoint (streaming)
├── lib/
│   └── knowledge-base.js    # GDD clinical knowledge base + system prompt
├── styles/
│   └── globals.css          # Global styles
├── public/                  # Static assets
├── vercel.json              # Vercel deployment config
├── next.config.js
├── package.json
├── tailwind.config.js
└── .env.example             # Environment variable template
```

---

## Knowledge Base Contents

The embedded knowledge base (`lib/knowledge-base.js`) includes:

- GDD definition, epidemiology, and etiological categories
- Complete clinical assessment framework (history, examination)
- Developmental milestone reference
- Red flags and urgency levels
- **Tier 1 investigations** (recommended for all GDD):
  - Chromosomal microarray (CMA) — first-line per AAN/CNS 2014
  - Fragile X DNA testing
  - MRI brain
  - EEG (if seizures/regression)
  - Auditory brainstem response
  - Lead level, thyroid function, plasma amino acids, urine organic acids
- **Tier 2 investigations** (clinically directed):
  - Trio WES / WGS
  - MR spectroscopy
  - CSF analysis (glucose, neurotransmitters, folate)
  - Lysosomal enzyme panels
  - Mitochondrial studies
  - Full metabolic panel
- **10 priority treatable conditions**
- Complete management framework
- Multidisciplinary team roles and referral guidance

---

## Disclaimer

> **For healthcare professionals only.** GDD-Assist is a clinical decision support tool. It does not replace clinical judgment, formal developmental assessment, or specialist consultation. Final clinical decisions rest with the treating clinician. This tool does not establish a physician-patient relationship.

---

## License

For clinical and educational use. Based on publicly available North American consensus guidelines.
