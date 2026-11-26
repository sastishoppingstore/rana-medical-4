import { Link, useLocation } from 'react-router-dom'
import { House, ArrowRight } from 'lucide-react'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-white text-[#17121a] flex flex-col">
      {/* top strip */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#c02736,#23244a)' }} />
      <div className="flex-1 grid place-items-center px-6 py-20">
        <div className="max-w-xl w-full text-center">
          <div
            className="mx-auto mb-8 w-20 h-20 rounded-2xl grid place-items-center text-white text-4xl font-black"
            style={{ background: 'linear-gradient(140deg,#c02736,#7e1a24)', boxShadow: '0 20px 50px -18px rgba(192,39,54,.55)' }}
          >
            404
          </div>
          <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#a02030]">Page not found</p>
          <h1 className="mt-3 font-black text-5xl sm:text-6xl leading-[0.95] tracking-tight" style={{ fontFamily: '"Archivo", Inter, sans-serif' }}>
            Yeh page
            <br />
            <span className="text-[#c02736]">nahi mila.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[#6b5b60] max-w-md mx-auto">
            The link may be broken or the page may have moved.
            <br className="hidden sm:block" />
            You were looking for:
            <span className="mt-2 block font-mono text-[13px] bg-[#fdeef0] border border-[#ecd6d9] rounded-lg px-3 py-2 text-[#8f1d28] truncate">{pathname}</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#c02736] text-white font-semibold px-6 py-3.5 rounded-xl hover:-translate-y-0.5 transition shadow-[0_12px_30px_-10px_rgba(192,39,54,.6)]"
            >
              <House size={17} /> Back to home
            </Link>
            <Link
              to="/erp"
              className="inline-flex items-center gap-2 border border-[#ecd6d9] text-[#17121a] font-semibold px-6 py-3.5 rounded-xl hover:bg-[#fdeef0] transition"
            >
              Open ERP <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#ecd6d9] py-5 text-center text-xs text-[#9a8b90]">
        Rana Medical Hospital — Advanced Healthcare
      </div>
    </div>
  )
}
