// 광고 데이터 분석 엔진

import { AdData, calculateChangeRate } from './dataParser';

export interface SummaryMetrics {
    // 당일 지표
    totalAdSpend: number;
    avgCPC: number;
    totalClicks: number;
    avgCTR: number;
    totalImpressions: number;

    // 전일 지표
    prevDayAdSpend: number;
    prevDayAvgCPC: number;
    prevDayClicks: number;

    // 최근 7일 지표
    last7DaysAdSpend: number;
    last7DaysAvgCPC: number;
    last7DaysClicks: number;

    // 이전 7일 지표
    prev7DaysAdSpend: number;
    prev7DaysAvgCPC: number;
    prev7DaysClicks: number;

    // 당월 지표
    currentMonthAdSpend: number;
    currentMonthAvgCPC: number;
    currentMonthClicks: number;

    // 전월 지표
    prevMonthAdSpend: number;
    prevMonthAvgCPC: number;
    prevMonthClicks: number;

    // 증감률
    adSpendChange: number;
    cpcChange: number;
    clicksChange: number;

    // 7일 증감률
    adSpend7DayChange: number;
    cpc7DayChange: number;
}

export interface KeywordPerformance extends AdData {
    성과점수: number; // CPC 효율성 + CTR 기반 점수
    증감: '증가' | '감소' | '신규' | '중단';
}

export interface PlatformComparison {
    platform: string;
    adSpend: number;
    avgCPC: number;
    ctr: number;
    clicks: number;
    점유율: number;
}

/**
 * 주요 지표 요약 계산
 */
export function calculateSummaryMetrics(data: AdData[]): SummaryMetrics {
    if (data.length === 0) {
        return {
            totalAdSpend: 0,
            avgCPC: 0,
            totalClicks: 0,
            avgCTR: 0,
            totalImpressions: 0,
            prevDayAdSpend: 0,
            prevDayAvgCPC: 0,
            prevDayClicks: 0,
            last7DaysAdSpend: 0,
            last7DaysAvgCPC: 0,
            last7DaysClicks: 0,
            prev7DaysAdSpend: 0,
            prev7DaysAvgCPC: 0,
            prev7DaysClicks: 0,
            currentMonthAdSpend: 0,
            currentMonthAvgCPC: 0,
            currentMonthClicks: 0,
            prevMonthAdSpend: 0,
            prevMonthAvgCPC: 0,
            prevMonthClicks: 0,
            adSpendChange: 0,
            cpcChange: 0,
            clicksChange: 0,
            adSpend7DayChange: 0,
            cpc7DayChange: 0,
        };
    }

    // 당일 지표
    const totalAdSpend = data.reduce((sum, row) => sum + row.당일광고비, 0);
    const totalClicks = data.reduce((sum, row) => sum + row.클릭수, 0);
    const totalImpressions = data.reduce((sum, row) => sum + row.노출수, 0);

    const cpcValues = data.map(row => row.당일CPC).filter(cpc => cpc > 0);
    const avgCPC = cpcValues.length > 0
        ? cpcValues.reduce((sum, cpc) => sum + cpc, 0) / cpcValues.length
        : 0;

    // 전일 지표
    const prevDayAdSpend = data.reduce((sum, row) => sum + row.전일광고비, 0);
    const prevDayClicks = 0; // 원본 데이터에 전일 클릭수 없음

    const prevCpcValues = data.map(row => row.전일CPC).filter(cpc => cpc > 0);
    const prevDayAvgCPC = prevCpcValues.length > 0
        ? prevCpcValues.reduce((sum, cpc) => sum + cpc, 0) / prevCpcValues.length
        : 0;

    // 최근 7일 지표
    const last7DaysAdSpend = data.reduce((sum, row) => sum + row.최근7일광고비, 0);
    const last7DaysClicks = 0; // 원본 데이터에 7일 클릭수 없음

    const last7DaysCpcValues = data.map(row => row.최근7일CPC).filter(cpc => cpc > 0);
    const last7DaysAvgCPC = last7DaysCpcValues.length > 0
        ? last7DaysCpcValues.reduce((sum, cpc) => sum + cpc, 0) / last7DaysCpcValues.length
        : 0;

    // 이전 7일 지표
    const prev7DaysAdSpend = data.reduce((sum, row) => sum + row.이전7일광고비, 0);
    const prev7DaysClicks = 0; // 원본 데이터에 7일 클릭수 없음

    const prev7DaysCpcValues = data.map(row => row.이전7일CPC).filter(cpc => cpc > 0);
    const prev7DaysAvgCPC = prev7DaysCpcValues.length > 0
        ? prev7DaysCpcValues.reduce((sum, cpc) => sum + cpc, 0) / prev7DaysCpcValues.length
        : 0;

    // 당월 지표
    const currentMonthAdSpend = data.reduce((sum, row) => sum + row.당월광고비, 0);
    const currentMonthClicks = 0; // 원본 데이터에 당월 클릭수 없음

    const currentMonthCpcValues = data.map(row => row.당월CPC).filter(cpc => cpc > 0);
    const currentMonthAvgCPC = currentMonthCpcValues.length > 0
        ? currentMonthCpcValues.reduce((sum, cpc) => sum + cpc, 0) / currentMonthCpcValues.length
        : 0;

    // 전월 지표
    const prevMonthAdSpend = data.reduce((sum, row) => sum + row.전월광고비, 0);
    const prevMonthClicks = 0; // 원본 데이터에 전월 클릭수 없음

    const prevMonthCpcValues = data.map(row => row.전월CPC).filter(cpc => cpc > 0);
    const prevMonthAvgCPC = prevMonthCpcValues.length > 0
        ? prevMonthCpcValues.reduce((sum, cpc) => sum + cpc, 0) / prevMonthCpcValues.length
        : 0;

    // CTR 계산
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // 클릭수 증감 - 현재는 전일 클릭수 데이터가 원본에 없으므로 0
    const clicksChange = 0;

    return {
        totalAdSpend,
        avgCPC,
        totalClicks,
        avgCTR,
        totalImpressions,
        prevDayAdSpend,
        prevDayAvgCPC,
        prevDayClicks,
        last7DaysAdSpend,
        last7DaysAvgCPC,
        last7DaysClicks,
        prev7DaysAdSpend,
        prev7DaysAvgCPC,
        prev7DaysClicks,
        currentMonthAdSpend,
        currentMonthAvgCPC,
        currentMonthClicks,
        prevMonthAdSpend,
        prevMonthAvgCPC,
        prevMonthClicks,
        adSpendChange: calculateChangeRate(totalAdSpend, prevDayAdSpend),
        cpcChange: calculateChangeRate(avgCPC, prevDayAvgCPC),
        clicksChange,
        adSpend7DayChange: calculateChangeRate(last7DaysAdSpend, prev7DaysAdSpend),
        cpc7DayChange: calculateChangeRate(last7DaysAvgCPC, prev7DaysAvgCPC),
    };
}

/**
 * 키워드별 성과 분석
 */
export function analyzeKeywordPerformance(data: AdData[]): KeywordPerformance[] {
    return data.map(row => {
        // 성과 점수 계산: CTR이 높고 CPC가 낮을수록 좋음
        const ctrValue = parseFloat(row.CTR.replace('%', '')) || 0;
        const cpcScore = row.당일CPC > 0 ? 1000 / row.당일CPC : 0; // CPC가 낮을수록 높은 점수
        const ctrScore = ctrValue * 10; // CTR 가중치
        const 성과점수 = cpcScore + ctrScore;

        // 증감 상태 판단
        let 증감: '증가' | '감소' | '신규' | '중단' = '신규';
        if (row.이전7일광고비 > 0) {
            const changeRate = calculateChangeRate(row.최근7일광고비, row.이전7일광고비);
            if (changeRate > 10) 증감 = '증가';
            else if (changeRate < -10) 증감 = '감소';
            else 증감 = '신규';
        } else if (row.최근7일광고비 === 0) {
            증감 = '중단';
        }

        return {
            ...row,
            성과점수,
            증감,
        };
    }).sort((a, b) => b.성과점수 - a.성과점수); // 성과 점수 높은 순으로 정렬
}

/**
 * 매체별 비교 분석 (Google vs Naver)
 */
export function comparePlatforms(data: AdData[]): PlatformComparison[] {
    const platformGroups: Record<string, AdData[]> = {};

    data.forEach(row => {
        const platform = row.매체 || 'Unknown';
        if (!platformGroups[platform]) {
            platformGroups[platform] = [];
        }
        platformGroups[platform].push(row);
    });

    const totalAdSpend = data.reduce((sum, row) => sum + row.최근7일광고비, 0);

    return Object.entries(platformGroups).map(([platform, rows]) => {
        const adSpend = rows.reduce((sum, row) => sum + row.최근7일광고비, 0);
        const clicks = rows.reduce((sum, row) => sum + row.클릭수, 0);
        const impressions = rows.reduce((sum, row) => sum + row.노출수, 0);

        const cpcValues = rows.map(row => row.최근7일CPC).filter(cpc => cpc > 0);
        const avgCPC = cpcValues.length > 0
            ? cpcValues.reduce((sum, cpc) => sum + cpc, 0) / cpcValues.length
            : 0;

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const 점유율 = totalAdSpend > 0 ? (adSpend / totalAdSpend) * 100 : 0;

        return {
            platform,
            adSpend,
            avgCPC,
            ctr,
            clicks,
            점유율,
        };
    }).sort((a, b) => b.adSpend - a.adSpend);
}
