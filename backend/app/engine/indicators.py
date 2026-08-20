import pandas as pd
import numpy as np

def calculate_technical_indicators(df: pd.DataFrame) -> dict:
    """
    df must contain columns: ['Open', 'High', 'Low', 'Close', 'Volume'] sorted chronologically.
    Calculates all required indicators including 5-day MA and returns latest values & series.
    """
    if df.empty or len(df) < 5:
        return {}

    close = df['Close']
    high = df['High']
    low = df['Low']
    volume = df['Volume']

    # Moving Averages (5, 20, 60, 120, 240)
    ma5 = close.rolling(window=5).mean()
    ma20 = close.rolling(window=20).mean() if len(df) >= 20 else close.rolling(window=len(df)).mean()
    ma60 = close.rolling(window=60).mean() if len(df) >= 60 else close.rolling(window=len(df)).mean()
    ma120 = close.rolling(window=120).mean() if len(df) >= 120 else close.rolling(window=len(df)).mean()
    ma240 = close.rolling(window=240).mean() if len(df) >= 240 else close.rolling(window=len(df)).mean()

    # MACD (12, 26, 9)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    macd_hist = macd_line - macd_signal

    # RSI (14)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / (loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))

    # Stochastic Oscillator (14, 3, 3)
    lowest_low = low.rolling(window=14).min()
    highest_high = high.rolling(window=14).max()
    stoch_k = 100 * ((close - lowest_low) / (highest_high - lowest_low + 1e-9))
    stoch_d = stoch_k.rolling(window=3).mean()

    # Bollinger Bands (20, 2)
    bb_middle = ma20
    std20 = close.rolling(window=20).std()
    bb_upper = bb_middle + (std20 * 2)
    bb_lower = bb_middle - (std20 * 2)

    # OBV (On-Balance Volume)
    obv_direction = np.where(close > close.shift(1), 1, np.where(close < close.shift(1), -1, 0))
    obv = (obv_direction * volume).cumsum()

    # ADX (Average Directional Index - 14)
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr14 = tr.rolling(window=14).mean()

    up_move = high - high.shift(1)
    down_move = low.shift(1) - low
    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0)
    
    plus_di = 100 * (pd.Series(plus_dm, index=df.index).rolling(14).mean() / (atr14 + 1e-9))
    minus_di = 100 * (pd.Series(minus_dm, index=df.index).rolling(14).mean() / (atr14 + 1e-9))
    dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di + 1e-9))
    adx = dx.rolling(14).mean()

    # ATR (14)
    atr = atr14

    # Fibonacci Retracement
    recent_period = min(120, len(df))
    period_high = float(high.iloc[-recent_period:].max())
    period_low = float(low.iloc[-recent_period:].min())
    diff = period_high - period_low

    fibonacci = {
        "0.0% (High)": round(period_high, 2),
        "23.6%": round(period_high - 0.236 * diff, 2),
        "38.2%": round(period_high - 0.382 * diff, 2),
        "50.0%": round(period_high - 0.5 * diff, 2),
        "61.8%": round(period_high - 0.618 * diff, 2),
        "78.6%": round(period_high - 0.786 * diff, 2),
        "100.0% (Low)": round(period_low, 2)
    }

    latest_close = float(close.iloc[-1])
    prev_close = float(close.iloc[-2]) if len(close) > 1 else latest_close
    gap_percent = round(((float(df['Open'].iloc[-1]) - prev_close) / (prev_close + 1e-9)) * 100, 2)

    if latest_close > ma20.iloc[-1] > ma60.iloc[-1] > ma120.iloc[-1]:
        elliott_phase = "상승 3파 (강력한 주세 상승 국면)"
    elif latest_close > ma20.iloc[-1] and ma20.iloc[-1] > ma60.iloc[-1]:
        elliott_phase = "상승 1파 또는 5파 진행 중"
    elif latest_close < ma20.iloc[-1] < ma60.iloc[-1]:
        elliott_phase = "하강 C파 (조정 하락 국면)"
    else:
        elliott_phase = "상승 4파 / 삼각수렴 조정 구간"

    volume_avg_20 = float(volume.iloc[-20:].mean()) if len(volume) >= 20 else float(volume.mean())
    latest_vol = float(volume.iloc[-1])
    vol_ratio = round((latest_vol / (volume_avg_20 + 1e-9)) * 100, 1)

    return {
        "latest": {
            "current_price": round(latest_close, 2),
            "ma5": round(float(ma5.iloc[-1]), 2) if not np.isnan(ma5.iloc[-1]) else round(latest_close, 2),
            "ma20": round(float(ma20.iloc[-1]), 2) if not np.isnan(ma20.iloc[-1]) else round(latest_close, 2),
            "ma60": round(float(ma60.iloc[-1]), 2) if not np.isnan(ma60.iloc[-1]) else round(latest_close, 2),
            "ma120": round(float(ma120.iloc[-1]), 2) if not np.isnan(ma120.iloc[-1]) else round(latest_close, 2),
            "ma240": round(float(ma240.iloc[-1]), 2) if not np.isnan(ma240.iloc[-1]) else round(latest_close, 2),
            "macd": round(float(macd_line.iloc[-1]), 2),
            "macd_signal": round(float(macd_signal.iloc[-1]), 2),
            "macd_hist": round(float(macd_hist.iloc[-1]), 2),
            "rsi": round(float(rsi.iloc[-1]), 1) if not np.isnan(rsi.iloc[-1]) else 50.0,
            "stoch_k": round(float(stoch_k.iloc[-1]), 1) if not np.isnan(stoch_k.iloc[-1]) else 50.0,
            "stoch_d": round(float(stoch_d.iloc[-1]), 1) if not np.isnan(stoch_d.iloc[-1]) else 50.0,
            "bb_upper": round(float(bb_upper.iloc[-1]), 2) if not np.isnan(bb_upper.iloc[-1]) else round(latest_close, 2),
            "bb_middle": round(float(bb_middle.iloc[-1]), 2) if not np.isnan(bb_middle.iloc[-1]) else round(latest_close, 2),
            "bb_lower": round(float(bb_lower.iloc[-1]), 2) if not np.isnan(bb_lower.iloc[-1]) else round(latest_close, 2),
            "obv": round(float(obv.iloc[-1]), 0) if not np.isnan(obv.iloc[-1]) else 0,
            "adx": round(float(adx.iloc[-1]), 1) if not np.isnan(adx.iloc[-1]) else 25.0,
            "atr": round(float(atr.iloc[-1]), 2) if not np.isnan(atr.iloc[-1]) else 0.0,
            "gap_percent": gap_percent,
            "volume_ratio_20d": vol_ratio,
            "elliott_phase": elliott_phase
        },
        "fibonacci": fibonacci,
        "series": {
            "dates": [d.strftime("%Y-%m-%d") for d in df.index],
            "open": [round(float(x), 2) for x in df['Open']],
            "high": [round(float(x), 2) for x in df['High']],
            "low": [round(float(x), 2) for x in df['Low']],
            "close": [round(float(x), 2) for x in df['Close']],
            "volume": [int(x) for x in df['Volume']],
            "ma5": [round(float(x), 2) if not np.isnan(x) else None for x in ma5],
            "ma20": [round(float(x), 2) if not np.isnan(x) else None for x in ma20],
            "ma60": [round(float(x), 2) if not np.isnan(x) else None for x in ma60],
            "ma120": [round(float(x), 2) if not np.isnan(x) else None for x in ma120],
            "ma240": [round(float(x), 2) if not np.isnan(x) else None for x in ma240],
            "rsi": [round(float(x), 1) if not np.isnan(x) else None for x in rsi],
            "macd": [round(float(x), 2) if not np.isnan(x) else None for x in macd_line],
            "macd_signal": [round(float(x), 2) if not np.isnan(x) else None for x in macd_signal],
            "bb_upper": [round(float(x), 2) if not np.isnan(x) else None for x in bb_upper],
            "bb_lower": [round(float(x), 2) if not np.isnan(x) else None for x in bb_lower]
        }
    }
