// (query-response.type.ts 참고)
export interface HeroesStatsResponse {
  _id: string; // "HeroesMatchStat의 ID" (API 문서 참고)
  attackDeckHeroes: string[]; // [Types.ObjectId] 대신 string[]
  matchCount: number;
  winRate: number;
  avgEvaluation: number;
  // buffCount, nurfCount는 API 문서에 있지만,
  // 실제 와이어프레임에는 "버프", "너프"로 표시됩니다.
  // stats.controller.ts 와 stats-query.service.ts는 
  // upvoteCount/downvoteCount 대신 buffCount/nurfCount를 반환합니다. 
  // heroes-match-stats.schema.ts를 따릅니다.
  buffCount: number;
  nurfCount: number;
}