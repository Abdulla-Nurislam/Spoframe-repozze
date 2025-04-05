const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Загружаем переменные окружения из .env
dotenv.config();

// Базовая конфигурация webpack
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  
  return {
    // Режим разработки или продакшна
    mode: isProd ? 'production' : 'development',
    
    // Точки входа в приложение
    entry: {
      main: './src/index.tsx',
    },
    
    // Настройка выходных файлов
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'js/[name].[contenthash].js' : 'js/[name].bundle.js',
      chunkFilename: isProd ? 'js/[name].[contenthash].chunk.js' : 'js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    
    // Настройка source maps для разработки
    devtool: isProd ? 'source-map' : 'eval-source-map',
    
    // Оптимизация бандла
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    },
    
    // Настройка dev-сервера
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      hot: true,
      historyApiFallback: true,
      port: 3000,
      open: true,
      client: {
        logging: 'verbose',
        overlay: true,
        progress: true,
      },
      compress: true,
    },
    
    // Настройка расширений и fallback
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@context': path.resolve(__dirname, 'src/context'),
        'process/browser': require.resolve('process/browser'),
      },
      fallback: {
        "process": require.resolve("process/browser"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "asset": require.resolve("assert/"),
      }
    },
    
    // Настройка загрузчиков
    module: {
      rules: [
        // JavaScript, TypeScript и JSX
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ]
            }
          }
        },
        // CSS
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        // Изображения
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: 'asset/resource',
          parser: {
            dataUrlCondition: {
              maxSize: 8192, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
        // Шрифты
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        }
      ]
    },
    
    // Плагины
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProd ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new MiniCssExtractPlugin({
        filename: isProd ? 'css/[name].[contenthash].css' : 'css/[name].css',
        chunkFilename: isProd ? 'css/[id].[contenthash].css' : 'css/[id].css',
      }),
      isProd && new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        algorithm: 'gzip',
      }),
      isProd && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            to: '',
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
          {
            from: 'src/assets/images',
            to: 'images',
          },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        'process.browser': true,
        'process.version': JSON.stringify(process.version)
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ].filter(Boolean),
    performance: {
      hints: isProd ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
}; 