import * as esbuild from 'esbuild-wasm';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugins';
import CodeEditor from './components/code-editor';

const App = () => {
  const ref = useRef<any>();
  const iFrame = useRef<any>();
  const [input, setInput] = useState('');

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    iFrame.current.srcdoc = html;

    const result = await ref.current.build({
      // index.js 가 application 내부에 번들로 제공되는 첫번째 파일
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });
    // setCode(result.outputFiles[0].text);
    iFrame.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      // ./public/esbuild.wasm
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };

  useEffect(() => {
    startService();
  }, []);

  const html = `
  <html>
    <head></head>
	<body>
	<div id="root"></div>
	<script>
  		window.addEventListener('message', (event) => {
			try {
        const { data } = event;
				eval(data);
			} catch (e) {
        const root = document.querySelector('#root');
        root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + e + '</div>';
        console.error(e);
			}
		}, false);
	</script>
	</body>
  </html> 
  `;

  return (
    <div>
      <CodeEditor
        initialValue="const a = 1;"
        onChange={(value) => setInput(value)}
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <iframe
        title="preview"
        ref={iFrame}
        sandbox="allow-scripts"
        srcDoc={html}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
