"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Shield, Terminal, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Sec-Ops AI active. I have audited the ThreatLens Knowledge Graph. How can I assist in validation or automated remediation?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickPrompts = [
    "Explain the S3 Bucket leak path",
    "How to remediate the IDOR vulnerability?",
    "Show active scan parameters"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response based on queries
    setTimeout(() => {
      let aiText = "Query processed. I'm reviewing the vulnerability definitions. For specific remediation steps, select an exposure from the Mitigation panel to generate an active PR.";
      const lower = text.toLowerCase();
      
      if (lower.includes('s3') || lower.includes('bucket')) {
        aiText = "Analysis: Asset 'corp-tax-records-2026' (S3 Bucket) is exposed due to leaked AWS keys found in staging JS chunks. An attacker could bypass perimeter access controls. Remediation: rotates AWS credentials, enforces public block policies, and restricts principal access to IAM authorized servers.";
      } else if (lower.includes('idor') || lower.includes('remediate')) {
        aiText = "IDOR Remediation recommendation: Implement server-side parameter ownership validation in the Express router. Do not rely on client-supplied identifiers. Ensure authorization tokens map directly to the database row owner.";
      } else if (lower.includes('scan') || lower.includes('discovery')) {
        aiText = "Current Discovery status: Passive discovery active. Executing DNS resolver mappings. Active crawlers are scanning static JavaScript segments for hardcoded tokens and credentials.";
      }

      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-cyber-bg border border-cyber-blue/30 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,217,255,0.15)] hover:shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:border-cyber-blue/60 hover:scale-105 transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyber-blue/10 to-cyber-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Bot className="w-6 h-6 text-cyber-blue group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyber-green border border-cyber-bg"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[500px] rounded-xl glass-panel border border-cyber-blue/30 shadow-[0_10px_30px_rgba(5,8,22,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="px-4 py-3 bg-cyber-sec/80 border-b border-cyber-border/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyber-blue animate-pulse" />
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white">ThreatLens AI Analyst</h4>
                <p className="text-[9px] text-cyber-green font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping"></span>
                  ONLINE | COGNITIVE MODEL ACTIVE
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#050816]/40 cyber-grid">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-cyber-blue/15 border border-cyber-blue/30 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5 text-cyber-blue" />
                  </div>
                )}
                <div>
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed font-mono ${
                      msg.sender === 'user'
                        ? 'bg-cyber-blue/10 border border-cyber-blue/30 text-white rounded-tr-none'
                        : 'bg-slate-900/90 border border-cyber-border/50 text-slate-300 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono mt-1 block px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-cyber-blue/15 border border-cyber-blue/30 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-cyber-blue" />
                </div>
                <div className="bg-slate-900/90 border border-cyber-border/50 p-3 rounded-lg rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-cyber-border/20 bg-cyber-sec/40 flex flex-wrap gap-1.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-[9px] font-mono bg-cyber-bg border border-cyber-border/60 text-slate-400 hover:text-cyber-blue hover:border-cyber-blue/50 px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1"
              >
                {p} <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-cyber-border/40 bg-cyber-sec/80 flex gap-2">
            <input
              type="text"
              placeholder="Ask Sec-Ops AI..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              className="flex-1 bg-cyber-bg border border-cyber-border/60 rounded px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyber-blue/60"
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/40 text-cyber-blue hover:text-white px-3 rounded flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
