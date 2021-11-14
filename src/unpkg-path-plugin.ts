import * as esbuild from 'esbuild-wasm';

// ESbuild plugin
export const unpkgPathPlugin = () => {
  return {
    // The name property is used only for debugging.
    name: 'unpkg-path-plugin',
    // Build: 파일을 로드하고, 구문분석하고 전송하고,
    // 여러 다른 파일을 함께 결합합니다.
    setup(build: esbuild.PluginBuild) {
      // onResolve: index.js 가 어디에 있는지 알아내는 과정, 미해결 단계
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);
        return { path: args.path, namespace: 'a' };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
        // index.js 를 파일 시스템에서 읽으려고 할때
        // 파일을 읽지말고 그 파일의 내용이 요기 있으니 이것을 보라고 한다.
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
                  import message from 'tiny-test-pkg';
                  console.log(message);
                `,
          };
        }
      });
    },
  };
};
