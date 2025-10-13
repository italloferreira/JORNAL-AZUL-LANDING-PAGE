document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsForm");
  const titleInput = document.getElementById("title");
  const captionInput = document.getElementById("caption");
  const bodyInput = document.getElementById("body");
  const fileInput = document.getElementById("file");

  // cria área de visualização das notícias cadastradas
  const container = document.createElement("div");
  container.classList.add("news-list");
  document.querySelector("main").appendChild(container);

  // pega notícias do localStorage
  function getNews() {
    return JSON.parse(localStorage.getItem("news")) || [];
  }

  // salva notícias no localStorage
  function saveNews(newsList) {
    localStorage.setItem("news", JSON.stringify(newsList));
  }

  // renderiza lista de notícias no formulário
  function renderNewsList() {
    const newsList = getNews();
    container.innerHTML = "<h3>Notícias cadastradas:</h3>";

    if (newsList.length === 0) {
      container.innerHTML += "<p>Nenhuma notícia cadastrada ainda.</p>";
      return;
    }

    newsList.forEach((news, index) => {
      const card = document.createElement("div");
      card.classList.add("news-item");
      card.innerHTML = `
        <strong>${news.title}</strong> - ${news.caption}
        <button class="delete-btn" data-index="${index}">Excluir</button>
      `;
      container.appendChild(card);
    });

    // evento dos botões de excluir
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        deleteNews(index);
      });
    });
  }

  // função para deletar notícia
  function deleteNews(index) {
    const newsList = getNews();
    newsList.splice(index, 1); // remove a notícia pelo índice
    saveNews(newsList);
    renderNewsList(); // atualiza a lista
  }

  // função para converter imagem em base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // evento de envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const caption = captionInput.value.trim();
    const body = bodyInput.value.trim();
    const file = fileInput.files[0];

    if (!title || !caption || !body) {
      alert("Preencha todos os campos!");
      return;
    }

    let imageBase64 = "";
    if (file) {
      imageBase64 = await toBase64(file);
    }

    const newNews = {
      title,
      caption,
      body,
      image: imageBase64,
      createdAt: new Date().toISOString(),
    };

    const newsList = getNews();
    newsList.unshift(newNews);
    saveNews(newsList);

    form.reset();
    renderNewsList();
    alert("Notícia adicionada com sucesso!");
  });

  // renderiza lista inicial
  renderNewsList();
});
