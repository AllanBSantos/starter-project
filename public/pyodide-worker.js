// Pyodide Web Worker: roda Python no navegador via WebAssembly.
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

self.importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);

let pyodidePromise = null;

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = self.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  }
  return pyodidePromise;
}

function buildCode(userCode, stdinMock) {
  const lines = [];
  lines.push("def _run_isolated():");
  lines.push("    import builtins");

  if (typeof stdinMock === "string" && stdinMock !== "") {
    const values = JSON.stringify(stdinMock.split("\n"));
    lines.push(`    _inputs = iter(${values})`);
    lines.push("    _original_input = builtins.input");
    lines.push("    def _mock_input(prompt=''):");
    lines.push("        try:");
    lines.push("            return next(_inputs)");
    lines.push("        except StopIteration:");
    lines.push("            return ''");
    lines.push("    builtins.input = _mock_input");
  }

  const indentedUserCode = userCode.split('\n').map(line => '    ' + line).join('\n');
  lines.push("");
  lines.push("    # Código do usuário:");
  lines.push(indentedUserCode);

  if (typeof stdinMock === "string" && stdinMock !== "") {
    lines.push("    builtins.input = _original_input");
  }

  lines.push("");
  lines.push("_run_isolated()");
  return lines.join('\n');
}

self.addEventListener("message", async (event) => {
  const { type, id, code, stdin_mock } = event.data;

  if (type !== "run") return;

  try {
    self.postMessage({ type: "exec_start", id });
    const pyodide = await getPyodide();

    const wrappedCode = buildCode(code, stdin_mock);

    // Redirect stdout/stderr
    const namespace = pyodide.globals.get("dict")();
    pyodide.runPython(`
import sys
import io
_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
    `, { globals: namespace });

    let exitCode = 0;
    try {
      pyodide.runPython(wrappedCode, { globals: namespace });
    } catch (err) {
      exitCode = 1;
    }

    const stdout = pyodide.runPython("_stdout.getvalue()", { globals: namespace });
    const stderr = pyodide.runPython("_stderr.getvalue()", { globals: namespace });

    self.postMessage({
      type: "result",
      id,
      stdout: stdout || "",
      stderr: stderr || "",
      exitCode
    });
  } catch (error) {
    self.postMessage({
      type: "result",
      id,
      stdout: "",
      stderr: error.message || "Erro ao executar Python",
      exitCode: -1
    });
  }
});

// Notify ready after first load
(async () => {
  try {
    console.log('[Pyodide Worker] Starting initialization...');
    await getPyodide();
    console.log('[Pyodide Worker] Pyodide loaded successfully');
    self.postMessage({ type: "ready" });
  } catch (err) {
    console.error('[Pyodide Worker] Init failed:', err);
    self.postMessage({ type: "init_error", message: err.message });
  }
})();
