import { HospitalSidebar } from '@/components/layout/sidebar'
import { RoleProvider } from '@/context/role-context'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <HospitalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </RoleProvider>
  )
}
