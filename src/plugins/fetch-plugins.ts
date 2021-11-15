import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // index.js 를 파일 시스템에서 읽으려고 할때
        // 파일을 읽지말고 그 파일의 내용이 요기 있으니 이것을 보라고 한다.
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }

        // Check to sett if we have already fetched this file
        // and if it is int the cache
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path,
        );

        // if it is, return it immediately
        if (cachedResult) {
          return cachedResult;
        }

        const { data, request } = await axios.get(args.path);
        const fileType = args.path.match(/.css$/) ? 'css' : 'jsx';

        const contents =
          fileType === 'css'
            ? `
          const style = document.createElement('style');
          style.innerHTML = 'body { background-color: "red" }';
          document.head.appendChild(style);
        `
            : data;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        // store response in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
