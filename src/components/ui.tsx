"use client";
import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mx-auto max-w-6xl px-4 md:px-6 lg:px-8", className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card p-5 md:p-6", className)} {...props} />;
}

export function ButtonLink({
  href, children, className, ...props
}: { href: string } & HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand text-white",
        "px-4 py-2.5 no-underline hover:brightness-95 active:brightness-90",
        "shadow-sm transition-all",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("prose-lite", className)} {...props} />;
}