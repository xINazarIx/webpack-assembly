const path = require('path'); // Для работы с путями файлов

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Плагин который выносит все стили в отдельный файл
const CopyWebpackPlugin = require('copy-webpack-plugin');
const  SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');



const isDev = process.env.NODE_ENV === 'development'; // (Методы находятся по-умолчанию в NODE), определяем в каком режиме находимся (разработка или продакшн). Режим задаём с помощью плагина cross-env в package.json
const isProd = !isDev;


const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}` // Хеш чтобы при сборке app выдавалиьс новые название файлов

module.exports = {
  context: path.resolve(__dirname, 'src'), // Относительно которой папки будем прописывать пути далее
  entry: './index.js', // Точка входа
  mode: 'development', // По-умолчанию используем режим разроботки
  output: {
    path: path.resolve(__dirname, 'dist'), // Папка кула билдим проект
    filename: filename('js'), // Название файла
    clean: true,
  },

  devtool: isProd ? false: 'source-map',

  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    open: true,
    compress: true,
    hot: true,
    port: 3000
  },


  plugins: [
    new HTMLWebpackPlugin({ // Плагин для html 
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: isProd // Сжимать html или нет
      }
    }),

    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`, // Название файла
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/copy'),
          to: path.resolve(__dirname, 'dist/assets/copy')
        }
      ]
    }),

    new SVGSpritemapPlugin('src/assets/images/svg/*.svg', {
      output: {
        filename: '../src/assets/images/spritemap.svg',
        svg: {
          sizes: true
        },
        chunk: {
          keep: true // Включаем чтобы при сборке проекта небыло ошибки из-за отсутствия spritemap.js 
        }
      }
    }),
  ],

  module: {
    rules: [ 
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/i, // Собираем все файлы с данным расширением
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr : isDev // Страница не презагружается
            }
          },

          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i, // Собираем все файлы с данным расширением
        use: [
          { 
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resoursePath, context) => {
                return path.relative(path.dirname(resoursePath), context) + '/'
              },
            }
          },

          'css-loader',
          'sass-loader'
        ]
      },

      {
        test: /\.(?:|png|jpg|gif|jpeg|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: `assets/images/${filename('[ext]')}`
        }
      },



      {
        test: /\.(?:|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: `assets/fonts/${filename('[ext]')}`
        }
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },

      
    ]
  }
};