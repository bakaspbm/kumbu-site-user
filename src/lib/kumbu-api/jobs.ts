import type {
  ApplicationListFilters,
  JobApplication,
  JobListFilters,
  UserCv,
  UserCvInsert,
} from "@/types/job";
import type { CatalogProduct } from "@/types/store";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";
import { mapListingDtoToProduct } from "@/lib/kumbu-api/catalog";

type ListingDto = Parameters<typeof mapListingDtoToProduct>[0];

type CvDto = {
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
  experience?: UserCv["experience"] | null;
  education?: UserCv["education"] | null;
  skills?: string[] | null;
  languages?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApplicationDto = {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  cvId: string;
  cvSnapshot?: unknown;
  coverMessage?: string | null;
  status: JobApplication["status"];
  conversationId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  jobTitle?: string | null;
  applicantName?: string | null;
  cvViewedAt?: string | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function toCv(row: CvDto): UserCv {
  return normalizeCvSnapshot(row);
}

function normalizeCvSnapshot(raw: unknown): UserCv {
  const row =
    raw && typeof raw === "object" ? (raw as Partial<CvDto> & Record<string, unknown>) : {};
  return {
    id: String(row.id ?? ""),
    userId: String(row.userId ?? ""),
    title: String(row.title ?? "CV"),
    profession: row.profession ?? null,
    fullName: String(row.fullName ?? "Candidato"),
    email: row.email ?? null,
    phone: row.phone ?? null,
    city: row.city ?? null,
    province: row.province ?? null,
    summary: row.summary ?? null,
    experience: Array.isArray(row.experience) ? row.experience : [],
    education: Array.isArray(row.education) ? row.education : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    languages: Array.isArray(row.languages) ? row.languages : [],
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
  };
}

function toApplication(row: ApplicationDto): JobApplication {
  return {
    id: String(row.id),
    jobId: String(row.jobId),
    applicantId: String(row.applicantId),
    employerId: String(row.employerId),
    cvId: String(row.cvId),
    cvSnapshot: normalizeCvSnapshot(row.cvSnapshot),
    coverMessage: row.coverMessage ?? null,
    status: row.status,
    conversationId: row.conversationId ?? null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
    jobTitle: row.jobTitle ?? null,
    applicantName: row.applicantName ?? null,
    cvViewedAt: row.cvViewedAt ?? null,
  };
}

export async function listActiveJobsBackend(filters: JobListFilters = {}): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const rows = await client.request<ListingDto[]>("/jobs", {
    query: {
      q: filters.q?.trim() || undefined,
      province: filters.province || undefined,
      municipality: filters.municipality || undefined,
      contractType: filters.contractType || undefined,
      sector: filters.sector || undefined,
      remote: filters.remote === true ? true : undefined,
    },
    auth: false,
  });
  return (rows ?? []).map((row, index) => mapListingDtoToProduct(row, index));
}

export async function listMyCvsBackend(): Promise<UserCv[]> {
  const client = clientOrThrow();
  const rows = await client.request<CvDto[]>("/jobs/cvs");
  return (rows ?? []).map(toCv);
}

export async function createCvBackend(input: UserCvInsert): Promise<UserCv> {
  const client = clientOrThrow();
  const row = await client.request<CvDto>("/jobs/cvs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toCv(row);
}

export async function updateCvBackend(
  cvId: string,
  input: Partial<UserCvInsert>,
): Promise<UserCv> {
  const client = clientOrThrow();
  const existing = (await listMyCvsBackend()).find((cv) => cv.id === cvId);
  if (!existing) throw new Error("CV não encontrado.");
  const payload = {
    title: input.title ?? existing.title,
    fullName: input.fullName ?? existing.fullName,
    profession: input.profession ?? existing.profession ?? undefined,
    email: input.email ?? existing.email,
    phone: input.phone ?? existing.phone ?? undefined,
    city: input.city ?? existing.city ?? undefined,
    province: input.province ?? existing.province ?? undefined,
    summary: input.summary ?? existing.summary ?? undefined,
    skills: input.skills ?? existing.skills ?? [],
    languages: input.languages ?? existing.languages ?? [],
  };
  const row = await client.request<CvDto>(`/jobs/cvs/${encodeURIComponent(cvId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return toCv(row);
}

export async function deleteCvBackend(cvId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/jobs/cvs/${encodeURIComponent(cvId)}`, { method: "DELETE" });
}

export async function applyToJobBackend(
  jobId: string,
  cvId: string,
  coverMessage?: string,
): Promise<JobApplication> {
  const client = clientOrThrow();
  const row = await client.request<ApplicationDto>(`/jobs/${encodeURIComponent(jobId)}/apply`, {
    method: "POST",
    body: JSON.stringify({ cvId, coverMessage: coverMessage ?? null }),
  });
  return toApplication(row);
}

export async function listMyJobApplicationsBackend(): Promise<JobApplication[]> {
  const client = clientOrThrow();
  const rows = await client.request<ApplicationDto[]>("/jobs/applications/mine");
  return (rows ?? []).map(toApplication);
}

export async function listEmployerJobApplicationsBackend(
  filters: ApplicationListFilters = {},
): Promise<JobApplication[]> {
  const client = clientOrThrow();
  const rows = await client.request<ApplicationDto[]>("/jobs/applications/employer", {
    query: {
      status: filters.status || undefined,
      q: filters.q?.trim() || undefined,
      province: filters.province || undefined,
    },
  });
  return (rows ?? []).map(toApplication);
}

export async function listApplicationsForJobBackend(
  jobId: string,
  filters: ApplicationListFilters = {},
): Promise<JobApplication[]> {
  const all = await listEmployerJobApplicationsBackend(filters);
  return all.filter((item) => item.jobId === jobId);
}

export async function respondJobApplicationBackend(
  applicationId: string,
  action: "accept" | "reject",
): Promise<JobApplication> {
  const client = clientOrThrow();
  const row = await client.request<ApplicationDto>(
    `/jobs/applications/${encodeURIComponent(applicationId)}/respond`,
    {
      method: "POST",
      body: JSON.stringify({ action }),
    },
  );
  return toApplication(row);
}

export async function recordCvViewBackend(
  applicationId: string,
): Promise<{ notified: boolean; firstView: boolean }> {
  const client = clientOrThrow();
  return client.request<{ notified: boolean; firstView: boolean }>(
    `/jobs/applications/${encodeURIComponent(applicationId)}/cv-view`,
    { method: "POST" },
  );
}

export async function markJobAsFilledBackend(jobId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/jobs/${encodeURIComponent(jobId)}/filled`, { method: "POST" });
}

export async function getMyApplicationForJobBackend(
  jobId: string,
): Promise<JobApplication | null> {
  const rows = await listMyJobApplicationsBackend();
  return rows.find((item) => item.jobId === jobId) ?? null;
}
