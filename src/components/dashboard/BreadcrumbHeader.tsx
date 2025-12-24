'use client'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  userName: string
  userRole?: string
  userAvatar?: string
}

export function BreadcrumbHeader({
  breadcrumbs,
  title,
  userName,
  userRole = 'Branch Manager',
  userAvatar,
}: BreadcrumbHeaderProps) {
  return (
    <header className="bg-bm-white sticky top-0 z-20 shadow-sm border-b border-bm-grey">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 min-w-0 max-w-[50%]">
            <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-bm-text-subtle mb-0.5">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {index > 0 && <span className="material-symbols-outlined text-xs">chevron_right</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className={index === breadcrumbs.length - 1 ? 'text-bm-maroon font-semibold' : 'hover:text-bm-maroon'}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={index === breadcrumbs.length - 1 ? 'text-bm-maroon font-semibold' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight leading-tight truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-1.5 rounded-full hover:bg-bm-grey transition-colors text-bm-text-secondary group flex-shrink-0">
              <span className="material-symbols-outlined text-base lg:text-lg group-hover:text-bm-maroon transition-colors">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon ring-2 ring-bm-white animate-pulse"></span>
            </button>
            <div className="h-5 lg:h-6 w-px bg-bm-grey hidden sm:block"></div>
            {/* User Profile */}
            <div className="flex items-center gap-2 lg:gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-bm-maroon shadow-sm flex-shrink-0"
                  src={userAvatar}
                />
              ) : (
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-maroon shadow-sm flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="font-bold text-xs lg:text-sm text-bm-text-primary truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] lg:text-xs text-bm-text-secondary truncate">{userRole}</p>
              </div>
              <span className="material-symbols-outlined text-bm-text-subtle text-sm hidden lg:block">expand_more</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

