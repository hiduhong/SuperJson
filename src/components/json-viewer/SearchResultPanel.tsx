import React from "react";
import { cn } from "../../utils/cn";

interface SearchResultItem {
  index: number;
  label: string;
  copy: string;
  preview: string;
}

interface SearchResultPanelProps {
  visible: boolean;
  matchCount: number;
  activeMatchIndex: number;
  items: SearchResultItem[];
  onSelect: (item: SearchResultItem) => void;
}

export const SearchResultPanel: React.FC<SearchResultPanelProps> = ({
  visible,
  matchCount,
  activeMatchIndex,
  items,
  onSelect
}) => {
  if (!visible) {
    return null;
  }
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-600">
        <span>结果列表</span>
        <span className="text-slate-400">{matchCount ? `${matchCount} 个匹配` : "无匹配"}</span>
      </div>
      {items.length ? (
        <div className="max-h-48 overflow-auto divide-y divide-slate-100">
          {items.map((item) => (
            <button
              key={`${item.index}-${item.label}`}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full flex-col gap-1 px-4 py-2 text-left text-xs hover:bg-slate-50",
                activeMatchIndex === item.index ? "bg-slate-100" : "bg-white"
              )}
            >
              {item.label ? (
                <span className="text-slate-700 truncate">{item.label}</span>
              ) : null}
              {item.preview ? (
                <span className="text-slate-400 truncate">{item.preview}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-2 text-xs text-slate-400">没有匹配结果</div>
      )}
    </div>
  );
};
