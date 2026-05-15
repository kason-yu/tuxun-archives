const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Supabase 配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://adqgeizddbitaovmhui.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWdlaXpkYmRpdGFhb3ZtaHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjkyNDQsImV4cCI6MjA5NDQwNTI0NH0.sOOAEuAfO-Fy3sD_3FZCVm4Oqb8TIYkMnFEbJAvYcTA';

// 通用请求函数
async function supabaseFetch(table, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${text}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// ========== 列管理接口 ==========

app.get('/api/headers', async (req, res) => {
  try {
    const data = await supabaseFetch('headers?select=name&order=id.asc');
    res.json(data.map(row => row.name));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/headers', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '列名不能为空' });

    const existing = await supabaseFetch(`headers?name=eq.${encodeURIComponent(name)}&select=name`);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: '列已存在' });
    }

    await supabaseFetch('headers', {
      method: 'POST',
      body: JSON.stringify([{ name }])
    });

    const countries = await supabaseFetch('countries?select=name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data, [name]: 0 };
        await supabaseFetch(`countries?name=eq.${encodeURIComponent(country.name)}`, {
          method: 'PATCH',
          body: JSON.stringify({ data: newData })
        });
      }
    }

    res.json({ success: true, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/headers/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (name === '国家') return res.status(400).json({ error: '不能删除国家列' });

    await supabaseFetch(`headers?name=eq.${encodeURIComponent(name)}`, { method: 'DELETE' });

    const countries = await supabaseFetch('countries?select=name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data };
        delete newData[name];
        await supabaseFetch(`countries?name=eq.${encodeURIComponent(country.name)}`, {
          method: 'PATCH',
          body: JSON.stringify({ data: newData })
        });
      }
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== 选中的列（筛选状态）接口 ==========

app.get('/api/selected-columns', async (req, res) => {
  try {
    const data = await supabaseFetch("settings?key=eq.selected_columns&select=value");
    if (!data || data.length === 0) return res.json([]);
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/selected-columns', async (req, res) => {
  try {
    const { columns, modes } = req.body;
    
    await supabaseFetch('settings', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: 'selected_columns', value: columns || [] })
    });

    if (modes) {
      await supabaseFetch('settings', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'selected_modes', value: modes })
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/selected-modes', async (req, res) => {
  try {
    const data = await supabaseFetch("settings?key=eq.selected_modes&select=value");
    if (!data || data.length === 0) return res.json({});
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== 国家数据接口 ==========

app.get('/api/countries', async (req, res) => {
  try {
    const headersData = await supabaseFetch('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];

    const countries = await supabaseFetch('countries?select=*');
    
    const result = (countries || []).map(country => {
      const row = { 国家: country.name };
      for (const h of headers) {
        if (h !== '国家') {
          row[h] = Number(country.data?.[h]) || 0;
        }
      }
      return row;
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/countries/:country', async (req, res) => {
  try {
    const { country } = req.params;
    
    const headersData = await supabaseFetch('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];

    const data = await supabaseFetch(`countries?name=eq.${encodeURIComponent(country)}&select=*`);
    if (!data || data.length === 0) return res.status(404).json({ error: '国家不存在' });

    const result = { 国家: data[0].name };
    for (const h of headers) {
      if (h !== '国家') {
        result[h] = Number(data[0].data?.[h]) || 0;
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/countries/:country/:column', async (req, res) => {
  try {
    const { country, column } = req.params;
    const { value } = req.body;

    const decodedCountry = decodeURIComponent(country);
    const decodedColumn = decodeURIComponent(column);

    const existing = await supabaseFetch(`countries?name=eq.${encodeURIComponent(decodedCountry)}&select=*`);

    if (!existing || existing.length === 0) {
      await supabaseFetch('countries', {
        method: 'POST',
        body: JSON.stringify({
          name: decodedCountry,
          data: { [decodedColumn]: Number(value) || 0 }
        })
      });
    } else {
      const newData = { ...existing[0].data, [decodedColumn]: Number(value) || 0 };
      await supabaseFetch(`countries?name=eq.${encodeURIComponent(decodedCountry)}`, {
        method: 'PATCH',
        body: JSON.stringify({ data: newData })
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/countries', async (req, res) => {
  try {
    const { country, data } = req.body;
    if (!country) return res.status(400).json({ error: '国家名不能为空' });

    const headersData = await supabaseFetch('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];

    const initialData = {};
    for (const h of headers) {
      if (h !== '国家') {
        initialData[h] = Number(data?.[h]) || 0;
      }
    }

    await supabaseFetch('countries', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        name: country,
        data: initialData
      })
    });

    res.json({ success: true, country });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/countries/:country', async (req, res) => {
  try {
    const { country } = req.params;
    await supabaseFetch(`countries?name=eq.${encodeURIComponent(decodeURIComponent(country))}`, { method: 'DELETE' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Geo Map API server running on port ${PORT}`);
    console.log(`Using Supabase: ${SUPABASE_URL}`);
  });
}

module.exports = app;