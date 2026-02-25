import React from "react";
import type { ShouldExpandNodeInitially } from "@uiw/react-json-view";
import type { ExtractedJsonSegment, JsonValue } from "../utils/jsonExtractor";

interface UseViewerSearchOptions {
  data: JsonValue[];
  sourceText?: string;
  segments?: ExtractedJsonSegment[];
}

export const useViewerSearch = ({ data, sourceText, segments }: UseViewerSearchOptions) => {
  const [searchText, setSearchText] = React.useState("");
  const [matchCount, setMatchCount] = React.useState(0);
  const [activeMatchIndex, setActiveMatchIndex] = React.useState(0);
  const [matchItems, setMatchItems] = React.useState<Array<{ index: number; label: string; copy: string; preview: string }>>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const normalizedQuery = searchText.trim().toLowerCase();
  const highlightStateRef = React.useRef({ applying: false });
  const activeMatchRef = React.useRef(0);
  const pendingScrollRef = React.useRef(false);

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

  const handleViewerKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(event.metaKey || event.ctrlKey)) {
      return;
    }
    if (event.key.toLowerCase() !== "f") {
      return;
    }
    event.preventDefault();
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

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
      setMatchItems([]);
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
    const items = matches.map((match, index) => {
      const containerElement = match.closest("[data-jsonviewer-path]") as HTMLElement | null;
      const label = containerElement?.getAttribute("data-jsonviewer-path") ?? "";
      const copy = containerElement?.getAttribute("data-jsonviewer-copy") ?? label;
      const previewSource = containerElement?.textContent ?? match.textContent ?? "";
      const preview = previewSource.replace(/\s+/g, " ").trim();
      return { index, label, copy, preview };
    });
    setMatchItems(items);
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

  return {
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
  };
};
