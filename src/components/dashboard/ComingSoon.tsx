'use client'

import React from 'react'

interface ComingSoonProps {
    title: string
    description?: string
    icon?: string
}

export function ComingSoon({
    title,
    description = "We're currently perfecting this module. Check back soon for exciting new features designed to elevate your training experience.",
    icon = "construction"
}: ComingSoonProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[60vh]">
            <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-bm-maroon to-bm-maroon-dark flex items-center justify-center shadow-premium transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl text-bm-gold">
                            {icon}
                        </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-bm-gold flex items-center justify-center shadow-md animate-bounce">
                        <span className="material-symbols-outlined text-bm-maroon text-sm">bolt</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        {title} <span className="text-bm-maroon italic">Coming Soon</span>
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button className="px-6 py-2.5 bg-bm-maroon text-white font-bold rounded-xl shadow-md hover:bg-bm-maroon-dark hover:shadow-lg transition-all text-xs flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                        Notify Me
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-bm-maroon/30 transition-all text-xs"
                    >
                        Go Back
                    </button>
                </div>

                <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-bm-maroon">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bm-maroon opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-bm-maroon"></span>
                                </span>
                                Development
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                            <p className="text-xs font-semibold text-slate-700">High</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
