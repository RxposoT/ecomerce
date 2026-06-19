import { Header } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { MobileNav } from '@/components/store/mobile-nav'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  )
}
