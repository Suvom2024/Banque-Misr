'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

type Step = 0 | 1 | 2 | 3 | 4

interface OnboardingFlowProps {
  userName: string
}

export function OnboardingFlow({ userName }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [selectedGoal, setSelectedGoal] = useState<'negotiation' | 'empathy' | 'de-escalation' | 'onboarding'>('empathy')

  const next = () => setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))
  const launchDashboard = () => router.push('/dashboard')
  const skipToDashboard = () => router.push('/dashboard')

  return (
    <div className="font-sans h-screen w-full overflow-hidden flex items-center justify-center bg-slate-900 relative selection:bg-bm-gold selection:text-bm-maroon">
      <Background />
      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-2">
      {step === 0 && <WelcomeHero userName={userName} onContinue={next} />}
      {step === 1 && <AiIntelligence onContinue={next} />}
      {step === 2 && (
        <PrimaryGoal
          selectedGoal={selectedGoal}
          onSelect={setSelectedGoal}
          onStart={next}
          onSkip={skipToDashboard}
        />
      )}
      {step === 3 && <PersonalizedInsights onContinue={next} />}
      {step === 4 && <ReadyTransformation onLaunch={launchDashboard} />}
      </div>
    </div>
  )
}

function Background() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-bm-maroon-dark via-[#4a0e16] to-slate-900 z-0">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-bm-maroon mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-bm-gold mix-blend-overlay filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-bm-maroon-light mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      <div className="absolute bottom-0 left-0 right-0 h-3/4 opacity-20 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#FFC72C"
            fillOpacity="0.2"
          ></path>
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave"
          preserveAspectRatio="none"
          style={{ animationDuration: '35s', animationDirection: 'reverse' }}
          viewBox="0 0 1440 320"
        >
          <path
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,133.3C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#ffffff"
            fillOpacity="0.05"
          ></path>
        </svg>
      </div>
    </div>
  )
}

function BrandBadge() {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 py-1 px-2 md:px-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] ring-1 ring-white/10 mb-2">
      <Image
        src="/logo.png"
        alt="Banque Misr"
        width={60}
        height={20}
        className="h-5 md:h-6 w-auto object-contain"
        priority
        unoptimized
      />
      <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase opacity-90">AI Platform</span>
    </div>
  )
}

function SmallBrand() {
  return (
    <Image
      src="/logo.png"
      alt="Banque Misr"
      width={90}
      height={30}
      className="h-7 md:h-8 w-auto object-contain mb-1.5"
      priority
      unoptimized
    />
  )
}

function WelcomeHero({ userName, onContinue }: { userName: string; onContinue: () => void }) {
  return (
    <main className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center">
      <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
        <BrandBadge />
      </div>
      <div className="mb-3 md:mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-lg">
          Welcome, <span className="text-gradient-gold">{userName}!</span>
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-slate-300 font-medium tracking-wide opacity-90 max-w-lg mx-auto">
          Your AI journey begins now.
        </p>
      </div>
      <HeroOrb />
      <div className="mb-3 md:mb-4 max-w-lg animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-white mb-1.5">Unlock unparalleled growth</h2>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
          Seamlessly interact with your personal <span className="text-bm-gold font-semibold">AI Coach</span> to elevate your skills and drive performance.
        </p>
      </div>
      <div className="w-full max-w-sm animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={onContinue}
          className="w-full relative group/btn overflow-hidden bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-extrabold py-3 md:py-3.5 px-5 md:px-6 rounded-xl shadow-[0_0_30px_rgba(255,199,44,0.3)] hover:shadow-[0_0_50px_rgba(255,199,44,0.5)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="relative z-10 text-sm md:text-base tracking-wide">Continue to Dashboard</span>
          <span className="material-symbols-outlined relative z-10 text-base md:text-lg transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
          <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-bm-gold-hover to-bm-gold transition-opacity duration-300 z-0"></div>
        </button>
        <p className="mt-3 text-[9px] md:text-[10px] text-white/30 font-medium tracking-wider uppercase">
          Secure Environment • Banque Misr
        </p>
      </div>
    </main>
  )
}

function HeroOrb() {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mb-4 md:mb-6 flex items-center justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
      <div className="absolute inset-0 bg-bm-maroon rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse-glow"></div>
      <div className="absolute inset-10 bg-bm-gold rounded-full mix-blend-overlay filter blur-[60px] opacity-20 animate-pulse"></div>
      <div className="absolute w-full h-full rounded-full border border-white/5 border-t-white/20 animate-spin-slow"></div>
      <div className="absolute w-[85%] h-[85%] rounded-full border border-white/5 border-b-bm-gold/30 animate-spin-reverse-slow"></div>
      <div className="absolute w-[120%] h-[120%] rounded-full border border-dashed border-white/5 opacity-30 animate-spin-slow" style={{ animationDuration: '40s' }}></div>
      <svg className="absolute w-full h-full z-10" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g className="animate-[spin_60s_linear_infinite]">
          <circle cx="100" cy="100" opacity="0.5" r="70" stroke="url(#paint0_radial)" strokeDasharray="2 4" strokeWidth="0.5"></circle>
          <path d="M100 30 L100 170 M30 100 L170 100" opacity="0.2" stroke="white" strokeWidth="0.2"></path>
          <path d="M50 50 L150 150 M150 50 L50 150" opacity="0.2" stroke="white" strokeWidth="0.2"></path>
          <circle className="animate-pulse" cx="100" cy="30" fill="#FFC72C" r="3"></circle>
          <circle cx="170" cy="100" fill="white" fillOpacity="0.8" r="2"></circle>
          <circle cx="100" cy="170" fill="white" fillOpacity="0.8" r="2"></circle>
          <circle className="animate-pulse" cx="30" cy="100" fill="#FFC72C" r="3" style={{ animationDelay: '1s' }}></circle>
          <circle cx="150" cy="50" fill="white" fillOpacity="0.6" r="2"></circle>
          <circle cx="50" cy="150" fill="white" fillOpacity="0.6" r="2"></circle>
          <circle cx="150" cy="150" fill="white" fillOpacity="0.6" r="2"></circle>
          <circle cx="50" cy="50" fill="white" fillOpacity="0.6" r="2"></circle>
        </g>
        <defs>
          <radialGradient cx="0" cy="0" gradientTransform="translate(100 100) rotate(90) scale(70)" gradientUnits="userSpaceOnUse" id="paint0_radial" r="1">
            <stop stopColor="#FFC72C" stopOpacity="0.8"></stop>
            <stop offset="1" stopColor="#FFC72C" stopOpacity="0"></stop>
          </radialGradient>
        </defs>
      </svg>
      <div className="relative z-20 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,199,44,0.1)] group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-bm-gold/20 to-bm-maroon/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <span
          className="material-symbols-outlined text-6xl text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}
        >
          neurology
        </span>
      </div>
    </div>
  )
}

function AiIntelligence({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="relative z-10 w-full max-w-6xl mx-4 animate-fade-in-up">
      <div className="text-center mb-2">
        <SmallBrand />
        <p className="text-bm-gold font-bold tracking-[0.2em] text-[8px] md:text-[9px] uppercase opacity-90">AI Platform</p>
      </div>
      <div className="rounded-3xl p-3 md:p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bm-maroon via-bm-gold to-bm-maroon"></div>
        <div className="text-center mb-3 md:mb-4 max-w-2xl mx-auto relative z-10">
          <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold text-white mb-1.5 tracking-tight drop-shadow-lg">Witness AI Intelligence in Action</h1>
          <p className="text-slate-300 font-medium text-[11px] md:text-xs">Real-time collaboration across our neural mesh providing instant, compliant feedback as you speak.</p>
        </div>
        <div className="relative z-10 mb-4 md:mb-5">
        <MeshCanvas />
        </div>
        <div className="flex items-center justify-center mt-4 relative z-10">
          <button
            onClick={onContinue}
            className="bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-bold py-2 px-4 md:py-2.5 md:px-5 rounded-xl shadow-lg shadow-bm-gold/20 hover:shadow-bm-gold/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group/btn overflow-hidden relative text-[11px] md:text-xs"
          >
            <span className="relative z-10">See Personalized Impact</span>
            <span className="material-symbols-outlined text-xs md:text-sm relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
          </button>
        </div>
      </div>
      <div className="mt-2 text-center text-white/30 text-[8px] md:text-[9px] font-medium tracking-wide">
        <p>© 2024 Banque Misr. All rights reserved.</p>
      </div>
    </main>
  )
}

function MeshCanvas() {
  return (
    <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] select-none bg-transparent rounded-2xl overflow-hidden">
      {/* Agentic Mesh Grid Background - Bigger and more visible */}
      <div className="absolute inset-0 opacity-40" style={{ 
        backgroundImage: `
          linear-gradient(rgba(122, 26, 37, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(122, 26, 37, 0.5) 1px, transparent 1px),
          linear-gradient(rgba(255, 199, 44, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 199, 44, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px, 60px 60px, 30px 30px, 30px 30px',
        backgroundPosition: '0 0, 0 0, 30px 30px, 30px 30px'
      }}></div>
      {/* Additional mesh pattern overlay */}
      <div className="absolute inset-0 opacity-25" style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(255, 199, 44, 0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-bm-maroon-dark/30 via-transparent to-slate-900/30"></div>
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flowGrad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#7A1A25" stopOpacity="0.2"></stop>
            <stop offset="50%" stopColor="#FFC72C" stopOpacity="0.9"></stop>
            <stop offset="100%" stopColor="#7A1A25" stopOpacity="0.2"></stop>
          </linearGradient>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#FFC72C" opacity="0.8" />
          </marker>
        </defs>
        {/* Curvy connection lines between agents */}
        <path className="animate-dash" d="M 50% 60 Q 35% 80, 20% 120" fill="none" stroke="url(#flowGrad)" strokeDasharray="8,6" strokeWidth="2" markerEnd="url(#arrowhead)"></path>
        <path className="animate-dash" d="M 50% 60 Q 65% 80, 80% 120" fill="none" stroke="url(#flowGrad)" strokeDasharray="8,6" strokeWidth="2" markerEnd="url(#arrowhead)" style={{ animationDirection: 'reverse' }}></path>
        <path className="animate-dash" d="M 20% 120 Q 25% 180, 30% 250" fill="none" stroke="url(#flowGrad)" strokeDasharray="8,6" strokeWidth="2" markerEnd="url(#arrowhead)" style={{ animationDuration: '2s' }}></path>
        <path className="animate-dash" d="M 80% 120 Q 75% 180, 70% 250" fill="none" stroke="url(#flowGrad)" strokeDasharray="8,6" strokeWidth="2" markerEnd="url(#arrowhead)" style={{ animationDuration: '4s' }}></path>
        <path className="animate-dash" d="M 20% 120 Q 50% 130, 80% 120" fill="none" opacity="0.3" stroke="rgba(255, 199, 44, 0.5)" strokeDasharray="4,4" strokeWidth="1.5" markerEnd="url(#arrowhead)" style={{ animationDuration: '5s' }}></path>
        <path className="animate-dash" d="M 30% 250 Q 50% 260, 70% 250" fill="none" opacity="0.3" stroke="rgba(255, 199, 44, 0.5)" strokeDasharray="4,4" strokeWidth="1.5" markerEnd="url(#arrowhead)" style={{ animationDuration: '6s' }}></path>
        {/* Additional curvy connections */}
        <path className="animate-dash" d="M 50% 60 Q 45% 100, 50% 140 Q 55% 180, 50% 220" fill="none" opacity="0.2" stroke="rgba(255, 199, 44, 0.4)" strokeDasharray="6,4" strokeWidth="1" style={{ animationDuration: '7s' }}></path>
        <circle className="animate-ping-slow" cx="50%" cy="60" fill="#7A1A25" opacity="0.15" r="40"></circle>
        <circle className="animate-ping-slow" cx="20%" cy="120" fill="#FFC72C" opacity="0.15" r="30" style={{ animationDelay: '1s' }}></circle>
        <circle className="animate-ping-slow" cx="80%" cy="120" fill="#FFC72C" opacity="0.15" r="30" style={{ animationDelay: '0.5s' }}></circle>
      </svg>

      {/* Main Agent Cards */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="node-card border-bm-maroon/20">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-bm-maroon/10 flex items-center justify-center mb-0.5 text-bm-maroon">
            <span className="material-symbols-outlined text-xs md:text-sm">mic</span>
          </div>
          <h3 className="text-[8px] md:text-[9px] font-bold text-slate-800">Listener</h3>
        </div>
        <div className="insight-bubble top-0 left-full ml-3" style={{ animationDelay: '0.2s' }}>
          <span className="text-bm-gold mr-1">●</span> Processing audio stream
        </div>
      </div>
      <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 animate-float">
        <div className="node-card">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-50 flex items-center justify-center mb-0.5 text-blue-600">
            <span className="material-symbols-outlined text-xs md:text-sm">lightbulb</span>
          </div>
          <h3 className="text-[8px] md:text-[9px] font-bold text-slate-800">Coaching</h3>
        </div>
        <div className="insight-bubble -top-7 left-0" style={{ animationDelay: '2.5s' }}>
          Suggestion: Show Empathy
        </div>
      </div>
      <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 animate-float-delayed">
        <div className="node-card">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-50 flex items-center justify-center mb-0.5 text-purple-600">
            <span className="material-symbols-outlined text-xs md:text-sm">face</span>
          </div>
          <h3 className="text-[8px] md:text-[9px] font-bold text-slate-800">Persona</h3>
        </div>
        <div className="insight-bubble -top-7 right-0" style={{ animationDelay: '1.5s' }}>
          Mood: Frustrated
        </div>
      </div>
      <div className="absolute top-[60%] left-[30%] -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="node-card">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-50 flex items-center justify-center mb-0.5 text-green-600">
            <span className="material-symbols-outlined text-xs md:text-sm">segment</span>
          </div>
          <h3 className="text-[8px] md:text-[9px] font-bold text-slate-800">Summarizer</h3>
        </div>
      </div>
      <div className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="node-card border-bm-gold/40 shadow-bm-gold/10">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-bm-gold/20 flex items-center justify-center mb-0.5 text-yellow-700">
            <span className="material-symbols-outlined text-xs md:text-sm">verified_user</span>
          </div>
          <h3 className="text-[8px] md:text-[9px] font-bold text-slate-800">Policy</h3>
        </div>
        <div className="insight-bubble -bottom-7 left-1/2 -translate-x-1/2" style={{ animationDelay: '3.5s' }}>
          <span className="text-green-400 mr-1">✓</span> Compliance Verified
        </div>
      </div>

      {/* Skeletal Agent Cards - Moving around with wandering animation */}
      <SkeletalAgentCard className="absolute top-[25%] left-[35%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander" delay="1s" />
      <SkeletalAgentCard className="absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander-delayed" delay="1.5s" />
      <SkeletalAgentCard className="absolute top-[45%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander" delay="2s" />
      <SkeletalAgentCard className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander-delayed" delay="2.5s" />
      <SkeletalAgentCard className="absolute top-[45%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander" delay="3s" />
      <SkeletalAgentCard className="absolute top-[70%] left-[10%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander-delayed" delay="3.5s" />
      <SkeletalAgentCard className="absolute top-[70%] left-[90%] -translate-x-1/2 -translate-y-1/2 z-5 animate-wander" delay="4s" />
    </div>
  )
}

function SkeletalAgentCard({ className, delay }: { className?: string; delay?: string }) {
  return (
    <div className={className} style={{ animationDelay: delay }}>
      <div className="flex flex-col items-center justify-center p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/20 border-dashed backdrop-blur-sm">
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/15 mb-1 animate-pulse"></div>
        <div className="h-1.5 w-10 md:w-12 bg-white/15 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

function NodeCard({
  className,
  icon,
  title,
  bubble,
  bubblePosition,
  color = 'slate',
}: {
  className?: string
  icon: string
  title: string
  bubble?: string
  bubblePosition?: 'top-left' | 'top-right' | 'left' | 'bottom'
  color?: 'slate' | 'blue' | 'purple' | 'green' | 'gold' | 'maroon'
}) {
  const colorClasses: Record<'slate' | 'blue' | 'purple' | 'green' | 'gold' | 'maroon', string> = {
    slate: 'bg-white border-slate-100 text-slate-800',
    blue: 'bg-white border-slate-100 text-slate-800',
    purple: 'bg-white border-slate-100 text-slate-800',
    green: 'bg-white border-slate-100 text-slate-800',
    gold: 'bg-white border-bm-gold/40 shadow-bm-gold/10 text-slate-800',
    maroon: 'bg-white border-bm-maroon/20 text-slate-800',
  }

  const iconColors: Record<'slate' | 'blue' | 'purple' | 'green' | 'gold' | 'maroon', string> = {
    slate: 'bg-slate-100 text-slate-500',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    gold: 'bg-bm-gold/20 text-yellow-700',
    maroon: 'bg-bm-maroon/10 text-bm-maroon',
  }

  const bubblePositions: Record<'top-left' | 'top-right' | 'left' | 'bottom', { className: string }> = {
    'top-left': { className: '-top-8 left-0' },
    'top-right': { className: '-top-8 right-0' },
    left: { className: 'top-0 left-full ml-4' },
    bottom: { className: '-bottom-8 left-1/2 -translate-x-1/2' },
  }

  return (
    <div className={className}>
      <div className={`node-card ${colorClasses[color]}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${iconColors[color]}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <h3 className="text-[10px] font-bold text-slate-800">{title}</h3>
      </div>
      {bubble && bubblePosition && (
        <div className={`insight-bubble ${bubblePositions[bubblePosition].className}`} style={{ animationDelay: '0.2s' }}>
          {bubble.startsWith('✓') ? <span className="text-green-400 mr-1">✓</span> : <span className="text-bm-gold mr-1">●</span>}
          {bubble.startsWith('✓') ? bubble.replace('✓', '').trim() : bubble}
        </div>
      )}
    </div>
  )
}

function Benefit({
  icon,
  title,
  description,
  color,
}: {
  icon: string
  title: string
  description: string
  color: 'bm-gold' | 'blue' | 'emerald'
}) {
  const colors: Record<typeof color, { bg: string; text: string; border: string }> = {
    'bm-gold': { bg: 'bg-bm-gold/20', text: 'text-bm-gold', border: 'border-bm-gold/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/30' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400/30' },
  }

  return (
    <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg transition-all duration-300">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${colors[color].bg} ${colors[color].text} flex items-center justify-center mb-2.5 border-2 ${colors[color].border}`}>
        <span className="material-symbols-outlined text-lg md:text-xl">{icon}</span>
      </div>
      <h4 className="text-sm md:text-base font-bold text-white mb-1.5 drop-shadow-md">{title}</h4>
      <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-[200px]">{description}</p>
    </div>
  )
}

function PrimaryGoal({
  selectedGoal,
  onSelect,
  onStart,
  onSkip,
}: {
  selectedGoal: 'negotiation' | 'empathy' | 'de-escalation' | 'onboarding'
  onSelect: (goal: 'negotiation' | 'empathy' | 'de-escalation' | 'onboarding') => void
  onStart: () => void
  onSkip: () => void
}) {
  return (
    <main className="relative z-10 w-full max-w-[500px] mx-4 animate-fade-in-up">
      <div className="text-center mb-3 md:mb-4">
        <Image
          src="/logo.png"
          alt="Banque Misr"
          width={180}
          height={60}
          className="h-14 md:h-16 w-auto object-contain mx-auto mb-3"
          priority
          unoptimized
        />
        <p className="text-bm-gold font-bold tracking-[0.2em] text-[8px] md:text-[9px] uppercase opacity-90">AI Voice Training Platform</p>
      </div>

      <div className="glass-panel rounded-2xl p-4 md:p-5 lg:p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bm-maroon via-bm-gold to-bm-maroon"></div>
        <div className="mb-3 text-center">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-800">What&apos;s your primary goal?</h2>
          <p className="text-slate-500 text-[11px] md:text-xs mt-0.5">Select a focus area to tailor your AI coach simulation.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
          <GoalCard
            selected={selectedGoal === 'negotiation'}
            icon="handshake"
            title="Negotiation"
            subtitle="Closing deals effectively"
            onClick={() => onSelect('negotiation')}
          />
          <GoalCard
            selected={selectedGoal === 'empathy'}
            icon="volunteer_activism"
            title="Empathy"
            subtitle="Customer connection"
            highlight
            onClick={() => onSelect('empathy')}
          />
          <GoalCard
            selected={selectedGoal === 'de-escalation'}
            icon="support_agent"
            title="De-escalation"
            subtitle="Handling conflict"
            onClick={() => onSelect('de-escalation')}
          />
          <GoalCard
            selected={selectedGoal === 'onboarding'}
            icon="school"
            title="Onboarding"
            subtitle="Platform basics"
            onClick={() => onSelect('onboarding')}
          />
        </div>

        <div className="bg-bm-gold/10 border border-bm-gold/20 rounded-xl p-2 flex items-start gap-1.5 md:gap-2 mb-3 animate-pulse">
          <span className="material-symbols-outlined text-bm-gold-hover text-sm md:text-base mt-0.5">auto_awesome</span>
          <div>
            <p className="text-[10px] md:text-[11px] font-bold text-slate-800">Excellent choice.</p>
            <p className="text-[9px] md:text-[10px] text-slate-600 leading-snug">
              {selectedGoal === 'empathy' && 'Your AI coach will prepare emotional intelligence scenarios to boost your empathy score.'}
              {selectedGoal === 'negotiation' && 'Your AI coach will prepare negotiation scenarios to enhance your deal-closing skills.'}
              {selectedGoal === 'de-escalation' && 'Your AI coach will prepare conflict resolution scenarios to improve your de-escalation techniques.'}
              {selectedGoal === 'onboarding' && 'Your AI coach will prepare foundational scenarios to help you master platform basics.'}
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-bold py-2 md:py-2.5 rounded-xl shadow-lg shadow-bm-gold/20 hover:shadow-bm-gold/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 group/btn relative overflow-hidden text-[11px] md:text-xs"
          type="button"
        >
          <span className="relative z-10">Start Training Journey</span>
          <span className="material-symbols-outlined relative z-10 text-xs md:text-sm transition-transform duration-300 group-hover/btn:translate-x-1">rocket_launch</span>
          <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
        </button>
        <div className="mt-2 text-center">
          <button className="text-[10px] md:text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors" type="button" onClick={onSkip}>
            Skip setup &amp; go to dashboard
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-white/30 text-[8px] md:text-[9px] font-medium tracking-wide">
        <p>© 2024 Banque Misr. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <a className="hover:text-bm-gold transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-bm-gold transition-colors" href="#">
            Help Center
          </a>
        </div>
      </div>
    </main>
  )
}

function GoalCard({
  selected,
  icon,
  title,
  subtitle,
  onClick,
  highlight,
}: {
  selected: boolean
  icon: string
  title: string
  subtitle: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      className={`option-card ${selected ? 'option-card-selected' : 'option-card-default'} group/card`}
      type="button"
      onClick={onClick}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-bm-maroon">
          <span className="material-symbols-outlined text-lg">check_circle</span>
        </div>
      )}
      <span className={`material-symbols-outlined text-3xl mb-2 ${highlight && selected ? 'text-bm-maroon' : 'text-slate-400'} group-hover/card:text-bm-maroon transition-colors`}>{icon}</span>
      <span className={`text-sm font-bold ${highlight && selected ? 'text-bm-maroon' : 'text-slate-700'} group-hover/card:text-bm-maroon`}>{title}</span>
      <span className={`text-[10px] mt-1 leading-tight ${highlight && selected ? 'text-bm-maroon/70' : 'text-slate-400'}`}>{subtitle}</span>
    </button>
  )
}

function PersonalizedInsights({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="relative z-10 w-full max-w-6xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
      <div className="flex-1 max-w-xl text-left">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-bm-gold/10 border border-bm-gold/20 mb-2">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bm-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-bm-gold"></span>
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-bm-gold tracking-widest uppercase">Analysis Complete</span>
          </div>
        </div>

        <div className="mb-3 md:mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-[1.15] mb-1.5 md:mb-2">
            Your AI Coach is <br />
            <span className="text-gradient-gold">Tailoring Your Path</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed max-w-lg">
            Based on your profile, we&apos;ve calibrated the simulation engine to focus on what matters most for your career growth at Banque Misr.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl p-3 md:p-4 mb-3 md:mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-[10px] md:text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-bm-gold text-xs md:text-sm">auto_awesome</span>
            Personalized Calibration
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-1.5">
              <div className="mt-0.5 p-0.5 rounded-full bg-bm-gold/20 text-bm-gold">
                <span className="material-symbols-outlined text-[9px] md:text-[10px] font-bold">check</span>
              </div>
              <div>
                <h4 className="text-white font-medium text-[11px] md:text-xs">Tailored Scenarios</h4>
                <p className="text-[9px] md:text-[10px] text-slate-400">Specific simulations for rapid skill acquisition in your role.</p>
              </div>
            </li>
            <li className="flex items-start gap-1.5">
              <div className="mt-0.5 p-0.5 rounded-full bg-bm-gold/20 text-bm-gold">
                <span className="material-symbols-outlined text-[9px] md:text-[10px] font-bold">trending_up</span>
              </div>
              <div>
                <h4 className="text-white font-medium text-[11px] md:text-xs">Accelerated Mastery</h4>
                <p className="text-[9px] md:text-[10px] text-slate-400">Proactive feedback loops designed to fast-track your goals.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onContinue}
            className="flex-1 relative group/btn overflow-hidden bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-extrabold py-2 md:py-2.5 px-4 md:px-5 rounded-xl shadow-[0_0_30px_rgba(255,199,44,0.3)] hover:shadow-[0_0_50px_rgba(255,199,44,0.5)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            <span className="relative z-10 text-xs md:text-sm tracking-wide">Continue to Insights</span>
            <span className="material-symbols-outlined relative z-10 text-sm md:text-base transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
          </button>
        </div>
      </div>

      <InsightsGraphic />
    </main>
  )
}

function InsightsGraphic() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center relative animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
      <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] mb-4 md:mb-6">
        <div className="absolute w-[120%] h-[120%] bg-bm-maroon/20 rounded-full blur-3xl animate-pulse-glow -top-[10%] -left-[10%]"></div>
        <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-8 border border-white/10 rounded-full animate-spin-reverse-slow border-dashed"></div>
        <div className="absolute inset-16 border border-bm-gold/20 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }}></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(122,26,37,0.4)] z-10">
            <div className="absolute inset-0 bg-bm-gold/5 rounded-full animate-pulse"></div>
            <span
              className="material-symbols-outlined text-4xl md:text-5xl lg:text-6xl text-bm-gold drop-shadow-[0_0_20px_rgba(255,199,44,0.6)]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}
            >
              psychology_alt
            </span>
            <div className="absolute -top-4 -right-4 bg-bm-maroon text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
              LEADERSHIP
            </div>
            <div className="absolute -bottom-2 -left-6 bg-slate-800 text-bm-gold text-[10px] font-bold px-2 py-1 rounded-md border border-bm-gold/20 shadow-lg animate-bounce" style={{ animationDelay: '0.7s' }}>
              STRATEGY
            </div>
            <div className="absolute top-1/2 -right-12 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 shadow-lg animate-bounce" style={{ animationDelay: '1.2s' }}>
              COMMUNICATION
            </div>
          </div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 500 500">
          <defs>
            <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="transparent"></stop>
              <stop offset="50%" stopColor="#FFC72C"></stop>
              <stop offset="100%" stopColor="transparent"></stop>
            </linearGradient>
          </defs>
          <path d="M250 250 L400 100" fill="none" stroke="url(#lineGrad)" strokeWidth="1"></path>
          <path d="M250 250 L100 400" fill="none" stroke="url(#lineGrad)" strokeWidth="1"></path>
          <circle cx="400" cy="100" fill="#FFC72C" r="3"></circle>
          <circle cx="100" cy="400" fill="#FFC72C" r="3"></circle>
        </svg>
      </div>

      {/* Insight box positioned below the circular graphic */}
      <div className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] relative z-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-3 md:p-4 rounded-xl border-l-4 border-l-bm-gold relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-bm-gold text-xs md:text-sm animate-spin">sync</span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating Insight...</span>
          </div>
          <p className="text-xs md:text-sm text-white/90 font-medium leading-relaxed">
            &quot;As a <span className="text-bm-gold">Branch Manager</span>, your AI will focus on advanced team leadership scenarios and conflict resolution.&quot;
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none"></div>
        </div>
      </div>
    </div>
  )
}

function ReadyTransformation({ onLaunch }: { onLaunch: () => void }) {
  return (
    <main className="relative z-10 w-full max-w-5xl px-4 md:px-6 flex flex-col items-center justify-center text-center">
      <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
        <div className="inline-flex items-center justify-center gap-1.5 py-1 px-2.5 md:px-3 rounded-full bg-bm-gold/10 backdrop-blur-md border border-bm-gold/20 shadow-[0_0_20px_rgba(255,199,44,0.1)] mb-3 md:mb-4">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-bm-gold animate-pulse"></div>
          <span className="text-[9px] md:text-[10px] font-bold text-bm-gold tracking-[0.2em] uppercase">System Optimized</span>
        </div>
      </div>

      <div className="mb-3 md:mb-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-1.5 md:mb-2 drop-shadow-2xl">
          Ready for Your <br className="hidden md:block" />
          <span className="text-gradient-gold text-shadow-glow">Professional Transformation?</span>
        </h1>
      </div>

      <FinalGraph />

      <div className="mb-4 md:mb-6 max-w-2xl animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
        <p className="text-sm md:text-base lg:text-lg text-slate-200 font-medium leading-relaxed drop-shadow-md">
          Empowering Banque Misr leaders with <br />
          <span className="text-bm-gold font-bold">AI-driven communication excellence.</span>
        </p>
      </div>

      <div className="w-full max-w-md animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={onLaunch}
          className="w-full relative group/btn overflow-hidden bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-extrabold py-2.5 md:py-3 px-5 md:px-6 rounded-2xl shadow-[0_0_30px_rgba(255,199,44,0.3)] hover:shadow-[0_0_60px_rgba(255,199,44,0.6)] transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="relative z-10 text-sm md:text-base lg:text-lg tracking-wide uppercase">Launch Dashboard</span>
          <span className="material-symbols-outlined relative z-10 text-lg md:text-xl lg:text-2xl transition-transform duration-300 group-hover/btn:rotate-45 group-hover/btn:translate-x-1">
            rocket_launch
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0"></div>
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-bm-gold-hover to-[#fdd835] transition-opacity duration-300 z-0"></div>
        </button>
        <p className="mt-2 md:mt-3 text-[9px] md:text-[10px] text-slate-400 font-medium tracking-widest uppercase opacity-60">
          Initializing Personalized Workspace...
        </p>
      </div>
    </main>
  )
}

function FinalGraph() {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 mb-3 md:mb-4 flex items-center justify-center animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
      <div className="absolute inset-0 bg-bm-maroon/60 rounded-full mix-blend-screen filter blur-[90px] opacity-50 animate-pulse-glow"></div>
      <div className="absolute inset-20 bg-bm-gold/40 rounded-full mix-blend-overlay filter blur-[70px] opacity-30 animate-pulse"></div>
      <div className="absolute w-full h-full rounded-full border border-white/5 border-t-bm-gold/20 animate-spin-slow"></div>
      <div className="absolute w-[80%] h-[80%] rounded-full border border-white/5 border-b-bm-maroon-light/50 animate-spin-reverse-slow"></div>
      <div className="absolute w-[110%] h-[110%] rounded-full border border-dashed border-white/5 opacity-20 animate-spin-slow" style={{ animationDuration: '50s' }}></div>

      <div className="relative z-20 w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 animate-float">
        <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(255,199,44,0.5)]" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 160H160" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M40 120H160" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M40 80H160" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M40 160V40" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M80 160V40" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M120 160V40" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <path d="M160 160V40" stroke="white" strokeOpacity="0.1" strokeWidth="1"></path>
          <defs>
            <linearGradient id="graphGradient" x1="40" x2="40" y1="40" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFC72C" stopOpacity="0.4"></stop>
              <stop offset="1" stopColor="#FFC72C" stopOpacity="0"></stop>
            </linearGradient>
            <linearGradient id="lineGradient" x1="40" x2="160" y1="160" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7A1A25"></stop>
              <stop offset="0.5" stopColor="#FFC72C"></stop>
              <stop offset="1" stopColor="#ffffff"></stop>
            </linearGradient>
          </defs>
          <path
            className="animate-pulse"
            d="M40 160 L40 130 C 60 125, 80 135, 100 90 C 120 45, 140 60, 160 30 V 160 Z"
            fill="url(#graphGradient)"
            opacity="0.6"
          ></path>
          <path
            className="drop-shadow-lg"
            d="M40 130 C 60 125, 80 135, 100 90 C 120 45, 140 60, 160 30"
            fill="none"
            stroke="url(#lineGradient)"
            strokeDasharray="200"
            strokeDashoffset="200"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate attributeName="stroke-dashoffset" dur="2s" from="200" to="0" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"></animate>
          </path>
          <g>
            <circle cx="40" cy="130" fill="white" r="3">
              <animate attributeName="opacity" begin="0s" dur="0.5s" fill="freeze" values="0;1"></animate>
            </circle>
            <circle cx="100" cy="90" fill="white" r="3">
              <animate attributeName="opacity" begin="1s" dur="0.5s" fill="freeze" values="0;1"></animate>
            </circle>
            <circle cx="160" cy="30" fill="#FFC72C" r="5" stroke="white" strokeWidth="2">
              <animate attributeName="r" dur="2s" repeatCount="indefinite" values="3;6;3"></animate>
              <animate attributeName="opacity" begin="1.8s" dur="0.5s" fill="freeze" values="0;1"></animate>
            </circle>
          </g>
        </svg>
      </div>

      <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '30s' }}>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
          <span className="material-symbols-outlined text-bm-gold text-lg">mic</span>
        </div>
      </div>
      <div className="absolute inset-0 animate-spin-reverse-slow" style={{ animationDuration: '40s' }}>
        <div className="absolute bottom-20 right-10 bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
          <span className="material-symbols-outlined text-bm-gold text-lg">psychology</span>
        </div>
      </div>
    </div>
  )
}

