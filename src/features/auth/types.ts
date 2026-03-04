export type UserRole = "child" | "parent";

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  linkedParentId?: string;
  whatsappNumber?: string;
};
