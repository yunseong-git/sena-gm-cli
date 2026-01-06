'use client';

import { useState, useEffect } from 'react';
import { useHeroStore } from '@/store/useHeroStore';
import { apiClient } from '@/lib/apiClient';
import HeroCard from '@/components/hero/HeroCard';
import { ArchiveSearchResponseDto, ATTACK_SCORE_ENUM } from '@/types/archive.type';
import DefenseRegisterModal from '@/components/archive/DefenseRegisterModal'; // [New]
import AttackRegisterModal from '@/components/archive/AttackRegisterModal';   // [New]

// 화면 상태 타입
type ViewMode = 'SEARCH' | 'RESULT';

export default function GuildArchivePage() {
  const { heroes, setHeroes } = useHeroStore();

  // --- 상태 관리 ---
  const [viewMode, setViewMode] = useState<ViewMode>('SEARCH');
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [results, setResults] = useState<ArchiveSearchResponseDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // [New] 모달 상태 관리
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [targetDefenseId, setTargetDefenseId] = useState<string>(''); // 공략 달 방어덱 ID

  // 1. 초기 영웅 데이터 로드
  useEffect(() => {
    const fetchHeroes = async () => {
      if (Object.keys(heroes).length > 0) return;
      setLoading(true);
      try {
        const data = await apiClient('/hero');
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

  const heroList = Object.values(heroes);

  // 2. 영웅 선택 토글
  const toggleHeroSelection = (heroId: string) => {
    setSelectedHeroes((prev) => {
      if (prev.includes(heroId)) return prev.filter((id) => id !== heroId);
      if (prev.length < 3) return [...prev, heroId];
      return prev;
    });
  };

  // 3. 검색 실행
  const handleSearch = async () => {
    if (selectedHeroes.length !== 3) return;

    setIsSearching(true);
    setResults(null);

    try {
      // [API] 방어덱 검색 (POST)
      const data = await apiClient('/archive/search', {
        method: 'POST',
        body: JSON.stringify({ heroeIds: selectedHeroes }),
      });

      setResults(Array.isArray(data) ? data : data.payload || []);
      setViewMode('RESULT');
    } catch (error: any) {
      alert(error.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 4. 다시 검색하기
  const handleResetSearch = () => {
    setViewMode('SEARCH');
  };

  // --- 모달 핸들러 ---
  const handleRegisterDefense = () => {
    setIsDefenseModalOpen(true);
  };

  const handleRegisterAttack = (defenseId: string) => {
    setTargetDefenseId(defenseId);
    setIsAttackModalOpen(true);
  };

  // --- 렌더링 헬퍼 ---
  const getScoreColor = (score: ATTACK_SCORE_ENUM) => {
    switch (score) {
      case ATTACK_SCORE_ENUM.NICE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case ATTACK_SCORE_ENUM.GOOD: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ATTACK_SCORE_ENUM.TRY: return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-7xl mx-auto">

        {/* --- 헤더 --- */}
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

        {/* --- 상단: 검색 슬롯 (Sticky) --- */}
        <div className="sticky top-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex flex-col gap-1 w-full md:w-auto text-center md:text-left">
            <h2 className="font-bold text-gray-800 text-base">
              {viewMode === 'SEARCH' ? '방어덱 검색' : '검색 결과'}
            </h2>
            <p className="text-xs text-gray-500">
              {viewMode === 'SEARCH' ? '상대 방어덱 영웅 3명을 선택하세요.' : `총 ${results?.length || 0}개의 방어덱 데이터`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            {/* 선택 슬롯 3개 */}
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => {
                const heroId = selectedHeroes[index];
                const hero = heroes[heroId];

                return (
                  <div
                    key={index}
                    onClick={() => viewMode === 'SEARCH' && heroId && toggleHeroSelection(heroId)}
                    className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center transition-all relative overflow-hidden ${heroId
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-dashed border-gray-300 bg-gray-50'
                      } ${viewMode === 'SEARCH' && heroId ? 'cursor-pointer hover:border-red-400 hover:bg-red-50 group' : ''}`}
                  >
                    {heroId && hero ? (
                      <>
                        <span className="text-xl font-black text-blue-300 select-none transition-colors group-hover:text-red-300">
                          {hero.name.slice(0, 1)}
                        </span>
                        <div className="absolute bottom-0 w-full bg-blue-500 text-white text-[9px] text-center py-0.5 font-bold truncate px-0.5 transition-colors group-hover:bg-red-500">
                          {hero.name}
                        </div>
                        {viewMode === 'SEARCH' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[1px]">
                            <svg className="w-5 h-5 text-red-600 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-300 text-lg font-bold">+</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 검색 버튼 */}
            {viewMode === 'SEARCH' && (
              <button
                onClick={handleSearch}
                disabled={selectedHeroes.length !== 3 || isSearching}
                className={`h-10 px-5 rounded-xl font-bold text-sm transition shadow-sm whitespace-nowrap ${selectedHeroes.length === 3 && !isSearching
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            )}
          </div>
        </div>

        {/* --- [VIEW 1] 검색 모드: 영웅 리스트 --- */}
        {viewMode === 'SEARCH' && (
          <>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center animate-fade-in">
                {heroList.length > 0 ? (
                  heroList.map((hero) => {
                    const isSelected = selectedHeroes.includes(hero._id);
                    const isFull = selectedHeroes.length >= 3;
                    const isDisabled = isFull && !isSelected;

                    return (
                      <div
                        key={hero._id}
                        className={`relative transition-all duration-200 origin-center ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 rounded-xl z-10 scale-95' : ''
                          } ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:z-20'}`}
                        style={{ transform: 'scale(0.85)', margin: '-10px' }}
                      >
                        <HeroCard
                          heroId={hero._id}
                          mode="SIMPLE"
                          onClick={() => {
                            if (isDisabled) return;
                            toggleHeroSelection(hero._id);
                          }}
                        />
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-30">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-400 py-20">
                    등록된 영웅 데이터가 없습니다.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* --- [VIEW 2] 결과 모드: 방어덱 + 공략 리스트 --- */}
        {viewMode === 'RESULT' && (
          <div className="animate-slide-up space-y-8">
            {!results || results.length === 0 ? (
              // 데이터 없음 -> 방어덱 등록 유도
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
                <div className="text-5xl mb-4">🤷‍♂️</div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">데이터가 없습니다.</h2>
                <p className="text-sm text-gray-500 mb-6">
                  이 방어덱 조합을 처음 발견하셨나요?<br />
                  방어덱을 등록하고 공략을 공유해보세요!
                </p>
                <button
                  onClick={handleRegisterDefense}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5 text-sm"
                >
                  + 방어덱 등록하기
                </button>
              </div>
            ) : (
              // 데이터 있음 -> 방어덱 리스트
              results.map((defense) => (
                <div key={defense.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* 1. 방어덱 헤더 (영웅 구성 + 등록 버튼) */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* 뱃지 */}
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">DEFENSE</span>
                        {defense.isDefault && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300">기본 덱</span>}
                      </div>
                      {/* 방어덱 영웅 아이콘들 */}
                      <div className="flex items-center gap-2">
                        {defense.deck.heroes.map((hid) => (
                          <div key={hid} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200 relative">
                            {heroes[hid] ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold text-xs">
                                {heroes[hid].name.slice(0, 1)}
                              </div>
                            ) : <div className="w-full h-full bg-gray-300" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegisterAttack(defense.id)}
                      className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition border border-blue-100"
                    >
                      + 이 덱 공략 추가
                    </button>
                  </div>

                  {/* 2. 공략(공격덱) 리스트 */}
                  <div className="p-4 bg-gray-50/50">
                    {defense.attacks && defense.attacks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {defense.attacks.map((attack) => (
                          <div key={attack.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 hover:border-blue-200 group">
                            {/* 상단: 점수, 작성자, 날짜 */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getScoreColor(attack.score)}`}>
                                  {attack.score}
                                </span>
                                <span className="text-xs font-bold text-gray-700">{attack.authorName}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {new Date(attack.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* 중단: 공격덱 영웅 구성 */}
                            <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg w-fit">
                              <span className="text-[10px] font-bold text-gray-400 mr-1">ATTACK</span>
                              {attack.deck.heroes.map((hid) => (
                                <div key={hid} className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                                  {heroes[hid]?.name.slice(0, 1)}
                                </div>
                              ))}
                            </div>

                            {/* 하단: 설명 */}
                            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                              {attack.description || '설명이 없습니다.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl bg-white">
                        아직 등록된 공략이 없습니다. <br />
                        첫 번째 승리 공식을 공유해주세요!
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* --- 모달 컴포넌트 --- */}
      <DefenseRegisterModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        initialHeroes={selectedHeroes} // 검색했던 조합 자동 세팅
      />

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