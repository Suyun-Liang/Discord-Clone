import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  memvers: (Member & { profile: Profile })[];
};
