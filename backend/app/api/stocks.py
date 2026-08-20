from fastapi import APIRouter, Query, HTTPException
import pandas as pd
import numpy as np
import yfinance as yf
import requests
import io
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, List

from app.engine.indicators import calculate_technical_indicators
from app.engine.valuation import calculate_valuation_metrics
from app.engine.supply_demand import analyze_supply_and_demand
from app.engine.news_crawler import fetch_stock_news_and_disclosures
from app.engine.ai_report import generate_ai_stock_report

router = APIRouter()
KST = timezone(timedelta(hours=9))

# Popular Default Stocks
POPULAR_STOCKS = [
    {"code": "005930", "ticker": "005930.KS", "name": "삼성전자", "market": "KOSPI", "currency": "KRW"},
    {"code": "000660", "ticker": "000660.KS", "name": "SK하이닉스", "market": "KOSPI", "currency": "KRW"},
    {"code": "035420", "ticker": "035420.KS", "name": "NAVER", "market": "KOSPI", "currency": "KRW"},
    {"code": "035720", "ticker": "035720.KS", "name": "카카오", "market": "KOSPI", "currency": "KRW"},
    {"code": "373220", "ticker": "373220.KS", "name": "LG에너지솔루션", "market": "KOSPI", "currency": "KRW"},
    {"code": "058610", "ticker": "058610.KQ", "name": "에스피지", "market": "KOSDAQ", "currency": "KRW"},
    {"code": "247540", "ticker": "247540.KQ", "name": "에코프로비엠", "market": "KOSDAQ", "currency": "KRW"},
    {"code": "068270", "ticker": "068270.KS", "name": "셀트리온", "market": "KOSPI", "currency": "KRW"},
    {"code": "AAPL", "ticker": "AAPL", "name": "애플 (Apple)", "market": "NASDAQ", "currency": "USD"},
    {"code": "NVDA", "ticker": "NVDA", "name": "엔비디아 (NVIDIA)", "market": "NASDAQ", "currency": "USD"},
    {"code": "TSLA", "ticker": "TSLA", "name": "테슬라 (Tesla)", "market": "NASDAQ", "currency": "USD"},
    {"code": "MSFT", "ticker": "MSFT", "name": "마이크로소프트 (Microsoft)", "market": "NASDAQ", "currency": "USD"},
    {"code": "GOOGL", "ticker": "GOOGL", "name": "알파벳 A (Google)", "market": "NASDAQ", "currency": "USD"},
    {"code": "AMD", "ticker": "AMD", "name": "AMD", "market": "NASDAQ", "currency": "USD"},
    {"code": "PLTR", "ticker": "PLTR", "name": "팔란티어 (Palantir)", "market": "NYSE", "currency": "USD"}
]

# Cache for Korean Stock Master List (Loaded on demand or startup)
KRX_STOCKS_CACHE: List[Dict[str, str]] = []

def load_krx_stock_master() -> List[Dict[str, str]]:
    global KRX_STOCKS_CACHE
    if KRX_STOCKS_CACHE:
        return KRX_STOCKS_CACHE

    try:
        url = 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download'
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            df = pd.read_html(io.BytesIO(r.content), encoding='euc-kr')[0]
            items = []
            for _, row in df.iterrows():
                code = str(row.get('종목코드', '')).zfill(6)
                name = str(row.get('회사명', '')).strip()
                # Market heuristic from KRX KIND output
                market = "KOSDAQ" if "코스닥" in str(row.get('시장구분', '')) else "KOSPI"
                suffix = ".KQ" if market == "KOSDAQ" else ".KS"
                items.append({
                    "code": code,
                    "ticker": f"{code}{suffix}",
                    "name": name,
                    "market": market,
                    "currency": "KRW"
                })
            KRX_STOCKS_CACHE = items
            return KRX_STOCKS_CACHE
    except Exception as e:
        print(f"KRX master load warning: {e}")
    return POPULAR_STOCKS

def generate_mock_ohlcv(symbol: str, count: int = 250) -> pd.DataFrame:
    """Generates clean historical OHLCV data if live network data is unavailable."""
    base_price = 78000.0 if symbol.replace(".KS", "").replace(".KQ", "").isdigit() else 185.0
    now_kst = datetime.now(timezone.utc).astimezone(KST)
    dates = pd.date_range(end=now_kst, periods=count, freq="B")
    
    np.random.seed(abs(hash(symbol)) % 10000)
    returns = np.random.normal(0.0005, 0.018, count)
    price_path = base_price * np.exp(np.cumsum(returns))
    
    opens = price_path * (1 + np.random.normal(0, 0.005, count))
    highs = np.maximum(opens, price_path) * (1 + np.abs(np.random.normal(0, 0.008, count)))
    lows = np.minimum(opens, price_path) * (1 - np.abs(np.random.normal(0, 0.008, count)))
    closes = price_path
    volumes = np.random.randint(1000000, 15000000, count)

    df = pd.DataFrame({
        "Open": opens,
        "High": highs,
        "Low": lows,
        "Close": closes,
        "Volume": volumes
    }, index=dates)
    return df

def resolve_ticker(code: str) -> tuple[str, str, str]:
    code_clean = code.strip().upper()
    
    # 1. Check popular list first
    for item in POPULAR_STOCKS:
        if item["code"] == code_clean or item["ticker"] == code_clean or item["name"].lower() == code_clean.lower():
            return item["ticker"], item["name"], item["market"]
            
    # 2. Check KRX Master list
    krx_list = load_krx_stock_master()
    for item in krx_list:
        if item["code"] == code_clean or item["name"] == code_clean:
            return item["ticker"], item["name"], item["market"]
    
    # 3. Numeric code fallback
    if code_clean.isdigit():
        return f"{code_clean}.KS", f"종목 ({code_clean})", "KOSPI"
        
    return code_clean, code_clean, "NASDAQ"

@router.get("/search")
def search_stocks(q: str = Query("", description="Stock code or name")):
    if not q or not q.strip():
        return {"results": POPULAR_STOCKS[:10]}
    
    query = q.strip()
    query_lower = query.lower()
    
    matches = []
    
    # 1. Match in Popular stocks
    for item in POPULAR_STOCKS:
        if query_lower in item["code"].lower() or query_lower in item["name"].lower() or query_lower in item["ticker"].lower():
            matches.append(item)
            
    # 2. Match in KRX Master Database (2800+ Korean stocks)
    krx_list = load_krx_stock_master()
    for item in krx_list:
        if len(matches) >= 15:
            break
        if query_lower in item["name"].lower() or query == item["code"]:
            if item["code"] not in [m["code"] for m in matches]:
                matches.append(item)
                
    # 3. Dynamic fallback if no matches found yet
    if not matches and len(query) >= 1:
        if query.isdigit():
            matches.append({"code": query, "ticker": f"{query}.KS", "name": f"종목 ({query})", "market": "KOSPI", "currency": "KRW"})
        else:
            matches.append({"code": query.upper(), "ticker": query.upper(), "name": query.upper(), "market": "NASDAQ", "currency": "USD"})
            
    return {"results": matches[:15]}

@router.get("/stock/{code}")
def get_stock_chart_data(code: str, period: str = Query("1d", enum=["1d", "1w", "1m"])):
    ticker, name, market = resolve_ticker(code)
    
    # Attempt yfinance fetch with fallback suffixes (.KS and .KQ)
    df = pd.DataFrame()
    tickers_to_try = [ticker]
    if code.isdigit():
        tickers_to_try = [f"{code}.KS", f"{code}.KQ"]

    for t in tickers_to_try:
        try:
            yf_ticker = yf.Ticker(t)
            df_temp = yf_ticker.history(period="1y")
            if not df_temp.empty and len(df_temp) >= 20:
                df = df_temp
                ticker = t
                break
        except Exception:
            continue

    if df.empty or len(df) < 20:
        df = generate_mock_ohlcv(code)

    # Resample for week or month if requested
    if period == "1w":
        df = df.resample("W").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()
    elif period == "1m":
        df = df.resample("M").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()

    indicators = calculate_technical_indicators(df)
    latest_price = float(df['Close'].iloc[-1])

    return {
        "stock_info": {
            "code": code,
            "ticker": ticker,
            "name": name,
            "market": market,
            "current_price": round(latest_price, 2)
        },
        "indicators": indicators
    }

@router.get("/analyze/{code}")
def analyze_stock(code: str):
    ticker, name, market = resolve_ticker(code)
    
    df = pd.DataFrame()
    info = {}
    tickers_to_try = [ticker]
    if code.isdigit():
        tickers_to_try = [f"{code}.KS", f"{code}.KQ"]

    for t in tickers_to_try:
        try:
            yf_ticker = yf.Ticker(t)
            df_temp = yf_ticker.history(period="1y")
            if not df_temp.empty and len(df_temp) >= 20:
                df = df_temp
                info = yf_ticker.info or {}
                ticker = t
                break
        except Exception:
            continue

    if df.empty or len(df) < 20:
        df = generate_mock_ohlcv(code)

    tech_data = calculate_technical_indicators(df)
    latest_price = float(df['Close'].iloc[-1])
    
    val_data = calculate_valuation_metrics(info, latest_price)
    supply_data = analyze_supply_and_demand(code, tech_data.get("latest", {}))
    news_data = fetch_stock_news_and_disclosures(code, name)

    report = generate_ai_stock_report(
        symbol=code,
        name=name,
        market=market,
        price=latest_price,
        tech_data=tech_data,
        val_data=val_data,
        supply_data=supply_data,
        news_data=news_data
    )

    return {
        "report": report,
        "indicators": tech_data
    }
