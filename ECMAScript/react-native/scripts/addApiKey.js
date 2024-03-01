const fs = require('fs');
const path = require('path');

const content = `
export const ErrorReporterConfig = {
  honeybadger_api_key: '${process.env.HONEYBADGER_API_KEY_REACT_NATIVE_SDK}',
}
`;

const filePath = path.join(__dirname, '..', 'src', 'utils', 'ErrorReporterConfig.ts');

fs.writeFile(filePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully');
  }
});
