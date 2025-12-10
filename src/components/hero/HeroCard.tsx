'use client';

import { useState } from 'react';
import { useHeroStore, HERO_RANK_ENUM, HERO_SKILL_ENUM, HERO_TYPE_ENUM } from '@/store/useHeroStore';

interface Props {
  heroId: string;
  mode: 'SIMPLE' | 'DETAIL'; // SIMPLE: 정보만, DETAIL: 스킬상호작용 포함
  className?: string;
  onClick?: () => void;
}

// 랭크별 스타일 (배경 그라데이션 & 테두리 & 텍스트 색상)
const RANK_STYLE: Record<HERO_RANK_ENUM, { bg: string, border: string, text: string }> = {
  [HERO_RANK_ENUM.UR]: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-700',
    border: 'border-red-500',
    text: 'text-red-100'
  },
  [HERO_RANK_ENUM.SSR]: {
    bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    border: 'border-yellow-400',
    text: 'text-yellow-900'
  },
  [HERO_RANK_ENUM.SR]: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    border: 'border-purple-400',
    text: 'text-purple-100'
  },
  [HERO_RANK_ENUM.R]: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    border: 'border-blue-400',
    text: 'text-blue-100'
  }
};

// 타입 텍스트 매핑
const TYPE_TEXT: Record<HERO_TYPE_ENUM, string> = {
  [HERO_TYPE_ENUM.DEFENSE]: '방어형',
  [HERO_TYPE_ENUM.ATTACK]: '공격형',
  [HERO_TYPE_ENUM.MAGIC]: '마법형',
  [HERO_TYPE_ENUM.SUPPORT]: '지원형',
  [HERO_TYPE_ENUM.ALLROUND]: '만능형',
};

export default function HeroCard({ heroId, mode, className = '', onClick }: Props) {
  const hero = useHeroStore((state) => state.heroes[heroId]);

  // 호버 상태 관리 (DETAIL 모드용)
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<HERO_SKILL_ENUM | null>(null);

  // 데이터 로딩 전 스켈레톤 (높이 줄임)
  if (!hero) {
    return <div className={`w-36 h-44 bg-gray-200 animate-pulse rounded-xl ${className}`} />;
  }

  const style = RANK_STYLE[hero.rank] || RANK_STYLE[HERO_RANK_ENUM.R];

  // 오버레이에 표시할 텍스트 결정
  const getOverlayContent = () => {
    // 1. 스킬 버튼 호버 시 (우선순위 높음)
    if (hoveredSkill && hero.skills[hoveredSkill]) {
      return {
        title: getSkillLabel(hoveredSkill),
        desc: hero.skills[hoveredSkill]?.description || '스킬 정보 없음'
      };
    }
    // 2. 카드 자체 호버 시 (기본/패시브 정보 표시)
    if (isCardHovered) {
      const basic = hero.skills[HERO_SKILL_ENUM.BASIC]?.description || '-';
      const passive = hero.skills[HERO_SKILL_ENUM.PASSIVE]?.description || '-';
      return {
        title: '기본 & 패시브',
        desc: `[평타]\n${basic}\n\n[패시브]\n${passive}`
      };
    }
    return null;
  };

  const overlay = mode === 'DETAIL' ? getOverlayContent() : null;
  const showOverlay = mode === 'DETAIL' && overlay !== null;

  return (
    // 메인 컨테이너 (스킬 버튼 공간 확보를 위해 너비를 조금 늘림)
    <div
      className={`relative select-none group flex items-start ${className}`}
      style={{ width: mode === 'DETAIL' ? '13rem' : '9rem', height: '11rem' }} // 높이 h-44 (11rem)
      onClick={onClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false);
        setHoveredSkill(null);
      }}
    >
      {/* === 메인 카드 (좌측) === */}
      <div className={`w-36 h-full flex flex-col border-2 ${style.border} bg-white overflow-hidden rounded-xl relative shadow-lg z-10 transition-transform duration-200 ${showOverlay ? '' : 'group-hover:scale-105'}`}>

        {/* 상단 헤더: 타입 (좌측 정렬) */}
        <div className={`flex justify-start items-center px-3 py-1.5 text-xs font-bold text-white ${style.bg}`}>
          <span>{TYPE_TEXT[hero.type]}</span>
        </div>

        {/* 중앙 컨텐츠 영역 (이름) */}
        <div className="flex-1 flex bg-gray-50 relative overflow-hidden">

          {/* 배경 초성 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`text-7xl font-black drop-shadow-sm z-10 ${style.text.replace('100', '600').replace('900', '700')}`}>
              {hero.name.slice(0, 1)}
            </span>
          </div>
        </div>

        {/* 하단: 이름 */}
        <div className="bg-gray-800 text-white pb-0 z-20">
          <div className="text-center font-bold text-sm py-1.5 truncate px-1">
            {hero.name}
          </div>
        </div>

        {/* === 오버레이 (설명창 - 카드 내부 표시) === */}
        {showOverlay && (
          <div className="absolute inset-0 z-30 bg-gray-900/95 text-white p-3 flex flex-col justify-center animate-fade-in text-center pointer-events-none">
            <h4 className="font-bold text-yellow-400 text-xs mb-2 pb-1 border-b border-gray-600 truncate">
              {overlay.title}
            </h4>
            <p className="text-[10px] whitespace-pre-wrap leading-relaxed text-gray-200 break-keep overflow-y-auto scrollbar-hide">
              {overlay.desc}
            </p>
          </div>
        )}
      </div>

      {/* === 스킬 버튼 (우측 외부) === */}
      {/* DETAIL 모드일 때만 카드의 오른쪽 바깥에 배치 */}
      {mode === 'DETAIL' && (
        <div className="flex flex-col gap-2 ml-1 mt-4 z-0">
          <SkillBtn label="1" size="4.5rem" onEnter={() => setHoveredSkill(HERO_SKILL_ENUM.SKILL_1)} onLeave={() => setHoveredSkill(null)} />
          <SkillBtn label="2" size="4.5rem" onEnter={() => setHoveredSkill(HERO_SKILL_ENUM.SKILL_2)} onLeave={() => setHoveredSkill(null)} />
        </div>
      )}
    </div>
  );
}

// 스킬 버튼 컴포넌트
function SkillBtn({ label, size, onEnter, onLeave }: { label: string, size: string, onEnter: () => void, onLeave: () => void }) {
  return (
    <div
      className="flex items-center justify-center text-lg font-bold cursor-help bg-white hover:bg-yellow-500 hover:text-white border border-gray-300 rounded-lg shadow-md transition-all text-gray-700 hover:scale-105 hover:shadow-lg"
      style={{ width: size, height: size }}
      onMouseEnter={(e) => {
        e.stopPropagation(); // 카드 전체 호버 이벤트 전파 방지
        onEnter();
      }}
      onMouseLeave={onLeave}
    >
      {label}
    </div>
  );
}

function getSkillLabel(skill: HERO_SKILL_ENUM) {
  switch (skill) {
    case HERO_SKILL_ENUM.SKILL_1: return '액티브 1스킬';
    case HERO_SKILL_ENUM.SKILL_2: return '액티브 2스킬';
    case HERO_SKILL_ENUM.BASIC: return '기본 공격';
    case HERO_SKILL_ENUM.PASSIVE: return '패시브 스킬';
    default: return '';
  }
}