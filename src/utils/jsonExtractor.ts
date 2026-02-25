export type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type ExtractedJsonSegment = { value: JsonValue; start: number; end: number };

/**
 * 递归地将对象中的 JSON 字符串值解析为对象。
 * 用于处理嵌套的 stringify 场景。
 */
export function deepUnescape(obj: JsonValue): JsonValue {
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      // 如果解析出来是对象或数组，则继续递归处理
      if (typeof parsed === 'object' && parsed !== null) {
        return deepUnescape(parsed);
      }
      return obj;
    } catch {
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepUnescape(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: JsonObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = deepUnescape(obj[key]);
      }
    }
    return result;
  }

  return obj;
}

/**
 * 尝试从脏文本中提取 JSON 对象。
 * 1. 寻找最外层的 {} 或 []
 * 2. 尝试解析
 * 3. 失败则尝试更宽松的匹配
 */
export function extractJson(text: string): JsonValue[] {
  const { values } = extractJsonWithRanges(text);
  return values;
}

export function extractJsonWithRanges(text: string): { values: JsonValue[]; segments: ExtractedJsonSegment[] } {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("No JSON structure found.");
  }
  const offset = text.length - text.trimStart().length;
  try {
    const parsed = deepUnescape(JSON.parse(trimmed));
    return {
      values: [parsed],
      segments: [{ value: parsed, start: offset, end: offset + trimmed.length }]
    };
  } catch {
    void 0;
  }
  const segments = scanJsonSegments(trimmed, offset);
  if (segments.length > 0) {
    return {
      values: segments.map((segment) => segment.value),
      segments
    };
  }
  throw new Error("No JSON structure found.");
}

function scanJsonSegments(text: string, offset: number): ExtractedJsonSegment[] {
  const segments: ExtractedJsonSegment[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    let found = false;
    if (char === '"') {
      const end = findStringEnd(text, i);
      if (end !== -1) {
        const candidate = text.substring(i, end + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (typeof parsed === 'string') {
             const trimmedParsed = parsed.trim();
             if (trimmedParsed.startsWith('{') || trimmedParsed.startsWith('[')) {
                 const result = deepUnescape(trimmedParsed);
                 if (typeof result === 'object' && result !== null) {
                    segments.push({ value: result, start: offset + i, end: offset + end + 1 });
                    i = end + 1;
                    found = true;
                    continue;
                 }
             }
          }
        } catch {
          void 0;
        }
      }
    }

    if (!found && (char === '{' || char === '[')) {
      const end = findBalancedClosing(text, i);
      if (end !== -1) {
        const candidate = text.substring(i, end + 1);
        try {
          const parsed = deepUnescape(JSON.parse(candidate));
          segments.push({ value: parsed, start: offset + i, end: offset + end + 1 });
          i = end + 1;
          found = true;
          continue;
        } catch {
           try {
              const unescaped = candidate.replace(/\\"/g, '"');
              const parsed = deepUnescape(JSON.parse(unescaped));
              segments.push({ value: parsed, start: offset + i, end: offset + end + 1 });
              i = end + 1;
              found = true;
              continue;
           } catch {
             void 0;
           }
        }
      }
    }
    i++;
  }
  return segments;
}

/**
 * 寻找字符串结束位置（匹配的引号），支持跳过转义字符
 */
function findStringEnd(text: string, start: number): number {
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
      continue;
    }
    if (text[i] === '"') {
      return i;
    }
  }
  return -1;
}

/**
 * 寻找匹配的闭合括号，支持跳过字符串和转义字符
 */
function findBalancedClosing(text: string, start: number): number {
  const stack: string[] = [];
  const startChar = text[start];
  stack.push(startChar);
  
  let inString = false;
  
  for (let i = start + 1; i < text.length; i++) {
    const char = text[i];
    
    // 处理转义：跳过下一个字符
    if (char === '\\') {
      i++; 
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}' || char === ']') {
        if (stack.length === 0) return -1;
        
        const last = stack.pop();
        if ((char === '}' && last !== '{') || (char === ']' && last !== '[')) {
            return -1; // 括号不匹配
        }
        
        if (stack.length === 0) {
          return i;
        }
      }
    }
  }
  return -1;
}
