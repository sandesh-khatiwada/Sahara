const fs = require('fs');
const path = require('path');

// Read the home.js file
const homeFile = path.join(__dirname, 'app', 'counsellor', 'main', 'home.js');
let content = fs.readFileSync(homeFile, 'utf8');

// Replace all Platform.select shadow calls with web-compatible versions
content = content.replace(
  /...Platform\.select\(\{\s*ios:\s*\{\s*shadowColor:\s*'#000',\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*8\s*\},\s*shadowOpacity:\s*0\.08,\s*shadowRadius:\s*4,\s*\},\s*android:\s*\{\s*elevation:\s*4,\s*\},\s*\}\),/g,
  `...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 4px rgba(0,0,0,0.08)',
      },
    }),`
);

content = content.replace(
  /...Platform\.select\(\{\s*ios:\s*\{\s*shadowColor:\s*'#000',\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*8\s*\},\s*shadowOpacity:\s*0\.1,\s*shadowRadius:\s*5,\s*\},\s*android:\s*\{\s*elevation:\s*5,\s*\},\s*\}\),/g,
  `...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 8px 5px rgba(0,0,0,0.1)',
      },
    }),`
);

content = content.replace(
  /...Platform\.select\(\{\s*ios:\s*\{\s*shadowColor:\s*'#4CAF50',\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*4\s*\},\s*shadowOpacity:\s*0\.3,\s*shadowRadius:\s*3,\s*\},\s*android:\s*\{\s*elevation:\s*3,\s*\},\s*\}\),/g,
  `...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 3px rgba(76,175,80,0.3)',
      },
    }),`
);

content = content.replace(
  /...Platform\.select\(\{\s*ios:\s*\{\s*shadowColor:\s*'#000',\s*shadowOffset:\s*\{\s*width:\s*0,\s*height:\s*4\s*\},\s*shadowOpacity:\s*0\.1,\s*shadowRadius:\s*3,\s*\},\s*android:\s*\{\s*elevation:\s*3,\s*\},\s*\}\),/g,
  `...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 3px rgba(0,0,0,0.1)',
      },
    }),`
);

// Write the file back
fs.writeFileSync(homeFile, content);
console.log('Fixed shadow styles in home.js');
