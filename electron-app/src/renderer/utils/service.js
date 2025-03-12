import axios from "axios";
import { Promise } from "core-js";
// import { getToken } from "@renderer/utils/setToken";
import { Message } from "element-ui";


const service = axios.create({
    baseURL: '/api',
    timeout: 3000
})

//添加请求拦截器
service.interceptors.request.use((config) => {
    // 在请求之前做什么
    config.headers['token'] = getToken('token')
    return config;
}, (error) => {
    return Promise.reject(error);
});

//添加响应拦截器
service.interceptors.response.use((response) => {
    // 对响应数据做什么
    let {status, message} = response.data
    if(status != 200){
        Message({message: message || 'error', type: 'warning'})
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// 连接到 SQLite 数据库（这会在项目目录下创建一个名为 data.db 的 SQLite 数据库文件）
const db = new sqlite3.Database('data.db');

// 创建表
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, date STRING, name STRING, description TEXT)");
});

// API 路由
app.get('/api/items', (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  db.run("INSERT INTO items (name, description) VALUES (?, ?)", [name, description], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  db.run("DELETE FROM items WHERE id = ?", [itemId], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ success: true });
  });
});

app.put('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  const { name, description } = req.body;
  db.run("UPDATE items SET name = ?, description = ? WHERE id = ?", [name, description, itemId], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ success: true });
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

export default service

