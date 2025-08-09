const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync('./data/posts.json', 'utf-8'));
    const template = fs.readFileSync('./views/index.html', 'utf-8');
    
    const postList = posts.map(p => `<li class="news-item"><a href="/post?id=${p.id}">${p.title}</a></li>`).join('');
    const html = template.replace('{{posts}}', postList);
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/post', (req, res) => {
  try {
    const postId = req.query.id;
    const posts = JSON.parse(fs.readFileSync('./data/posts.json', 'utf-8'));
    const post = posts.find(p => p.id == postId);
    
    if (!post) {
      return res.status(404).send('Post bulunamadı');
    }
    
    const template = fs.readFileSync('./views/post.html', 'utf-8');
    const html = template
      .replace('{{title}}', post.title)
      .replace('{{content}}', post.content);
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/create', (req, res) => {
  try {
    const template = fs.readFileSync('./views/create.html', 'utf-8');
    res.send(template);
  } catch (error) {
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/create', (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).send('Başlık ve içerik gereklidir');
    }
    
    const posts = JSON.parse(fs.readFileSync('./data/posts.json', 'utf-8'));
    const newPost = {
      id: Date.now(),
      title,
      content
    };
    
    posts.push(newPost);
    fs.writeFileSync('./data/posts.json', JSON.stringify(posts, null, 2));
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Sunucu hatası');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Sayfa bulunamadı');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Sunucu hatası');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 