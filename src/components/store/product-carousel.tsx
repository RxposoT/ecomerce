'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/stripe/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ProductCarouselProps {
  products: any[]
  title: string
  subtitle?: string
}

export function ProductCarousel({ products, title, subtitle }: ProductCarouselProps) {
  const [scrollPos, setScrollPos] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  const checkScroll = useCallback(() => {
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 10)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
  }, [container])

  useEffect(() => {
    if (!container) return
    checkScroll()
    container.addEventListener('scroll', checkScroll)
    return () => container.removeEventListener('scroll', checkScroll)
  }, [container, checkScroll])

  function scroll(dir: 'left' | 'right') {
    if (!container) return
    const amount = container.clientWidth * 0.8
    container.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[90rem] mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="size-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="size-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={setContainer}
          className="flex gap-5 overflow-x-auto px-6 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="snap-start shrink-0 w-[calc((100vw-12rem)/6)] hidden lg:block pointer-events-none" />
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/produtos/${product.slug}`}
              className="group snap-start shrink-0 w-[260px] md:w-[280px] rounded-2xl border border-border/30 bg-card overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-border/60 transition-all duration-300"
            >
              <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center overflow-hidden">
                {product.product_images?.[0] ? (
                  <img
                    src={product.product_images[0].url}
                    alt={product.product_images[0].alt_text || product.name}
                    className="object-cover w-full h-full group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center">
                      <span className="text-xl font-semibold text-muted-foreground/30">{product.name?.[0]}</span>
                    </div>
                    <span className="text-xs">Sem imagem</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                  {product.compare_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          <div className="snap-start shrink-0 w-[calc((100vw-12rem)/6)] hidden lg:block pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
