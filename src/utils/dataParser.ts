// TSV/CSV 텍스트 데이터 파싱 유틸리티

export interface AdData {
  매체: string;
  키워드: string;
  당일광고비: number;
  전일광고비: number;
  최근7일광고비: number;
  이전7일광고비: number;
  당월광고비: number;
  전월광고비: number;
  당일CPC: number;
  전일CPC: number;
  최근7일CPC: number;
  이전7일CPC: number;
  당월CPC: number;
  전월CPC: number;
  CVR: string;
  캠페인: string;
  광고그룹: string;
  노출수: number;
  클릭수: number;
  CTR: string;
}

/**
 * 텍스트를 숫자로 변환 (쉼표 제거)
 */
function parseNumber(value: string): number {
  if (!value || value === '-' || value === '0') return 0;
  const cleaned = value.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * 탭 또는 쉼표로 구분된 텍스트 데이터를 파싱
 */
export function parseDataText(text: string): AdData[] {
  if (!text || text.trim() === '') {
    throw new Error('데이터가 비어있습니다.');
  }

  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('최소 2줄(헤더 + 데이터)이 필요합니다.');
  }

  // 구분자 감지 (탭 우선, 없으면 쉼표)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data: AdData[] = [];

  // 헤더를 건너뛰고 데이터 행 처리
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter).map(v => v.trim());
    
    // "종합합계", "필터합계" 같은 합계 행은 건너뛰기
    if (values[0] && (values[0].includes('합계') || values[0] === '-')) {
      continue;
    }

    // 최소한의 데이터가 있는지 확인
    if (values.length < 5) continue;

    try {
      const rowData: AdData = {
        매체: values[0] || '',
        키워드: values[1] || '',
        당일광고비: parseNumber(values[2]),
        전일광고비: parseNumber(values[3]),
        최근7일광고비: parseNumber(values[4]),
        이전7일광고비: parseNumber(values[5]),
        당월광고비: parseNumber(values[6]),
        전월광고비: parseNumber(values[7]),
        당일CPC: parseNumber(values[8]),
        전일CPC: parseNumber(values[9]),
        최근7일CPC: parseNumber(values[10]),
        이전7일CPC: parseNumber(values[11]),
        당월CPC: parseNumber(values[12]),
        전월CPC: parseNumber(values[13]),
        CVR: values[14] || '0.00%',
        캠페인: values[15] || '',
        광고그룹: values[16] || '',
        노출수: parseNumber(values[17]),
        클릭수: parseNumber(values[18]),
        CTR: values[19] || '0.00%',
      };

      data.push(rowData);
    } catch (error) {
      console.warn(`행 ${i + 1} 파싱 실패:`, error);
    }
  }

  if (data.length === 0) {
    throw new Error('파싱된 데이터가 없습니다. 데이터 형식을 확인해주세요.');
  }

  return data;
}

/**
 * 퍼센트 변화율 계산
 */
export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
