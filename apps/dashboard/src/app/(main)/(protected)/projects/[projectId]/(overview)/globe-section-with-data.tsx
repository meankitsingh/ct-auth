'use client';

import { stackAppInternalsSymbol } from "@/lib/stack-app-internals";
import { useAdminApp } from '../use-admin-app';
import { GlobeSection } from './globe';

export function GlobeSectionWithData({ includeAnonymous }: { includeAnonymous: boolean }) {
  const adminApp = useAdminApp();
  const data = (adminApp as any)[stackAppInternalsSymbol].useMetrics(includeAnonymous);

  return (
    <GlobeSection countryData={data.users_by_country} totalUsers={data.total_users} />
  );
}
