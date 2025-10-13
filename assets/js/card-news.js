// assets/js/card-news.js

const firstNews = document.querySelector('.first-news');
const otherNewsContainer = document.querySelector('.other-news-conteiner');

function criarOtherNews(noticia) {
    const div = document.createElement('div');
    div.classList.add('other-news');
    div.style.backgroundImage = noticia.image ? `url(${noticia.image})` : 'none';
    div.style.backgroundSize = 'cover';
    div.style.backgroundPosition = 'center';
    div.style.backgroundRepeat = 'no-repeat';

    div.innerHTML = `
        <div class="overlay">
            <h1 class="news-title">${noticia.title}</h1>
            <a href="pages/news.html?id=${noticia.id}">
                <button class="news-button">Ver notícia</button>
            </a>
        </div>
    `;
    otherNewsContainer.appendChild(div);
}

function atualizarNoticias() {
    const noticias = JSON.parse(localStorage.getItem('noticias')) || [];

    if (noticias.length === 0) {
        firstNews.innerHTML = `<h1>Título</h1><p>Sub-título</p><a href="#"><button>Ver notícia</button></a>`;
        otherNewsContainer.innerHTML = '';
        return;
    }

    // Primeira notícia
    const primeira = noticias[0];
    firstNews.style.backgroundImage = primeira.image ? `url(${primeira.image})` : 'none';
    firstNews.style.backgroundSize = 'cover';
    firstNews.style.backgroundPosition = 'center';
    firstNews.style.backgroundRepeat = 'no-repeat';
    firstNews.innerHTML = `
        <div class="overlay">
            <h1>${primeira.title}</h1>
            <p>${primeira.caption}</p>
            <a href="pages/news.html?id=${primeira.id}">
                <button>Ver notícia</button>
            </a>
        </div>
    `;

    // Outras notícias
    otherNewsContainer.innerHTML = '';
    for (let i = 1; i < noticias.length; i++) {
        criarOtherNews(noticias[i]);
    }
}

// Executa ao abrir a página
atualizarNoticias();
