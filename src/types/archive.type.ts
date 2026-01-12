// 백엔드 DTO 구조와 일치시킴

import { HERO_SKILL_ENUM } from "@/store/useHeroStore";

export enum ATTACK_SCORE_ENUM {
  NICE = 'nice',
  GOOD = 'good',
  TRY = 'try',
}

// [New] 스킬 예약 객체 타입
export interface SkillReservationDto {
  heroIndex: number;
  skillType: HERO_SKILL_ENUM;
}

export interface DeckDto {
  compositionKey: string;
  heroes: [string, string, string]; // 영웅 ID 3개
  skillReservation: SkillReservationDto[]; // [New] 스킬 예약 필드 추가
}

export interface ArchiveAttackResponseDto {
  id: string;
  authorName: string;
  authorId: string;
  deck: DeckDto; // 공격덱 정보
  description: string;
  score: ATTACK_SCORE_ENUM;
  isPicked: boolean;
  createdAt: string; // Date string
}

export interface ArchiveSearchResponseDto {
  id: string; // 방어덱 ID
  deck: DeckDto; // 방어덱 정보
  isDefault: boolean;
  createdAt: string;
  attacks: ArchiveAttackResponseDto[]; // 이 방어덱에 달린 공략들
}