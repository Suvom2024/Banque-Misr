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
      <div className="w-full px-6 lg:px-10">
        <div className="flex items-center justify-between h-24">
          <div>
            <div className="flex items-center gap-2 text-sm text-bm-text-subtle mb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="material-symbols-outlined text-sm">chevron_right</span>}
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
            <h1 className="text-2xl font-extrabold text-bm-maroon tracking-tighter leading-tight">{title}</h1>
          </div>
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-bm-grey transition-colors text-bm-text-secondary group">
              <span className="material-symbols-outlined text-[28px] group-hover:text-bm-maroon transition-colors">
                notifications
              </span>
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-bm-maroon ring-2 ring-bm-white animate-pulse"></span>
            </button>
            <div className="h-8 w-px bg-bm-grey"></div>
            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-bm-grey ring-offset-2"
                  src={userAvatar}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-bm-grey flex items-center justify-center ring-2 ring-bm-grey ring-offset-2">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="font-bold text-sm text-bm-text-primary">{userName}</p>
                <p className="text-xs text-bm-text-secondary">{userRole}</p>
              </div>
              <span className="material-symbols-outlined text-bm-text-subtle">expand_more</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

