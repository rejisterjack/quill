import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 py-16">
      <p className="text-sm font-semibold text-default-500">404</p>
      <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
      <p className="text-sm text-default-500">That page is not in Quill.</p>
      <Link href="/" className="text-sm font-semibold text-primary">
        Back home
      </Link>
    </div>
  );
}
