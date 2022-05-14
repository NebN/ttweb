module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/',
  
  //configureWebpack: {
  //  entry: {
  //    worker: './src/script/transformation-worker'
  //  },
  //},

  chainWebpack: config => {
    config.performance
      .maxEntrypointSize(400000)
      .maxAssetSize(400000)
      .plugins
  },
 
}