// assets/js/news.js

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function carregarNoticia() {
    const id = getQueryParam('id');
    if (!id) return;

    const noticias = JSON.parse(localStorage.getItem('noticias')) || [];
    const noticia = noticias.find(n => n.id == id);

    if (!noticia) return;

    document.querySelector('.top-news-conteiner h2').innerText = noticia.title;
    document.querySelector('.top-news-conteiner p').innerText = noticia.caption;

    const imgContainer = document.querySelector('.img-conteiner');
    imgContainer.style.backgroundImage = noticia.image ? `url(${noticia.image})` : 'none';
    imgContainer.style.backgroundSize = 'cover';
    imgContainer.style.backgroundPosition = 'center';
    imgContainer.style.backgroundRepeat = 'no-repeat';

    document.querySelector('.body-news-conteiner').innerText = noticia.body;
}

carregarNoticia();
