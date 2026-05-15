const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// JSON 数据库路径
const dbPath = path.join(__dirname, 'data.json');

// 读取数据库
function readDB() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('读取数据库失败:', e.message);
    return { headers: ['国家'], data: {} };
  }
}

// 写入数据库
function writeDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// 选中的列（单独存储，方便快速读写）
const selectedColsPath = path.join(__dirname, 'selected-columns.json');

function readSelectedColumns() {
  try {
    const raw = fs.readFileSync(selectedColsPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeSelectedColumns(cols) {
  fs.writeFileSync(selectedColsPath, JSON.stringify(cols, null, 2), 'utf-8');
}

// ========== 列管理接口 ==========

// 获取所有列
app.get('/api/headers', (req, res) => {
  const db = readDB();
  res.json(db.headers);
});

// 新增列
app.post('/api/headers', (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: '列名不能为空' });

  const db = readDB();
  if (db.headers.includes(name)) {
    return res.status(409).json({ error: '列已存在' });
  }

  db.headers.push(name);
  // 所有现有国家新增该列为 0
  for (const key in db.data) {
    db.data[key][name] = 0;
  }
  writeDB(db);
  res.json({ success: true, name });
});

// 删除列
app.delete('/api/headers/:name', (req, res) => {
  const { name } = req.params;
  if (name === '国家') return res.status(400).json({ error: '不能删除国家列' });

  const db = readDB();
  const idx = db.headers.indexOf(name);
  if (idx === -1) return res.status(404).json({ error: '列不存在' });

  db.headers.splice(idx, 1);
  for (const key in db.data) {
    delete db.data[key][name];
  }
  writeDB(db);
  res.json({ success: true });
});

// ========== 选中的列（筛选状态）接口 ==========

app.get('/api/selected-columns', (req, res) => {
  const cols = readSelectedColumns();
  res.json(cols);
});

app.put('/api/selected-columns', (req, res) => {
  const { columns, modes } = req.body;
  writeSelectedColumns(columns || []);
  if (modes) {
    const modesPath = path.join(__dirname, 'selected-modes.json');
    fs.writeFileSync(modesPath, JSON.stringify(modes, null, 2), 'utf-8');
  }
  res.json({ success: true });
});

app.get('/api/selected-modes', (req, res) => {
  const modesPath = path.join(__dirname, 'selected-modes.json');
  try {
    const raw = fs.readFileSync(modesPath, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (e) {
    res.json({});
  }
});

// ========== 国家数据接口 ==========

// 获取所有国家数据
app.get('/api/countries', (req, res) => {
  const db = readDB();
  const result = [];
  for (const countryName in db.data) {
    const row = { 国家: countryName };
    for (const h of db.headers) {
      if (h === '国家') continue;
      row[h] = Number(db.data[countryName][h]) || 0;
    }
    result.push(row);
  }
  res.json(result);
});

// 获取单个国家数据
app.get('/api/countries/:country', (req, res) => {
  const db = readDB();
  const { country } = req.params;
  const rowData = db.data[country];
  if (!rowData) return res.status(404).json({ error: '国家不存在' });

  const result = { 国家: country };
  for (const h of db.headers) {
    if (h === '国家') continue;
    result[h] = Number(rowData[h]) || 0;
  }
  res.json(result);
});

// 更新某国某列的值
app.put('/api/countries/:country/:column', (req, res) => {
  const { country, column } = req.params;
  const { value } = req.body;

  const db = readDB();
  if (!db.data[country]) {
    db.data[country] = { 国家: country };
    for (const h of db.headers) {
      if (h !== '国家' && db.data[country][h] === undefined) {
        db.data[country][h] = 0;
      }
    }
  }

  db.data[country][column] = Number(value) || 0;
  writeDB(db);
  res.json({ success: true });
});

// 新增国家
app.post('/api/countries', (req, res) => {
  const { country, data } = req.body;
  if (!country) return res.status(400).json({ error: '国家名不能为空' });

  const db = readDB();
  db.data[country] = { 国家: country };
  for (const h of db.headers) {
    if (h === '国家') continue;
    db.data[country][h] = 0;
  }
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      db.data[country][k] = Number(v) || 0;
    }
  }
  writeDB(db);
  res.json({ success: true, country });
});

// 删除国家
app.delete('/api/countries/:country', (req, res) => {
  const { country } = req.params;
  const db = readDB();
  delete db.data[country];
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  const db = readDB();
  const count = Object.keys(db.data).length;
  console.log(`Geo Map API server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
  console.log(`Countries in database: ${count}`);
  console.log(`Headers: ${db.headers.join(', ')}`);
});
