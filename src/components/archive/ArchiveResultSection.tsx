'use client';

import { DefenseDeckResponseDto } from '@/types/archive.type';
import HeroCard from '@/components/hero/HeroCard';
import ArchiveDefenseCard from './ArchiveDefenseCard'; // [New] 분리된 컴포넌트

interface Props {
  results: DefenseDeckResponseDto[] | null;
  selectedHeroes: string[];
  onRegisterDefense: () => void;
  onRegisterAttack: (defenseId: string) => void;
}

export default function ArchiveResultSection({ results, selectedHeroes, onRegisterDefense, onRegisterAttack }: Props) {

  return (
    <div className="animate-slide-up space-y-8">

      {/* 1. 검색 조건 표시 */}
      {selectedHeroes && selectedHeroes.length === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-500 mb-4">현재 검색된 방어덱 조합</h3>
          <div className="flex gap-4">
            {selectedHeroes.map((hid) => (
              <div key={hid} className="scale-90 origin-top">
                <HeroCard heroId={hid} mode="SIMPLE" className="pointer-events-none" />
              </div>
            ))}
          </div>

          {/* [New] 결과가 있을 때도 방어덱을 추가할 수 있도록 버튼 노출 */}
          {results && results.length > 0 && (
            <button
              onClick={onRegisterDefense}
              className="mt-6 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 border border-blue-100 transition flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              이 조합으로 새 방어덱 등록하기
            </button>
          )}
        </div>
      )}

      {/* 2. 결과 리스트 */}
      {!results || results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="text-5xl mb-4">🤷‍♂️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">데이터가 없습니다.</h2>
          <p className="text-sm text-gray-500 mb-6">이 방어덱 조합을 처음 발견하셨나요?<br />방어덱을 등록하고 공략을 공유해보세요!</p>
          <button onClick={onRegisterDefense} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5 text-sm">
            + 방어덱 등록하기
          </button>
        </div>
      ) : (
        results.map((defense) => (
          <ArchiveDefenseCard
            key={defense._id}
            defense={defense}
            onRegisterAttack={onRegisterAttack}
          />
        ))
      )}
    </div>
  );
}