import fs from 'fs';

export const getInput = (basePath: string) => {
  const input = fs.readFileSync(`${basePath}/input.mdx`, 'utf-8');
  return input;
}

export const getOutput = (basePath: string) => {
  const input = fs.readFileSync(`${basePath}/output.mdx`, 'utf-8');
  return input;
}

export const getNode = (basePath: string) => {
  const input = fs.readFileSync(`${basePath}/node.json`, 'utf-8');
  return input;
}

// @ts-ignore
export function removePosition(tree) {
  ;[...walkThrough(tree)]

  return tree
}

export const print = (tree: object) => {
  return `${JSON.stringify(removePosition(tree), null, 2)}\n`
}

const walkThrough = function* (obj: object) {
  // @ts-ignore
  const walk = function* (x: object & { position?: object, loc?: object, range?: object, start?: any, end?: any }, previous = []) {
    if (x) {
      for (const key of Object.keys(x)) {
        if (key === 'position' || key === 'loc' || key === 'range' || key === 'start' || key === 'end') {
          delete x[key]
        }
        // @ts-ignore
        if (typeof x[key] === 'object') yield* walk(x[key], [...previous, key])
        // @ts-ignore
        else yield [[...previous, key], x[key]]
      }
    }
  }
  yield* walk(obj)
}

