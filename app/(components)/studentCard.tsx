import Link from "next/link"
import StatusDot from "./statusDot"
import { Phone, Mail, Fingerprint, CalendarClock, User, Clock } from "lucide-react"

const StudentCard = ({ 
  name, membershipType, status, subscriptionEndDate, id, phoneNumber, email, fingerprintId 
}: {
  id: string,
  name: string,
  membershipType: string,
  status: 'Active' | 'Expired' | 'Suspended',
  subscriptionEndDate: string,
  phoneNumber?: string,
  email?: string,
  fingerprintId?: number
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50 ring-green-500/30'
      case 'Expired': return 'text-red-700 bg-red-50 ring-red-500/30'
      case 'Suspended': return 'text-amber-700 bg-amber-50 ring-amber-500/30'
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/30'
    }
  }

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'text-purple-700 bg-purple-50 ring-purple-500/30'
      case 'Basic': return 'text-blue-700 bg-blue-50 ring-blue-500/30'
      case 'Student': return 'text-emerald-700 bg-emerald-50 ring-emerald-500/30'
      case 'Couple': return 'text-pink-700 bg-pink-50 ring-pink-500/30'
      default: return 'text-gray-700 bg-gray-50 ring-gray-500/30'
    }
  }

  const calculateDaysRemaining = (endDate: string | number) => {
    const end = new Date(endDate).getTime()
    const now = Date.now()
    const diff = end - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = calculateDaysRemaining(subscriptionEndDate)

  return (
    <Link href={`./students/${id}`} className="block h-full outline-none group">
      <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-red-400 opacity-90" />

        <div className="flex h-full flex-col">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/80 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold leading-tight tracking-tight text-slate-800 transition-colors group-hover:text-orange-600">
                    {name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${getMembershipColor(membershipType)}`}>
                      {membershipType}
                    </span>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-0.5">
                <StatusDot status={status} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
              {phoneNumber && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200/80">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-[15px] font-medium">{phoneNumber}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200/80">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-[15px] font-medium">{email}</span>
                </div>
              )}
              {fingerprintId !== undefined && fingerprintId !== null && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200/80">
                    <Fingerprint className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[15px] font-semibold text-slate-700">ID: {fingerprintId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${daysRemaining >= 0 ? 'bg-slate-50 text-slate-600' : 'bg-rose-50 text-red-600 font-semibold'}`}>
              {daysRemaining >= 0 ? (
                <>
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  <span>
                    Ends in <strong className="text-slate-900 mx-0.5">{daysRemaining}</strong> days
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>
                    Expired <strong className="mx-0.5">{Math.abs(daysRemaining)}</strong> days ago
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default StudentCard
