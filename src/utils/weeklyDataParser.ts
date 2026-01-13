// 주간 광고 데이터 파싱 유틸리티

export interface NaverWeeklyData {
    캠페인: string;
    광고그룹: string;
    키워드: string;
    일별: string; // 2025.12.08.
    노출수: number;
    클릭수: number;
    평균클릭비용: number;
    총비용: number;
    평균노출순위: number;
}

export interface GoogleWeeklyData {
    캠페인: string;
    광고그룹: string;
    검색키워드: string;
    일: string; // 2026-01-05
    통화코드: string;
    키워드최대CPC: number;
    노출수: number;
    클릭수: number;
    비용: number;
    평균CPC: number;
}

export interface WeeklyAdData {
    매체: 'Naver' | 'Google';
    날짜: string;
    노출수: number;
    클릭수: number;
    CPC: number;
    광고비: number;
}

export interface AdditionalMetrics {
    GA전환수: number;
    실문의건수: number;
    퍼맥스광고비: number;
}

/**
 * 숫자 파싱 (쉼표 제거)
 */
function parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value || value === '-' || value === '0') return 0;
    const cleaned = String(value).replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * 네이버 주간 데이터 파싱
 */
export function parseNaverWeeklyData(text: string): NaverWeeklyData[] {
    if (!text || text.trim() === '') {
        throw new Error('네이버 데이터가 비어있습니다.');
    }

    const lines = text.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('최소 2줄(헤더 + 데이터)이 필요합니다.');
    }

    // 첫 줄이 헤더인지 확인하고 건너뛰기
    let startIndex = 0;
    if (lines[0].includes('키워드 보고서') || lines[0].includes('캠페인')) {
        startIndex = lines[0].includes('키워드 보고서') ? 2 : 1;
    }

    const data: NaverWeeklyData[] = [];

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split('\t').map(v => v.trim());

        if (values.length < 8) continue;

        try {
            data.push({
                캠페인: values[0] || '',
                광고그룹: values[1] || '',
                키워드: values[2] || '-',
                일별: values[3] || '',
                노출수: parseNumber(values[4]),
                클릭수: parseNumber(values[5]),
                평균클릭비용: parseNumber(values[6]),
                총비용: parseNumber(values[7]),
                평균노출순위: parseNumber(values[8]),
            });
        } catch (error) {
            console.warn(`네이버 행 ${i + 1} 파싱 실패:`, error);
        }
    }

    if (data.length === 0) {
        throw new Error('파싱된 네이버 데이터가 없습니다.');
    }

    return data;
}

/**
 * 구글 주간 데이터 파싱
 */
export function parseGoogleWeeklyData(text: string): GoogleWeeklyData[] {
    if (!text || text.trim() === '') {
        throw new Error('구글 데이터가 비어있습니다.');
    }

    const lines = text.trim().split('\n');
    if (lines.length < 3) {
        throw new Error('최소 3줄(제목 + 날짜 + 헤더 + 데이터)이 필요합니다.');
    }

    // 헤더 찾기 (캠페인으로 시작하는 행)
    let startIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('캠페인')) {
            startIndex = i + 1;
            break;
        }
    }

    const data: GoogleWeeklyData[] = [];

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split('\t').map(v => v.trim());

        if (values.length < 10) continue;

        try {
            data.push({
                캠페인: values[0] || '',
                광고그룹: values[1] || '',
                검색키워드: values[2] || '',
                일: values[3] || '',
                통화코드: values[4] || 'KRW',
                키워드최대CPC: parseNumber(values[5]),
                노출수: parseNumber(values[6]),
                클릭수: parseNumber(values[7]),
                비용: parseNumber(values[8]),
                평균CPC: parseNumber(values[9]),
            });
        } catch (error) {
            console.warn(`구글 행 ${i + 1} 파싱 실패:`, error);
        }
    }

    if (data.length === 0) {
        throw new Error('파싱된 구글 데이터가 없습니다.');
    }

    return data;
}

/**
 * 날짜 범위 계산 (지난주 월~금)
 */
export function calculateWeekRange(referenceDate: Date): { start: string; end: string } {
    // 지난주 금요일 찾기
    const lastFriday = new Date(referenceDate);
    const day = lastFriday.getDay();
    const daysToSubtract = day === 0 ? 2 : (day === 6 ? 1 : day + 2); // 일요일이면 2일, 토요일이면 1일, 평일이면 day+2
    lastFriday.setDate(lastFriday.getDate() - daysToSubtract);

    // 지난주 월요일
    const lastMonday = new Date(lastFriday);
    lastMonday.setDate(lastMonday.getDate() - 4);

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    };

    return {
        start: formatDate(lastMonday),
        end: formatDate(lastFriday),
    };
}

/**
 * 지지난주 날짜 범위 계산
 */
export function calculatePreviousWeekRange(referenceDate: Date): { start: string; end: string } {
    // 지난주 월요일 찾기
    const lastFriday = new Date(referenceDate);
    const day = lastFriday.getDay();
    const daysToSubtract = day === 0 ? 2 : (day === 6 ? 1 : day + 2);
    lastFriday.setDate(lastFriday.getDate() - daysToSubtract);

    const lastMonday = new Date(lastFriday);
    lastMonday.setDate(lastMonday.getDate() - 4);

    // 지지난주는 그 이전 주
    const prevFriday = new Date(lastMonday);
    prevFriday.setDate(prevFriday.getDate() - 3); // 지난주 월요일 - 3일 = 지지난주 금요일

    const prevMonday = new Date(prevFriday);
    prevMonday.setDate(prevMonday.getDate() - 4);

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    };

    return {
        start: formatDate(prevMonday),
        end: formatDate(prevFriday),
    };
}
