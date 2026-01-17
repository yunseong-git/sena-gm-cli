'use client';

import { useHeroStore, HERO_SKILL_ENUM } from '@/store/useHeroStore';
// import { ArchiveSearchResponseDto, ATTACK_SCORE_ENUM } from '@/types/archive.type'; 
// 타입을 any로 임시 처리하거나 정확한 타입을 import 해야 함 (충돌 방지)
import HeroCard from '@/components/hero/HeroCard';

interface Props {
  results: any[] | null; // 유연하게 any로 처리하여 구조 변경에 대응
  selectedHeroes: string[];
  onRegisterDefense: () => void;
  onRegisterAttack: (defenseId: string) => void;
}

export default function ArchiveResultSection({ results, selectedHeroes, onRegisterDefense, onRegisterAttack }: Props) {
  const { heroes } = useHeroStore();

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'nice': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'try': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const getSkillLabel = (type: string) => {
    return type === HERO_SKILL_ENUM.SKILL_1 ? '1스' : '2스';
  };

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
          <div key={defense._id || defense.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* 방어덱 헤더 */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">DEFENSE</span>
                  {defense.isDefault && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300">기본 덱</span>}
                </div>
                {/* 영웅 아이콘 - DTO 구조에 따라 분기 처리 */}
                <div className="flex items-center gap-2">
                  {(defense.heroes || defense.deck?.heroes || []).map((hid: string) => (
                    <div key={hid} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200 relative">
                      {heroes[hid] ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold text-xs">
                          {heroes[hid].name.slice(0, 1)}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-500">?</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onRegisterAttack(defense._id || defense.id)}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition border border-blue-100"
              >
                + 이 덱 공략 추가
              </button>
            </div>

            {/* 공략(공격덱) 리스트 */}
            <div className="p-4 bg-gray-50/50">
              {/* attacks 필드명 확인 (attackDecks일 수도 있음) */}
              {(defense.attackDecks || defense.attacks || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(defense.attackDecks || defense.attacks || []).map((attack: any) => (
                    <div key={attack._id || attack.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 hover:border-blue-200 group">

                      {/* 상단 정보 */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {/* score가 있을 때만 표시 */}
                          {attack.score && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getScoreColor(attack.score)}`}>
                              {attack.score}
                            </span>
                          )}
                          <span className="text-xs font-bold text-gray-700">{attack.authorName || '익명'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(attack.createdAt)}</span>
                      </div>

                      {/* 공격덱 영웅 구성 */}
                      <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg w-fit">
                        <span className="text-[10px] font-bold text-gray-400 mr-1">ATTACK</span>
                        {(attack.heroes || attack.deck?.heroes || []).map((hid: string) => (
                          <div key={hid} className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                            {heroes[hid] ? heroes[hid].name.slice(0, 1) : '?'}
                          </div>
                        ))}
                      </div>

                      {/* 스킬 예약 정보 표시 */}
                      {(attack.skillReservation || attack.deck?.skillReservation || []).length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-bold text-gray-400 block mb-1">SKILL ORDER</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(attack.skillReservation || attack.deck?.skillReservation).map((skill: any, idx: number) => {
                              const heroList = attack.heroes || attack.deck?.heroes || [];
                              const targetHeroId = heroList[skill.heroIndex];
                              const targetHeroName = targetHeroId && heroes[targetHeroId] ? heroes[targetHeroId].name : '?';

                              return (
                                <div key={idx} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  <span className="bg-white px-1 rounded text-[9px] text-yellow-600 border border-yellow-100">{idx + 1}</span>
                                  <span>{targetHeroName} {getSkillLabel(skill.skillType)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all border-t border-gray-100 pt-2 mt-2">
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
  );
}