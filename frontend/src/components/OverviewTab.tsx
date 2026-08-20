import React from 'react';
import { MandatoryChecks } from '../types/stock';
import { CheckCircle2, Building, DollarSign, PieChart, TrendingUp, ShieldAlert, BarChart2 } from 'lucide-react';

interface OverviewTabProps {
  data: MandatoryChecks;
  stockName: string;
  stockCode: string;
  market: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, stockName, stockCode, market }) => {
  const checkItems = [
    { label: '① 현재 주가', value: data.current_price, highlight: true },
    { label: '② 시가총액', value: data.market_cap },
    { label: '③ PER', value: data.per },
    { label: '④ PBR', value: data.pbr },
    { label: '⑤ ROE', value: data.roe, highlight: true },
    { label: '⑥ 영업이익', value: data.operating_profit },
    { label: '⑦ 순이익', value: data.net_income },
    { label: '⑧ 최근 분기 실적', value: data.quarterly_result },
    { label: '⑨ 실적 컨센서스', value: data.consensus },
    { label: '⑩ 기관 매매동향', value: data.institutional_trend },
    { label: '⑪ 외국인 매매동향', value: data.foreigner_trend },
    { label: '⑫ 공매도 추이', value: data.short_selling },
    { label: '⑬ 대차잔고', value: data.securities_lending },
    { label: '⑭ 거래량 변화', value: data.volume_change },
    { label: '⑮ 최근 3개월 뉴스', value: data.recent_3m_news },
    { label: '⑯ 최근 공시', value: data.recent_filings },
    { label: '⑰ 증권사 목표주가', value: data.target_price, highlight: true },
    { label: '⑱ 애널리스트 의견', value: data.analyst_opinion },
    { label: '⑲ 산업 전망', value: data.industry_outlook },
    { label: '⑳ 경쟁사 비교', value: data.competitor_comparison },
  ];

  return (
    <div className="space-y-6">
      {/* Target Stock Overview Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-700 p-5 rounded-xl border border-dark-600 shadow-md">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">분석 대상 기본 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700/60">
            <span className="text-xs text-gray-400 block">종목명 (코드)</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{stockName} <span className="text-sm font-mono text-blue-400">({stockCode})</span></span>
          </div>
          <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700/60">
            <span className="text-xs text-gray-400 block">상장 시장</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{market}</span>
          </div>
          <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700/60">
            <span className="text-xs text-gray-400 block">현재가</span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{data.current_price}</span>
          </div>
        </div>
      </div>

      {/* 20 Mandatory Checklist Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-bold text-white">반드시 확인할 20가지 최신 조사 데이터</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checkItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                item.highlight
                  ? 'bg-blue-950/20 border-blue-500/30'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className="text-gray-400 font-medium mb-1 flex items-center justify-between">
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-semibold">
                    주요
                  </span>
                )}
              </div>
              <div className="font-semibold text-gray-100 leading-relaxed">{item.value || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
