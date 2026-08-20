import React from 'react';
import { ValuationAnalysisReport } from '../types/stock';
import { DollarSign, Shield, TrendingUp, Cpu, Award } from 'lucide-react';

interface ValuationTabProps {
  data: ValuationAnalysisReport;
}

export const ValuationTab: React.FC<ValuationTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* DCF Valuation Highlight Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-dark-800 to-indigo-950/40 p-5 rounded-xl border border-blue-500/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">DCF 현금흐름할인 가치평가</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              적정가치 추정치: <span className="text-emerald-400 font-mono">{data.dcf_valuation}</span>
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              경제적 해자(Moat): <span className="text-blue-300 font-semibold">{data.moat}</span>
            </p>
          </div>

          <div className="bg-dark-900/80 px-4 py-3 rounded-lg border border-dark-700 text-right">
            <span className="text-xs text-gray-400 block">영업활동 현금흐름 (FCF)</span>
            <span className="text-base font-bold text-white font-mono">{data.fcf}</span>
          </div>
        </div>
      </div>

      {/* Ratios & Fundamentals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-2">
          <span className="text-gray-400 font-semibold block text-sm border-b border-dark-700 pb-1.5">상대 가치 평가</span>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">PER 비교</span>
            <span className="font-semibold text-white">{data.per_comparison}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">PBR 비교</span>
            <span className="font-semibold text-white">{data.pbr_comparison}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">EV/EBITDA</span>
            <span className="font-semibold text-white">{data.ev_ebitda}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">PEG (이익성장비율)</span>
            <span className="font-semibold text-white">{data.peg}</span>
          </div>
        </div>

        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-2">
          <span className="text-gray-400 font-semibold block text-sm border-b border-dark-700 pb-1.5">수익성 & 효율성</span>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">ROE (자기자본이익률)</span>
            <span className="font-semibold text-emerald-400">{data.roe}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">ROIC (투고자본수익률)</span>
            <span className="font-semibold text-emerald-400">{data.roic}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">부채비율</span>
            <span className="font-semibold text-white">{data.debt_ratio}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">현금흐름</span>
            <span className="font-semibold text-white">{data.cash_flow}</span>
          </div>
        </div>

        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-2">
          <span className="text-gray-400 font-semibold block text-sm border-b border-dark-700 pb-1.5">주주환원 & 성장 동력</span>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">배당수익률</span>
            <span className="font-semibold text-amber-400">{data.dividend}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">자사주 정책</span>
            <span className="font-semibold text-white">{data.treasury_stock}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">성장성 (CAGR)</span>
            <span className="font-semibold text-blue-400">{data.growth}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400">신사업 추진</span>
            <span className="font-semibold text-white">{data.new_business}</span>
          </div>
        </div>
      </div>

      {/* Moat & Risk Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <span className="text-gray-400 font-semibold block text-sm mb-2 text-emerald-400">경쟁력 및 경제적 해자 (Moat)</span>
          <p className="text-gray-200 leading-relaxed bg-dark-900 p-3 rounded border border-dark-700">{data.moat}</p>
        </div>

        <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
          <span className="text-gray-400 font-semibold block text-sm mb-2 text-rose-400">핵심 리스크요약</span>
          <p className="text-gray-200 leading-relaxed bg-dark-900 p-3 rounded border border-dark-700">{data.risk}</p>
        </div>
      </div>
    </div>
  );
};
