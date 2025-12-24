'use client'

interface ScenarioStudioHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  lastSaved?: string
}

export function ScenarioStudioHeader({
  userName,
  userRole = 'Administrator',
  userAvatar,
  lastSaved = '2 mins ago',
}: ScenarioStudioHeaderProps) {
  return (
    <header className="bg-bm-white border-b border-bm-grey shadow-sm z-10 flex-shrink-0">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 min-w-0 max-w-[40%]">
            <button className="text-bm-text-secondary hover:text-bm-maroon transition-colors p-1.5 rounded-full hover:bg-bm-light-grey flex-shrink-0">
              <span className="material-symbols-outlined text-base lg:text-lg">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-bm-text-primary tracking-tight truncate">Scenario Creator Studio</h1>
              <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-bm-text-secondary font-medium">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 flex-shrink-0">Draft</span>
                <span className="truncate">Last saved {lastSaved}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative flex-shrink-0"
                title="Version History"
              >
                <span className="material-symbols-outlined text-base lg:text-lg">history</span>
              </button>
              <button
                className="p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative flex-shrink-0"
                title="Collaborators"
              >
                <span className="material-symbols-outlined text-base lg:text-lg">group_add</span>
              </button>
              <button className="relative p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-base lg:text-lg">notifications</span>
                <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon border-2 border-bm-white"></span>
              </button>
            </div>
            <div className="h-5 lg:h-6 w-px bg-bm-grey mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2 lg:gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs lg:text-sm text-bm-text-primary leading-tight truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] lg:text-xs text-bm-text-secondary truncate">{userRole}</p>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

