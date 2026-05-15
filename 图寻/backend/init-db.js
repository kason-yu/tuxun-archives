const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'world_map', 'geo.csv');
const csvText = fs.readFileSync(csvPath, 'utf-8');

const lines = csvText.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());
if (!headers.includes('国家')) headers.unshift('国家');

const dataPath = path.join(__dirname, 'data.json');

// 检查是否已有数据库
if (fs.existsSync(dataPath)) {
  console.log('数据库已存在，跳过初始化');
  process.exit(0);
}

// 解析并存储
const data = {};
lines.slice(1).forEach(line => {
  const values = line.split(',').map(v => v.trim());
  const row = {};
  headers.forEach((header, idx) => {
    const val = values[idx];
    row[header] = isNaN(Number(val)) ? val : Number(val);
  });
  if (row['国家']) {
    data[row['国家']] = row;
  }
});

const db = {
  headers,
  data
};

fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf-8');
console.log(`数据库初始化完成！共导入 ${Object.keys(data).length} 条记录，${headers.length} 列`);
