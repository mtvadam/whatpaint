import React from 'react';

type Step = {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
};

type StepIndicatorProps = {
  steps: Step[];
};

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step.status === 'completed'
                  ? 'bg-accent text-white'
                  : step.status === 'current'
                  ? 'bg-accent/30 text-accent border-2 border-accent'
                  : 'bg-card text-gray-500 border border-border'
              }`}
            >
              {step.status === 'completed' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                step.status === 'current' ? 'text-white' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${step.status === 'completed' ? 'bg-accent' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
