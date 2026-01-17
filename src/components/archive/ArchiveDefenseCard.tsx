'use client';

import { useHeroStore, HERO_SKILL_ENUM } from '@/store/useHeroStore';
import { DefenseDeckResponseDto } from '@/types/archive.type';

interface Props {
  defense: DefenseDeckResponseDto;
  onRegisterAttack: (defenseId: string) => void;
}

export default function ArchiveDefenseCard({ defense, onRegisterAttack }: Props) {
  const { heroes } = useHeroStore();

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

  // 점수 뱃지 컬러 (score 필드가 있다면 사용)
  const getScoreColor = (score?: string) => {
    switch (score) {
      case 'nice': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'try': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      {/* 1. 방어덱 헤더 */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start gap-1">
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">DEFENSE</span>
            {defense.isDefault && <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300">기본 덱</span>}
          </div>

          {/* 방어덱 영웅 아이콘 (Flattened: defense.heroes) */}
          <div className="flex items-center gap-2">
            {defense.heroes?.map((hid) => (
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
          onClick={() => onRegisterAttack(defense._id)}
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition border border-blue-100"
        >
          + 이 덱 공략 추가
        </button>
      </div>

      {/* 2. 공략(공격덱) 리스트 */}
      <div className="p-4 bg-gray-50/50">
        {(defense.attackDecks || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {defense.attackDecks.map((attack) => (
              <div key={attack._id} className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 group ${attack.isPicked ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-100 hover:border-blue-200'}`}>

                {/* 상단 정보 */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {/* isPicked(추천) 뱃지 */}
                    {attack.isPicked && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-yellow-100 text-yellow-700 border-yellow-200">
                        PICK
                      </span>
                    )}
                    {/* Score가 있다면 표시 */}
                    {attack.score && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getScoreColor(attack.score)}`}>
                        {attack.score}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gray-700">{attack.authorName}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{formatDate(attack.createdAt)}</span>
                </div>

                {/* 공격덱 영웅 구성 (Flattened: attack.heroes) */}
                <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg w-fit">
                  <span className="text-[10px] font-bold text-gray-400 mr-1">ATTACK</span>
                  {attack.heroes?.map((hid) => (
                    <div key={hid} className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                      {heroes[hid] ? heroes[hid].name.slice(0, 1) : '?'}
                    </div>
                  ))}
                </div>

                {/* 스킬 예약 정보 표시 */}
                {attack.skillReservation && attack.skillReservation.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">SKILL ORDER</span>
                    <div className="flex flex-wrap gap-1.5">
                      {attack.skillReservation.map((skill, idx) => {
                        const targetHeroId = attack.heroes?.[skill.heroIndex];
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
  );
}