const fs = require("fs");

// Sync version number from react-native to Flutter
const packageJsonData = fs.readFileSync(
  "./ECMAScript/react-native/package.json",
  "utf8"
);
const packageJson = JSON.parse(packageJsonData);
const version = packageJson.version;

const pubspecYamlData = fs.readFileSync("./Flutter/pubspec.yaml", "utf8");
const newPubspecYamlData = pubspecYamlData.replace(
  /version: .*/,
  `version: ${version}`
);

fs.writeFileSync("./Flutter/pubspec.yaml", newPubspecYamlData, "utf8");

// @todo add changeset
// maybe compare git diff and prepend to Flutter/CHANGELOG.md
