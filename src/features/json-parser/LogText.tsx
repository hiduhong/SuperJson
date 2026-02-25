import React from "react";

interface LogTextProps {
  text: string;
}

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

export const LogText: React.FC<LogTextProps> = ({ text }) => {
  const lines = text.split(/\n/);
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
