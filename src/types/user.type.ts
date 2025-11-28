// 백엔드의 GUILD_ROLE_ENUM과 일치시킵니다.
export type GuildRole = 'master' | 'submaster' | 'manager' | 'member' | null;

export interface User {
  sub: string;        // userId
  userRole: string;   // 'admin' | 'user'
  guildId: string | null;
  guildRole: GuildRole;
}