/* eslint-env node */

const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;

function resolveWithCandidates(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx")
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const absoluteTarget = path.join(projectRoot, "src", request.slice(2));
    const resolvedTarget = resolveWithCandidates(absoluteTarget);

    if (resolvedTarget) {
      return resolvedTarget;
    }
  }

  if ((request.startsWith("./") || request.startsWith("../")) && parent?.filename) {
    const absoluteTarget = path.resolve(path.dirname(parent.filename), request);
    const resolvedTarget = resolveWithCandidates(absoluteTarget);

    if (resolvedTarget) {
      return resolvedTarget;
    }
  }

  return originalResolveFilename.call(Module, request, parent, isMain, options);
};

function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX
    },
    fileName: filename
  });

  module._compile(outputText, filename);
}

Module._extensions[".ts"] = compileTypeScript;
Module._extensions[".tsx"] = compileTypeScript;
