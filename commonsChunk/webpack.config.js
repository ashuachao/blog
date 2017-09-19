const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
module.exports= {
    entry: {
        main: path.resolve(__dirname, './main.js'),
        // main1: path.resolve(__dirname, './main1.js'),
        chunk1: path.resolve(__dirname, './chunk2.js')
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['chunk1', 'chunk2'],
            // minChunks: Infinity
        }),
        new BundleAnalyzerPlugin({
            generateStatsFile: true
        })
    ]
}