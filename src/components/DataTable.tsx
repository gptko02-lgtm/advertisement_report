'use client';

import { AdData } from '@/utils/dataParser';
import { useState } from 'react';

interface DataTableProps {
    data: AdData[];
}

export default function DataTable({ data }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof AdData; direction: 'asc' | 'desc' } | null>(null);

    // 검색 필터링
    const filteredData = data.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            row.매체.toLowerCase().includes(searchLower) ||
            row.키워드.toLowerCase().includes(searchLower) ||
            row.캠페인.toLowerCase().includes(searchLower)
        );
    });

    // 정렬
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue);
        const bString = String(bValue);
        return sortConfig.direction === 'asc'
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
    });

    const handleSort = (key: keyof AdData) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return {
                    key,
                    direction: current.direction === 'asc' ? 'desc' : 'asc',
                };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key: keyof AdData) => {
        if (sortConfig?.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const formatNumber = (num: number) => num.toLocaleString('ko-KR');

    return (
        <div className="card fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="gradient-text">📋 광고 데이터 상세</h3>
                <div className="text-sm text-[var(--color-text-secondary)]">
                    총 {data.length}개 항목 (표시: {filteredData.length}개)
                </div>
            </div>

            {/* 검색 */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="매체, 키워드, 캠페인으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                />
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('매체')} className="cursor-pointer">
                                매체 {getSortIcon('매체')}
                            </th>
                            <th onClick={() => handleSort('키워드')} className="cursor-pointer">
                                키워드 {getSortIcon('키워드')}
                            </th>
                            <th onClick={() => handleSort('당일광고비')} className="cursor-pointer text-right">
                                당일 광고비 {getSortIcon('당일광고비')}
                            </th>
                            <th onClick={() => handleSort('당일CPC')} className="cursor-pointer text-right">
                                당일 CPC {getSortIcon('당일CPC')}
                            </th>
                            <th onClick={() => handleSort('클릭수')} className="cursor-pointer text-right">
                                클릭수 {getSortIcon('클릭수')}
                            </th>
                            <th onClick={() => handleSort('노출수')} className="cursor-pointer text-right">
                                노출수 {getSortIcon('노출수')}
                            </th>
                            <th className="text-right">CTR</th>
                            <th>캠페인</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className="badge badge-info">{row.매체}</span>
                                    </td>
                                    <td className="font-medium">{row.키워드}</td>
                                    <td className="text-right">₩{formatNumber(row.당일광고비)}</td>
                                    <td className="text-right">₩{formatNumber(row.당일CPC)}</td>
                                    <td className="text-right">{formatNumber(row.클릭수)}</td>
                                    <td className="text-right">{formatNumber(row.노출수)}</td>
                                    <td className="text-right">{row.CTR}</td>
                                    <td className="text-sm text-[var(--color-text-secondary)]">
                                        {row.캠페인}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center text-[var(--color-text-secondary)] py-8">
                                    {searchTerm ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {sortedData.length > 10 && (
                <div className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                    💡 테이블 헤더를 클릭하여 정렬할 수 있습니다
                </div>
            )}
        </div>
    );
}
