import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// --- 타입 정의 ---

export enum HERO_SKILL_ENUM {
  SKILL_1 = 's1',
  SKILL_2 = 's2',
  BASIC = 'basic',
  PASSIVE = 'passive',
}

export enum HERO_RANK_ENUM {
  UR = 'ur',
  SSR = 'ssr',
  SR = 'sr',
  R = 'r'
}
export enum HERO_TYPE_ENUM {
  DEFENSE = 'defense',
  ATTACK = 'attack',
  SUPPORT = 'support',
  MAGIC = 'magic',
  ALLROUND = 'allround'
}

export interface SkillInfo {
  description: string;
}

export interface HeroData {
  _id: string;
  name: string;
  type: HERO_TYPE_ENUM;
  rank: HERO_RANK_ENUM;
  skills: {
    [key in HERO_SKILL_ENUM]?: SkillInfo;
  };
}

// --- Zustand Store ---

interface HeroState {
  heroes: Record<string, HeroData>; // 검색 속도를 위해 Map(Object) 형태 사용
  setHeroes: (data: HeroData[]) => void;
  getHero: (id: string) => HeroData | undefined;
}

export const useHeroStore = create<HeroState>()(
  persist( // [New] persist로 감싸기
    (set, get) => ({
      heroes: {},

      setHeroes: (data) => {
        const heroMap = data.reduce((acc, hero) => {
          acc[hero._id] = hero;
          return acc;
        }, {} as Record<string, HeroData>);
        set({ heroes: heroMap });
      },

      getHero: (id) => get().heroes[id],
    }),
    {
      name: 'senagm-hero-storage', // [Important] localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소 위치 (기본값이 localStorage라 생략 가능하지만 명시함)
      // version: 1, // [Tip] 나중에 데이터 구조가 바뀌면 버전을 올려서 강제로 구버전 캐시를 날릴 수 있음
    }
  )
);