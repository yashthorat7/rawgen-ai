"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is Codex?",
    answer: "Codex is an all-in-one platform for developers to showcase their coding journey, skills, projects, and achievements to recruiters and the wider tech community. It helps you create a comprehensive profile that highlights your technical expertise and experience."
  },
  {
    question: "How do I add my coding profiles?",
    answer: "You can connect your profiles from popular platforms like LeetCode, CodeChef, Codeforces, and GeeksforGeeks. Just navigate to your dashboard, find the profiles section, and click the add button to link your accounts."
  },
  {
    question: "Can recruiters find me on Codex?",
    answer: "Yes! Recruiters can search for developers by skills, projects, or platforms. Make sure to complete your profile with relevant technologies and showcase your best projects to increase visibility."
  },
  {
    question: "How do I showcase my projects?",
    answer: "In your dashboard, navigate to the Projects section and click the add button. You can add project details, including title, description, tech stack, repository link, and even deployment links. Adding images will make your projects stand out."
  },
  {
    question: "Is Codex free to use?",
    answer: "Yes, Codex is completely free for developers to create and maintain their profiles. Create an account today to start showcasing your coding journey!"
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={cn(
              "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200",
              openIndex === index ? "bg-blue-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"
            )}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="flex justify-between items-center w-full p-5 text-left focus:outline-none"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-200",
                  openIndex === index ? "transform rotate-180" : ""
                )}
              />
            </button>
            
            <div 
              className={cn(
                "transition-all duration-200 ease-in-out overflow-hidden",
                openIndex === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-5 pt-0 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 