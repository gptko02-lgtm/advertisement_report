'use client';

import { useState } from 'react';

interface DataInputProps {
    onSubmit: (data: string) => void;
    isLoading: boolean;
}

export default function DataInput({ onSubmit, isLoading }: DataInputProps) {
    const [inputData, setInputData] = useState('');

    const handleSubmit = () => {
        if (inputData.trim()) {
            onSubmit(inputData);
        }
    };

    const sampleData = `매체	키워드(소재)	당일(광고비)	전일(광고비)	최근 7일(광고비)	이전 7일(광고비)	당월(광고비)	전월(광고비)	당일(CPC)	전일(CPC)	최근 7일(CPC)	이전 7일(CPC)	당월(CPC)	전월(CPC)	CVR	캠페인	광고그룹	노출수	클릭수	CTR
Google	CHATGPT강의	16,058	17,335	73,650	99,037	33,393	582,955	973	1,083	877	812	1,077	700	0.00%	MO_TOP 10_지피티	TOP10_MO	1,570	15	0.96%
Naver	챗GPT강의	10,318	6,160	26,598	23,320	16,478	173,437	1,042	1,232	1,108	686	1,177	458	0.00%	MO_TOP10_지피티	TOP10_MO	4,825	9	0.19%
Google	챗GPT교육	2,741	1,420	18,639	27,972	4,161	102,227	1,246	1,420	1,331	1,216	1,387	1,175	0.00%	PC_TOP 10_지피티	TOP10_PC	20	2	10.00%`;

    const handleLoadSample = () => {
        setInputData(sampleData);
    };

    return (
        <div className="card fade-in">
            <div className="flex items-center justify-between mb-4">
                <h2 className="gradient-text">📊 광고 데이터 입력</h2>
                <button
                    onClick={handleLoadSample}
                    className="btn btn-outline text-sm"
                    disabled={isLoading}
                >
                    샘플 데이터 불러오기
                </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                광고 플랫폼에서 복사한 데이터를 아래에 붙여넣으세요.
                <br />
                탭(Tab) 또는 쉼표로 구분된 데이터를 자동으로 인식합니다.
            </p>

            <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="여기에 광고 데이터를 붙여넣으세요..."
                className="input textarea mb-4"
                rows={12}
                disabled={isLoading}
            />

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={!inputData.trim() || isLoading}
                    className="btn btn-primary flex-1"
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            분석 중...
                        </>
                    ) : (
                        <>
                            <span>🔍</span>
                            데이터 분석하기
                        </>
                    )}
                </button>

                {inputData && (
                    <button
                        onClick={() => setInputData('')}
                        className="btn btn-outline"
                        disabled={isLoading}
                    >
                        초기화
                    </button>
                )}
            </div>

            <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <p className="text-xs text-[var(--color-text-secondary)]">
                    💡 <strong>Tip:</strong> Excel이나 Google Sheets에서 데이터를 선택하고 Ctrl+C로 복사한 후,
                    위 텍스트 영역에 Ctrl+V로 붙여넣으세요.
                </p>
            </div>
        </div>
    );
}
