'use client';

import { useState } from 'react';
import Link from 'next/link';
import { parseNaverWeeklyData, parseGoogleWeeklyData, calculateWeekRange, calculatePreviousWeekRange, AdditionalMetrics } from '@/utils/weeklyDataParser';
import { generateWeeklySummary } from '@/utils/weeklyAnalyticsEngine';
import { generateWeeklyExcelReport } from '@/utils/weeklyExcelExporter';

export default function WeeklyReportPage() {
    const [naverData, setNaverData] = useState('');
    const [googleData, setGoogleData] = useState('');
    const [gaConversions, setGaConversions] = useState('');
    const [realInquiries, setRealInquiries] = useState('');
    const [perfmaxBudget, setPerfmaxBudget] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');

        try {
            // 1. 데이터 파싱
            const parsedNaver = parseNaverWeeklyData(naverData);
            const parsedGoogle = parseGoogleWeeklyData(googleData);

            // 2. 추가 지표 파싱
            const metrics: AdditionalMetrics = {
                GA전환수: parseInt(gaConversions) || 0,
                실문의건수: parseInt(realInquiries) || 0,
                퍼맥스광고비: parseInt(perfmaxBudget) || 0,
            };

            // 3. 분석 수행
            const summary = generateWeeklySummary(parsedNaver, parsedGoogle, metrics);

            // 4. 날짜 범위 계산
            const today = new Date();
            const lastWeek = calculateWeekRange(today);
            const prevWeek = calculatePreviousWeekRange(today);
            const lastWeekRange = `${lastWeek.start}~${lastWeek.end}`;
            const prevWeekRange = `${prevWeek.start}~${prevWeek.end}`;

            // 5. 엑셀 생성
            await generateWeeklyExcelReport(summary, lastWeekRange, prevWeekRange);

            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : '데이터 처리 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] shadow-sm">
                <div className="container py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="gradient-text">📅 주간 광고 리포트 생성기</h1>
                            <p className="text-[var(--color-text-secondary)] mt-2">
                                주간 광고 데이터를 분석하고 운영 리포트를 자동 생성합니다
                            </p>
                        </div>
                        <Link href="/" className="btn btn-outline">
                            ← 일일 리포트
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8">
                <div className="space-y-6">
                    {/* 네이버 데이터 입력 */}
                    <div className="card fade-in">
                        <h2 className="gradient-text mb-4">📊 [1] 네이버 주간 데이터</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            네이버 광고 관리자에서 키워드 보고서 (주간 데이터)를 복사해서 붙여넣으세요
                        </p>
                        <textarea
                            value={naverData}
                            onChange={(e) => setNaverData(e.target.value)}
                            placeholder="캠페인	광고그룹	키워드	일별	노출수	클릭수	평균클릭비용(VAT포함,원)	총비용(VAT포함,원)	평균노출순위
MO_TOP10_지피티	TOP10_MO	-	2025.12.08.	1097	3	704	2112	2.9
..."
                            className="input textarea"
                            rows={8}
                            disabled={isLoading}
                        />
                    </div>

                    {/* 구글 데이터 입력 */}
                    <div className="card fade-in">
                        <h2 className="gradient-text mb-4">🔍 [2] 구글 주간 데이터</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            구글 Ads에서 키워드별 실적 (주간 데이터)을 복사해서 붙여넣으세요
                        </p>
                        <textarea
                            value={googleData}
                            onChange={(e) => setGoogleData(e.target.value)}
                            placeholder="캠페인	광고그룹	검색 키워드	일	통화 코드	키워드 최대 CPC	노출수	클릭수	비용	평균 CPC
MO_TOP 10_지피티	TOP10_MO	AI활용교육	2026-01-05	KRW	10000	24	1	979	979
..."
                            className="input textarea"
                            rows={8}
                            disabled={isLoading}
                        />
                    </div>

                    {/* 추가 지표 입력 */}
                    <div className="card fade-in">
                        <h2 className="gradient-text mb-4">📝 [3] 추가 지표 입력</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            아래 항목들을 수기로 입력해주세요 (GA 데이터 및 퍼맥스 광고비)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    GA전환수
                                </label>
                                <input
                                    type="number"
                                    value={gaConversions}
                                    onChange={(e) => setGaConversions(e.target.value)}
                                    placeholder="예: 3"
                                    className="input"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    실 문의 건수
                                </label>
                                <input
                                    type="number"
                                    value={realInquiries}
                                    onChange={(e) => setRealInquiries(e.target.value)}
                                    placeholder="예: 2"
                                    className="input"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    퍼맥스 광고비 (원)
                                </label>
                                <input
                                    type="number"
                                    value={perfmaxBudget}
                                    onChange={(e) => setPerfmaxBudget(e.target.value)}
                                    placeholder="예: 48733"
                                    className="input"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="card bg-red-50 border-red-200 fade-in">
                            <p className="text-red-800 font-medium">⚠️ 오류 발생</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="card fade-in">
                        <button
                            onClick={handleGenerate}
                            disabled={!naverData || !googleData || isLoading}
                            className="btn btn-primary w-full text-lg py-4"
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <span>📊</span>
                                    주간 리포트 생성하기
                                </>
                            )}
                        </button>
                        <p className="text-xs text-[var(--color-text-secondary)] text-center mt-3">
                            💡 모든 데이터를 입력한 후 버튼을 클릭하면 주간 광고 운영 리포트가 다운로드됩니다
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
