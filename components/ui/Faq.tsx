"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is RawGen AI?",
    answer:
      "RawGen AI is a platform that helps you showcase your competitive programming achievements across multiple platforms. It automatically fetches and analyzes your data, providing beautiful visualizations and AI-powered insights to help you improve your skills and connect with recruiters.",
  },
  {
    question: "How does RawGen AI work?",
    answer:
      "RawGen AI connects to your competitive programming platform profiles (LeetCode, CodeChef, etc.) and automatically fetches your data. It then analyzes your performance, creates beautiful visualizations, and provides AI-powered insights to help you improve. You can also build a professional portfolio to showcase your skills to recruiters.",
  },
  {
    question: "Which platforms does RawGen AI support?",
    answer:
      "RawGen AI currently supports LeetCode, CodeChef, GeeksForGeeks, and Codeforces. We're constantly working to add support for more platforms to help you showcase your achievements from all your competitive programming activities.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security very seriously. We use industry-standard encryption and security measures to protect your data. We only access the data you explicitly allow us to, and you have full control over what information is shared with recruiters.",
  },
  {
    question: "How does the AI-powered insights work?",
    answer:
      "Our AI analyzes your problem-solving patterns, identifies your strengths and areas for improvement, and provides personalized recommendations. It looks at factors like problem difficulty, topics, and your solving speed to give you actionable insights to improve your skills.",
  },
  {
    question: "Can recruiters find me on RawGen AI?",
    answer:
      "Yes! Recruiters can search for candidates based on their skills, experience, and achievements. You can control your profile visibility and choose what information to share. Many top companies use RawGen AI to find talented competitive programmers.",
  },
];

const FaqItem = ({ question, answer }: FaqItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-primary-100 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-primary-600" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 text-gray-600">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FaqAccordion = () => {
  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <FaqItem key={index} {...item} />
      ))}
    </div>
  );
};
