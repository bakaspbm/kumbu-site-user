"use server";

import { serverActionError } from "@/lib/i18n/server-errors";
import { serverLoginRequiredError } from "@/lib/i18n/server-errors";
import {
  listApplicationsForJob,
  listEmployerJobApplications,
  listMyListings,
} from "@/lib/site-data";
import { isJobListing } from "@/lib/jobs/category";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { ApplicationListFilters } from "@/types/job";
import type { JobApplication } from "@/types/job";
import type { CatalogProduct } from "@/types/store";

export type EmployerJobsDataResult =
  | { ok: true; jobs: CatalogProduct[]; applications: JobApplication[] }
  | { ok: false; error: string; needsLogin?: boolean };

export async function loadEmployerJobsDataAction(
  jobId: string,
  filters: ApplicationListFilters = {},
): Promise<EmployerJobsDataResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    const all = await listMyListings();
    const jobs = all.filter(isJobListing);
    const applications = jobId
      ? await listApplicationsForJob(jobId, filters)
      : await listEmployerJobApplications(filters);

    return { ok: true, jobs, applications };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
