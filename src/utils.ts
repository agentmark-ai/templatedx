export function resolvePath(basePath: string, targetPath: string): string {
  if (targetPath.startsWith('/')) {
    return targetPath;
  }

  const baseParts = basePath.split('/').filter(Boolean);
  const targetParts = targetPath.split('/').filter(Boolean);
  
  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  return '/' + baseParts.join('/');
}

export function getDirname(filePath: string): string {
  const parts = filePath.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

export function cloneObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cloneObject(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = cloneObject(obj[key]);
    }
  }
  
  return cloned;
}

export function stringifyValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join('');
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}