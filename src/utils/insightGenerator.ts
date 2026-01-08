// 인사이트 자동 생성 로직

import { AdData } from './dataParser';
import { SummaryMetrics, KeywordPerformance, PlatformComparison } from './analyticsEngine';

export type InsightLevel = '즉시조치' | '적극적기회' | '긍정적지표';

export interface Insight {
    level: InsightLevel;
    이유: string;
    제안액션: string;
    기간: string;
    우선순위: '높음' | '중간' | '낮음';
}

/**
 * 데이터 분석을 통해 인사이트 자동 생성
 */
export function generateInsights(
    metrics: SummaryMetrics,
    keywords: KeywordPerformance[],
    platforms: PlatformComparison[]
): Insight[] {
    const insights: Insight[] = [];

    // 1. 즉시 조치 필요 항목
    // CPC 급등
    if (metrics.cpcChange > 50) {
        insights.push({
            level: '즉시조치',
            이유: `당일 CPC ₩${Math.round(metrics.avgCPC).toLocaleString()}로 전일 대비 ${metrics.cpcChange.toFixed(1)}% 급등`,
            제안액션: '입찰가 조정 또는 품질평가수 확인',
            기간: '즉시',
            우선순위: '높음',
        });
    }

    // CTR 급락
    if (metrics.avgCTR < 0.2) {
        insights.push({
            level: '즉시조치',
            이유: `전반적 CTR ${metrics.avgCTR.toFixed(2)}% 저조`,
            제안액션: '광고 문구 및 타겟 전략 재검토',
            기간: '1주일 이내',
            우선순위: '높음',
        });
    }

    // 특정 키워드 CTR 급락
    const lowCtrKeywords = keywords.filter(k => {
        const ctr = parseFloat(k.CTR.replace('%', '')) || 0;
        return ctr < 0.15 && k.클릭수 > 5;
    });

    if (lowCtrKeywords.length > 0) {
        insights.push({
            level: '즉시조치',
            이유: `${lowCtrKeywords[0].키워드} CTR ${lowCtrKeywords[0].CTR} 저조`,
            제안액션: '광고 문구 및 랜딩 재검토',
            기간: '즉시',
            우선순위: '높음',
        });
    }

    // 2. 적극적 기회
    // 신규 키워드 성과 모니터링
    const newKeywords = keywords.filter(k => k.증감 === '신규' && k.클릭수 > 0);
    if (newKeywords.length > 0) {
        insights.push({
            level: '적극적기회',
            이유: `신규 키워드 성과 모니터링 (${newKeywords.length}개)`,
            제안액션: `'${newKeywords[0].키워드}' 등 신규 키워드 추적`,
            기간: '2주',
            우선순위: '중간',
        });
    }

    // 매체 집중도
    if (platforms.length >= 2) {
        const topPlatform = platforms[0];
        if (topPlatform.점유율 > 75) {
            insights.push({
                level: '적극적기회',
                이유: `${topPlatform.platform} 매체 집중도 ${topPlatform.점유율.toFixed(0)}%`,
                제안액션: `${platforms[1]?.platform || '다른 매체'} 확장 기회 탐색`,
                기간: '1개월',
                우선순위: '중간',
            });
        }
    }

    // Performance Max 캠페인
    const perfMaxCampaigns = keywords.filter(k =>
        k.캠페인.toLowerCase().includes('performance max') ||
        k.캠페인.toLowerCase().includes('pmax')
    );

    if (perfMaxCampaigns.length > 0) {
        insights.push({
            level: '적극적기회',
            이유: 'Performance Max 캠페인 데이터 분석',
            제안액션: '전환 추적 설정 및 성과 분석 재구축',
            기간: '2주',
            우선순위: '중간',
        });
    }

    // 3. 긍정적 지표
    // 광고비 감소
    if (metrics.adSpendChange < -20) {
        insights.push({
            level: '긍정적지표',
            이유: `주간 광고비 ${Math.abs(metrics.adSpendChange).toFixed(1)}% 감소 - 효율성 개선 중`,
            제안액션: '현재 전략 유지',
            기간: '-',
            우선순위: '낮음',
        });
    }

    // 우수한 CPC 수준
    if (metrics.avgCPC < 1000 && metrics.avgCPC > 0) {
        insights.push({
            level: '긍정적지표',
            이유: `평균 CPC ₩${Math.round(metrics.avgCPC).toLocaleString()} - 경쟁적 수준 유지`,
            제안액션: 'CPC 수준 유지',
            기간: '-',
            우선순위: '낮음',
        });
    }

    // 특정 키워드 우수 성과
    const topKeywords = keywords.slice(0, 3).filter(k => {
        const ctr = parseFloat(k.CTR.replace('%', '')) || 0;
        return ctr > 1 || k.클릭수 > 10;
    });

    if (topKeywords.length > 0) {
        const topKw = topKeywords[0];
        insights.push({
            level: '긍정적지표',
            이유: `'${topKw.키워드}' 키워드 - ${topKw.매체}에서 가장 높은 성과`,
            제안액션: '예산 배분 최적화',
            기간: '-',
            우선순위: '낮음',
        });
    }

    // Google 매체 점유율
    const googlePlatform = platforms.find(p => p.platform.toLowerCase().includes('google'));
    if (googlePlatform && googlePlatform.점유율 > 60) {
        insights.push({
            level: '긍정적지표',
            이유: `Google 평균 CPC ₩${Math.round(googlePlatform.avgCPC).toLocaleString()} - 경쟁적 있는 CPC 수준 유지`,
            제안액션: '현재 수준 유지',
            기간: '-',
            우선순위: '낮음',
        });
    }

    return insights;
}
