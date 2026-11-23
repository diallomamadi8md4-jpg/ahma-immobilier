import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonVariants, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  children: React.ReactNode;
};

export function LinkButton({ href, variant, size, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...rest}>
      {children}
    </Link>
  );
}
