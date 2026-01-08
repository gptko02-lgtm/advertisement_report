'use client';

import { Insight } from '@/utils/insightGenerator';
import { SummaryMetrics } from '@/utils/analyticsEngine';

interface InsightPanelProps {
    metrics: SummaryMetrics;
    insights: Insight[];
}

export default function InsightPanel({ metrics, insights }: InsightPanelProps) {
    const formatNumber = (num: number) => Math.round(num).toLocaleString('ko-KR');
    const formatPercent = (num: number) => {
        const sign = num > 0 ? '+' : '';
        return `${sign}${num.toFixed(1)}%`;
    };

    const getChangeColor = (value: number) => {
        if (value > 0) return 'text-red-500';
        if (value < 0) return 'text-green-500';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-6 fade-in">
            {/* 주요 지표 카드 */}
            <div className="card">
                <h3 className="gradient-text mb-4">📈 주요 지표 요약</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">총 광고비</p>
                        <p className="text-2xl font-bold">₩{formatNumber(metrics.totalAdSpend)}</p>
                        <p className={`text-sm mt-1 ${getChangeColor(metrics.adSpendChange)}`}>
                            {formatPercent(metrics.adSpendChange)}
                        </p>
                    </div>

                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">평균 CPC</p>
                        <p className="text-2xl font-bold">₩{formatNumber(metrics.avgCPC)}</p>
                        <p className={`text-sm mt-1 ${getChangeColor(metrics.cpcChange)}`}>
                            {formatPercent(metrics.cpcChange)}
                        </p>
                    </div>

                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">총 클릭수</p>
                        <p className="text-2xl font-bold">{formatNumber(metrics.totalClicks)}</p>
                    </div>

                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">평균 CTR</p>
                        <p className="text-2xl font-bold">{metrics.avgCTR.toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            {/* 인사이트 카드 */}
            <div className="card">
                <h3 className="gradient-text mb-4">💡 주요 인사이트</h3>

                {/* 즉시 조치 필요 */}
                {insights.filter(i => i.level === '즉시조치').length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                            <span>🔴</span> 즉시 조치 필요
                        </h4>
                        <div className="space-y-2">
                            {insights.filter(i => i.level === '즉시조치').map((insight, idx) => (
                                <div key={idx} className="insight-card urgent">
                                    <p className="font-medium text-red-900">{insight.이유}</p>
                                    <p className="text-sm text-red-700 mt-1">→ {insight.제안액션}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="badge badge-error text-xs">{insight.기간}</span>
                                        <span className="badge badge-error text-xs">{insight.우선순위}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 적극적 기회 */}
                {insights.filter(i => i.level === '적극적기회').length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-orange-600 font-semibold mb-2 flex items-center gap-2">
                            <span>🟡</span> 적극적 기회
                        </h4>
                        <div className="space-y-2">
                            {insights.filter(i => i.level === '적극적기회').map((insight, idx) => (
                                <div key={idx} className="insight-card opportunity">
                                    <p className="font-medium text-orange-900">{insight.이유}</p>
                                    <p className="text-sm text-orange-700 mt-1">→ {insight.제안액션}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="badge badge-warning text-xs">{insight.기간}</span>
                                        <span className="badge badge-warning text-xs">{insight.우선순위}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 긍정적 지표 */}
                {insights.filter(i => i.level === '긍정적지표').length > 0 && (
                    <div>
                        <h4 className="text-green-600 font-semibold mb-2 flex items-center gap-2">
                            <span>🟢</span> 긍정적 지표
                        </h4>
                        <div className="space-y-2">
                            {insights.filter(i => i.level === '긍정적지표').map((insight, idx) => (
                                <div key={idx} className="insight-card positive">
                                    <p className="font-medium text-green-900">{insight.이유}</p>
                                    <p className="text-sm text-green-700 mt-1">→ {insight.제안액션}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {insights.length === 0 && (
                    <p className="text-[var(--color-text-secondary)] text-center py-4">
                        분석할 데이터가 충분하지 않습니다.
                    </p>
                )}
            </div>
        </div>
    );
}
