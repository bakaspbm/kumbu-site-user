
export type JobContractType =
  | "tempo_inteiro"
  | "tempo_parcial"
  | "estagio"
  | "freelance"
  | "remoto";

export type JobListingStatus = "active" | "filled_hidden" | "inactive";

export type JobApplicationStatus = "pending" | "accepted" | "rejected";

export interface CvExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description: string;
  role?: string;
  period?: string;
}

export interface CvEducationEntry {
  institution: string;
  course: string;
  period?: string;
}

export interface UserCv {
  id: string;
  userId: string;
  title: string;
  profession?: string | null;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  province?: string | null;
  summary?: string | null;
  experience: CvExperienceEntry[];
  education: CvEducationEntry[];
  skills: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCvInsert {
  title: string;
  profession?: string | null;
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  province?: string;
  summary?: string;
  experience?: CvExperienceEntry[];
  education?: CvEducationEntry[];
  skills?: string[];
  languages?: string[];
}

export interface JobMeta {
  contractType: JobContractType;
  sector?: string | null;
  province?: string | null;
  municipality?: string | null;
  salaryKz?: number | null;
  salaryMinKz?: number | null;
  salaryMaxKz?: number | null;
  remote?: boolean;
  requirements?: string | null;
  benefits?: string | null;
  positionsCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  cvId: string;
  cvSnapshot: UserCv;
  coverMessage?: string | null;
  status: JobApplicationStatus;
  conversationId?: string | null;
  createdAt: string;
  updatedAt: string;
  jobTitle?: string | null;
  applicantName?: string | null;
  cvViewedAt?: string | null;
}

export interface JobListFilters {
  province?: string;
  municipality?: string;
  contractType?: JobContractType;
  sector?: string;
  remote?: boolean;
  q?: string;
}

export interface ApplicationListFilters {
  province?: string;
  status?: JobApplicationStatus;
  q?: string;
}
