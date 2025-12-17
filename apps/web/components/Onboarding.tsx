"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { XIcon, SparklesIcon, YouTubeIcon, NotesIcon, SearchIcon } from "./Icons";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
};

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Notely! 👋",
    description: "Transform YouTube videos into smart notes. Let's get you started with a quick tour.",
    icon: <SparklesIcon className="w-8 h-8" />,
  },
  {
    id: "youtube",
    title: "YouTube to Notes",
    description: "Paste any YouTube URL to extract transcripts and generate AI-powered summaries with timestamps.",
    icon: <YouTubeIcon className="w-8 h-8" />,
    action: {
      label: "Try YouTube Notes",
      href: "/youtube",
    },
  },
  {
    id: "notes",
    title: "Create Notes",
    description: "Write notes manually, organize with tags, and use AI to enhance your content.",
    icon: <NotesIcon className="w-8 h-8" />,
    action: {
      label: "Create Note",
      href: "/notes/new",
    },
  },
  {
    id: "ai",
    title: "AI Generation",
    description: "Generate notes from prompts using AI. Perfect for brainstorming and idea capture.",
    icon: <SparklesIcon className="w-8 h-8" />,
  },
  {
    id: "search",
    title: "Quick Search",
    description: "Press Cmd+K (or Ctrl+K) to search across all your notes, tags, and content instantly.",
    icon: <SearchIcon className="w-8 h-8" />,
  },
];

export function Onboarding({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean; 
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  // Check if onboarding was already completed
  useEffect(() => {
    const completed = localStorage.getItem("onboarding-completed");
    if (completed === "true") {
      setIsDismissed(true);
      onComplete();
    }
  }, [onComplete]);

  if (isDismissed || !isVisible) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsDismissed(true);
    onComplete();
  };

  const handleAction = () => {
    if (step.action) {
      handleComplete();
      router.push(step.action.href);
    }
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">
                    {step.title}
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Skip onboarding"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-[var(--color-text)] mb-6">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-2 mb-6 justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-[var(--color-primary)]"
                      : index < currentStep
                      ? "w-2 bg-[var(--color-primary)]/50"
                      : "w-2 bg-[var(--color-border)]"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {step.action && (
                <button
                  onClick={handleAction}
                  className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  {step.action.label}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-bg)] transition-colors"
              >
                {isLastStep ? "Get Started" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

