'use client';

import { useState } from 'react';
import DataInput from '@/components/DataInput';
import InsightPanel from '@/components/InsightPanel';
import DataTable from '@/components/DataTable';
import ExportButton from '@/components/ExportButton';
import { parseDataText, AdData } from '@/utils/dataParser';
import { calculateSummaryMetrics, analyzeKeywordPerformance, comparePlatforms } from '@/utils/analyticsEngine';
import { generateInsights } from '@/utils/insightGenerator';
import type { SummaryMetrics, KeywordPerformance, PlatformComparison } from '@/utils/analyticsEngine';
import type { Insight } from '@/utils/insightGenerator';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState<AdData[]>([]);
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [keywords, setKeywords] = useState<KeywordPerformance[]>([]);
  const [platforms, setPlatforms] = useState<PlatformComparison[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string>('');

  const handleDataSubmit = async (inputText: string) => {
    setIsLoading(true);
    setError('');

    try {
      // 1. 데이터 파싱
      const parsedData = parseDataText(inputText);
      setRawData(parsedData);

      // 2. 분석 수행
      const summaryMetrics = calculateSummaryMetrics(parsedData);
      const keywordPerformance = analyzeKeywordPerformance(parsedData);
      const platformComparison = comparePlatforms(parsedData);

      setMetrics(summaryMetrics);
      setKeywords(keywordPerformance);
      setPlatforms(platformComparison);

      // 3. 인사이트 생성
      const generatedInsights = generateInsights(summaryMetrics, keywordPerformance, platformComparison);
      setInsights(generatedInsights);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const hasResults = rawData.length > 0 && metrics !== null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="gradient-text">🎯 광고 성과 분석 리포트 생성기</h1>
              <p className="text-[var(--color-text-secondary)] mt-2">
                광고 데이터를 붙여넣으면 자동으로 분석하고 인사이트가 포함된 엑셀 리포트를 생성합니다
              </p>
            </div>
            <a href="/weekly" className="btn btn-outline">
              주간 리포트 →
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-6">
          {/* Data Input */}
          <DataInput onSubmit={handleDataSubmit} isLoading={isLoading} />

          {/* Error Message */}
          {error && (
            <div className="card bg-red-50 border-red-200 fade-in">
              <p className="text-red-800 font-medium">⚠️ 오류 발생</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <>
              {/* Insights Panel */}
              <InsightPanel metrics={metrics!} insights={insights} />

              {/* Data Table */}
              <DataTable data={rawData} />

              {/* Export Button */}
              <ExportButton
                rawData={rawData}
                metrics={metrics!}
                keywords={keywords}
                platforms={platforms}
                insights={insights}
              />
            </>
          )}

          {/* Empty State */}
          {!hasResults && !isLoading && !error && (
            <div className="card text-center py-16 fade-in">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">데이터를 입력해주세요</h3>
              <p className="text-[var(--color-text-secondary)]">
                위의 입력창에 광고 플랫폼 데이터를 붙여넣으면 자동으로 분석이 시작됩니다
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-bg-card)] border-t border-[var(--color-border)] mt-16">
        <div className="container py-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            💡 이 도구는 ChatGPT 교육 광고 성과 분석을 위해 제작되었습니다
          </p>
        </div>
      </footer>
    </div>
  );
}
