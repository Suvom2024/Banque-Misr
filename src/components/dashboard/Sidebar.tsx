'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

type ActiveItem = 'dashboard' | 'training-hub' | 'development-goals' | 'analytics' | 'history' | 'integrations' | 'settings' | 'agent-mesh'

interface SidebarProps {
  activeItem?: ActiveItem
}

export function Sidebar({ activeItem = 'dashboard' }: SidebarProps) {
  // #region agent log
  useEffect(() => {
    const checkIconStyles = () => {
      const iconElements = document.querySelectorAll('.material-symbols-outlined');
      if (iconElements.length > 0) {
        const firstIcon = iconElements[0] as HTMLElement;
        const computedStyle = window.getComputedStyle(firstIcon);
        const fontFamily = computedStyle.fontFamily;
        const fontSize = computedStyle.fontSize;
        const fontWeight = computedStyle.fontWeight;
        const textContent = firstIcon.textContent;
        
        fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Sidebar.tsx:useEffect',message:'Icon element computed styles check',data:{iconCount:iconElements.length,fontFamily,fontSize,fontWeight,textContent,hasMaterialSymbolsInFont:fontFamily.includes('Material Symbols')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      } else {
        fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Sidebar.tsx:useEffect',message:'No icon elements found',data:{iconCount:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
    };
    
    // Check immediately and after a delay
    setTimeout(checkIconStyles, 100);
    setTimeout(checkIconStyles, 1000);
  }, []);
  // #endregion agent log
  
  const getLinkClass = (item: ActiveItem) => {
    const baseClass = 'sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium group'
    if (activeItem === item) {
      return `${baseClass} active font-bold`
    }
    return `${baseClass} text-bm-white/90`
  }

  const getIconClass = (item: ActiveItem) => {
    if (activeItem === item) {
      return 'material-symbols-outlined text-[22px] text-bm-white/80'
    }
    return 'material-symbols-outlined text-[22px] text-bm-white/80'
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-bm-maroon text-bm-white flex flex-col h-full shadow-2xl z-20 overflow-hidden">
      {/* Logo Section */}
      <div className="h-20 flex-shrink-0 flex items-center justify-center px-6 border-b border-bm-maroon-dark/30">
        <Image
          src="/logo.png"
          alt="Banque Misr"
          width={180}
          height={60}
          className="h-14 w-auto object-contain"
          priority
          quality={85}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow min-h-0 p-3 space-y-0.5">
        <div className="px-3 py-1.5 text-xs font-bold text-bm-white/50 uppercase tracking-wider">Main Menu</div>
        <Link className={getLinkClass('dashboard')} href="/dashboard">
          <span className={getIconClass('dashboard')}>dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link className={getLinkClass('training-hub')} href="/training-hub">
          <span className={getIconClass('training-hub')}>model_training</span>
          <span>Training Hub</span>
        </Link>
        <Link className={getLinkClass('agent-mesh')} href="/agent-mesh/orchestrator">
          <span className={getIconClass('agent-mesh')}>account_tree</span>
          <span>Agent Mesh</span>
        </Link>
        <Link className={getLinkClass('development-goals')} href="/development-goals">
          <span className={getIconClass('development-goals')}>flag</span>
          <span>My Development</span>
        </Link>
        <Link className={getLinkClass('analytics')} href="/analytics">
          <span className={getIconClass('analytics')}>query_stats</span>
          <span>Analytics</span>
        </Link>
        <Link className={getLinkClass('integrations')} href="/integrations">
          <span className={getIconClass('integrations')}>extension</span>
          <span>Integrations</span>
        </Link>
        <Link className={getLinkClass('history')} href="#">
          <span className={getIconClass('history')}>history_edu</span>
          <span>History</span>
        </Link>
        <div className="px-3 py-1.5 mt-4 text-xs font-bold text-bm-white/50 uppercase tracking-wider">System</div>
        <Link className={getLinkClass('settings')} href="#">
          <span className={getIconClass('settings')}>settings</span>
          <span>Settings</span>
        </Link>
      </nav>

      {/* AI Assistant Section (for analytics) or Other Sections */}
      {activeItem === 'analytics' ? (
        <div className="flex-shrink-0 p-4 border-t border-bm-maroon-dark/30">
          <div className="p-3 rounded-xl bg-gradient-to-br from-bm-maroon-dark to-bm-maroon shadow-inner border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-bm-gold text-xl">neurology</span>
              <span className="font-bold text-xs">AI Assistant</span>
            </div>
            <p className="text-[10px] text-bm-white/80 leading-relaxed mb-2">Need help interpreting the data? Ask our AI assistant.</p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg transition-colors border border-white/10">
              Ask Question
            </button>
          </div>
        </div>
      ) : activeItem === 'development-goals' ? (
        <div className="flex-shrink-0 p-6 border-t border-bm-maroon-dark/50">
          <div className="p-5 rounded-xl bg-gradient-to-br from-bm-maroon-dark to-[#4a0f16] border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 p-2 rounded-full">
                <span className="material-symbols-outlined text-bm-gold text-xl">psychology</span>
              </div>
              <h3 className="font-semibold text-bm-white text-sm">AI Coach</h3>
            </div>
            <p className="text-xs text-bm-white/60 mb-4 leading-relaxed">Stuck on a goal? Ask your AI coach for personalized tips.</p>
            <button className="w-full bg-white/5 hover:bg-white/10 text-bm-gold text-xs font-bold py-2.5 px-4 rounded-lg transition-colors border border-bm-gold/20">
              Ask Coach
            </button>
          </div>
        </div>
      ) : activeItem === 'integrations' ? (
        <div className="flex-shrink-0 p-3 border-t border-bm-maroon-dark/50">
          <div className="p-3 rounded-lg bg-bm-maroon-dark/40">
            <h3 className="font-semibold text-bm-white mb-1 text-xs">Need Help?</h3>
            <p className="text-xs text-bm-white/70 mb-2">Our support team is here to assist with connection issues.</p>
            <button className="w-full bg-bm-gold/20 text-bm-gold font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-bm-gold/30 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 p-4 border-t border-bm-maroon-dark/50">
          <Link
            className="w-full flex items-center justify-center bg-bm-gold/20 text-bm-gold font-bold py-2.5 px-3 rounded-xl text-xs hover:bg-bm-gold/30 transition-all duration-300 border border-bm-gold/30"
            href="/training-hub/new-session"
          >
            <span className="material-symbols-outlined mr-1.5 text-lg">add_circle</span>
            New Session
          </Link>
        </div>
      )}
    </aside>
  )
}


