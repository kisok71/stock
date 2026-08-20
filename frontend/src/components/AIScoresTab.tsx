import React from 'react';
import { AIScores } from '../types/stock';
import { Cpu, Award, Zap } from 'lucide-react';

interface AIScoresTabProps {
  scores: AIScores;
}

export const AIScoresTab: React.FC<AIScoresTabProps> = ({ scores }) => {
  const categories = [
    { label: '성장성', score: scores.growth, desc: 'CAGR 및 매출 확대 잠재력' },
    { label: '안전성', score: scores.safety, desc: '부채비율 및 재무 안정구조' },
    { label: '수익성', score: scores.profitability, desc: 'ROE, 영업이익률 수준' },
    { label: '수급', score: scores.supply, desc: '기관/외국인 수급 강도' },
    { label: '기술적 분석', score: scores.technical, desc: '이동평균선 & 보조지표 종합' },
    { label: '실적', score: scores.financial, desc: '어닝 서프라이즈 & 컨센서스' },
    { label: '밸류에이션', score: scores.valuation, desc: 'DCF & 상대가치 저평가율' },
    { label: '시장심리', score: scores.sentiment, desc: '뉴스 감성 및 모멘텀' },
    { label: '모멘텀', score: scores.momentum, desc: '주가 상승 추세 파동' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Total Overall AI Score Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-dark-800 to-indigo-950 p-6 rounded-xl border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-5 h-5 text-blue-400" />
            AI 종합 다차원 평가 시스템
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            종합 점수: <span className="text-emerald-400 font-mono text-3xl ml-1">{scores.total_score}</span> / 100 점
          </h3>
          <p className="text-xs text-gray-400 mt-1">9가지 대분류 정량/정성 평가 수치를 종합 산출한 AI 최종 점수입니다.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-dark-900/90 rounded-xl border border-blue-500/30 text-center min-w-[120px]">
            <span className="text-[10px] text-gray-400 font-semibold block">AI 등급</span>
            <span className="text-xl font-bold text-amber-400 block mt-0.5">
              {scores.total_score >= 85 ? 'S 급 (최우수)' : scores.total_score >= 70 ? 'A 급 (우수)' : 'B 급 (보통)'}
            </span>
          </div>
        </div>
      </div>

      {/* 9 Category Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.label} className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{cat.label}</h4>
                <p className="text-[11px] text-gray-400">{cat.desc}</p>
              </div>

              <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${getScoreColor(cat.score)}`}>
                {cat.score} 점
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-dark-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cat.score >= 85 ? 'bg-emerald-400' : cat.score >= 70 ? 'bg-blue-400' : cat.score >= 55 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${cat.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
