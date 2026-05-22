export const dynamic = "force-dynamic";
import PageClient from "./page-client";

export const metadata = {
  title: "Apps",
};

type Params = {
  projectId: string,
};

export default async function Page() {
  return (
    <PageClient />
  );
}
