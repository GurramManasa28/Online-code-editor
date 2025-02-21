import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Code2, Copy, Download, Play, Upload } from 'lucide-react';

type Language = 'javascript' | 'java' | 'python';

const INITIAL_CODE = {
  javascript: '// Example JavaScript code\nconsole.log("Hello, World!");\n\n// You can use console.log for output\nconst sum = (a, b) => a + b;\nconsole.log("Sum:", sum(5, 3));',
  java: '// Java code will be executed in a web environment\n// Only basic Java syntax highlighting is available\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  python: '# Example Python code\nprint("Hello, World!")\n\n# You can use print for output\ndef calculate_sum(a, b):\n    return a + b\n\nresult = calculate_sum(5, 3)\nprint(f"Sum: {result}")'
};

const FILE_EXTENSIONS = {
  javascript: '.js',
  java: '.java',
  python: '.py'
};

function App() {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState(INITIAL_CODE[language]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const getLanguageExtension = (lang: Language) => {
    switch (lang) {
      case 'javascript':
        return javascript({ jsx: true, typescript: true });
      case 'java':
        return java();
      case 'python':
        return python();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${FILE_EXTENSIONS[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setCode(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(INITIAL_CODE[newLanguage]);
    setOutput('');
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    
    const consoleLog = console.log;
    let outputText = '';
    
    // Override console.log to capture output
    console.log = (...args) => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      outputText += output + '\n';
      setOutput(current => current + output + '\n');
    };

    try {
      if (language === 'javascript') {
        // Execute JavaScript code
        const func = new Function(code);
        func();
      } else if (language === 'python') {
        setOutput('Python execution is simulated in this environment.\nSample output:\n\n' + 
                 'Hello, World!\nSum: 8');
      } else if (language === 'java') {
        setOutput('Java execution is simulated in this environment.\nSample output:\n\n' +
                 'Hello, World!');
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      }
    } finally {
      console.log = consoleLog;
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Code2 className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">Online Code Editor</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex gap-2">
                {(['javascript', 'java', 'python'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-2 rounded capitalize ${
                      language === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="upload"
                  className="hidden"
                  accept=".js,.java,.py,.ts,.tsx"
                  onChange={handleUpload}
                />
                <button
                  onClick={() => document.getElementById('upload')?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <Upload size={16} />
                  Upload
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <Copy size={16} />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>

            <CodeMirror
              value={code}
              height="600px"
              theme={oneDark}
              extensions={[getLanguageExtension(language)]}
              onChange={(value) => setCode(value)}
              className="text-lg"
            />
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Output</h2>
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  isRunning
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors`}
              >
                <Play size={16} />
                Run
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm bg-gray-900 overflow-auto whitespace-pre">
              {output || 'Click "Run" to see the output'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;