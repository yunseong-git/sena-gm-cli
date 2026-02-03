'use client';

import { useState, useEffect } from 'react';
import { useHeroStore } from '@/store/useHeroStore';
import { apiClient } from '@/lib/apiClient';
import { DefenseDeckResponseDto } from '@/types/archive.type'; // 타입 변경 확인
import DefenseRegisterModal from '@/components/archive/DefenseRegisterModal';
import AttackRegisterModal from '@/components/archive/AttackRegisterModal';
import ArchiveSearchSection from '@/components/archive/ArchiveSearchSection';
import ArchiveResultSection from '@/components/archive/ArchiveResultSection';

type ViewMode = 'SEARCH' | 'RESULT';

export default function GuildArchivePage() {
  const { heroes, setHeroes } = useHeroStore();

  // --- 상태 관리 ---
  const [viewMode, setViewMode] = useState<ViewMode>('SEARCH');
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [results, setResults] = useState<DefenseDeckResponseDto[] | null>(null);
  const [loading, setLoading] = useState(false); // 영웅 데이터 로딩
  const [isSearching, setIsSearching] = useState(false); // 검색 API 호출 로딩

  // 모달 상태
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [targetDefenseId, setTargetDefenseId] = useState<string>('');

  // 1. 초기 영웅 데이터 로드 (없으면 API 호출)
  useEffect(() => {
    const fetchHeroes = async () => {
      if (Object.keys(heroes).length > 0) return;
      setLoading(true);
      try {
        const data = await apiClient('/hero');
        // 백엔드 응답 구조에 따라 배열인지 payload인지 확인
        const heroList = Array.isArray(data) ? data : data.payload;
        if (heroList) setHeroes(heroList);
      } catch (error) {
        console.error('영웅 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, [heroes, setHeroes]);

  // 2. 영웅 선택 토글 (최대 3명)
  const toggleHeroSelection = (heroId: string) => {
    setSelectedHeroes((prev) => {
      if (prev.includes(heroId)) return prev.filter((id) => id !== heroId);
      if (prev.length < 3) return [...prev, heroId];
      return prev;
    });
  };

  // 3. 검색 실행
  const handleSearch = async () => {
    if (selectedHeroes.length !== 3) {
      alert('영웅 3명을 모두 선택해야 검색할 수 있습니다.');
      return;
    }

    setIsSearching(true);
    setResults(null);

    try {
      // POST /archive/search
      // DTO 필드명: heroIds (백엔드 수정사항 반영)
      const data = await apiClient('/archive/search', {
        method: 'POST',
        body: JSON.stringify({ heroIds: selectedHeroes }),
      });

      // [수정] 응답 구조에 따라 데이터 추출 (Wrapper DTO 대응)
      // 백엔드가 ArchiveSearchResDto { results: [] } 를 반환한다고 가정
      // 만약 배열로 온다면 data 자체를 사용
      const searchResults = data?.results || (Array.isArray(data) ? data : []);

      if (!Array.isArray(searchResults)) {
        setResults([]);
        // alert('서버 응답 형식이 올바르지 않습니다.');
      } else {
        setResults(searchResults);
        setViewMode('RESULT');
      }

    } catch (error: any) {
      console.error('Search Error:', error);
      alert(error.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 4. 다시 검색하기 (결과 -> 검색 화면)
  const handleResetSearch = () => {
    setViewMode('SEARCH');
    // 선택된 영웅은 유지하여 수정을 용이하게 함
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-7xl mx-auto">

        {/* 헤더 & 뒤로가기 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏰 길드 아카이브</h1>
          {viewMode === 'RESULT' && (
            <button
              onClick={handleResetSearch}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition px-3 py-2 rounded-lg hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              영웅 다시 선택
            </button>
          )}
        </div>

        {/* 뷰 모드에 따라 컴포넌트 교체 */}
        {viewMode === 'SEARCH' ? (
          <ArchiveSearchSection
            selectedHeroes={selectedHeroes}
            onToggleHero={toggleHeroSelection}
            onSearch={handleSearch}
            isSearching={isSearching}
            loading={loading}
          />
        ) : (
          <ArchiveResultSection
            results={results}
            selectedHeroes={selectedHeroes} // [New] 검색 조건 표시를 위해 전달
            onRegisterDefense={() => setIsDefenseModalOpen(true)}
            onRegisterAttack={(defenseId) => {
              setTargetDefenseId(defenseId);
              setIsAttackModalOpen(true);
            }}
          />
        )}

      </div>

      {/* 모달 컴포넌트들 */}

      {/* 방어덱 등록 모달 */}
      <DefenseRegisterModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        initialHeroes={selectedHeroes} // 검색했던 조합 자동 세팅
      />

      {/* 공격덱 등록 모달 (타겟 방어덱 ID 전달) */}
      {targetDefenseId && (
        <AttackRegisterModal
          isOpen={isAttackModalOpen}
          onClose={() => setIsAttackModalOpen(false)}
          defenseId={targetDefenseId}
        />
      )}
    </main>
  );
}