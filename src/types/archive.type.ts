import { HERO_SKILL_ENUM } from "@/store/useHeroStore";

// 스킬 예약 객체
export interface SkillReservationDto {
  heroIndex: number;
  skillType: HERO_SKILL_ENUM; // 's1', 's2'
}

// 덱 핵심 정보 (상속용)
export interface DeckCoreDto {
  heroes: string[]; // 영웅 ID 3개
  skillReservation: SkillReservationDto[];
}

// 공격덱 응답 DTO
export interface AttackDeckResponseDto extends DeckCoreDto {
  _id: string;
  authorName: string;
  description: string;
  isPicked: boolean;
  createdAt: string;
  // DTO에 score가 없다면 제외, 있다면 추가 (일단 UI 유지를 위해 optional로 둠)
  score?: 'nice' | 'good' | 'try';
}

// 방어덱 응답 DTO
export interface DefenseDeckResponseDto extends DeckCoreDto {
  _id: string;
  attackDecks: AttackDeckResponseDto[];
  // DTO에 isDefault가 없다면 제외 (optional)
  isDefault?: boolean;
}

// 최종 검색 결과 (래퍼)
export interface ArchiveSearchResDto {
  results: DefenseDeckResponseDto[];
}