import React from "react";
import JsonView from "@uiw/react-json-view";

type KeyNameRender = NonNullable<React.ComponentProps<typeof JsonView.KeyName>["render"]>;
type RowRender = NonNullable<React.ComponentProps<typeof JsonView.Row>["render"]>;
type BraceRightRender = NonNullable<React.ComponentProps<typeof JsonView.BraceRight>["render"]>;
type BracketsRightRender = NonNullable<React.ComponentProps<typeof JsonView.BracketsRight>["render"]>;

const buildDisplayPath = (keys: Array<string | number>) => {
  const parts: string[] = [];
  keys.forEach((key) => {
    if (typeof key === "number") {
      parts.push(`[${key}]`);
    } else {
      parts.push(String(key));
    }
  });
  return parts.join(" ➔ ");
};

const buildCopyPath = (keys: Array<string | number>) => {
  let path = "";
  keys.forEach((key) => {
    if (typeof key === "number") {
      path += `[${key}]`;
      return;
    }
    const keyText = String(key);
    if (/^[A-Za-z_$][\w$]*$/.test(keyText)) {
      path += `.${keyText}`;
      return;
    }
    path += `["${keyText.replace(/"/g, '\\"')}"]`;
  });
  return path;
};

const shouldAppendComma = (parentValue: unknown, keyName?: string | number) => {
  if (parentValue === null || parentValue === undefined || keyName === undefined) {
    return false;
  }
  if (Array.isArray(parentValue) && typeof keyName === "number") {
    return keyName < parentValue.length - 1;
  }
  if (typeof parentValue === "object") {
    const keys = Object.keys(parentValue as Record<string, unknown>);
    if (!keys.length) {
      return false;
    }
    return String(keyName) !== keys[keys.length - 1];
  }
  return false;
};

export const useJsonPathRenderers = () => {
  const renderKeyName = React.useCallback<KeyNameRender>(
    (props, meta) => {
      const keys = meta.keys ?? [];
      const label = buildDisplayPath(keys);
      const copy = buildCopyPath(keys);
      return (
        <span {...props} data-jsonviewer-path={label} data-jsonviewer-copy={copy}>
          {props.children}
        </span>
      );
    },
    []
  );
  const renderRow = React.useCallback<RowRender>(
    (props, meta) => {
      const keys = meta.keys ?? [];
      const label = buildDisplayPath(keys);
      const copy = buildCopyPath(keys);
      const hasComma = shouldAppendComma(meta.parentValue, meta.keyName);
      return (
        <div {...props} data-jsonviewer-path={label} data-jsonviewer-copy={copy}>
          {props.children}
          {hasComma ? <span className="text-slate-400">,</span> : null}
        </div>
      );
    },
    []
  );
  const renderBraceRight = React.useCallback<BraceRightRender>(
    (props, meta) => {
      const hasComma = shouldAppendComma(meta.parentValue, meta.keyName);
      return (
        <span {...props}>
          {props.children}
          {hasComma ? <span className="text-slate-400">,</span> : null}
        </span>
      );
    },
    []
  );
  const renderBracketsRight = React.useCallback<BracketsRightRender>(
    (props, meta) => {
      const hasComma = shouldAppendComma(meta.parentValue, meta.keyName);
      return (
        <span {...props}>
          {props.children}
          {hasComma ? <span className="text-slate-400">,</span> : null}
        </span>
      );
    },
    []
  );
  return { renderKeyName, renderRow, renderBraceRight, renderBracketsRight };
};
