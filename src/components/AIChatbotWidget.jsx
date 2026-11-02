import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Code,
  ShieldAlert,
  PhoneCall,
  BookOpen,
  Search,
  HelpCircle,
  Info,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Zap
} from 'lucide-react';
import { 
  KNOWLEDGE_BASE, 
  queryKnowledgeBase, 
  getRelatedEntries, 
  getAllKnowledgeEntries, 
  CATEGORY_MAP 
} from '../utils/knowledgeBaseService';

export default function AIChatbotWidget() {
  const { 
    isChatbotOpen, 
    setIsChatbotOpen, 
    currentUser, 
    setChatbotPrefillData, 
    setActiveTab, 
    setIsAnonymousTrackerOpen,
    addToast 
  } = useApp();

  const [activeWidgetTab, setActiveWidgetTab] = useState('chat'); // 'chat' | 'kb'
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! I am the GMS Intelligent Intake Guide for MITS Gwalior.`,
      entry: null,
      jsonDraft: null
    },
    {
      id: 2,
      sender: 'bot',
      text: 'You can query grievance procedures, anonymous reporting protocols, bonafide verification, hostel mess issues, or let me structure a draft complaint for you.',
      entry: null,
      relatedEntries: getRelatedEntries(['kb-how-to-file', 'kb-anonymous', 'kb-which-category'])
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isApiOutageMode, setIsApiOutageMode] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatbotOpen && activeWidgetTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isChatbotOpen, activeWidgetTab]);

  // ─── Floating Comic-Inspired Launcher ────────────────────────────────────
  if (!isChatbotOpen) {
    return (
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#0b1424] hover:bg-[#0f1b2d] text-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,0.95)] hover:shadow-[4px_4px_0px_0px_rgba(56,189,248,0.4)] transition-all flex items-center gap-3 border border-slate-700 hover:border-blue-400 cursor-pointer group"
        title="Open GMS Assistant"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-400/40 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>
        <div className="flex flex-col text-left pr-1 hidden sm:flex">
          <span className="text-xs font-black tracking-wider uppercase leading-tight text-white group-hover:text-blue-300 transition-colors">
            GMS Assistant
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Rule-Based Intake</span>
        </div>
      </button>
    );
  }

  // Handle Quick Chips
  const handleQuickChip = (promptText) => {
    setInput(promptText);
    handleSend(promptText);
  };

  // Route / Action Executor
  const handleExecuteAction = (action, suggestedCategory = null) => {
    if (!action && !suggestedCategory) return;

    if (action?.route) {
      const route = action.route;

      if (route.startsWith('/app/complaints/new')) {
        let category = null;
        let priority = 'Medium';
        let isAnon = false;

        try {
          const url = new URL(route, 'https://rcms.mitsgwalior.in');
          const catParam = url.searchParams.get('category');
          const prioParam = url.searchParams.get('priority');

          if (catParam) {
            category = CATEGORY_MAP[catParam] || catParam;
          }
          if (prioParam) {
            priority = prioParam.charAt(0).toUpperCase() + prioParam.slice(1);
          }
        } catch {
          if (route.includes('category=cat-mess')) category = 'cat_mess';
          if (route.includes('category=cat-admin')) category = 'cat_admin';
          if (route.includes('category=cat-events')) category = 'cat_events';
          if (route.includes('priority=urgent')) priority = 'Urgent';
        }

        if (!category && suggestedCategory) {
          category = CATEGORY_MAP[suggestedCategory] || suggestedCategory;
        }

        if (action.label && action.label.toLowerCase().includes('anonymous')) {
          isAnon = true;
        }

        setChatbotPrefillData({
          category,
          priority,
          is_anonymous: isAnon
        });

        setActiveTab('submit');
        setIsChatbotOpen(false);
        addToast('Lodge Grievance Form Opened', `Pre-filled based on: ${action.label}`, 'info');
        return;
      }

      if (route.startsWith('/app/track')) {
        setIsAnonymousTrackerOpen(true);
        setIsChatbotOpen(false);
        addToast('Token Tracker Opened', 'Enter your secret tracking code (e.g. MRC-XXXX-XXXX).', 'info');
        return;
      }
    }

    if (suggestedCategory) {
      const mapped = CATEGORY_MAP[suggestedCategory] || suggestedCategory;
      setChatbotPrefillData({ category: mapped });
      setActiveTab('submit');
      setIsChatbotOpen(false);
      addToast('Category Selected', `Lodge Grievance loaded with recommended category.`, 'info');
    }
  };

  const handleApplyDraft = (draft) => {
    setChatbotPrefillData(draft);
    setActiveTab('submit');
    setIsChatbotOpen(false);
    addToast('Grievance Draft Loaded', 'Form pre-filled from structured intake. Review and submit!', 'success');
  };

  const handleSend = (textToSend = input) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      jsonDraft: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      // Outage fallback simulation mode
      if (isApiOutageMode) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: '⚠️ Guided Rule-Based Mode Active: Switching to structured university knowledge base and verified procedural routes.',
            fallbackGuided: true
          }
        ]);
        setIsTyping(false);
        return;
      }

      // Query Knowledge Base first
      const kbResult = queryKnowledgeBase(query);
      const lower = query.toLowerCase();

      // Check if user specifically requested a grievance drafting / structuring
      const isDraftIntent = lower.includes('draft') || lower.includes('lodge') || lower.includes('write a complaint') || lower.includes('file a complaint about');

      let jsonOutput = null;
      if (isDraftIntent || (!kbResult.match && (lower.includes('mess') || lower.includes('wifi') || lower.includes('water') || lower.includes('exam') || lower.includes('hostel')))) {
        let extractedCategory = 'cat_infra';
        let extractedTitle = query;
        let extractedDescription = query;
        let extractedLocation = 'Campus General';
        let extractedPriority = 'Medium';

        if (lower.includes('mess') || lower.includes('food') || lower.includes('dinner') || lower.includes('chapati') || lower.includes('cater')) {
          extractedCategory = 'cat_mess';
          extractedTitle = 'Substandard food hygiene and meal preparation in Hostel Mess';
          extractedDescription = `Student reported significant issues regarding mess catering: "${query}". Requesting formal hygiene inspection and quality audit of meal preparation.`;
          extractedLocation = 'Hostel BH-1 Dining Hall';
          extractedPriority = 'High';
        } else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('router') || lower.includes('network')) {
          extractedCategory = 'cat_it';
          extractedTitle = 'Severe Wi-Fi connectivity disruption in residential wing';
          extractedDescription = `Access point failure reported: "${query}". Students are unable to access LMS, research portals, and technical submissions.`;
          extractedLocation = 'Hostel Block C, 2nd Floor';
          extractedPriority = 'High';
        } else if (lower.includes('timetable') || lower.includes('class') || lower.includes('faculty') || lower.includes('exam') || lower.includes('lab')) {
          extractedCategory = 'cat_academic';
          extractedTitle = 'Academic scheduling conflict / Lab infrastructure issue';
          extractedDescription = `Academic discrepancy: "${query}". Requires immediate alignment by Head of Department and Dean Academics.`;
          extractedLocation = 'Mathematics & Computing Lab 2';
          extractedPriority = 'Urgent';
        } else if (lower.includes('water') || lower.includes('clean') || lower.includes('washroom') || lower.includes('toilet') || lower.includes('cooler')) {
          extractedCategory = 'cat_sanitation';
          extractedTitle = 'Sanitation maintenance required for campus facilities';
          extractedDescription = `Sanitation concern: "${query}". Estate maintenance team dispatched for sanitization and filter replacement.`;
          extractedLocation = 'Student Activity Centre (SAC)';
          extractedPriority = 'Medium';
        } else if (lower.includes('bonafide') || lower.includes('certificate') || lower.includes('fee') || lower.includes('scholarship')) {
          extractedCategory = 'cat_admin';
          extractedTitle = 'Administrative request delay / certificate processing issue';
          extractedDescription = `Student grievance regarding administrative workflow: "${query}". Submitted for expedited verification.`;
          extractedLocation = 'Administrative Block, Ground Floor';
          extractedPriority = 'Medium';
        }

        jsonOutput = {
          category: extractedCategory,
          title: extractedTitle,
          description: extractedDescription,
          location: extractedLocation,
          priority: extractedPriority
        };
      }

      // Build bot response based on Knowledge Base hit or fallback
      let botText = '';
      let matchedEntry = null;
      let relatedEntries = [];
      let isFallback = false;

      if (kbResult.match) {
        matchedEntry = kbResult.match;
        botText = matchedEntry.answer;
        relatedEntries = kbResult.relatedEntries || [];
      } else if (jsonOutput) {
        botText = "I have drafted a structured grievance from your description according to MITS-DU SLA standards:";
      } else {
        isFallback = true;
        botText = KNOWLEDGE_BASE.fallback;
        relatedEntries = getRelatedEntries(['kb-how-to-file', 'kb-which-category', 'kb-contacts']);
      }

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botText,
        entry: matchedEntry,
        isSensitive: Boolean(kbResult.isSensitive || matchedEntry?.sensitive),
        isUnverified: Boolean(matchedEntry && matchedEntry.verified === false),
        action: matchedEntry?.action || null,
        suggestedCategory: matchedEntry?.suggestedCategory || null,
        relatedEntries: relatedEntries,
        jsonDraft: jsonOutput,
        isFallback: isFallback
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 120);
  };

  // Filter KB entries for the Browse tab
  const allEntries = getAllKnowledgeEntries();
  const filteredKbEntries = allEntries.filter(entry => {
    const matchesSearch = kbSearchTerm === '' || 
      entry.topic.toLowerCase().includes(kbSearchTerm.toLowerCase()) ||
      entry.question.toLowerCase().includes(kbSearchTerm.toLowerCase()) ||
      entry.keywords?.some(k => k.toLowerCase().includes(kbSearchTerm.toLowerCase()));

    if (selectedTopicFilter === 'all') return matchesSearch;
    if (selectedTopicFilter === 'verified') return matchesSearch && entry.verified;
    if (selectedTopicFilter === 'unverified') return matchesSearch && !entry.verified;
    if (selectedTopicFilter === 'sensitive') return matchesSearch && entry.sensitive;
    if (selectedTopicFilter === 'admin') return matchesSearch && entry.suggestedCategory === 'cat-admin';
    if (selectedTopicFilter === 'mess') return matchesSearch && entry.suggestedCategory === 'cat-mess';

    return matchesSearch;
  });

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[640px] h-[580px] bg-[#0b1424] rounded-3xl shadow-[5px_5px_0px_0px_rgba(8,14,26,0.95)] border border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Bot Header (Manga Panel Top) */}
      <div className="bg-[#080e1a] border-b border-slate-800 p-3.5 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 manga-halftone opacity-20 pointer-events-none" />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-400/40 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">GMS Assistant</h4>
              <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800 font-mono font-bold px-1.5 py-0.2 rounded">
                KB v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Rule-Based Campus Guide</span>
              <button 
                onClick={() => setShowSafetyModal(true)}
                className="text-amber-400 hover:text-amber-200 underline cursor-pointer text-[9px]"
                title="View Safety Notice"
              >
                Notice
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 relative z-10">
          {/* Outage Toggle for Presentation Defense */}
          <button
            onClick={() => setIsApiOutageMode(!isApiOutageMode)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
              isApiOutageMode ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Demonstrate guided fallback mode"
          >
            {isApiOutageMode ? 'Rule-Only' : 'Auto'}
          </button>

          <button
            onClick={() => setIsChatbotOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Header (Chat vs Browse Knowledge Base) */}
      <div className="bg-[#080e1a]/80 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveWidgetTab('chat')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              activeWidgetTab === 'chat' 
                ? 'bg-blue-600 text-white border-blue-400 shadow-xs' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Assistant Chat</span>
          </button>
          <button
            onClick={() => setActiveWidgetTab('kb')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              activeWidgetTab === 'kb' 
                ? 'bg-blue-600 text-white border-blue-400 shadow-xs' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Browse KB ({allEntries.length})</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
          MITS-DU SLA Ready
        </div>
      </div>

      {/* Safety Notice Inline Banner */}
      <div className="bg-amber-950/30 border-b border-amber-800/60 px-3 py-1 flex items-center justify-between gap-2 text-[10px] text-amber-200">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">{KNOWLEDGE_BASE.safetyNotice}</span>
        </div>
        <button
          onClick={() => setShowSafetyModal(true)}
          className="text-amber-300 font-bold underline shrink-0 hover:text-amber-100 cursor-pointer"
        >
          Details
        </button>
      </div>

      {/* ─── TAB 1: Chat View ─── */}
      {activeWidgetTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#080e1a]">
          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[92%]">
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md border border-blue-400/40'
                        : 'bg-[#0b1424] border border-slate-800 text-slate-200 rounded-bl-none shadow-md space-y-2'
                    }`}
                  >
                    {/* Bot Topic Pill if matched */}
                    {msg.entry && (
                      <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800 text-[10px]">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5 text-blue-400" />
                          {msg.entry.topic}
                        </span>
                        {msg.entry.verified ? (
                          <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-semibold text-[9px] flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-300 bg-amber-950/80 border border-amber-800 px-1.5 py-0.2 rounded font-mono font-semibold text-[9px] flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> Provisional
                          </span>
                        )}
                      </div>
                    )}

                    {/* Sensitive Urgent Banner */}
                    {msg.isSensitive && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-700/60 text-rose-200 text-[11px] space-y-2">
                        <div className="flex items-center gap-1.5 font-black uppercase text-rose-300">
                          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                          <span>Emergency Crisis & Safety Protocol</span>
                        </div>
                        <p className="text-[10px] text-rose-300/90 leading-tight">
                          If you or someone else is in immediate danger, please reach out to authorities immediately.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          <a 
                            href="tel:112"
                            className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-500 transition-colors shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call 112 (Emergency)</span>
                          </a>
                          <a 
                            href="tel:18001805522"
                            className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-500 transition-colors shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Anti-Ragging: 1800-180-5522</span>
                          </a>
                          <a 
                            href="tel:14416"
                            className="col-span-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition-colors shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Tele-MANAS: 14416</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Main text answer */}
                    <p className="leading-relaxed whitespace-pre-wrap text-[11px] sm:text-xs text-slate-200">
                      {msg.text}
                    </p>

                    {/* Unverified Notice */}
                    {msg.isUnverified && (
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[10px] text-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">MITS Placeholder Notice:</strong> Office contacts and processing hours mentioned are provisional placeholders awaiting official college confirmation.
                        </div>
                      </div>
                    )}

                    {/* Suggested Category Tag */}
                    {msg.suggestedCategory && (
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-slate-400">
                          Suggested Category: <strong className="text-blue-300">{msg.suggestedCategory}</strong>
                        </span>
                      </div>
                    )}

                    {/* Action Button from Knowledge Base */}
                    {msg.action && (
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(msg.action, msg.suggestedCategory)}
                        className="w-full mt-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-blue-400/30"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Structured JSON Output Card */}
                    {msg.jsonDraft && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#080e1a] text-slate-200 text-[11px] font-mono border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold border-b border-slate-800 pb-1">
                          <span className="flex items-center gap-1">
                            <Code className="w-3 h-3" /> Structured JSON Output
                          </span>
                          <span>MITS-DU SLA Ready</span>
                        </div>

                        <div className="space-y-1 text-slate-300">
                          <p><strong className="text-blue-400">category:</strong> "{msg.jsonDraft.category}"</p>
                          <p><strong className="text-blue-400">title:</strong> "{msg.jsonDraft.title}"</p>
                          <p><strong className="text-blue-400">priority:</strong> "{msg.jsonDraft.priority}"</p>
                          <p><strong className="text-blue-400">location:</strong> "{msg.jsonDraft.location}"</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyDraft(msg.jsonDraft)}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pre-fill Complaint Form &rarr;</span>
                        </button>
                      </div>
                    )}

                    {/* Related Questions Pills */}
                    {msg.relatedEntries && msg.relatedEntries.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Related questions:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {msg.relatedEntries.map(rel => (
                            <button
                              key={rel.id}
                              onClick={() => handleQuickChip(rel.question)}
                              className="text-left px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#080e1a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>{rel.question}</span>
                              <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0 text-blue-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback Action Buttons */}
                    {msg.isFallback && (
                      <div className="pt-2 flex flex-col gap-1.5">
                        <button
                          onClick={() => handleExecuteAction({ label: "File under Other", route: "/app/complaints/new?category=cat-other" })}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Lodge Grievance under 'Other'</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setActiveWidgetTab('kb')}
                          className="w-full py-1 px-2.5 rounded-lg bg-[#080e1a] hover:bg-slate-800 text-slate-300 font-semibold text-[10px] flex items-center justify-center gap-1 border border-slate-800 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-blue-400" />
                          <span>Explore all FAQ Topics</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] font-mono text-slate-400">Consulting GMS knowledge base...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#080e1a] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              onClick={() => handleQuickChip('How do I file a complaint?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 hover:bg-blue-900 border border-blue-800 transition-colors cursor-pointer"
            >
              📝 How to file
            </button>
            <button
              onClick={() => handleQuickChip('How does anonymous reporting work?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800 transition-colors cursor-pointer"
            >
              🔒 Anonymous reporting
            </button>
            <button
              onClick={() => handleQuickChip('Where do I complain about mess or canteen food?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 transition-colors cursor-pointer"
            >
              🍲 Mess & Canteen
            </button>
            <button
              onClick={() => handleQuickChip('My bonafide certificate is delayed.')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 transition-colors cursor-pointer"
            >
              📜 Bonafide delay
            </button>
            <button
              onClick={() => handleQuickChip('I am being ragged, harassed or threatened.')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800 transition-colors cursor-pointer"
            >
              🚨 Ragging & Harassment
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2.5 bg-[#080e1a] border-t border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Ask a question or describe an issue..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0b1424] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer border border-blue-400/30"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── TAB 2: Browse Knowledge Base Topics ─── */}
      {activeWidgetTab === 'kb' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#080e1a]">
          {/* Search & Topic Filters */}
          <div className="p-3 bg-[#0b1424] border-b border-slate-800 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topics (e.g. mess, bonafide, ID, tracking)..."
                value={kbSearchTerm}
                onChange={(e) => setKbSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#080e1a] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              {kbSearchTerm && (
                <button
                  onClick={() => setKbSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
              {[
                { id: 'all', label: 'All Topics' },
                { id: 'verified', label: 'Verified Only' },
                { id: 'unverified', label: 'Provisional/Placeholders' },
                { id: 'sensitive', label: 'Safety & Helplines' },
                { id: 'mess', label: 'Food & Mess' },
                { id: 'admin', label: 'Administration' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedTopicFilter(f.id)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedTopicFilter === f.id
                      ? 'bg-blue-600 text-white border-blue-400 font-bold'
                      : 'bg-[#080e1a] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Knowledge Entries */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredKbEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No knowledge base topics match your search.</p>
                <button
                  onClick={() => { setKbSearchTerm(''); setSelectedTopicFilter('all'); }}
                  className="text-xs text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredKbEntries.map(entry => (
                <div
                  key={entry.id}
                  className="p-3 bg-[#0b1424] rounded-xl border border-slate-800 shadow-xs space-y-2 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {entry.question}
                      </h5>
                      <p className="text-[10px] text-blue-400 font-medium">
                        Topic: {entry.topic}
                      </p>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${
                      entry.sensitive
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : entry.verified
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {entry.sensitive ? 'Sensitive' : entry.verified ? 'Verified' : 'Placeholder'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {entry.answer}
                  </p>

                  {!entry.verified && (
                    <p className="text-[9px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/60">
                      ⚠️ MITS details are placeholders pending final administrative confirmation.
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setActiveWidgetTab('chat');
                        handleQuickChip(entry.question);
                      }}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ask in chat</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>

                    {entry.action && (
                      <button
                        onClick={() => handleExecuteAction(entry.action, entry.suggestedCategory)}
                        className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {entry.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Safety Policy Modal Dialog */}
      {showSafetyModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b1424] rounded-2xl p-4 max-w-sm w-full shadow-2xl border border-slate-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider">
                <Info className="w-4 h-4 text-blue-400" />
                <span>GMS Assistant Guidelines</span>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-white">
                {KNOWLEDGE_BASE.safetyNotice}
              </p>
              <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-200 text-[11px] space-y-1 border border-amber-800/60">
                <p className="font-bold flex items-center gap-1 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  College Verification Notice
                </p>
                <p>
                  Entries with <code>verified: false</code> contain MITS-specific details that are placeholders and must be verified by designated administrative officers before final launch.
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                For formal complaints, please lodge a grievance using the portal so it is assigned a cryptographic audit tracking code.
              </p>
            </div>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-md"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
