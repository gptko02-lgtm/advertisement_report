'use client';

import { useState } from 'react';
import { generateExcelReport } from '@/utils/excelExporter';
import { AdData } from '@/utils/dataParser';
import { SummaryMetrics, KeywordPerformance, PlatformComparison } from '@/utils/analyticsEngine';
import { Insight } from '@/utils/insightGenerator';

interface ExportButtonProps {
    rawData: AdData[];
    metrics: SummaryMetrics;
    keywords: KeywordPerformance[];
    platforms: PlatformComparison[];
    insights: Insight[];
}

export default function ExportButton({
    rawData,
    metrics,
    keywords,
    platforms,
    insights,
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            await generateExcelReport(rawData, metrics, keywords, platforms, insights);
        } catch (error) {
            console.error('Excel export failed:', error);
            alert('엑셀 파일 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="card fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="gradient-text mb-2">📥 엑셀 리포트 다운로드</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        분석 결과를 5개 섹션으로 구성된 단일 시트 엑셀 파일로 다운로드합니다
                    </p>
                    <div className="mt-3 space-y-1">
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            ✓ 섹션 1: 주요 지표 요약 + 주요 인사이트
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            ✓ 섹션 2: 매체별 비교 (Google vs Naver)
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            ✓ 섹션 3: 키워드별 상세 분석 + 성과 판단 기준
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            ✓ 섹션 4: 개선 제안 및 액션 플랜
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            ✓ 섹션 5: 일일 광고 성과 상세 데이터
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="btn btn-secondary text-lg px-8 py-4"
                >
                    {isExporting ? (
                        <>
                            <span className="spinner"></span>
                            생성 중...
                        </>
                    ) : (
                        <>
                            <span>📊</span>
                            엑셀 리포트 다운로드
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
