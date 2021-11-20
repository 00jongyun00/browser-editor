import 'bulmaswatch/solar/bulmaswatch.min.css';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Bundler from './bundler';

import CodeEditor from './components/code-editor';
import Preview from './components/preview';

const App = () => {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const onClick = async () => {
    const result = await Bundler(input);
    setCode(result);
  };

  return (
    <div>
      <CodeEditor
        initialValue="const a = 1;"
        onChange={(value) => setInput(value)}
      />
      <button onClick={onClick}>Submit</button>
      <Preview code={code} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
