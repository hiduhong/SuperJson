import React from "react";
import Split, { type SplitProps } from "react-split";
import { cn } from "../../utils/cn";

interface SplitPaneProps extends SplitProps {
  className?: string;
  children: React.ReactNode;
}

export const SplitPane= ({
  className,
  children,
  ...props
}: SplitPaneProps) => {
  return (
    <Split
      className={cn("flex h-full w-full", className)}
      gutterSize={8}
      elementStyle={(_dimension, size, gutterSize) => ({
        "flex-basis": `calc(${size}% - ${gutterSize}px)`,
      })}
      gutterStyle={(_dimension, gutterSize) => ({
        "flex-basis": `${gutterSize}px`,
      })}
      {...props}
    >
      {children}
    </Split>
  );
};
