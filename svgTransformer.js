// Custom Metro transformer: SVG files go through react-native-svg-transformer,
// everything else through Expo's default Babel transformer.
//
// We can't use `react-native-svg-transformer/expo` directly: as of Expo SDK 56
// it can't locate Expo's upstream transformer (it lives nested at
// expo/node_modules/@expo/metro-config and isn't hoisted), so it falls back to
// `null` and Metro crashes with "Cannot read properties of undefined
// (reading 'transformFile')". Instead we resolve Expo's real transformer path
// from the default config and wrap it ourselves.
const { getDefaultConfig } = require('expo/metro-config');
const { createTransformer } = require('react-native-svg-transformer');

const expoBabelTransformer = require(
  getDefaultConfig(__dirname).transformer.babelTransformerPath
);

module.exports.transform = createTransformer(expoBabelTransformer);
