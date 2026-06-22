import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { SpotCheck } from '@/types'
import {
  ClipboardCheck,
  Headphones,
  CheckCircle2,
  XCircle,
  Camera,
  ChevronDown,
  Filter,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

type ResultFilter = '全部' | '合规' | '不合规' | '待关注'

const resultConfig: Record<string, { label: string; bg: string; text: string }> = {
  pass: { label: '合规', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  fail: { label: '不合规', bg: 'bg-red-100', text: 'text-red-600' },
  warning: { label: '待关注', bg: 'bg-amber-100', text: 'text-amber-600' },
}

export default function SpotCheck() {
  const spotchecks = useAppStore((s) => s.spotchecks)
  const createSpotCheckAnomaly = useAppStore((s) => s.createSpotCheckAnomaly)

  const [resultFilter, setResultFilter] = useState<ResultFilter>('全部')
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState('全部')
  const [justCreatedAnomaly, setJustCreatedAnomaly] = useState<string | null>(null)

  const stores = ['全部', ...Array.from(new Set(spotchecks.map((s) => s.storeName)))]

  const filtered = spotchecks.filter((s) => {
    if (resultFilter !== '全部' && resultConfig[s.result]?.label !== resultFilter) return false
    if (storeFilter !== '全部' && s.storeName !== storeFilter) return false
    return true
  })

  const handleCreateAnomaly = (check: SpotCheck) => {
    const newAnomaly = createSpotCheckAnomaly(check.id)
    if (newAnomaly) {
      setJustCreatedAnomaly(newAnomaly.id)
      setTimeout(() => setJustCreatedAnomaly(null), 3000)
    }
  }

  const resultButtons: ResultFilter[] = ['全部', '合规', '不合规', '待关注']

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 font-['Noto_Sans_SC']">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-[#4A9EFF]" />
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">抽查记录</h1>
            <p className="text-sm text-[#1B2A4A]/60">质控抽查证据与结论记录</p>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#1B2A4A]/50" />
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#1B2A4A]"
          >
            {stores.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {resultButtons.map((b) => (
            <button
              key={b}
              onClick={() => setResultFilter(b)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                resultFilter === b
                  ? 'bg-[#4A9EFF] text-white'
                  : 'bg-gray-100 text-[#1B2A4A]/70 hover:bg-gray-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-[#1B2A4A]/50">近30天</span>
      </div>

      <div className="grid gap-4">
        {filtered.map((check) => {
          const cfg = resultConfig[check.result]
          const expanded = selectedCheck === check.id
          return (
            <div
              key={check.id}
              onClick={() => setSelectedCheck(expanded ? null : check.id)}
              className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="font-['DM_Mono'] text-sm text-[#1B2A4A]/60">{check.date}</span>
                  <span className="text-sm font-medium text-[#1B2A4A]">{check.storeName}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-[#1B2A4A]/40 transition ${expanded ? 'rotate-180' : ''}`}
                />
              </div>

              <div className="mt-3 flex gap-6 text-sm text-[#1B2A4A]/70">
                <span>咨询师：{check.assistantName}</span>
                <span>项目：{check.projectName}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(expanded ? check.photos : check.photos.slice(0, 4)).map((photo, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg">
                    <img
                      src={photo.url}
                      alt={photo.caption || `证据${i + 1}`}
                      className={`object-cover transition hover:scale-105 ${
                        expanded ? 'h-40 w-40' : 'h-16 w-16'
                      }`}
                    />
                    {!expanded && check.photos.length > 4 && i === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                        +{check.photos.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <Headphones className="h-4 w-4 text-[#4A9EFF]" />
                <span className="text-[#1B2A4A]/70">
                  {expanded ? check.audioSummary : check.audioSummary.slice(0, 40) + '…'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                {check.signatureConfirmed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={check.signatureConfirmed ? 'text-emerald-600' : 'text-red-400'}>
                  {check.signatureConfirmed ? '已签名' : '未签名'}
                </span>
                <Camera className="ml-4 h-4 w-4 text-[#1B2A4A]/30" />
                <span className="text-[#1B2A4A]/50">{check.photos.length}张</span>
              </div>

              {expanded && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[#1B2A4A]/60 mb-1">备注</p>
                    <p className="text-sm leading-relaxed text-[#1B2A4A]/70">{check.notes}</p>
                  </div>
                  {(check.result === 'fail' || check.result === 'warning') && (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-700">
                          {check.result === 'fail' ? '检查不合规，请发起整改' : '存在待关注问题，建议发起整改'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCreateAnomaly(check) }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                      >
                        发起整改 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {justCreatedAnomaly && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      整改任务已创建，可在异常闭环模块查看
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#1B2A4A]/40">暂无匹配的抽查记录</div>
        )}
      </div>
    </div>
  )
}
