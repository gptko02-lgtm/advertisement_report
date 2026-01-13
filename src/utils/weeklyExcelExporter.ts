// 주간 광고 리포트 Excel 생성

import ExcelJS from 'exceljs';
import { WeeklySummary } from './weeklyAnalyticsEngine';

/**
 * 주간 광고 리포트 Excel 생성
 */
export async function generateWeeklyExcelReport(
    summary: {
        전체: WeeklySummary;
        네이버: WeeklySummary;
        구글: WeeklySummary;
    },
    lastWeekRange: string,  // "01.05~01.09"
    prevWeekRange: string,  // "12.29~01.02"
    prevWeekData?: WeeklySummary  // 지지난주 데이터 (선택적)
): Promise<void> {
    // ExcelJS를 안전하게 접근 (Next.js 빌드 호환성)
    const ExcelJSWorkbook = (ExcelJS as any).default?.Workbook || ExcelJS.Workbook;
    if (!ExcelJSWorkbook) {
        throw new Error('ExcelJS Workbook을 로드할 수 없습니다. ExcelJS 라이브러리를 확인해주세요.');
    }
    const workbook = new ExcelJSWorkbook();
    const sheet = workbook.addWorksheet('주간 광고 운영');

    let currentRow = 1;

    // ============================================
    // 제목
    // ============================================
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const titleCell = sheet.getCell(`A${currentRow}`);
    titleCell.value = '지피티코리아 주간 광고운영내역';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // 부제
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const subtitleCell = sheet.getCell(`A${currentRow}`);
    subtitleCell.value = '네이버 건매수, 구글 건매수';
    subtitleCell.font = { size: 10, color: { argb: 'FFFF0000' } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;

    currentRow++; // 빈 줄

    // ============================================
    // 운영이슈 박스
    // ============================================
    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const issueHeaderCell = sheet.getCell(`A${currentRow}`);
    issueHeaderCell.value = '운영이슈';
    issueHeaderCell.font = { bold: true, size: 11 };
    issueHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    issueHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
    issueHeaderCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
    };
    currentRow++;

    sheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const issueContentCell = sheet.getCell(`A${currentRow}`);
    issueContentCell.value = '- 일광고비 7만원 이하 운영 (PC 1,300 / 모바일 1,800)';
    issueContentCell.font = { size: 10 };
    issueContentCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    issueContentCell.alignment = { horizontal: 'left', vertical: 'middle' };
    issueContentCell.border = {
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
    };
    sheet.getRow(currentRow).height = 30;
    currentRow++;

    currentRow++; // 빈 줄

    // ============================================
    // 1. 전체 섹션
    // ============================================
    currentRow = addWeeklySection(sheet, currentRow, '1. 전체', summary.전체, lastWeekRange, prevWeekRange, prevWeekData, true);
    currentRow++; // 빈 줄

    // ============================================
    // 2. 네이버 섹션
    // ============================================
    currentRow = addWeeklySection(sheet, currentRow, '2. 네이버', summary.네이버, lastWeekRange, prevWeekRange, undefined, false);
    currentRow++; // 빈 줄

    // ============================================
    // 3. 구글 섹션
    // ============================================
    currentRow = addWeeklySection(sheet, currentRow, '3. 구글', summary.구글, lastWeekRange, prevWeekRange, undefined, false);

    // 열 너비 설정
    sheet.getColumn(1).width = 15;  // 주
    sheet.getColumn(2).width = 12;  // 노출
    sheet.getColumn(3).width = 10;  // 클릭
    sheet.getColumn(4).width = 10;  // CPC
    sheet.getColumn(5).width = 15;  // 광고비
    sheet.getColumn(6).width = 12;  // GA전환수
    sheet.getColumn(7).width = 12;  // 실문의건수
    sheet.getColumn(8).width = 12;  // CPA
    sheet.getColumn(9).width = 15;  // 퍼맥스광고비

    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    downloadExcelFile(buffer, `지피티코리아_주간광고운영내역_${lastWeekRange.replace('~', '-')}.xlsx`);
}

/**
 * 주간 섹션 추가
 */
function addWeeklySection(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    title: string,
    data: WeeklySummary,
    lastWeekRange: string,
    prevWeekRange: string,
    prevWeekData: WeeklySummary | undefined,
    showAllColumns: boolean
): number {
    let currentRow = startRow;

    // 섹션 제목 (배경색 없음, 검정 글씨)
    sheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const sectionTitle = sheet.getCell(`A${currentRow}`);
    sectionTitle.value = title;
    sectionTitle.font = { bold: true, size: 11, color: { argb: 'FF000000' } };  // 검정 글씨
    sectionTitle.alignment = { horizontal: 'left', vertical: 'middle' };
    sheet.getRow(currentRow).height = 20;
    currentRow++;

    // 헤더 행
    const headers = showAllColumns
        ? ['주', '노출', '클릭', 'CPC', '광고비', 'GA전환수', '실문의건수', 'CPA', '퍼맥스광고비']
        : ['주', '노출', '클릭', 'CPC', '광고비', 'GA전환수', '실문의건수', 'CPA'];

    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });
    currentRow++;

    // 지지난주 데이터 행 (먼저 표시)
    const prevWeekValues = [
        prevWeekRange,
        prevWeekData ? prevWeekData.노출수 : '',
        prevWeekData ? prevWeekData.클릭수 : '',
        prevWeekData ? prevWeekData.CPC : '',
        prevWeekData ? prevWeekData.광고비 : '',
        prevWeekData && showAllColumns ? prevWeekData.GA전환수 : '',
        prevWeekData && showAllColumns ? prevWeekData.실문의건수 : '',
        prevWeekData && showAllColumns ? prevWeekData.CPA : '',
    ];

    if (showAllColumns) {
        prevWeekValues.push(prevWeekData ? prevWeekData.퍼맥스광고비 : '');
    }

    const prevWeekRow = sheet.addRow(prevWeekValues);
    styleDataRow(prevWeekRow);

    // 지지난주 데이터가 있으면 숫자 포맷 적용
    if (prevWeekData) {
        prevWeekRow.getCell(2).numFmt = '#,##0';  // 노출
        prevWeekRow.getCell(3).numFmt = '#,##0';  // 클릭
        prevWeekRow.getCell(4).numFmt = '#,##0';  // CPC
        prevWeekRow.getCell(5).numFmt = '#,##0';  // 광고비
        if (showAllColumns) {
            prevWeekRow.getCell(6).numFmt = '#,##0';  // GA전환수
            prevWeekRow.getCell(7).numFmt = '#,##0';  // 실문의건수
            prevWeekRow.getCell(8).numFmt = '#,##0';  // CPA
            prevWeekRow.getCell(9).numFmt = '#,##0';  // 퍼맥스광고비
        }
    }
    currentRow++;

    // 지난주 데이터 행 (두 번째로 표시)
    const lastWeekValues = [
        lastWeekRange,
        data.노출수,
        data.클릭수,
        data.CPC,
        data.광고비,
        showAllColumns ? data.GA전환수 : '',
        showAllColumns ? data.실문의건수 : '',
        showAllColumns ? data.CPA : '',
    ];

    if (showAllColumns) {
        lastWeekValues.push(data.퍼맥스광고비);
    }

    const lastWeekRow = sheet.addRow(lastWeekValues);
    styleDataRow(lastWeekRow);

    // 숫자 포맷 적용
    lastWeekRow.getCell(2).numFmt = '#,##0';  // 노출
    lastWeekRow.getCell(3).numFmt = '#,##0';  // 클릭
    lastWeekRow.getCell(4).numFmt = '#,##0';  // CPC
    lastWeekRow.getCell(5).numFmt = '#,##0';  // 광고비
    if (showAllColumns) {
        lastWeekRow.getCell(6).numFmt = '#,##0';  // GA전환수
        lastWeekRow.getCell(7).numFmt = '#,##0';  // 실문의건수
        lastWeekRow.getCell(8).numFmt = '#,##0';  // CPA
        lastWeekRow.getCell(9).numFmt = '#,##0';  // 퍼맥스광고비
    }
    currentRow++;

    // 전주 비교 행 (공백)
    const comparisonValues = ['전주 비교', '', '', '', '', '', '', ''];
    if (showAllColumns) {
        comparisonValues.push('');
    }

    const comparisonRow = sheet.addRow(comparisonValues);
    styleDataRow(comparisonRow);
    comparisonRow.getCell(1).font = { bold: true };
    currentRow++;

    return currentRow;
}

/**
 * 데이터 행 스타일 적용
 */
function styleDataRow(row: ExcelJS.Row) {
    row.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
}

/**
 * Excel 파일 다운로드
 */
function downloadExcelFile(buffer: any, filename: string) {
    try {
        // Buffer를 Uint8Array로 변환하여 Blob으로 생성
        const uint8Array = new Uint8Array(buffer);
        const blob = new Blob([uint8Array], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // Blob URL 생성 및 다운로드
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // 링크를 DOM에 추가하고 클릭
        document.body.appendChild(link);
        link.click();

        // 정리
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Excel download failed:', error);
        throw new Error('파일 다운로드에 실패했습니다.');
    }
}
