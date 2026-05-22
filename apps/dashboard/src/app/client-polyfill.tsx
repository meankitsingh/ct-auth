"use client";

import { useUser } from "@stackframe/stack";
import { Suspense, useEffect } from "react";

// ensure that the polyfills are loaded even on the client
import "../polyfills";

export function ClientPolyfill() {
  return <Suspense fallback={null}><InnerClientPolyfill /></Suspense>;
}

function InnerClientPolyfill() {
  const user = useUser();

  useEffect(() => {
    return () => {};
  }, [user]);


  return null;
}
