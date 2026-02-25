import React from "react";
import JsonView from "@uiw/react-json-view";
import { ChevronDown, ChevronUp, Search, X, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ExtractedJsonSegment, JsonValue } from "../../utils/jsonExtractor";
import { LogText } from "./LogText";
import { useViewerSearch } from "../../hooks/useViewerSearch";
import { BreadcrumbBar } from "../../components/json-viewer/BreadcrumbBar";
import { SearchResultPanel } from "../../components/json-viewer/SearchResultPanel";
import { useBreadcrumb } from "../../hooks/useBreadcrumb";
import { useJsonPathRenderers } from "../../hooks/useJsonPathRenderers";

interface JsonViewerProps {
  data: JsonValue[];
  sourceText?: string;
  segments?: ExtractedJsonSegment[];
  error?: string | null;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  sourceText,
  segments,
  error,
  className,
}) => {
  const dataList: JsonValue[] = data;
  const {
    viewerRef,
    searchText,
    setSearchText,
    searchInputRef,
    matchCount,
    activeMatchIndex,
    matchItems,
    normalizedQuery,
    scrollToMatch,
    handleViewerKeyDown,
    shouldExpandNodeInitially
  } = useViewerSearch({ data, sourceText, segments });
  const { breadcrumb, breadcrumbCopied, handleClickBreadcrumb, handleCopyBreadcrumb, setBreadcrumbFromPath } = useBreadcrumb(viewerRef);
  const { renderKeyName, renderRow, renderBraceRight, renderBracketsRight } = useJsonPathRenderers();
  const jsonViewStyle = {
    "--w-rjv-background-color": "transparent",
    "--w-rjv-font-family": "monospace",
    "--w-rjv-font-size": "14px",
    "--w-rjv-color": "#0f172a",
    "--w-rjv-key-string": "#1d4ed8",
    "--w-rjv-type-string-color": "#16a34a",
    "--w-rjv-type-int-color": "#e11d48",
    "--w-rjv-type-float-color": "#e11d48",
    "--w-rjv-type-boolean-color": "#f97316",
    "--w-rjv-type-null-color": "#64748b",
    "--w-rjv-line-color": "#e2e8f0",
    "--w-rjv-arrow-color": "#94a3b8",
    "--w-rjv-info-color": "#64748b",
    "--w-rjv-update-color": "#0ea5e9",
    "--w-rjv-copied-color": "#16a34a",
    "--w-rjv-copied-success-color": "#22c55e"
  } as React.CSSProperties;


  return (
    <div className={cn("flex flex-col h-full bg-slate-50", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="text-sm font-medium text-slate-600">Viewer / Structure</div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search in viewer"
              ref={searchInputRef}
              className="pl-8 pr-7 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
            />
            {searchText ? (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{matchCount ? `${activeMatchIndex + 1}/${matchCount}` : "0/0"}</span>
            <button
              type="button"
              disabled={!matchCount}
              onClick={() => scrollToMatch(activeMatchIndex - 1)}
              className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!matchCount}
              onClick={() => scrollToMatch(activeMatchIndex + 1)}
              className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <BreadcrumbBar
        breadcrumb={breadcrumb}
        breadcrumbCopied={breadcrumbCopied}
        onCopy={handleCopyBreadcrumb}
      />
      <SearchResultPanel
        visible={Boolean(normalizedQuery)}
        matchCount={matchCount}
        activeMatchIndex={activeMatchIndex}
        items={matchItems}
        onSelect={(item) => {
          scrollToMatch(item.index);
          setBreadcrumbFromPath(item.label, item.copy);
        }}
      />
      <div
        ref={viewerRef}
        className="flex-1 overflow-auto p-4 bg-slate-100 relative"
        onClick={handleClickBreadcrumb}
        onKeyDown={handleViewerKeyDown}
        tabIndex={0}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-600">
            <XCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Invalid JSON</p>
            <p className="text-sm text-rose-500 mt-2 max-w-md text-center">{error}</p>
          </div>
        ) : sourceText && segments && segments.length > 0 ? (
          <div>
            {(() => {
              const parts: Array<
                | { type: "text"; content: string; key: string }
                | { type: "json"; value: JsonValue; key: string; index: number }
              > = [];
              const sorted = [...segments].sort((a, b) => a.start - b.start);
              let cursor = 0;
              sorted.forEach((segment, index) => {
                if (segment.start > cursor) {
                  parts.push({
                    type: "text",
                    content: sourceText.slice(cursor, segment.start),
                    key: `text-${cursor}`
                  });
                }
                parts.push({
                  type: "json",
                  value: segment.value,
                  key: `json-${segment.start}-${segment.end}`,
                  index
                });
                cursor = segment.end;
              });
              if (cursor < sourceText.length) {
                parts.push({
                  type: "text",
                  content: sourceText.slice(cursor),
                  key: `text-${cursor}`
                });
              }
              return parts.map((part) => {
                if (part.type === "text") {
                  if (!part.content) {
                    return null;
                  }
                  return (
                    <div key={part.key}>
                      <LogText text={part.content} />
                    </div>
                  );
                }
                const value = part.value !== null && typeof part.value === "object" ? part.value : { value: part.value };
                return (
                  <div key={part.key}>
                    <JsonView
                      value={value}
                      collapsed={normalizedQuery ? false : 2}
                      shouldExpandNodeInitially={normalizedQuery ? shouldExpandNodeInitially : undefined}
                      style={jsonViewStyle}
                      displayDataTypes={false}
                      enableClipboard={false}
                    >
                      <JsonView.KeyName render={renderKeyName} />
                      <JsonView.Row render={renderRow} />
                      <JsonView.BraceRight render={renderBraceRight} />
                      <JsonView.BracketsRight render={renderBracketsRight} />
                    </JsonView>
                  </div>
                );
              });
            })()}
          </div>
        ) : dataList.length > 0 ? (
          <div className="space-y-4">
            {dataList.map((item, index) => {
              const value = item !== null && typeof item === "object" ? item : { value: item };
              return (
              <div key={index}>
                <JsonView
                  value={value}
                  collapsed={normalizedQuery ? false : 2}
                  shouldExpandNodeInitially={normalizedQuery ? shouldExpandNodeInitially : undefined}
                  style={jsonViewStyle}
                  displayDataTypes={false}
                  enableClipboard={false}
                >
                  <JsonView.KeyName render={renderKeyName} />
                  <JsonView.Row render={renderRow} />
                  <JsonView.BraceRight render={renderBraceRight} />
                  <JsonView.BracketsRight render={renderBracketsRight} />
                </JsonView>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>No data to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
