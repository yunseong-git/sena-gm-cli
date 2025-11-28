// (hero.schema.ts 참고)
export interface HeroSkill {
  skillIndex: number; // 1: SKILL_1, 2: SKILL_2, ...
  description: string;
}

export interface Hero {
  _id: string; // MongoDB의 _id
  name: string;
  rank: string; // "찐스", "초스", "희귀" 등
  type: string; // "방어형", "공격형" 등
  skills: HeroSkill[];
}