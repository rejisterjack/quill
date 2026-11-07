/** True when this deployment is the public shared playground. */
export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEMO === "true"
  );
}
