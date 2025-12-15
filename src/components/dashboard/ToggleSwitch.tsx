'use client'

interface ToggleSwitchProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleSwitch({ id, label, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-bm-text-primary" htmlFor={id}>
        {label}
      </label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          checked={checked}
          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-bm-maroon"
          id={id}
          name={id}
          type="checkbox"
          onChange={(e) => onChange(e.target.checked)}
        />
        <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer" htmlFor={id}></label>
      </div>
    </div>
  )
}

