import * as esbuild from 'esbuild-wasm';

// (async () => {
//   await fileCache.setItem('color', 'red');
//
//   const color = await fileCache.getItem('color');
//
//   console.log(color);
// })();

// ESbuild plugin
export const unpkgPathPlugin = () => {
  return {
    // The name property is used only for debugging.
    name: 'unpkg-path-plugin',
    // Build: 파일을 로드하고, 구문분석하고 전송하고,
    // 여러 다른 파일을 함께 결합합니다.
    setup(build: esbuild.PluginBuild) {
      // Handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Handle relative paths in a module
      // if (args.path.includes('./') || args.path.includes('../'))
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href,
        };
      });

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
