import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import { INVESTIGATION_CATEGORIES, MILESTONE_REFERENCE } from "../lib/knowledge-base";

// --- Simple markdown renderer ----
function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^[-•] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

// ---- Urgency badge ----
function UrgencyBadge({ urgency }) {
  const u = urgency?.toLowerCase() || "";
  const styles = u.includes("urgent")
    ? "bg-red-50 text-red-700 border border-red-200"
    : u.includes("soon")
    ? "bg-orange-50 text-orange-700 border border-orange-200"
    : "bg-gray-50 text-gray-600 border border-gray-200";
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${styles}`}>
      {urgency}
    </span>
  );
}

// ---- Investigation Card ----
function InvestigationCard({ item, category }) {
  const [open, setOpen] = useState(false);
  const cat = INVESTIGATION_CATEGORIES[category];
  const badgeClass = `badge-${category === "neuroimaging" ? "neuro" : category === "electrophysiology" ? "electro" : category === "biochemical" ? "biochem" : "genetics"}`;
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
      onClick={() => setOpen(!open)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                {cat.icon} {cat.label}
              </span>
              {item.treatable && (
                <span className="treatable-badge text-xs px-2 py-0.5 rounded-full">
                  ✓ Treatable
                </span>
              )}
              {item.urgency && <UrgencyBadge urgency={item.urgency} />}
            </div>
            <h4 className="font-semibold text-sm text-gray-900 leading-snug">{item.name}</h4>
          </div>
          <span className="text-gray-400 text-sm mt-1 flex-shrink-0">{open ? "▲" : "▼"}</span>
        </div>
        {item.yield && (
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium text-gray-700">Yield:</span> {item.yield}
          </p>
        )}
      </div>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50 fade-in-up">
          <p className="text-xs text-gray-700 mb-2">
            <span className="font-semibold">Indication:</span> {item.indication}
          </p>
          {item.notes && (
            <p className="text-xs text-gray-600 italic">{item.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Chat Message ----
function ChatMessage({ role, content, isStreaming }) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4 fade-in-up">
        <div
          style={{ background: "var(--primary)", maxWidth: "75%" }}
          className="text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-sm"
        >
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 mb-4 fade-in-up">
      <div
        style={{ background: "var(--accent)", minWidth: 32, height: 32 }}
        className="rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 mt-0.5"
      >
        G
      </div>
      <div
        style={{ background: "white", maxWidth: "85%", border: "1px solid var(--border)" }}
        className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm"
      >
        {isStreaming && !content ? (
          <div className="flex gap-1.5 items-center py-1">
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </div>
        ) : (
          <div
            className="prose-chat"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}

// ---- Milestone Table ----
function MilestoneSection() {
  const [activeTab, setActiveTab] = useState("motor");
  const tabs = [
    { key: "motor", label: "🏃 Motor" },
    { key: "language", label: "💬 Language" },
    { key: "cognitive", label: "🧠 Cognitive" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Milestone</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Typical Age</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Concern if Beyond</th>
            </tr>
          </thead>
          <tbody>
            {MILESTONE_REFERENCE[activeTab].map((m, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-4 py-2.5 font-medium text-gray-800">{m.milestone}</td>
                <td className="px-4 py-2.5 text-green-700">{m.typical}</td>
                <td className="px-4 py-2.5 text-red-600 font-medium">{m.concern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Red Flags Panel ----
function RedFlagsPanel() {
  const flags = [
    {
      icon: "⚠️",
      title: "Developmental Regression",
      desc: "Any loss of previously acquired skills – URGENT metabolic/neurodegenerative workup",
      urgent: true,
    },
    {
      icon: "⚡",
      title: "Infantile Spasms (West Syndrome)",
      desc: "Clusters of jack-knife movements; EEG hypsarrhythmia – URGENT neurology referral",
      urgent: true,
    },
    {
      icon: "📏",
      title: "Abnormal Head Growth",
      desc: "Progressive microcephaly or macrocephaly – neuroimaging required",
      urgent: true,
    },
    {
      icon: "🧬",
      title: "Family History of ID",
      desc: "Consanguinity or multiple affected relatives – expedite genetic evaluation",
      urgent: false,
    },
    {
      icon: "🔬",
      title: "Metabolic Decompensation",
      desc: "Episodic encephalopathy with intercurrent illness – inborn error of metabolism",
      urgent: true,
    },
    {
      icon: "👁️",
      title: "Cherry Red Spot / Retinal Changes",
      desc: "Storage disorder (GM1/GM2 gangliosidosis, Niemann-Pick) – lysosomal enzyme panel",
      urgent: true,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3">
      {flags.map((f, i) => (
        <div
          key={i}
          className={`flex gap-3 p-3 rounded-xl border text-sm ${
            f.urgent
              ? "bg-red-50 border-red-100"
              : "bg-amber-50 border-amber-100"
          }`}
        >
          <span className="text-xl flex-shrink-0">{f.icon}</span>
          <div>
            <p className={`font-semibold text-xs mb-0.5 ${f.urgent ? "text-red-700" : "text-amber-700"}`}>
              {f.urgent && "🚨 "}
              {f.title}
            </p>
            <p className="text-xs text-gray-600">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Quick Prompt Chips ----
const QUICK_PROMPTS = [
  "What are the Tier 1 investigations for a 2-year-old with GDD and no identified etiology?",
  "Boy, 18 months, not walking, hypotonic, large head – what investigations would you recommend?",
  "How do the McDonald 2006 UK guidelines differ from the North American Shevell 2003 guidelines?",
  "Child with GDD and regression at 3 years – what are the priority investigations?",
  "Which conditions causing GDD are treatable and how?",
  "Why did McDonald et al. recommend routine creatine kinase, calcium, urate and iron in GDD?",
  "When should neuroimaging be performed in GDD – compare the guidelines?",
  "What is the evidence grading system used by McDonald et al. 2006?",
  "How does Fragile X syndrome present and how is it diagnosed?",
  "Outline the management plan for a newly diagnosed 2-year-old with GDD",
];

// ---- Main Component ----
export default function GDDAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [activeCategory, setActiveCategory] = useState("genetics");
  const [activeTier, setActiveTier] = useState("tier1");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to **GDD-Assist** – your clinical decision support tool for Global Developmental Delay.\n\nI'm trained on **North American consensus guidelines** (AAN/CNS Practice Parameters, AAP Committee on Genetics) and can help you with:\n\n- **Assessment**: history, examination findings, developmental domains\n- **Investigation planning**: genetics, neuroimaging, electrophysiology, biochemical/metabolic\n- **Treatable conditions**: ensuring no reversible etiology is missed\n- **Management**: multidisciplinary referrals, early intervention, therapies\n\nHow can I help with your patient today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text) => {
      const msg = text || input.trim();
      if (!msg || isLoading) return;
      setInput("");
      const userMessages = [...messages, { role: "user", content: msg }];
      setMessages(userMessages);
      setIsLoading(true);
      const assistantIndex = userMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const apiMessages = userMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = {
                      role: "assistant",
                      content: accumulated,
                    };
                    return updated;
                  });
                }
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: "I encountered an error processing your request. Please check your API configuration and try again.",
          };
          return updated;
        });
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, messages, isLoading]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const navTabs = [
    { id: "chat", label: "AI Assistant", icon: "💬" },
    { id: "investigations", label: "Investigations", icon: "🔬" },
    { id: "guidelines", label: "Guidelines", icon: "📋" },
    { id: "milestones", label: "Milestones", icon: "📈" },
    { id: "redflags", label: "Red Flags", icon: "🚨" },
  ];

  const catTabs = Object.entries(INVESTIGATION_CATEGORIES).map(([k, v]) => ({
    id: k,
    label: v.label,
    icon: v.icon,
  }));

  return (
    <>
      <Head>
        <title>GDD-Assist | Clinical Decision Support</title>
        <meta name="description" content="Clinical decision support for Global Developmental Delay assessment and management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
        {/* Header */}
        <header
          style={{ background: "var(--primary)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          className="sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: "var(--accent)",
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="text-white font-bold text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>G</span>
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "DM Serif Display, serif",
                    color: "white",
                    fontSize: "1.2rem",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  GDD-Assist
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>
                  Clinical Decision Support · AAN/CNS Guidelines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.3)" }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem" }}>
                  For Healthcare Professionals
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.55)",
                    borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                    background: "transparent",
                    padding: "0.6rem 0.75rem",
                    fontSize: "0.8rem",
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Disclaimer */}
        <div
          style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }}
          className="text-center py-2 px-4 text-xs text-amber-800"
        >
          ⚕️ <strong>Clinical Decision Support Only</strong> — Not a substitute for clinical judgment. Final decisions rest with the treating clinician.
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">

          {/* ======= CHAT TAB ======= */}
          {activeTab === "chat" && (
            <div className="flex gap-6">
              {/* Chat panel */}
              <div className="flex-1 min-w-0">
                <div
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{ border: "1px solid var(--border)", height: "calc(100vh - 260px)", display: "flex", flexDirection: "column" }}
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((msg, i) => (
                      <ChatMessage
                        key={i}
                        role={msg.role}
                        content={msg.content}
                        isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div style={{ borderTop: "1px solid var(--border)", background: "#fafbff" }} className="p-3">
                    <div className="flex gap-2 items-end">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your patient or ask a clinical question…"
                        rows={2}
                        className="flex-1 resize-none text-sm rounded-xl px-4 py-3 outline-none transition-shadow"
                        style={{
                          border: "1.5px solid var(--border)",
                          background: "white",
                          fontFamily: "DM Sans, sans-serif",
                          lineHeight: 1.5,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                      <button
                        onClick={() => sendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl text-white text-sm font-semibold px-5 py-3 flex-shrink-0 transition-all disabled:opacity-40"
                        style={{
                          background: isLoading ? "var(--text-muted)" : "var(--primary)",
                          minWidth: 88,
                        }}
                      >
                        {isLoading ? "..." : "Send ↑"}
                      </button>
                    </div>
                    <p className="text-xs mt-1.5 px-1" style={{ color: "var(--text-muted)" }}>
                      Press Enter to send · Shift+Enter for new line
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick prompts sidebar */}
              <div className="w-64 flex-shrink-0 hidden lg:block">
                <div className="bg-white rounded-2xl shadow-sm p-4" style={{ border: "1px solid var(--border)" }}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Clinical Questions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        disabled={isLoading}
                        className="text-left text-xs py-2.5 px-3 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-200 text-gray-700 hover:text-blue-700 disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guideline badge */}
                <div
                  className="mt-4 p-4 rounded-2xl text-xs"
                  style={{ background: "var(--primary)", color: "rgba(255,255,255,0.85)" }}
                >
                  <p className="font-bold text-white mb-2">📚 Guideline References</p>
                  <p className="mb-1 font-semibold text-yellow-300">North American</p>
                  <p className="mb-1">• Shevell et al. <em>Neurology</em> 2003 (AAN/CNS)</p>
                  <p className="mb-1">• Moeschler et al. <em>Pediatrics</em> 2014 (AAP)</p>
                  <p className="mb-1">• Miller et al. <em>AJHG</em> 2010 (CMA)</p>
                  <p className="mb-2">• Srour &amp; Shevell <em>Arch Dis Child</em> 2014</p>
                  <p className="font-semibold text-blue-300 mb-1">UK / International</p>
                  <p className="">• McDonald et al. <em>Arch Dis Child</em> 2006</p>
                  <p className="text-xs mt-1 opacity-60">PMC2083045 · Glasgow guidelines</p>
                </div>
              </div>
            </div>
          )}

          {/* ======= INVESTIGATIONS TAB ======= */}
          {activeTab === "investigations" && (
            <div>
              <div className="mb-5">
                <h2 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)", fontSize: "1.5rem" }}>
                  Investigation Framework
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Based on North American consensus (AAN/CNS, AAP). Categorized by modality and tier.
                </p>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {catTabs.map((tab) => {
                  const cat = INVESTIGATION_CATEGORIES[tab.id];
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                      style={{
                        background: isActive ? cat.color : "white",
                        color: isActive ? "white" : cat.color,
                        borderColor: isActive ? cat.color : cat.color + "55",
                        boxShadow: isActive ? `0 2px 12px ${cat.color}40` : "none",
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tier toggle */}
              <div className="flex gap-2 mb-5">
                {["tier1", "tier2"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTier(t)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
                    style={{
                      background: activeTier === t ? "var(--primary)" : "white",
                      color: activeTier === t ? "white" : "var(--primary)",
                      borderColor: "var(--primary)",
                    }}
                  >
                    {t === "tier1" ? "🥇 Tier 1 — Recommended for All" : "🥈 Tier 2 — Clinically Directed"}
                  </button>
                ))}
              </div>

              {/* Description banner */}
              {activeTier === "tier1" && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                  <strong>Tier 1 investigations</strong> are recommended for <strong>all children with GDD</strong> of undetermined etiology, per the AAN/CNS Practice Parameter (Shevell et al. 2003) and AAP update (Moeschler et al. 2014).
                </div>
              )}
              {activeTier === "tier2" && (
                <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-800">
                  <strong>Tier 2 investigations</strong> are guided by clinical features, examination findings, and results of Tier 1 testing. Discuss with specialist (genetics, neurology) before ordering.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INVESTIGATION_CATEGORIES[activeCategory][activeTier].map((item, i) => (
                  <InvestigationCard key={i} item={item} category={activeCategory} />
                ))}
              </div>

              {/* Treatable conditions summary */}
              <div className="mt-8 p-5 rounded-2xl bg-green-50 border border-green-100">
                <h3 style={{ fontFamily: "DM Serif Display, serif", color: "#065f46", fontSize: "1.1rem" }} className="mb-3">
                  ✓ Priority: Treatable Conditions Causing GDD
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    ["Congenital Hypothyroidism", "TSH / Free T4", false],
                    ["Phenylketonuria (PKU)", "Plasma Amino Acids", false],
                    ["Biotinidase Deficiency", "Biotinidase Activity", true],
                    ["Creatine Deficiency Syndromes", "Urine Creatine Metabolites", false],
                    ["GLUT1 Deficiency Syndrome", "CSF:Blood Glucose Ratio", false],
                    ["Cerebral Folate Deficiency", "CSF 5-MTHF", false],
                    ["Pyridoxine-Dependent Epilepsy", "Plasma/Urine Alpha-AASA", false],
                    ["Lead Toxicity", "Blood Lead Level", true],
                    ["Iron Deficiency", "Ferritin / Iron Studies", true],
                    ["Calcium Disorders", "Serum Calcium", true],
                    ["Purine Disorders", "Plasma Urate", true],
                    ["Neurotransmitter Disorders", "CSF Neurotransmitters", false],
                    ["Urea Cycle Defects", "Plasma Ammonia", false],
                    ["CDG Syndromes (some)", "Disialotransferrins", false],
                  ].map(([cond, test, mcdonald], i) => (
                    <div key={i} className={`flex gap-2 text-xs p-2.5 rounded-lg border ${mcdonald ? "bg-blue-50 border-blue-100" : "bg-white border-green-100"}`}>
                      <span className={`font-bold flex-shrink-0 ${mcdonald ? "text-blue-600" : "text-green-600"}`}>Rx</span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {cond}
                          {mcdonald && <span className="ml-1 text-blue-500 font-normal">★</span>}
                        </p>
                        <p className="text-gray-500">Test: {test}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  ★ = Highlighted by McDonald et al. 2006 (Arch Dis Child) as first-line — not specifically in North American guidelines
                </p>
              </div>
            </div>
          )}

          {/* ======= GUIDELINES COMPARISON TAB ======= */}
          {activeTab === "guidelines" && (
            <div>
              <div className="mb-5">
                <h2 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)", fontSize: "1.5rem" }}>
                  Guideline Comparison
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Side-by-side comparison of North American (Shevell 2003 / Moeschler 2014) vs McDonald et al. 2006 UK guidelines.
                </p>
              </div>

              {/* Article banner */}
              <div className="mb-6 p-5 rounded-2xl border border-blue-200 bg-blue-50">
                <div className="flex gap-4 items-start">
                  <div className="text-3xl">📄</div>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">McDonald L, Rennie A, Tolmie J, Galloway P, McWilliam R.</p>
                    <p className="text-blue-800 text-sm italic mt-0.5">"Investigation of global developmental delay."</p>
                    <p className="text-blue-700 text-xs mt-1">
                      <strong>Arch Dis Child.</strong> 2006;91(8):701–705. PMC2083045. DOI: 10.1136/adc.2005.078147
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      Royal Hospital for Sick Children, Yorkhill, Glasgow, UK · Evidence-graded guidelines for preschool GDD
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence grading system */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                    Evidence Grading (McDonald 2006)
                  </h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { cat: "Ia", desc: "Meta-analysis of RCTs", rec: "A", recDesc: "Directly based on Category I" },
                      { cat: "Ib", desc: "At least one RCT", rec: "A", recDesc: "" },
                      { cat: "IIa", desc: "Controlled study (no randomisation)", rec: "B", recDesc: "Category II or extrapolated from I" },
                      { cat: "IIb", desc: "Quasi-experimental study", rec: "B", recDesc: "" },
                      { cat: "III", desc: "Descriptive studies (comparative, case-control)", rec: "C", recDesc: "Category III or extrapolated from I/II" },
                      { cat: "IV", desc: "Expert opinion / clinical experience", rec: "D", recDesc: "Category IV or extrapolated from I/II/III" },
                    ].map((e, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="font-mono font-bold text-indigo-700 w-6 flex-shrink-0">{e.cat}</span>
                        <span className="text-gray-700 flex-1">{e.desc}</span>
                        <span className={`font-bold w-6 text-center rounded flex-shrink-0 ${
                          e.rec === "A" ? "text-green-700" : e.rec === "B" ? "text-blue-700" : e.rec === "C" ? "text-orange-700" : "text-gray-600"
                        }`}>→{e.rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                    GDD Severity Classification (McDonald 2006)
                  </h3>
                  <div className="space-y-3">
                    {[
                      { severity: "Mild", def: "Functional age <33% below chronological age", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
                      { severity: "Moderate", def: "Functional age 34–66% of chronological age", color: "bg-orange-50 border-orange-200 text-orange-800" },
                      { severity: "Severe", def: "Functional age >66% below chronological age", color: "bg-red-50 border-red-200 text-red-800" },
                    ].map((s) => (
                      <div key={s.severity} className={`p-3 rounded-xl border text-xs ${s.color}`}>
                        <p className="font-bold">{s.severity} GDD</p>
                        <p className="mt-0.5 opacity-80">{s.def}</p>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ All three groups merit investigation — aetiological diagnosis can be made irrespective of severity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Aims of Investigation */}
              <div className="mb-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                  Aims of Investigation in GDD (McDonald et al. 2006)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { n: "1", label: "Establish Causation", icon: "🔍" },
                    { n: "2", label: "Alter Management", icon: "⚕️" },
                    { n: "3", label: "Predict Prognosis & Recurrence", icon: "📊" },
                    { n: "4", label: "Influence Prevention", icon: "🛡️" },
                  ].map((a) => (
                    <div key={a.n} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-2xl mb-1">{a.icon}</div>
                      <p className="text-xs font-semibold text-gray-700">{a.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Plus: <strong>Do not miss conditions exacerbating GDD</strong>, and especially do not miss <strong className="text-green-700">TREATABLE conditions</strong>.
                </p>
              </div>

              {/* Key comparison table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div style={{ background: "var(--primary)" }} className="px-5 py-3">
                  <h3 className="text-white font-bold text-sm">
                    Investigation Recommendations: North American vs McDonald 2006 (Glasgow UK)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 w-40">Investigation</th>
                        <th className="text-left px-4 py-3 font-semibold text-indigo-700">North American (Shevell 2003 / Moeschler 2014)</th>
                        <th className="text-left px-4 py-3 font-semibold text-blue-700">McDonald et al. 2006 (Glasgow UK)</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          test: "Cytogenetic analysis (Karyotype)",
                          na: "Recommended",
                          uk: "Recommended (Grade C/D)",
                          status: "agree"
                        },
                        {
                          test: "Fragile X DNA test",
                          na: "Recommended",
                          uk: "Recommended (Grade C/D)",
                          status: "agree"
                        },
                        {
                          test: "Neuroimaging (MRI)",
                          na: "Recommended for ALL children with GDD",
                          uk: "Second-line only — when additional features present (abnormal head size, neuro exam, seizures, regression). Rec D",
                          status: "differ"
                        },
                        {
                          test: "Blood Lead Level",
                          na: "Targeted — only if risk factors present",
                          uk: "ROUTINE first-line screening (Grade C) — treatable neurotoxin",
                          status: "differ"
                        },
                        {
                          test: "Thyroid Function (TSH/T4)",
                          na: "Only if systemic features of thyroid dysfunction",
                          uk: "ROUTINE first-line (pragmatic — treatable + chromosomal syndromes at risk)",
                          status: "differ"
                        },
                        {
                          test: "Creatine Kinase (CK)",
                          na: "Not mentioned",
                          uk: "ROUTINE first-line in boys (Grade D) — prevent missed/late DMD",
                          status: "differ"
                        },
                        {
                          test: "Serum Calcium",
                          na: "Not mentioned",
                          uk: "ROUTINE first-line (Grade D) — DiGeorge, Williams, pseudohypoparathyroidism",
                          status: "differ"
                        },
                        {
                          test: "Plasma Urate",
                          na: "Not mentioned",
                          uk: "ROUTINE first-line — more stable than ammonia/lactate; purine disorders",
                          status: "differ"
                        },
                        {
                          test: "Iron Studies (FBC/Ferritin)",
                          na: "Not mentioned",
                          uk: "ROUTINE first-line (Grade III–IV) — associated with developmental delay, easily treated",
                          status: "differ"
                        },
                        {
                          test: "Biotinidase",
                          na: "Not mentioned",
                          uk: "ROUTINE first-line (Grade C) — treatable, may present as GDD with no other signs",
                          status: "differ"
                        },
                        {
                          test: "Metabolic investigations",
                          na: "Selective/targeted",
                          uk: "Selective/targeted, second-line (Grade C/D)",
                          status: "agree"
                        },
                        {
                          test: "EEG",
                          na: "If seizures or regression",
                          uk: "Not routine; if seizures, regression, or Landau-Kleffner suspected (Grade C/D)",
                          status: "agree"
                        },
                        {
                          test: "Telomere studies",
                          na: "Not mentioned (CMA preferred)",
                          uk: "At genetics clinic — 5% yield in undiagnosed LD",
                          status: "differ"
                        },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                          <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-100">{row.test}</td>
                          <td className="px-4 py-3 text-indigo-700 border-r border-gray-100">{row.na}</td>
                          <td className="px-4 py-3 text-blue-700">{row.uk}</td>
                          <td className="px-4 py-3 text-center">
                            {row.status === "agree" ? (
                              <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Agree</span>
                            ) : (
                              <span className="inline-block bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Differs</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* McDonald first-line panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                    🆕 McDonald-Specific First-Line Tests
                    <span className="text-xs font-normal text-gray-400 ml-2">Not in North American guidelines</span>
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { test: "Creatine Kinase (CK)", reason: "Boys — exclude DMD presenting as GDD", grade: "D", treatable: false },
                      { test: "Serum Calcium", reason: "DiGeorge, Williams, pseudohypoparathyroidism", grade: "D", treatable: true },
                      { test: "Plasma Urate", reason: "Purine disorders; stable analyte for screening", grade: "D", treatable: true },
                      { test: "Iron Studies", reason: "Iron deficiency → developmental delay; easily treated", grade: "III–IV", treatable: true },
                      { test: "Biotinidase Activity", reason: "Treatable; may present as GDD with NO other signs", grade: "C", treatable: true },
                    ].map((t, i) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs text-blue-900">{t.test}</p>
                            <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono">Rec {t.grade}</span>
                            {t.treatable && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Treatable</span>}
                          </div>
                          <p className="text-xs text-blue-600 mt-0.5">{t.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                    Metabolic Panel (McDonald 2006 — when clinically indicated)
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Indicated when: family history, consanguinity, <strong>regression</strong>, ataxia, epilepsy, organomegaly, coarse facial features.
                  </p>
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">🩸 Blood:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Lactate", "Amino acids", "Ammonia", "VLCFAs", "Carnitine", "Homocysteine", "Disialotransferrins (CDG)"].map((t) => (
                        <span key={t} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-lg">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">🧪 Urine:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Organic acids", "Orotate", "Glycosaminoglycans (MPS)", "Oligosaccharides"].map((t) => (
                        <span key={t} className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-100 px-2 py-1 rounded-lg">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
                    ⚠️ Metabolic tests have a high rate of non-specific, non-diagnostic abnormalities when used as a general screen. Use selectively.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= MILESTONES TAB ======= */}
          {activeTab === "milestones" && (
            <div>
              <div className="mb-5">
                <h2 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)", fontSize: "1.5rem" }}>
                  Developmental Milestone Reference
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Red flags for delay across motor, language, and cognitive domains. GDD = delay in ≥2 domains.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                {["motor", "language", "cognitive"].map((domain) => (
                  <div key={domain} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div
                      style={{
                        background: domain === "motor" ? "#1a2744" : domain === "language" ? "#0891b2" : "#4f46e5",
                        padding: "12px 16px",
                      }}
                    >
                      <h3 className="text-white font-semibold text-sm capitalize">
                        {domain === "motor" ? "🏃 Gross/Fine Motor" : domain === "language" ? "💬 Speech/Language" : "🧠 Cognitive/Social"}
                      </h3>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Milestone</th>
                          <th className="text-left px-3 py-2 font-semibold text-green-700">Typical</th>
                          <th className="text-left px-3 py-2 font-semibold text-red-600">Concern</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MILESTONE_REFERENCE[domain].map((m, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                            <td className="px-3 py-2 text-gray-700">{m.milestone}</td>
                            <td className="px-3 py-2 text-green-700 font-medium">{m.typical}</td>
                            <td className="px-3 py-2 text-red-600 font-medium">{m.concern}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="mb-3 text-lg">
                    GDD Definition
                  </h3>
                  <div className="text-sm space-y-2 text-gray-700">
                    <p>
                      <strong>GDD</strong> = significant delay (≥2 SD below mean) in <strong>two or more</strong> developmental domains in children <strong>under 5 years</strong>:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {["Gross/Fine Motor", "Speech/Language", "Cognitive", "Social/Personal", "Activities of Daily Living"].map((d) => (
                        <div key={d} className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1.5 rounded-lg border border-blue-100">
                          {d}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Prevalence: <strong>1–3%</strong> of children under 5 years. Most will have intellectual disability on formal testing at age &gt;5 years.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="mb-3 text-lg">
                    Developmental Assessment Tools
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { name: "Bayley-IV (BSID-IV)", desc: "Gold standard; cognitive, language, motor, social-emotional, adaptive; 1–42 months", tag: "Comprehensive" },
                      { name: "ASQ-3", desc: "Parent-report screening; 5 domains; 1–66 months", tag: "Screening" },
                      { name: "Vineland-3 (VABS)", desc: "Adaptive behavior; daily living skills; all ages", tag: "Adaptive" },
                      { name: "Griffiths-III", desc: "6 subscales including foundations of learning; 0–6 years", tag: "Comprehensive" },
                      { name: "MCHAT-R/F", desc: "Autism screening at 18 and 24 months", tag: "ASD Screen" },
                    ].map((tool, i) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded font-medium self-start flex-shrink-0">
                          {tool.tag}
                        </span>
                        <div>
                          <p className="font-semibold text-xs text-gray-800">{tool.name}</p>
                          <p className="text-xs text-gray-500">{tool.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= RED FLAGS TAB ======= */}
          {activeTab === "redflags" && (
            <div>
              <div className="mb-5">
                <h2 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)", fontSize: "1.5rem" }}>
                  Clinical Red Flags
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Features requiring urgent evaluation or expedited specialist referral in children with GDD.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">Warning Signs</h3>
                  <RedFlagsPanel />
                </div>

                <div className="space-y-5">
                  {/* Etiology breakdown */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-4">
                      Etiological Breakdown
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Genetic/Chromosomal", pct: 50, color: "#4F46E5" },
                        { label: "Structural Brain Anomaly", pct: 20, color: "#0891B2" },
                        { label: "Perinatal/Environmental", pct: 12, color: "#D97706" },
                        { label: "Metabolic/Biochemical", pct: 3, color: "#059669" },
                        { label: "Postnatal Acquired", pct: 7, color: "#7C3AED" },
                        { label: "Unknown/Idiopathic", pct: 40, color: "#6B7280" },
                      ].map((e) => (
                        <div key={e.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{e.label}</span>
                            <span style={{ color: e.color }} className="font-bold">{e.pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${e.pct}%`, background: e.color, transition: "width 0.8s ease" }}
                              className="h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">*Percentages from published series; unknown/idiopathic persists after full evaluation</p>
                  </div>

                  {/* Comorbidities */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 style={{ fontFamily: "DM Serif Display, serif", color: "var(--primary)" }} className="text-lg mb-3">
                      Common Comorbidities in GDD
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { cond: "Epilepsy", pct: "40–60% (severe GDD)", color: "bg-red-50 text-red-700 border-red-100" },
                        { cond: "Autism Spectrum Disorder", pct: "20–30%", color: "bg-blue-50 text-blue-700 border-blue-100" },
                        { cond: "ADHD", pct: "20–30%", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
                        { cond: "Cerebral Palsy", pct: "Variable", color: "bg-purple-50 text-purple-700 border-purple-100" },
                        { cond: "Feeding Difficulties", pct: "Common (esp. early)", color: "bg-green-50 text-green-700 border-green-100" },
                        { cond: "Sleep Disorders", pct: "40–80%", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                      ].map((c, i) => (
                        <div key={i} className={`p-2.5 rounded-lg border ${c.color}`}>
                          <p className="font-semibold">{c.cond}</p>
                          <p className="text-xs opacity-75 mt-0.5">{c.pct}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Management quick reference */}
                  <div
                    className="p-5 rounded-2xl"
                    style={{ background: "var(--primary)", color: "rgba(255,255,255,0.9)" }}
                  >
                    <h3 style={{ fontFamily: "DM Serif Display, serif", color: "white" }} className="text-lg mb-3">
                      Management Essentials
                    </h3>
                    <div className="space-y-2 text-xs">
                      {[
                        ["🏥 Multidisciplinary team", "Developmental Peds, PT, OT, SLP, Psychology"],
                        ["🧒 Early Intervention (0–3y)", "IDEA Part C (USA) / provincial programs (Canada)"],
                        ["🎓 IEP/IFSP", "School-based services from age 3 years"],
                        ["🧠 Treat underlying cause", "Metabolic, endocrine, epilepsy management"],
                        ["👁️ Ophthalmology", "Visual impairment affects development"],
                        ["👂 Audiology", "Hearing loss may mimic/co-occur with GDD"],
                        ["🧬 Genetic counseling", "Recurrence risk, family planning"],
                        ["👪 Family support", "Respite care, parent mental health"],
                      ].map(([label, detail], i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-semibold flex-shrink-0">{label}:</span>
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          style={{ borderTop: "1px solid var(--border)", background: "white" }}
          className="mt-12 py-6 px-4 text-center text-xs text-gray-400"
        >
          <p>
            GDD-Assist — Clinical Decision Support based on{" "}
            <em>Shevell et al. Neurology 2003</em> · <em>Moeschler et al. Pediatrics 2014</em> (AAN/CNS/AAP North American Consensus) ·{" "}
            <em>McDonald et al. Arch Dis Child 2006</em> (PMC2083045)
          </p>
          <p className="mt-1">
            For healthcare professionals only · Not for direct patient use · Always apply clinical judgment
          </p>
        </footer>
      </div>
    </>
  );
}
