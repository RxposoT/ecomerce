'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  alt_text: string | null
  sort_order: number | null
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[]
  productName: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const current = sorted[selectedIndex]

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  if (!current) {
    return (
      <div className="aspect-[4/5] bg-muted/20 rounded-3xl flex items-center justify-center border border-border/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <svg className="size-16 opacity-20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span className="text-sm">Sem imagem</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={cn(
          'aspect-[4/5] bg-muted/20 rounded-3xl overflow-hidden border border-border/30 cursor-crosshair relative',
          zoomed && 'rounded-3xl'
        )}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={current.url}
          alt={current.alt_text || productName}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            zoomed && 'scale-150'
          )}
          style={
            zoomed
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : undefined
          }
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                'size-16 md:size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                i === selectedIndex
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-border/30 hover:border-border/60 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={img.url}
                alt={img.alt_text || `${productName} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
