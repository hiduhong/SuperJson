import React from "react";
import ReactJson from "react-json-view";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataList: any[] = data;

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
            {dataList.map((item, index) => (
              <div key={index}>
                {dataList.length > 1 && index >= 0 && (
                  <div className="flex items-center py-4">
                    <div className="flex-grow border-t border-dashed border-zinc-700"></div>
                    <span className="px-3 text-zinc-500 text-xs font-mono">JSON #{index + 1}</span>
                    <div className="flex-grow border-t border-dashed border-zinc-700"></div>
                  </div>
                )}
                <ReactJson
                  src={item}
                  theme="twilight"
                  displayDataTypes={false}
                  displayObjectSize={true}
                  enableClipboard={true}
                  style={{ backgroundColor: 'transparent', fontSize: '14px', fontFamily: 'monospace' }}
                  collapsed={2}
                  name={false}
                />
              </div>
            ))}
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
