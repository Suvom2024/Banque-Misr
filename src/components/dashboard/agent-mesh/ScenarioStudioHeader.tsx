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
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <button className="text-bm-text-secondary hover:text-bm-maroon transition-colors p-2 rounded-full hover:bg-bm-light-grey">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-bm-text-primary tracking-tight">Scenario Creator Studio</h1>
              <div className="flex items-center gap-2 text-xs text-bm-text-secondary font-medium">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Draft Mode</span>
                <span>Last saved {lastSaved}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative"
                title="Version History"
              >
                <span className="material-symbols-outlined">history</span>
              </button>
              <button
                className="p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative"
                title="Collaborators"
              >
                <span className="material-symbols-outlined">group_add</span>
              </button>
              <button className="relative p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-bm-maroon border-2 border-bm-white"></span>
              </button>
            </div>
            <div className="h-8 w-px bg-bm-grey mx-2"></div>
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-bm-text-primary leading-tight">{userName}</p>
                <p className="text-xs text-bm-text-secondary">{userRole}</p>
              </div>
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-bm-maroon shadow-sm"
                  src={userAvatar}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-maroon shadow-sm">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

