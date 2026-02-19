import Navbar from '@/components/Navbar'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
