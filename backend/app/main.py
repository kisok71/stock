from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stocks import router as stocks_router

app = FastAPI(
    title="Stock Analysis & AI Reporting System API",
    description="국내/해외 주식 차트 지표 및 AI 종합 분석 보고서 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Stock Analysis & AI Reporting Engine API",
        "docs_url": "/docs"
    }
