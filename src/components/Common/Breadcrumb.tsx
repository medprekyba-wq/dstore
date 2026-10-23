
"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SITE_URL = "https://www.diagnostore.com";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  title?: string;
  homeLabel?: string;
  homeHref?: string;
  separator?: React.ReactNode;
  seoHeading?: boolean;
}

function generateBreadcrumbsFromPath(
  pathname: string,
  homeLabel = "Home",
  homeHref = "/"
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: homeLabel, href: homeHref },
  ];

  const pathSegments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;

    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, SITE_URL).toString(),
    })),
  };
}

const Breadcrumb = ({
  items,
  title,
  homeLabel = "Home",
  homeHref = "/",
  separator = ">",
  seoHeading = false,
}: BreadcrumbProps) => {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const breadcrumbItems =
    items && items.length > 0
      ? items
      : generateBreadcrumbsFromPath(
          pathname,
          homeLabel,
          homeHref
        );

  // Use the actual page title when no custom items are supplied.
  const finalItems =
    title && (!items || items.length === 0)
      ? breadcrumbItems.map((item, index) =>
          index === breadcrumbItems.length - 1
            ? { ...item, label: title }
            : item
        )
      : breadcrumbItems;

  const jsonLd = getBreadcrumbJsonLd(finalItems);

  return (
    <>
      {/* Google Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Visible Breadcrumb Navigation */}
      <div className="overflow-hidden pt-28">
        <div className="py-5 bg-gray-2">
          <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
            <div className="flex items-center justify-start gap-3">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1">
                  {finalItems.map((item, index) => {
                    const isLast =
                      index === finalItems.length - 1;

                    return (
                      <li
                        key={`${item.href}-${index}`}
                        className="flex items-center"
                      >
                        {isLast && seoHeading ? (
                          <h1
                            className="font-medium text-custom-sm text-blue"
                            aria-current="page"
                          >
                            {item.label}
                          </h1>
                        ) : isLast ? (
                          <span
                            className="font-medium text-custom-sm text-blue"
                            aria-current="page"
                          >
                            {item.label}
                          </span>
                        ) : (
                          <>
                            <Link
                              href={item.href}
                              className="text-gray-600 transition-colors text-custom-sm hover:text-blue"
                            >
                              {item.label}
                            </Link>

                            <span
                              className="flex items-center mx-1"
                              aria-hidden="true"
                            >
                              {separator}
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;

// Admin breadcrumbs - no public SEO structured data
export const AdminBreadcrumb = ({
  items,
  title,
  homeLabel = "Admin",
  homeHref = "/admin",
  separator = ">",
}: BreadcrumbProps) => {
  const pathname = usePathname();

  if (pathname === "/admin") return null;

  const breadcrumbItems =
    items && items.length > 0
      ? items
      : generateBreadcrumbsFromPath(
          pathname,
          homeLabel,
          homeHref
        );

  return (
    <div className="overflow-hidden shadow-breadcrumb pt-[100px]">
      <div className="border-t border-gray-3">
        <div className="w-full px-4 py-5 mx-auto max-w-7xl sm:px-8 xl:px-0 xl:py-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold capitalize text-dark sm:text-2xl">
              {title ||
                breadcrumbItems[breadcrumbItems.length - 1]?.label}
            </h2>

            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1">
                {breadcrumbItems.map((item, index) => {
                  const isLast =
                    index === breadcrumbItems.length - 1;

                  return (
                    <li
                      key={`${item.href}-${index}`}
                      className="flex items-center"
                    >
                      {isLast ? (
                        <span
                          className="font-medium text-custom-sm text-blue"
                          aria-current="page"
                        >
                          {item.label}
                        </span>
                      ) : (
                        <>
                          <Link
                            href={item.href}
                            className="text-gray-600 transition-colors text-custom-sm hover:text-blue"
                          >
                            {item.label}
                          </Link>

                          <span
                            className="flex items-center mx-1"
                            aria-hidden="true"
                          >
                            {separator}
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};