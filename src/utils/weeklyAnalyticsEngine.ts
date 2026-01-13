// 주간 광고 데이터 분석 엔진

import { NaverWeeklyData, GoogleWeeklyData, AdditionalMetrics } from './weeklyDataParser';

export interface WeeklySummary {
    매체: '전체' | 'Naver' | 'Google';
    노출수: number;
    클릭수: number;
    CPC: number;
    광고비: number;
    GA전환수: number;
    실문의건수: number;
    CPA: number;
    퍼맥스광고비: number;
}

/**
 * 네이버 주간 데이터 집계
 */
export function aggregateNaverWeekly(data: NaverWeeklyData[]): Omit<WeeklySummary, 'GA전환수' | '실문의건수' | 'CPA' | '퍼맥스광고비'> {
    const 노출수 = data.reduce((sum, row) => sum + row.노출수, 0);
    const 클릭수 = data.reduce((sum, row) => sum + row.클릭수, 0);
    const 광고비 = data.reduce((sum, row) => sum + row.총비용, 0);
    const CPC = 클릭수 > 0 ? 광고비 / 클릭수 : 0;

    return {
        매체: 'Naver',
        노출수,
        클릭수,
        CPC: Math.round(CPC),
        광고비,
    };
}

/**
 * 구글 주간 데이터 집계
 */
export function aggregateGoogleWeekly(
    data: GoogleWeeklyData[],
    퍼맥스광고비: number
): Omit<WeeklySummary, 'GA전환수' | '실문의건수' | 'CPA'> {
    const 노출수 = data.reduce((sum, row) => sum + row.노출수, 0);
    const 클릭수 = data.reduce((sum, row) => sum + row.클릭수, 0);
    const 광고비 = data.reduce((sum, row) => sum + row.비용, 0);
    const CPC = 클릭수 > 0 ? 광고비 / 클릭수 : 0;

    return {
        매체: 'Google',
        노출수,
        클릭수,
        CPC: Math.round(CPC),
        광고비,
        퍼맥스광고비,
    };
}

/**
 * CPA 계산
 * CPA = 광고비 / (GA전환수 + 실문의건수)
 */
export function calculateCPA(광고비: number, GA전환수: number, 실문의건수: number): number {
    const 총전환수 = GA전환수 + 실문의건수;
    if (총전환수 === 0) return 0;
    return Math.round(광고비 / 총전환수);
}

/**
 * 전체 주간 요약 생성
 */
export function generateWeeklySummary(
    naverData: NaverWeeklyData[],
    googleData: GoogleWeeklyData[],
    metrics: AdditionalMetrics
): {
    전체: WeeklySummary;
    네이버: WeeklySummary;
    구글: WeeklySummary;
} {
    // 네이버 집계
    const naverAgg = aggregateNaverWeekly(naverData);

    // 구글 집계
    const googleAgg = aggregateGoogleWeekly(googleData, metrics.퍼맥스광고비);

    // 네이버 요약 (GA전환수와 실문의건수는 전체에만 적용, 매체별로는 분배하지 않음)
    const 네이버: WeeklySummary = {
        ...naverAgg,
        GA전환수: 0,
        실문의건수: 0,
        CPA: 0,
        퍼맥스광고비: 0,
    };

    // 구글 요약
    const 구글: WeeklySummary = {
        ...googleAgg,
        GA전환수: 0,
        실문의건수: 0,
        CPA: 0,
    };

    // 전체 집계
    const 전체노출수 = naverAgg.노출수 + googleAgg.노출수;
    const 전체클릭수 = naverAgg.클릭수 + googleAgg.클릭수;
    const 전체광고비 = naverAgg.광고비 + googleAgg.광고비;
    const 전체CPC = 전체클릭수 > 0 ? 전체광고비 / 전체클릭수 : 0;
    const 전체CPA = calculateCPA(전체광고비, metrics.GA전환수, metrics.실문의건수);

    const 전체: WeeklySummary = {
        매체: '전체',
        노출수: 전체노출수,
        클릭수: 전체클릭수,
        CPC: Math.round(전체CPC),
        광고비: 전체광고비,
        GA전환수: metrics.GA전환수,
        실문의건수: metrics.실문의건수,
        CPA: 전체CPA,
        퍼맥스광고비: metrics.퍼맥스광고비,
    };

    return { 전체, 네이버, 구글 };
}
