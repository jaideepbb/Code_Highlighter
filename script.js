// Highlight the code
function highlightCode() {
    const code = document.getElementById("codeInput").value;
    const lang = document.getElementById("languageSelector").value;
    const output = document.getElementById("highlightedCode");
    output.textContent = code;
  
    if (lang === "auto") {
      hljs.highlightElement(output);
    } else {
      output.className = lang;
      hljs.highlightBlock(output);
    }
  }
  
  // Format the code using Prettier
  function formatCode() {
    const input = document.getElementById("codeInput");
    const lang = document.getElementById("languageSelector").value;
  
    try {
      if (lang === "javascript") {
        const formatted = prettier.format(input.value, {
          parser: "babel",
          plugins: prettierPlugins,
        });
        input.value = formatted;
      } else if (lang === "html") {
        const formatted = prettier.format(input.value, {
          parser: "html",
          plugins: prettierPlugins,
        });
        input.value = formatted;
      } else if (lang === "python") {
        // Try using Pyodide if available
        if (window.pyodide) {
          window.pyodide.runPythonAsync(`import black\nformatted = black.format_str("""${input.value}""", mode=black.Mode())`).then(result => {
            input.value = result;
          }).catch(err => {
            alert("Python formatting error: " + err);
          });
        } else {
          alert("Python formatting requires Pyodide, which is not loaded.");
        }
      } else {
        alert("Formatting not available for the selected language.");
      }
    } catch (err) {
      alert("Formatting Error: " + err.message);
    }
  }
  
  // Check syntax for JavaScript, HTML, and Python
  function checkSyntax() {
    const code = document.getElementById("codeInput").value;
    const lang = document.getElementById("languageSelector").value;
    const output = document.getElementById("errorOutput");
  
    try {
      if (lang === "javascript") {
        esprima.parseScript(code);
        output.textContent = "✔ No syntax errors in JavaScript.";
        output.style.color = "lime";
      } else if (lang === "html") {
        const results = HTMLHint.verify(code);
        if (results.length === 0) {
          output.textContent = "✔ No syntax errors in HTML.";
          output.style.color = "lime";
        } else {
          output.textContent = "❌ HTML Errors:\n" + results.map(r => `${r.message} (line ${r.line})`).join("\n");
          output.style.color = "red";
        }
      } else if (lang === "python") {
        if (window.pyodide) {
          window.pyodide.runPythonAsync(`import ast\nast.parse("""${code}""")`).then(() => {
            output.textContent = "✔ No syntax errors in Python.";
            output.style.color = "lime";
          }).catch(err => {
            output.textContent = "❌ Python Syntax Error: " + err;
            output.style.color = "red";
          });
        } else {
          output.textContent = "❌ Python syntax checking requires Pyodide. Not loaded.";
          output.style.color = "orange";
        }
      } else {
        output.textContent = "⚠️ Syntax checking not available for selected language.";
        output.style.color = "gray";
      }
    } catch (err) {
      output.textContent = "❌ Syntax Error: " + err.message;
      output.style.color = "red";
    }
  }
  
  // Generate shareable link
  function shareCode() {
    const code = document.getElementById("codeInput").value;
    const encoded = encodeURIComponent(btoa(code));
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("✅ Shareable link copied to clipboard!");
    });
  }
  
  // Load code from URL if available
  window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get("code");
    if (sharedCode) {
      const decoded = atob(decodeURIComponent(sharedCode));
      document.getElementById("codeInput").value = decoded;
      highlightCode();
    }
  
    // Load Pyodide if needed
    if (document.getElementById("languageSelector").value === "python") {
      window.pyodide = await loadPyodide();
      await window.pyodide.loadPackage("black");
    }
  };
  
  // Search inside code
  function searchCode() {
    const searchTerm = document.getElementById("searchBox").value;
    const code = document.getElementById("highlightedCode").innerText;
    if (!searchTerm) return highlightCode();
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const highlighted = code.replace(regex, '<mark>$1</mark>');
    document.getElementById("highlightedCode").innerHTML = highlighted;
  }
  
