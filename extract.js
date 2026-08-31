const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<i\s+class="([^"]*fa-[^"]*)"[^>]*>/g;
let match;
const classes = new Set();
while ((match = regex.exec(html)) !== null) {
    classes.add(match[1]);
}
console.log(Array.from(classes).sort().join('\n'));
