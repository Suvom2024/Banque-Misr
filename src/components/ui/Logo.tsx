import Image from 'next/image'

export function Logo() {
  return (
      <Image
        src="/logo.png"
        alt="Banque Misr"
        width={140}
        height={47}
        className="h-12 md:h-14 w-auto object-contain"
        priority
        unoptimized
      />
  )
}

