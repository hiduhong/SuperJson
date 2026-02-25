import React from "react";
import JsonView, { type ShouldExpandNodeInitially } from "@uiw/react-json-view";
import { ChevronDown, ChevronUp, Search, X, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ExtractedJsonSegment, JsonValue } from "../../utils/jsonExtractor";

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
  const [searchText, setSearchText] = React.useState("");
  const [matchCount, setMatchCount] = React.useState(0);
  const [activeMatchIndex, setActiveMatchIndex] = React.useState(0);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const normalizedQuery = searchText.trim().toLowerCase();
  const highlightStateRef = React.useRef({ applying: false });
  const activeMatchRef = React.useRef(0);
  const pendingScrollRef = React.useRef(false);
  const renderLogText = (text: string) => {
    const lines = text.split(/\n/);
    const logPattern = /^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+(?<level>[A-Z]+)\s+\[(?<thread>[^\]]+)\]\s+\[(?<trace>TraceId:\s*[^\]]+)\]\s+(?<logger>[^:]+?)\s*:?\s*(?<message>.*)$/;
    const getLevelClass = (level: string) => {
      switch (level) {
        case "ERROR":
          return "text-rose-600";
        case "WARN":
        case "WARNING":
          return "text-amber-600";
        case "INFO":
          return "text-indigo-600";
        case "DEBUG":
          return "text-sky-600";
        case "TRACE":
          return "text-violet-600";
        default:
          return "text-slate-500";
      }
    };
    const renderLine = (line: string) => {
      const trimmedLine = line.replace(/^\s+/, "");
      const leading = line.slice(0, line.length - trimmedLine.length);
      const match = trimmedLine.match(logPattern);
      if (!match?.groups) {
        return <span className="text-slate-500">{line || "\u00A0"}</span>;
      }
      const { timestamp, level, thread, trace, logger, message } = match.groups as Record<string, string>;
      return (
        <>
          {leading ? <span className="text-slate-500">{leading}</span> : null}
          <span className="text-slate-500">{timestamp}</span>
          <span> </span>
          <span className={getLevelClass(level)}>{level}</span>
          <span> </span>
          <span className="text-cyan-600">[{thread}]</span>
          <span> </span>
          <span className="text-amber-600">[{trace}]</span>
          <span> </span>
          <span className="text-indigo-700">{logger}</span>
          <span className="text-slate-500"> :</span>
          <span> </span>
          <span className="text-slate-800">{message || "\u00A0"}</span>
        </>
      );
    };
    return (
      <div className="space-y-1">
        {lines.map((line, index) => (
          <div key={`line-${index}`} className="text-xs font-mono whitespace-pre-wrap">
            {renderLine(line)}
          </div>
        ))}
      </div>
    );
  };
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

  const valueContainsQuery = React.useCallback((value: unknown) => {
    if (!normalizedQuery) {
      return false;
    }
    const stack: unknown[] = [value];
    while (stack.length) {
      const current = stack.pop();
      if (current === null || current === undefined) {
        if (String(current).toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        continue;
      }
      if (typeof current === "string" || typeof current === "number" || typeof current === "boolean" || typeof current === "bigint") {
        if (String(current).toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        continue;
      }
      if (current instanceof Date) {
        if (current.toISOString().toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        continue;
      }
      if (Array.isArray(current)) {
        for (let index = current.length - 1; index >= 0; index -= 1) {
          stack.push(current[index]);
        }
        continue;
      }
      if (typeof current === "object") {
        const entries = Object.entries(current as Record<string, unknown>);
        for (let index = entries.length - 1; index >= 0; index -= 1) {
          const [key, val] = entries[index];
          if (key.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          stack.push(val);
        }
      }
    }
    return false;
  }, [normalizedQuery]);

  const shouldExpandNodeInitially = React.useCallback<ShouldExpandNodeInitially<object>>((_isExpanded, props) => {
    if (!normalizedQuery) {
      return props.level <= 2;
    }
    if (props.keyName !== undefined && String(props.keyName).toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    return props.level <= 2 || valueContainsQuery(props.value);
  }, [normalizedQuery, valueContainsQuery]);

  const setActiveMatch = React.useCallback((index: number, shouldScroll: boolean) => {
    const container = viewerRef.current;
    if (!container) {
      return;
    }
    const matches = Array.from(
      container.querySelectorAll("mark[data-jsonviewer-highlight='true']")
    ) as HTMLElement[];
    if (!matches.length) {
      return;
    }
    const safeIndex = ((index % matches.length) + matches.length) % matches.length;
    matches.forEach((match, idx) => {
      if (idx === safeIndex) {
        match.classList.add("bg-amber-300");
      } else {
        match.classList.remove("bg-amber-300");
      }
    });
    if (shouldScroll) {
      matches[safeIndex].scrollIntoView({ block: "center", behavior: "smooth" });
    }
    setActiveMatchIndex(safeIndex);
    activeMatchRef.current = safeIndex;
  }, []);
  const scrollToMatch = React.useCallback((index: number) => {
    setActiveMatch(index, true);
  }, [setActiveMatch]);

  const applyHighlights = React.useCallback(() => {
    const container = viewerRef.current;
    if (!container) {
      return;
    }
    if (highlightStateRef.current.applying) {
      return;
    }
    highlightStateRef.current.applying = true;
    const query = normalizedQuery;
    const marks = Array.from(container.querySelectorAll("mark[data-jsonviewer-highlight='true']"));
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) {
        return;
      }
      parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
      parent.normalize();
    });
    if (!query) {
      setMatchCount(0);
      setActiveMatchIndex(0);
      highlightStateRef.current.applying = false;
      return;
    }
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!node.nodeValue.toLowerCase().includes(query)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }
    nodes.forEach((node) => {
      const text = node.nodeValue ?? "";
      const lowerText = text.toLowerCase();
      let startIndex = 0;
      const fragment = document.createDocumentFragment();
      while (true) {
        const matchIndex = lowerText.indexOf(query, startIndex);
        if (matchIndex === -1) {
          const tail = text.slice(startIndex);
          if (tail) {
            fragment.appendChild(document.createTextNode(tail));
          }
          break;
        }
        const head = text.slice(startIndex, matchIndex);
        if (head) {
          fragment.appendChild(document.createTextNode(head));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-jsonviewer-highlight", "true");
        mark.className = "bg-amber-200 text-slate-900 rounded-sm px-0.5 transition-colors";
        mark.textContent = text.slice(matchIndex, matchIndex + query.length);
        fragment.appendChild(mark);
        startIndex = matchIndex + query.length;
      }
      node.parentNode?.replaceChild(fragment, node);
    });
    const matches = Array.from(container.querySelectorAll("mark[data-jsonviewer-highlight='true']"));
    setMatchCount(matches.length);
    if (matches.length) {
      const nextIndex = Math.min(activeMatchRef.current, matches.length - 1);
      const shouldScroll = pendingScrollRef.current;
      pendingScrollRef.current = false;
      setActiveMatch(nextIndex, shouldScroll);
    } else {
      setActiveMatchIndex(0);
      activeMatchRef.current = 0;
    }
    highlightStateRef.current.applying = false;
  }, [normalizedQuery, setActiveMatch]);

  React.useEffect(() => {
    pendingScrollRef.current = true;
  }, [normalizedQuery]);

  React.useEffect(() => {
    const container = viewerRef.current;
    if (!container) {
      return;
    }
    let rafId = 0;
    const schedule = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        applyHighlights();
      });
    };
    schedule();
    if (!normalizedQuery) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (highlightStateRef.current.applying) {
        return;
      }
      schedule();
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [normalizedQuery, data, sourceText, segments, applyHighlights]);

  return (
    <div className={cn("flex flex-col h-full bg-slate-50", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="text-sm font-medium text-slate-600">Viewer / Structure</div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search in viewer"
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
      <div ref={viewerRef} className="flex-1 overflow-auto p-4 bg-slate-100 relative">
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
                      {renderLogText(part.content)}
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
                    />
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
                />
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
