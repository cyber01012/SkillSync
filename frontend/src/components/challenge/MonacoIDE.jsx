import React from "react";
import Editor from "@monaco-editor/react";
import { useRef, useCallback } from "react";

export default function MonacoIDE({
  value,
  onChange,
  language = "python",
  readOnly = false,
  onCursorChange,
}) {
  const editorRef = useRef(null);

  const handleMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange?.({
          line: e.position.lineNumber,
          col: e.position.column,
        });
      });
    },
    [onCursorChange]
  );

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "Consolas, monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
      }}
    />
  );
}
