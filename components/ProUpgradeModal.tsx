'use client';

/**
 * ProUpgradeModal
 * Reusable PRO upgrade modal. Can be triggered from anywhere in the app
 * by passing isOpen=true and the feature the user was trying to access.
 * Embeds <MpesaPayment> once the user clicks "Upgrade with M-Pesa".
 */

import { useState } from 'react';
import { X, CheckCircle2, Star, Zap, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MpesaPayment from './MpesaPayment';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Short description of what the user was trying to unlock, e.g. "your Career Report PDF" */
  triggerFeature: string;
  /** Optional callback after a successful payment — lets callers proceed with the action */
  onSuccess?: () => void;
}

const PRO_BENEFITS = [
  'Unlimited Career Matcher results (50+ matches)',
  'Download personalised Career Report PDF',
  'Save & compare up to 4 careers side-by-side',
  'University guide per career (UoN, JKUAT, Strathmore & more)',
  'Visual Career Roadmap — CBC to employment',
  'AI-powered Career Counselor chatbot',
];

export default function ProUpgradeModal({
  isOpen,
  onClose,
  triggerFeature,
  onSuccess,
}: ProUpgradeModalProps) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [showPayment, setShowPayment] = useState(false);

  function handleClose() {
    setShowPayment(false);
    onClose();
  }

  function handleSuccess() {
    setShowPayment(false);
    onClose();
    onSuccess?.();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Gradient header */}
            <div
              className="relative px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #004400, #006600)' }}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close upgrade modal"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl" style={{ background: '#F59E0B' }}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-black text-amber-300 uppercase tracking-widest">
                  TAFUTA PRO
                </span>
              </div>

              <h2 className="text-xl font-black text-white leading-snug">
                Unlock {triggerFeature}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Upgrade to access all premium career guidance features
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {!showPayment ? (
                <>
                  {/* Top 3 benefits */}
                  <ul className="space-y-2.5">
                    {PRO_BENEFITS.slice(0, 3).map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-200">{benefit}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2.5 text-sm text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>+ {PRO_BENEFITS.length - 3} more features</span>
                    </li>
                  </ul>

                  {/* Pricing toggle */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex gap-2">
                      {(['monthly', 'annual'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlan(p)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            plan === p
                              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          {p === 'monthly' ? 'Monthly' : 'Annual'}
                          {p === 'annual' && (
                            <span
                              className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                              style={{ background: '#F59E0B' }}
                            >
                              -58%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                        KSH {plan === 'monthly' ? '199' : '999'}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">
                        /{plan === 'monthly' ? 'month' : 'year'}
                      </span>
                      {plan === 'annual' && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                          Save KSH 1,389 vs monthly billing
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => setShowPayment(true)}
                    className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                    style={{ background: '#006600' }}
                  >
                    <Zap className="w-5 h-5" />
                    Upgrade with M-Pesa
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    Maybe later
                  </button>
                </>
              ) : (
                <MpesaPayment
                  plan={plan}
                  onSuccess={handleSuccess}
                  onCancel={() => setShowPayment(false)}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
