import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts';
import { TechnicalIndicators } from '../types/stock';
import { Layers, Activity, Eye, EyeOff } from 'lucide-react';

interface StockChartProps {
  indicators?: TechnicalIndicators | null;
  period: '1d' | '1w' | '1m';
  onPeriodChange: (period: '1d' | '1w' | '1m') => void;
  loading: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  indicators,
  period,
  onPeriodChange,
  loading
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);

  // Indicator Toggles
  const [showMA5, setShowMA5] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [showMA60, setShowMA60] = useState(true);
  const [showMA120, setShowMA120] = useState(true);
  const [showMA240, setShowMA240] = useState(false);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || !indicators || !indicators.series) return;

    // Clean up previous chart
    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const { dates, open, high, low, close, volume, ma5, ma20, ma60, ma120, ma240, bb_upper, bb_lower } = indicators.series;

    if (!dates || dates.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#151921' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#1E2430' },
        horzLines: { color: '#1E2430' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
      timeScale: {
        borderColor: '#2A3241',
        timeVisible: true,
      },
    });

    chartApiRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#0ECB81',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });

    const candleData = dates.map((date, i) => ({
      time: date,
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
    }));
    candleSeries.setData(candleData);

    // Volume Series
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      chart.priceScale('').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      const volumeData = dates.map((date, i) => ({
        time: date,
        value: volume[i],
        color: close[i] >= open[i] ? 'rgba(14, 203, 129, 0.4)' : 'rgba(246, 70, 93, 0.4)',
      }));
      volumeSeries.setData(volumeData);
    }

    // Moving Averages
    if (showMA5) {
      const ma5Series = chart.addLineSeries({ color: '#F43F5E', lineWidth: 1, title: 'MA5' });
      ma5Series.setData(dates.map((time, i) => ({ time, value: ma5[i] })).filter((d) => d.value !== null) as any);
    }
    if (showMA20) {
      const ma20Series = chart.addLineSeries({ color: '#F0B90B', lineWidth: 1, title: 'MA20' });
      ma20Series.setData(dates.map((time, i) => ({ time, value: ma20[i] })).filter((d) => d.value !== null) as any);
    }
    if (showMA60) {
      const ma60Series = chart.addLineSeries({ color: '#2962FF', lineWidth: 1, title: 'MA60' });
      ma60Series.setData(dates.map((time, i) => ({ time, value: ma60[i] })).filter((d) => d.value !== null) as any);
    }
    if (showMA120) {
      const ma120Series = chart.addLineSeries({ color: '#E040FB', lineWidth: 1, title: 'MA120' });
      ma120Series.setData(dates.map((time, i) => ({ time, value: ma120[i] })).filter((d) => d.value !== null) as any);
    }
    if (showMA240) {
      const ma240Series = chart.addLineSeries({ color: '#00E676', lineWidth: 1, title: 'MA240' });
      ma240Series.setData(dates.map((time, i) => ({ time, value: ma240[i] })).filter((d) => d.value !== null) as any);
    }

    // Bollinger Bands
    if (showBB) {
      const bbUpperSeries = chart.addLineSeries({ color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
      const bbLowerSeries = chart.addLineSeries({ color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });
      bbUpperSeries.setData(dates.map((time, i) => ({ time, value: bb_upper[i] })).filter((d) => d.value !== null) as any);
      bbLowerSeries.setData(dates.map((time, i) => ({ time, value: bb_lower[i] })).filter((d) => d.value !== null) as any);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartApiRef.current) {
        chartApiRef.current.remove();
        chartApiRef.current = null;
      }
    };
  }, [indicators, period, showMA5, showMA20, showMA60, showMA120, showMA240, showBB, showVolume]);

  const latest = indicators?.latest;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-700 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-bold text-white tracking-wide">실시간 캔들 차트 & 13종 기술적 지표</h2>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-lg border border-dark-700">
          {(['1d', '1w', '1m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                period === p ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {p === '1d' ? '일봉' : p === '1w' ? '주봉' : '월봉'}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Toggles Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-dark-900/60 p-2 rounded-lg border border-dark-700/50">
        <span className="text-gray-400 font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> 지표 토글:
        </span>

        <button
          onClick={() => setShowMA5(!showMA5)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showMA5 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          5일선
        </button>

        <button
          onClick={() => setShowMA20(!showMA20)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showMA20 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          20일선
        </button>

        <button
          onClick={() => setShowMA60(!showMA60)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showMA60 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          60일선
        </button>

        <button
          onClick={() => setShowMA120(!showMA120)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showMA120 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          120일선
        </button>

        <button
          onClick={() => setShowMA240(!showMA240)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showMA240 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          240일선
        </button>

        <button
          onClick={() => setShowBB(!showBB)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showBB ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          볼린저밴드
        </button>

        <button
          onClick={() => setShowVolume(!showVolume)}
          className={`px-2 py-0.5 rounded border transition-all ${
            showVolume ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-dark-700 text-gray-500 border-dark-600'
          }`}
        >
          거래량
        </button>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="relative w-full h-[420px] rounded-lg overflow-hidden border border-dark-700">
        {loading && (
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm z-10 flex items-center justify-center text-sm text-gray-300 font-medium">
            차트 및 지표 데이터를 로딩 중입니다...
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Summary Indicator Cards Footer */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs pt-1">
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">RSI (14)</span>
            <span className={`font-mono font-bold ${latest.rsi > 70 ? 'text-rose-400' : latest.rsi < 30 ? 'text-emerald-400' : 'text-gray-200'}`}>
              {latest.rsi}
            </span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">MACD (Line/Hist)</span>
            <span className="font-mono font-bold text-blue-400">
              {latest.macd} / {latest.macd_hist}
            </span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">스토캐스틱 (%K/%D)</span>
            <span className="font-mono font-bold text-amber-400">
              {latest.stoch_k} / {latest.stoch_d}
            </span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">ADX (추세강도)</span>
            <span className="font-mono font-bold text-purple-400">{latest.adx}</span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">ATR (변동성)</span>
            <span className="font-mono font-bold text-gray-200">{latest.atr}</span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">20일 평균 거래량</span>
            <span className="font-mono font-bold text-emerald-400">{latest.volume_ratio_20d}%</span>
          </div>
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700 col-span-2 sm:col-span-1">
            <span className="text-gray-400 block text-[10px]">엘리어트 파동 국면</span>
            <span className="font-semibold text-blue-300 text-[11px] truncate block">{latest.elliott_phase}</span>
          </div>
        </div>
      )}
    </div>
  );
};
