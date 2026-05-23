import { getNodeEnvironment } from "@stackframe/stack-shared/dist/utils/env";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      Welcome to CognitionTree Shiel API endpoint.<br />
      <Link href="/api/v1">API v1</Link><br />
      {getNodeEnvironment() === "development" && (
        <>
          <br />
          <Link href="/dev-stats">Dev Stats</Link><br />
        </>
      )}
    </div>
  );
}
