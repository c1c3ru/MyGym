const React = require('react');
const { View } = require('react-native');

function MockQRCode(props) {
  return React.createElement(View, { testID: 'mock-qr-code', ...props });
}

module.exports = MockQRCode;


