// Excel 파일 생성 및 내보내기

import ExcelJS from 'exceljs';
import { AdData } from './dataParser';
import { SummaryMetrics, KeywordPerformance, PlatformComparison } from './analyticsEngine';
import { Insight } from './insightGenerator';

/**
 * 5개 시트로 구성된 Excel 리포트 생성
 */
export async function generateExcelReport(
    rawData: AdData[],
    metrics: SummaryMetrics,
    keywords: KeywordPerformance[],
    platforms: PlatformComparison[],
    insights: Insight[]
): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // 시트 1: 주요 지표 + 인사이트
    await createSummarySheet(workbook, metrics, insights);

    // 시트 2: 일일 광고 성과 분석
    await createDailyPerformanceSheet(workbook, rawData);

    // 시트 3: 키워드별 상세 분석
    await createKeywordAnalysisSheet(workbook, keywords);

    // 시트 4: Google vs Naver 매체 비교
    await createPlatformComparisonSheet(workbook, platforms);

    // 시트 5: 개선 제안 및 액션 플랜
    await createActionPlanSheet(workbook, insights);

    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    downloadExcelFile(buffer, `ChatGPT교육_광고리포트_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 시트 1: 주요 지표 + 주요 인사이트
 */
async function createSummarySheet(
    workbook: ExcelJS.Workbook,
    metrics: SummaryMetrics,
    insights: Insight[]
) {
    const sheet = workbook.addWorksheet('주요 지표');

    // 제목
    sheet.mergeCells('C1:E1');
    const titleCell = sheet.getCell('C1');
    titleCell.value = 'ChatGPT 교육 광고 - 주간 성과 리포트';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('C2:E2');
    const dateCell = sheet.getCell('C2');
    dateCell.value = `보고 기준일: ${new Date().toLocaleDateString('ko-KR')}`;
    dateCell.font = { size: 10 };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 주요 지표 헤더
    sheet.addRow([]);
    sheet.addRow(['📊 주요 지표']);
    sheet.getCell('A4').font = { bold: true, size: 12 };

    // 지표 테이블 헤더 (날짜 표시)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}월 ${day}일`;
    };

    const metricsHeaderRow = sheet.addRow([
        '구분',
        formatDate(yesterday),      // 당일 -> 어제 날짜
        formatDate(dayBeforeYesterday), // 전일 -> 그저께 날짜
        '증감',
        '최근 7일',
        '이전 7일',
        '증감율',
        '당월'
    ]);
    metricsHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // 지표 데이터
    const metricsData = [
        ['광고비', metrics.totalAdSpend, metrics.prevDayAdSpend, metrics.adSpendChange.toFixed(1) + '%', metrics.last7DaysAdSpend, metrics.prev7DaysAdSpend, metrics.adSpend7DayChange.toFixed(1) + '%', metrics.currentMonthAdSpend],
        ['CPC', Math.round(metrics.avgCPC), Math.round(metrics.prevDayAvgCPC), metrics.cpcChange.toFixed(1) + '%', Math.round(metrics.last7DaysAvgCPC), Math.round(metrics.prev7DaysAvgCPC), metrics.cpc7DayChange.toFixed(1) + '%', Math.round(metrics.currentMonthAvgCPC)],
        ['클릭수', metrics.totalClicks, metrics.prevDayClicks, '', metrics.last7DaysClicks, metrics.prev7DaysClicks, '', metrics.currentMonthClicks],
        ['CTR', metrics.avgCTR.toFixed(2) + '%', '', '', '', '', '', ''],
        ['노출수', metrics.totalImpressions, '', '', '', '', '', ''],
    ];

    metricsData.forEach(row => {
        const dataRow = sheet.addRow(row);
        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };

            // 증감률 셀에 조건부 서식
            if (colNumber === 4 || colNumber === 7) {
                const value = String(cell.value || '');
                if (value.includes('-')) {
                    cell.font = { color: { argb: 'FF00B050' } }; // 초록색 (감소)
                } else if (value.includes('+') || (!value.includes('-') && value !== '')) {
                    cell.font = { color: { argb: 'FFFF0000' } }; // 빨간색 (증가)
                }
            }
        });
    });

    // 주요 인사이트 섹션
    sheet.addRow([]);
    sheet.addRow(['💡 주요 인사이트']);
    sheet.getCell(`A${sheet.lastRow!.number}`).font = { bold: true, size: 12 };

    insights.slice(0, 5).forEach(insight => {
        let icon = '';
        let color = 'FF000000';

        if (insight.level === '즉시조치') {
            icon = '✓';
            color = 'FFFF0000';
        } else if (insight.level === '적극적기회') {
            icon = '✓';
            color = 'FFFFA500';
        } else {
            icon = '✓';
            color = 'FF00B050';
        }

        const row = sheet.addRow([icon, insight.이유]);
        row.getCell(1).font = { color: { argb: color }, bold: true };
        row.getCell(2).alignment = { wrapText: true };
    });

    // 열 너비 조정
    sheet.getColumn(1).width = 12;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 12;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 12;
    sheet.getColumn(8).width = 15;
}

/**
 * 시트 2: 일일 광고 성과 분석
 */
async function createDailyPerformanceSheet(
    workbook: ExcelJS.Workbook,
    data: AdData[]
) {
    const sheet = workbook.addWorksheet('일일 광고 성과 분석');

    // 제목
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '일일 광고 성과 분석';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 헤더
    const headerRow = sheet.addRow(['매체', '키워드', '당일 광고비', '당일 CPC', '노출수', '클릭수']);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // 데이터
    data.forEach(row => {
        const dataRow = sheet.addRow([
            row.매체,
            row.키워드,
            row.당일광고비,
            row.당일CPC,
            row.노출수,
            row.클릭수,
        ]);

        dataRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // 열 너비 조정
    sheet.getColumn(1).width = 12;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 12;
    sheet.getColumn(5).width = 12;
    sheet.getColumn(6).width = 12;
}

/**
 * 시트 3: 키워드별 상세 분석
 */
async function createKeywordAnalysisSheet(
    workbook: ExcelJS.Workbook,
    keywords: KeywordPerformance[]
) {
    const sheet = workbook.addWorksheet('키워드별 상세 분석');

    // 제목
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '키워드별 상세 분석';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 헤더
    const headerRow = sheet.addRow(['순위', '매체', '키워드', '최근7일 광고비', '이전7일 광고비', '증감', '최근7일 CPC', 'CTR', '성과']);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // 데이터 (상위 12개만)
    keywords.slice(0, 12).forEach((kw, index) => {
        const change = kw.최근7일광고비 - kw.이전7일광고비;
        const dataRow = sheet.addRow([
            index + 1,
            kw.매체,
            kw.키워드,
            kw.최근7일광고비,
            kw.이전7일광고비,
            change,
            kw.최근7일CPC,
            kw.CTR,
            kw.증감,
        ]);

        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };

            // 증감 열 색상
            if (colNumber === 6) {
                if (change > 0) {
                    cell.font = { color: { argb: 'FFFF0000' } };
                    cell.value = '+' + change.toLocaleString();
                } else if (change < 0) {
                    cell.font = { color: { argb: 'FF00B050' } };
                }
            }

            // 성과 열 색상
            if (colNumber === 9) {
                if (cell.value === '우수') {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9FFD9' } };
                } else if (cell.value === '개선필요') {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFDDDD' } };
                } else if (cell.value === '신규') {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEEAA' } };
                }
            }
        });
    });

    // 성과 판단 기준 설명
    sheet.addRow([]);
    sheet.addRow([]);
    const criteriaTitle = sheet.addRow(['📊 성과 판단 기준']);
    criteriaTitle.getCell(1).font = { bold: true, size: 11, color: { argb: 'FF4472C4' } };

    // 설명 추가
    const criteria = [
        ['🆕 신규:', '조건 1: 이전 7일 광고비가 0원이고, 최근 7일 광고비가 0원 초과'],
        ['', '조건 2: 이전 7일 광고비가 있지만 증감률이 -10% ~ +10% 사이 (유지)'],
        ['📈 증가:', '이전 7일 광고비 대비 +10% 초과 증가'],
        ['📉 감소:', '이전 7일 광고비 대비 -10% 미만 감소'],
        ['⏸️ 중단:', '최근 7일 광고비가 0원'],
    ];

    criteria.forEach(([label, desc]) => {
        const row = sheet.addRow([label, desc]);
        if (label) {
            row.getCell(1).font = { bold: true, size: 10 };
        }
        row.getCell(2).font = { size: 9 };
        row.getCell(2).alignment = { wrapText: true };
    });

    // 열 너비
    sheet.getColumn(1).width = 8;
    sheet.getColumn(2).width = 12;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 15;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 12;
    sheet.getColumn(7).width = 12;
    sheet.getColumn(8).width = 10;
    sheet.getColumn(9).width = 12;
}

/**
 * 시트 4: Google vs Naver 매체 비교
 */
async function createPlatformComparisonSheet(
    workbook: ExcelJS.Workbook,
    platforms: PlatformComparison[]
) {
    const sheet = workbook.addWorksheet('Google vs Naver 매체 비교');

    // 제목
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Google vs Naver 매체 비교';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 헤더
    const headerRow = sheet.addRow(['매체', '최근7일 광고비', '점유율', '평균 CPC', 'CTR', '클릭수', '평가']);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // 데이터
    platforms.forEach(platform => {
        let evaluation = '';
        if (platform.avgCPC > 1000) {
            evaluation = 'CPC 효율성, CTR 높음';
        } else if (platform.ctr < 0.1) {
            evaluation = 'CPC 우수, CTR 개선 필요';
        } else {
            evaluation = '안정적';
        }

        const dataRow = sheet.addRow([
            platform.platform,
            platform.adSpend,
            platform.점유율.toFixed(1) + '%',
            Math.round(platform.avgCPC),
            platform.ctr.toFixed(2) + '%',
            platform.clicks,
            evaluation,
        ]);

        dataRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // 열 너비
    sheet.getColumn(1).width = 12;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 12;
    sheet.getColumn(4).width = 12;
    sheet.getColumn(5).width = 10;
    sheet.getColumn(6).width = 12;
    sheet.getColumn(7).width = 25;
}

/**
 * 시트 5: 개선 제안 및 액션 플랜
 */
async function createActionPlanSheet(
    workbook: ExcelJS.Workbook,
    insights: Insight[]
) {
    const sheet = workbook.addWorksheet('개선 제안 및 액션 플랜');

    // 제목
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '개선 제안 및 액션 플랜';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 즉시 조치 필요
    const urgentInsights = insights.filter(i => i.level === '즉시조치');
    if (urgentInsights.length > 0) {
        sheet.addRow([]);
        const urgentTitle = sheet.addRow(['🔴 즉시 조치 필요']);
        urgentTitle.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFF0000' } };

        const urgentHeader = sheet.addRow(['No', '이유', '제안 액션', '기간', '우선순위']);
        urgentHeader.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        urgentInsights.forEach((insight, index) => {
            const row = sheet.addRow([
                index + 1,
                insight.이유,
                insight.제안액션,
                insight.기간,
                insight.우선순위,
            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { wrapText: true };
            });
        });
    }

    // 적극적 기회
    const opportunityInsights = insights.filter(i => i.level === '적극적기회');
    if (opportunityInsights.length > 0) {
        sheet.addRow([]);
        const opportunityTitle = sheet.addRow(['🟡 적극적 기회']);
        opportunityTitle.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFA500' } };

        const opportunityHeader = sheet.addRow(['No', '이유', '제안 액션', '기간', '우선순위']);
        opportunityHeader.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC99' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        opportunityInsights.forEach((insight, index) => {
            const row = sheet.addRow([
                index + 1,
                insight.이유,
                insight.제안액션,
                insight.기간,
                insight.우선순위,
            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { wrapText: true };
            });
        });
    }

    // 긍정적 지표
    const positiveInsights = insights.filter(i => i.level === '긍정적지표');
    if (positiveInsights.length > 0) {
        sheet.addRow([]);
        const positiveTitle = sheet.addRow(['🟢 긍정적 지표 (유지 전략)']);
        positiveTitle.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF00B050' } };

        const positiveHeader = sheet.addRow(['No', '이유', '제안 액션', '기간', '우선순위']);
        positiveHeader.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        positiveInsights.forEach((insight, index) => {
            const row = sheet.addRow([
                index + 1,
                insight.이유,
                insight.제안액션,
                insight.기간,
                insight.우선순위,
            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { wrapText: true };
            });
        });
    }

    // 열 너비
    sheet.getColumn(1).width = 6;
    sheet.getColumn(2).width = 40;
    sheet.getColumn(3).width = 35;
    sheet.getColumn(4).width = 12;
    sheet.getColumn(5).width = 12;
}

/**
 * Excel 파일 다운로드
 */
function downloadExcelFile(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
