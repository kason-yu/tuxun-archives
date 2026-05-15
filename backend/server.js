const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://adqgeizddbitaovmhui.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWdlaXpkYmRpdGFhb3ZtaHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjkyNDQsImV4cCI6MjA5NDQwNTI0NH0.sOOAEuAfO-Fy3sD_3FZCVm4Oqb8TIYkMnFEbJAvYcTA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (...args) => {
      const [url, options] = args;
      if (options && options.body && typeof options.body === 'string') {
        const buf = Buffer.from(options.body, 'utf-8');
        return globalThis.fetch(url, { ...options, body: buf });
      }
      return globalThis.fetch(...args);
    }
  }
});

// ========== 列管理接口 ==========

// 获取所有列
app.get('/api/headers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('headers').select('name').order('id');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(row => row.name));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 新增列
app.post('/api/headers', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '列名不能为空' });

    const { data: existing } = await supabase.from('headers').select('name').eq('name', name);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: '列已存在' });
    }

    const { error } = await supabase.from('headers').insert([{ name }]);
    if (error) return res.status(500).json({ error: error.message });
    
    const { data: countries } = await supabase.from('countries').select('name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data, [name]: 0 };
        await supabase.from('countries').update({ data: newData }).eq('name', country.name);
      }
    }
    
    res.json({ success: true, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 删除列
app.delete('/api/headers/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (name === '国家') return res.status(400).json({ error: '不能删除国家列' });

    const { error } = await supabase.from('headers').delete().eq('name', name);
    if (error) return res.status(500).json({ error: error.message });
    
    const { data: countries } = await supabase.from('countries').select('name,data');
    if (countries) {
      for (const country of countries) {
        const newData = { ...country.data };
        delete newData[name];
        await supabase.from('countries').update({ data: newData }).eq('name', country.name);
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
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'selected_columns');
    if (error || !data || data.length === 0) return res.json([]);
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/selected-columns', async (req, res) => {
  try {
    const { columns, modes } = req.body;
    
    await supabase.from('settings').upsert([
      { key: 'selected_columns', value: columns || [] }
    ], { onConflict: 'key' });
    
    if (modes) {
      await supabase.from('settings').upsert([
        { key: 'selected_modes', value: modes }
      ], { onConflict: 'key' });
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/selected-modes', async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'selected_modes');
    if (error || !data || data.length === 0) return res.json({});
    res.json(data[0].value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== 国家数据接口 ==========

app.get('/api/countries', async (req, res) => {
  try {
    const { data: headersData } = await supabase.from('headers').select('name').order('id');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    
    const { data: countries, error } = await supabase.from('countries').select('*');
    if (error) return res.status(500).json({ error: error.message });
    
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
    
    const { data: headersData } = await supabase.from('headers').select('name').order('id');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    
    const { data, error } = await supabase.from('countries').select('*').eq('name', decodeURIComponent(country));
    if (error || !data || data.length === 0) return res.status(404).json({ error: '国家不存在' });
    
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

    let { data: existing } = await supabase.from('countries').select('*').eq('name', decodeURIComponent(country));
    
    if (!existing || existing.length === 0) {
      const { error } = await supabase.from('countries').insert([{
        name: decodeURIComponent(country),
        data: { [decodeURIComponent(column)]: Number(value) || 0 }
      }]);
      if (error) return res.status(500).json({ error: error.message });
    } else {
      const newData = { ...existing[0].data, [decodeURIComponent(column)]: Number(value) || 0 };
      const { error } = await supabase.from('countries')
        .update({ data: newData })
        .eq('name', decodeURIComponent(country));
      if (error) return res.status(500).json({ error: error.message });
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

    const { data: headersData } = await supabase.from('headers').select('name').order('id');
    const headers = headersData ? headersData.map(h => h.name) : ['国家'];
    
    const initialData = {};
    for (const h of headers) {
      if (h !== '国家') {
        initialData[h] = Number(data?.[h]) || 0;
      }
    }
    
    const { error } = await supabase.from('countries').upsert([{
      name: country,
      data: initialData
    }], { onConflict: 'name' });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, country });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/countries/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { error } = await supabase.from('countries').delete().eq('name', decodeURIComponent(country));
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Geo Map API server running on port ${PORT}`);
    console.log(`Using Supabase: ${supabaseUrl}`);
  });
}

module.exports = app;