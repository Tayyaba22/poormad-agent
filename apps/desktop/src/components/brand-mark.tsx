import { cn } from '@/lib/utils'

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

// PoorMad brand mark: the pixel moon (🌑) — the project's identity, distinct
// from the upstream Hermes "girl" mark. Rendered on a transparent tile so it
// sits on any surface (space-black or light) without a foreign white box.
export function BrandMark({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md',
        className
      )}
      {...props}
    >
      <img alt="" className="size-full object-contain" src={assetPath('poormad.png')} />
    </span>
  )
}
