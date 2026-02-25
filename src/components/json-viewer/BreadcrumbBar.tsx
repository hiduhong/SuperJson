import React from "react";
import { Copy } from "lucide-react";

interface BreadcrumbBarProps {
  breadcrumb: { label: string; copy: string } | null;
  breadcrumbCopied: boolean;
  onCopy: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  breadcrumb,
  breadcrumbCopied,
  onCopy,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-slate-700">路径</span>
        {breadcrumb?.label ? (
          <span className="truncate">{breadcrumb.label}</span>
        ) : (
          <span className="truncate text-slate-400 italic">点击 JSON 键或值以显示路径</span>
        )}
      </div>
      <button
        type="button"
        onClick={onCopy}
        disabled={!breadcrumb?.label}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Copy className="h-3.5 w-3.5" />
        {breadcrumbCopied ? "已复制" : "复制路径"}
      </button>
    </div>
  );
};
