const http = require("http");   ""                                                          
const fs = require("fs");                                                                   
const path = require("path");                                                               
const url = require("url");                                                                 


const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const route = parsedUrl.pathname;                                                                    

  if (route === "/" && req.method === "GET") {
    // Ana sayfa
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const template = fs.readFileSync("./views/index.html", "utf-8");

    const postList = posts.map(p => `<li><a href="/post?id=${p.id}">${p.title}</a></li>`).join("");      // posts dosyasından haberleri okur index ile 
    const html = template.replace("{{posts}}", postList);                                                // şablonları ekler Liste halinde ana sayfada gösterir

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  else if (route === "/post" && req.method === "GET") {                                                   
    const postId = parsedUrl.query.id;                                                                    
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const post = posts.find(p => p.id == postId);                                                   // URL'den gelen id ile haberi bulur
                                                                                                    // bilinmeyen varsa 404 döner
    if (!post) {                                                                                    // post şablonunu doldurur ve kullanıcıya gösterir           
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Post not found");
      return;
    }

    const template = fs.readFileSync("./views/post.html", "utf-8");
    const html = template.replace("{{title}}", post.title).replace("{{content}}", post.content);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  else if (route === "/create" && req.method === "GET") {
    const template = fs.readFileSync("./views/create.html", "utf-8");               
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(template);
  }

  else if (route === "/create" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const title = params.get("title");
      const content = params.get("content");

      const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
      const newPost = {
        id: Date.now(),
        title,
        content
      };
      posts.push(newPost);
  
      fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 2));                     // yeni haberin kayıtlı kalması bölümü UNUTMA
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  }

  else if (route.startsWith("/public/")) {
    const filePath = path.join(__dirname, route);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);                                 
        res.end("File not found");
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  }

  else {
    res.writeHead(404);
    res.end("Page not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 