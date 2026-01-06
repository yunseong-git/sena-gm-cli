// 백엔드 DTO 구조와 일치시킴

export enum ATTACK_SCORE_ENUM {
  NICE = 'nice',
  GOOD = 'good',
  TRY = 'try',
}

export interface DeckDto {
  compositionKey: string;
  heroes: [string, string, string]; // 영웅 ID 3개
  // skillReservation 등은 필요 시 추가
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