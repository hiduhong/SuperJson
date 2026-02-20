export type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

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
  const trimmed = text.trim();
  const results: JsonValue[] = [];
  
  // 1. 尝试直接解析
  try {
    const parsed = deepUnescape(JSON.parse(trimmed));
    return [parsed];
  } catch {
    // 忽略直接解析错误，尝试提取
  }

  // 2. 扫描所有可能的 JSON 起始位置
  let i = 0;
  while (i < trimmed.length) {
    const char = trimmed[i];
    let found = false;
    
    // 尝试提取被引号包裹的 JSON 字符串
    if (char === '"') {
      const end = findStringEnd(trimmed, i);
      if (end !== -1) {
        const candidate = trimmed.substring(i, end + 1);
        try {
          const parsed = JSON.parse(candidate);
          // 只有当解析出来的是字符串，且看起来像 JSON (对象或数组) 时才处理
          if (typeof parsed === 'string') {
             const trimmedParsed = parsed.trim();
             if (trimmedParsed.startsWith('{') || trimmedParsed.startsWith('[')) {
                 const result = deepUnescape(trimmedParsed);
                 // 确保结果是对象或数组，而不是原样返回的字符串
                 if (typeof result === 'object' && result !== null) {
                    results.push(result);
                    i = end + 1;
                    found = true;
                    continue;
                 }
             }
          }
        } catch {
          // 忽略错误，继续扫描
        }
      }
    }

    if (!found && (char === '{' || char === '[')) {
      const end = findBalancedClosing(trimmed, i);
      if (end !== -1) {
        const candidate = trimmed.substring(i, end + 1);
        try {
          results.push(deepUnescape(JSON.parse(candidate)));
          i = end + 1;
          found = true;
          continue;
        } catch {
           // 尝试处理转义字符 (例如 \" -> ")
           try {
              const unescaped = candidate.replace(/\\"/g, '"');
              results.push(deepUnescape(JSON.parse(unescaped)));
              i = end + 1;
              found = true;
              continue;
           } catch {
               // 继续尝试下一个可能
           }
        }
      }
    }
    
    // 如果没有找到 JSON，继续前进
    i++;
  }

  if (results.length > 0) {
    return results;
  }

  throw new Error("No JSON structure found.");
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
