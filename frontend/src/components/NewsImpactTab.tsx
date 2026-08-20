import React from 'react';
import { NewsItem } from '../types/stock';
import { Newspaper, Star, AlertTriangle, CheckCircle } from 'lucide-react';

interface NewsImpactTabProps {
  newsList: NewsItem[];
}

export const NewsImpactTab: React.FC<NewsImpactTabProps> = ({ newsList }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-5 h-5 text-blue-400" />
        <h3 className="text-base font-bold text-white">최근 3개월 핵심 뉴스 및 공시 영향 분석</h3>
      </div>

      <div className="space-y-3">
        {newsList.map((item, idx) => (
          <div key={idx} className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3 text-xs shadow">
            {/* Header: Title + Star rating + Type Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-700 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    item.type === '호재' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {item.type}
                </span>
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-mono text-sm tracking-widest">{item.importance}</span>
                <span className="text-gray-500 text-[11px] font-mono">{item.date}</span>
              </div>
            </div>

            {/* Impact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-dark-900/60 p-3 rounded-lg border border-dark-700/60">
              <div>
                <span className="text-gray-400 font-medium block">단기 주가 영향</span>
                <span className="text-gray-200 mt-0.5 block font-semibold">{item.short_term_impact}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">장기 실적 영향</span>
                <span className="text-gray-200 mt-0.5 block font-semibold">{item.long_term_impact}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">신뢰도 평가</span>
                <span className="text-blue-400 mt-0.5 block font-semibold">{item.reliability}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
