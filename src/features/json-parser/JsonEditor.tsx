import React, { useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Trash2, FileJson, Copy, FileCode } from "lucide-react";
import { cn } from "../../utils/cn";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFormat?: () => void;
  isSmartExtract?: boolean;
  onToggleSmartExtract?: () => void;
  onLoadSample?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  onFormat,
  isSmartExtract,
  onToggleSmartExtract,
  onLoadSample,
  onUndo,
  onRedo,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand("copy");
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
    <div className={cn("flex flex-col h-full bg-zinc-900", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="text-sm font-medium text-zinc-400">Input / Logs</div>
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
          {onFormat && (
            <Button variant="secondary" size="sm" onClick={onFormat}>
              <FileJson className="w-4 h-4 mr-2" />
              Format
            </Button>
          )}
           {onToggleSmartExtract && (
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isSmartExtract} 
                onChange={onToggleSmartExtract}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-emerald-500/50"
              />
              <span className="text-xs font-medium text-zinc-400">Smart Extract</span>
            </label>
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className="w-full h-full p-4 bg-zinc-950 text-zinc-300 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-900/50 border-none"
          placeholder="Paste your dirty JSON or logs here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
