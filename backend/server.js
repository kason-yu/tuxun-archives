const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const SUPABASE_URL = 'https://adqgeizdbditaaovmhui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWdlaXpkYmRpdGFhb3ZtaHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjkyNDQsImV4cCI6MjA5NDQwNTI0NH0.sOOAEuAfO-Fy3sD_3FZCVm4Oqb8TIYkMnFEbJAvYcTA';

async function supabaseRequest(path, method, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const options = {
    method: method || 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'authorization': `Bearer ${SUPABASE_KEY}`,
      'content-type': 'application/json'
    }
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Supabase request error:', { url, error: error.message });
    throw error;
  }
}

app.get('/api/headers', async (req, res) => {
  try {
    const data = await supabaseRequest('headers?select=name&order=id.asc');
    res.json(data.map(row => row.name));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/headers', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '列名不能为空' });

    const existing = await supabaseRequest(`headers?name=eq.${encodeURIComponent(name)}&select=name`);
    if (existing && existing.length > 0) return res.status(409).json({ error: '列已存在' });

    await supabaseRequest('headers', 'POST', [{ name }]);

    const countries = await supabaseRequest('countries?select=name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data, [name]: 0 };
        await supabaseRequest(`countries?name=eq.${encodeURIComponent(country.name)}`, 'PATCH', { data: newData });
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

    await supabaseRequest(`headers?name=eq.${encodeURIComponent(name)}`, 'DELETE');

    const countries = await supabaseRequest('countries?select=name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data };
        delete newData[name];
        await supabaseRequest(`countries?name=eq.${encodeURIComponent(country.name)}`, 'PATCH', { data: newData });
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/selected-columns', async (req, res) => {
  try {
    const data = await supabaseRequest("settings?key=eq.selected_columns&select=value");
    if (!data || data.length === 0) return res.json([]);
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/selected-columns', async (req, res) => {
  try {
    const { columns, modes } = req.body;
    await supabaseRequest('settings', 'POST', { key: 'selected_columns', value: columns || [] });
    if (modes) await supabaseRequest('settings', 'POST', { key: 'selected_modes', value: modes });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/selected-modes', async (req, res) => {
  try {
    const data = await supabaseRequest("settings?key=eq.selected_modes&select=value");
    if (!data || data.length === 0) return res.json({});
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/countries', async (req, res) => {
  try {
    const headersData = await supabaseRequest('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    const countries = await supabaseRequest('countries?select=*');
    const result = (countries || []).map(country => {
      const row = { 国家: country.name };
      for (const h of headers) if (h !== '国家') row[h] = Number(country.data?.[h]) || 0;
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
    const headersData = await supabaseRequest('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    const data = await supabaseRequest(`countries?name=eq.${encodeURIComponent(country)}&select=*`);
    if (!data || data.length === 0) return res.status(404).json({ error: '国家不存在' });
    const result = { 国家: data[0].name };
    for (const h of headers) if (h !== '国家') result[h] = Number(data[0].data?.[h]) || 0;
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/countries/:country/:column', async (req, res) => {
  try {
    const { country, column } = req.params;
    const { value } = req.body;
    const dc = decodeURIComponent(country), dcol = decodeURIComponent(column);
    const existing = await supabaseRequest(`countries?name=eq.${encodeURIComponent(dc)}&select=*`);
    if (!existing || existing.length === 0) {
      await supabaseRequest('countries', 'POST', { name: dc, data: { [dcol]: Number(value) || 0 } });
    } else {
      const newData = { ...existing[0].data, [dcol]: Number(value) || 0 };
      await supabaseRequest(`countries?name=eq.${encodeURIComponent(dc)}`, 'PATCH', { data: newData });
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
    const headersData = await supabaseRequest('headers?select=name&order=id.asc');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    const initialData = {};
    for (const h of headers) if (h !== '国家') initialData[h] = Number(data?.[h]) || 0;
    await supabaseRequest('countries', 'POST', { name: country, data: initialData });
    res.json({ success: true, country });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/countries/:country', async (req, res) => {
  try {
    await supabaseRequest(`countries?name=eq.${encodeURIComponent(decodeURIComponent(req.params.country))}`, 'DELETE');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`API running on ${PORT}`));
}

module.exports = app;