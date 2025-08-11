import { FC } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

export const CodeEditor: FC<CodeEditorProps> = ({
  value,
  onValueChange,
  className,
  ...props
}) => {
  return (
    <Editor
      value={value}
      onValueChange={onValueChange}
      highlight={(code) => highlight(code, languages.js)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
      className={className}
      {...props}
    />
  );
};

export interface CodeEditorProps {
  value: string;
  className: string;
  onValueChange: (code: string) => any;
}
