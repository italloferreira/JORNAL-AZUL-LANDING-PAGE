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

  // cria botão para limpar o cache
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "🗑️ Limpar todas as notícias";
  clearBtn.classList.add("clear-cache-btn");
  clearBtn.style.marginTop = "10px";
  clearBtn.style.padding = "8px 12px";
  clearBtn.style.backgroundColor = "#d32f2f";
  clearBtn.style.color = "#fff";
  clearBtn.style.border = "none";
  clearBtn.style.borderRadius = "6px";
  clearBtn.style.cursor = "pointer";

  // adiciona o botão abaixo da lista
  document.querySelector("main").appendChild(clearBtn);

  // pega notícias do localStorage
  function getNews() {
    return JSON.parse(localStorage.getItem("noticias")) || [];
  }

  // salva notícias no localStorage
  function saveNews(newsList) {
    localStorage.setItem("noticias", JSON.stringify(newsList));
  }

  // renderiza lista de notícias
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

  // função para deletar uma notícia específica
  function deleteNews(index) {
    const newsList = getNews();
    newsList.splice(index, 1);
    saveNews(newsList);
    renderNewsList();
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

    // gera um ID único
    const id = Date.now().toString();

    const newNews = {
      id,
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

  // botão para limpar apenas as notícias
  clearBtn.addEventListener("click", () => {
    const confirmClear = confirm("Tem certeza que deseja apagar todas as notícias?");
    if (confirmClear) {
      localStorage.removeItem("noticias"); // apaga só as notícias
      renderNewsList();
      alert("Todas as notícias foram apagadas!");
    }
  });

  // renderiza lista inicial
  renderNewsList();
});
