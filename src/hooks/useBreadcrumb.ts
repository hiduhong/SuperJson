import React from "react";

export const useBreadcrumb = (viewerRef: React.RefObject<HTMLDivElement | null>) => {
  const [breadcrumb, setBreadcrumb] = React.useState<{ label: string; copy: string } | null>(null);
  const [breadcrumbCopied, setBreadcrumbCopied] = React.useState(false);
  const breadcrumbTimerRef = React.useRef<number | null>(null);
  const handleClickBreadcrumb = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const container = viewerRef.current;
      if (!target || !container) {
        return;
      }
      const selected = target.closest<HTMLElement>("[data-jsonviewer-path]");
      if (!selected || !container.contains(selected)) {
        setBreadcrumb({ label: "", copy: "" });
        return;
      }
      const label = selected.getAttribute("data-jsonviewer-path") ?? "";
      const copy = selected.getAttribute("data-jsonviewer-copy") ?? label;
      if (!label) {
        setBreadcrumb({ label: "", copy: "" });
        return;
      }
      setBreadcrumb({ label, copy });
    },
    [viewerRef]
  );
  React.useEffect(() => {
    return () => {
      if (breadcrumbTimerRef.current) {
        window.clearTimeout(breadcrumbTimerRef.current);
      }
    };
  }, []);
  const handleCopyBreadcrumb = React.useCallback(() => {
    if (!breadcrumb?.copy) {
      return;
    }
    navigator.clipboard?.writeText(breadcrumb.copy);
    setBreadcrumbCopied(true);
    if (breadcrumbTimerRef.current) {
      window.clearTimeout(breadcrumbTimerRef.current);
    }
    breadcrumbTimerRef.current = window.setTimeout(() => {
      setBreadcrumbCopied(false);
    }, 2000);
  }, [breadcrumb]);
  return { breadcrumb, breadcrumbCopied, handleClickBreadcrumb, handleCopyBreadcrumb };
};
