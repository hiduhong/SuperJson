import React from "react";
import JsonView from "@uiw/react-json-view";
import { XCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import type { JsonValue } from "../../utils/jsonExtractor";

interface JsonViewerProps {
  data: JsonValue[];
  error?: string | null;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  error,
  className,
}) => {
  const dataList: JsonValue[] = data;
  const jsonViewStyle = {
    "--w-rjv-background-color": "transparent",
    "--w-rjv-font-family": "monospace",
    "--w-rjv-font-size": "14px",
    "--w-rjv-color": "#d4d4d8",
    "--w-rjv-key-string": "#93c5fd",
    "--w-rjv-type-string-color": "#a7f3d0",
    "--w-rjv-type-int-color": "#fca5a5",
    "--w-rjv-type-float-color": "#fca5a5",
    "--w-rjv-type-boolean-color": "#fde68a",
    "--w-rjv-type-null-color": "#fca5a5",
    "--w-rjv-line-color": "#27272a",
    "--w-rjv-arrow-color": "#71717a",
    "--w-rjv-info-color": "#52525b",
    "--w-rjv-update-color": "#67e8f9",
    "--w-rjv-copied-color": "#a7f3d0",
    "--w-rjv-copied-success-color": "#34d399"
  } as React.CSSProperties;

  return (
    <div className={cn("flex flex-col h-full bg-zinc-900", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="text-sm font-medium text-zinc-400">Viewer / Structure</div>
        <div className="flex space-x-2">
            {/* Toolbar placeholders */}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-zinc-950 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <XCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Invalid JSON</p>
            <p className="text-sm text-red-400 mt-2 max-w-md text-center">{error}</p>
          </div>
        ) : dataList.length > 0 ? (
          <div className="space-y-4">
            {dataList.map((item, index) => {
              const value = item !== null && typeof item === "object" ? item : { value: item };
              return (
              <div key={index}>
                {dataList.length > 1 && index >= 0 && (
                  <div className="flex items-center py-4">
                    <div className="flex-grow border-t border-dashed border-zinc-700"></div>
                    <span className="px-3 text-zinc-500 text-xs font-mono">JSON #{index + 1}</span>
                    <div className="flex-grow border-t border-dashed border-zinc-700"></div>
                  </div>
                )}
                <JsonView
                  value={value}
                  collapsed={2}
                  style={jsonViewStyle}
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
