import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from "webpack";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const isDevelopment = process.env.NODE_ENV !== 'production';

// 변수명 다음에 콜론.. 
const config: webpack.Configuration = {
  name: 'sleact',
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'hidden-source-map' : 'eval',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@hooks': path.resolve(__dirname, 'hooks'),
      '@components': path.resolve(__dirname, 'components'),
      '@layouts': path.resolve(__dirname, 'layouts'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@typings': path.resolve(__dirname, 'typings'),
    },
  },
  entry: {
    app: './client',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { browsers: ['last 2 chrome versions'] }, // 지원해야하는 인터넷 브라우저
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          env: {
            development: {
              // 바벨 플러그인을 적용하면 압축, 안쓰는 코드 제거, 소스맵 제공이 된다.
              // 스타일드 컴포넌트 혹은 이모션이, 클래스 네임으로 바뀌는데 클래스네임이 뭐가 될지 미리 알 수 있게 함 (?) 문서 참조
              // TODO: check!! https://www.npmjs.com/package/@emotion/babel-plugin
              plugins: [['@emotion', {sourceMaps: true}], require.resolve('react-refresh/babel')],
            },
            production: {
              plugins: ['@emotion']
            }
          }
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
      // eslint: {
      //   files: "./src/**/*",
      // },
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }), // process.env를 프론트에서도 접근이 가능하게끔 한다. 
  ],
  output: { // 클라이언트 부터 해서 로더타서 만들어낸 결과물이 아웃풋에서 설정된대로 나옴
    path: path.join(__dirname, 'dist'), // __dirname이 이 파일이 존재하고 있는 디렉토리네임이 될거고 이 경우 ts. ts/dist 폴더가 하나 생기면서
    filename: '[name].js', // 그 안에 웹페이지 결과물이 생김. [name] 이렇게 써놓은것은 entry.app이다. 
    publicPath: '/dist/',
  },
  devServer: { // setting한 이유 1. hot reloading 2. proxy server
    historyApiFallback: true, // react router 할 때 필요한 설정. false로 했을 경우 새로고침할 때 /login 이 안뜬다. 이것의 역할: 주소를 사기쳐주는(?).SPA는 페이지가 하나이기 때문에 index.html 하나밖에 없는데 가짜로 /login을 만들어 주는것이다. 얘가 가짜 주소를 입력해준다. 원래는 새로고침할 때 localhost:3090/login은 서버로 간다. /signup을 쳐도 서버는 무조건 localhost:3090으로 간다(index 페이지로 간다는 뜻) true로 해두면 서버에는 없는 주소(/signup, /login)를 있는것 마냥 해줘서 /login, /signup으로 가는 것 이다.  
    port: 3090,
    publicPath: '/dist/',
    // 이 proxy 눈속임?은 백, 프론트 모두 로컬호스트일 때 먹히는 방법
    proxy: { // proxy에서 /api로 보내는 요청은 주소를 3095로 보내는 것 처럼 취급하겠다 뜻(3090이 아닌 3095인 것 처럼 속임) 그래서 개발자 도구의 network탭에서 확인해보면 options 요청이 안감!
      '/api/': {
        target: 'http://localhost:3095',
        changeOrigin: true,
      }
    }
  },
};

if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new ReactRefreshWebpackPlugin());
  // config.plugins.push(new ReactRefreshWebpackPlugin({
  //   overlay: {
  //     useURLPolyfill: true
  //   }
  // }));
}
if (!isDevelopment && config.plugins) {
  // config.plugins.push(new webpack.HotModuleReplacementPlugin({ minimize: true }));
  // config.plugins.push(new BundleAnalyzerPlugin({
  //   analyzerMode: "static"
  // }));
}

export default config;
