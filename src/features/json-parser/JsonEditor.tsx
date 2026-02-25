import React, { useRef, useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Trash2, Copy, FileCode } from "lucide-react";
import { cn } from "../../utils/cn";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLoadSample?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  onLoadSample,
  onUndo,
  onRedo,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCopied, setShowCopied] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand("copy");
      setShowCopied(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        setShowCopied(false);
      }, 2200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+Z / Ctrl+Z for Undo
    // Handle Cmd+Shift+Z / Ctrl+Shift+Z / Ctrl+Y for Redo
    if (e.metaKey || e.ctrlKey) {
      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      } else if (key === 'y' && !e.metaKey) { // Ctrl+Y (Windows Redo)
        e.preventDefault();
        onRedo?.();
      }
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-50", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="text-sm font-medium text-slate-600">Input / Logs</div>
        <div className="flex space-x-2">
          {onLoadSample && (
             <Button variant="ghost" size="sm" onClick={onLoadSample} title="Load Sample">
                <FileCode className="w-4 h-4" />
             </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onChange("")} title="Clear">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className="w-full h-full p-4 bg-white text-slate-800 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400/50 border-none"
          placeholder="Paste your dirty JSON or logs here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {showCopied ? (
          <div className="absolute top-3 right-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 shadow-sm">
            已复制到剪切板
          </div>
        ) : null}
      </div>
    </div>
  );
};
