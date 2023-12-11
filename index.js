//優化目標：
// 1.用alert以外方式警告重複收藏
// 2.在主頁中按下收藏後收藏按鈕後會轉換成移除按鈕
// 3.favorite清空後顯示 未收藏或轉回首頁
// 4.增加一鍵重置收藏按鈕



//-----API-----//
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

//-----STATE-----//
const VIEW_MODE = {
  cardsMode: 'cardsMode',
  listMode: 'listMode'
}

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')


//-----MODEL-----//
const model = {
  movies: [],
  filteredMovies: [],
  favoriteMovies: JSON.parse(localStorage.getItem('favoriteMovies')) || [],
  MOVIE_PRE_PAGE: 12,

  currentMode: VIEW_MODE.cardsMode,

  AXIOS_API() {
    return axios.get(INDEX_URL).then(response => {
      this.movies.push(...response.data.results)
    }).catch((err) => console.log(err))
  },

  setCurrentModel(mode) {
    return this.currentMode = mode;
  },

  getMovieByID(id) {
    return this.movies.find(movie => movie.id === id)
  },

  removeFavoriteMovie(id) {

    const favoriteIndex = model.favoriteMovies.findIndex(movie => movie.id === id)
    model.favoriteMovies.splice(favoriteIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(model.favoriteMovies))
  },

  isFavorite(id) {
    return this.favoriteMovies.some(movie => movie.id === id)
  },

  getMovieByPage(page){

    const data = this.filteredMovies.length ? this.filteredMovies : this.movies
    const startIndex = (page - 1) * this.MOVIE_PRE_PAGE
    return data.slice(startIndex , startIndex + this.MOVIE_PRE_PAGE)
  },

}

//-----VIEW-----//
const view = {

  renderMovies(data) {
    let rawHTML = ''
    switch (model.currentMode) {

      case VIEW_MODE.cardsMode:
        data.forEach(item => {

          rawHTML += `
            <div class="col-sm-3">
              <div class="mb-3">
                <div class="card">
                  <img src="${POSTER_URL}${item.image}" class="card-img-top"
                    alt="...">
                  <div class="card-body">
                    <h5 class="card-title" >${item.title}</h5>
                  </div>
                  <div class="card-footer d-flex justify-content-end">
                    <button href="#" class="btn btn-primary me-1 btn-show-movie" data-bs-toggle="modal"
                      data-bs-target="#movie-more" data-id="${item.id}">More</button>
                    ${this.getFavoriteBtn(item)}
                  </div>
                </div>
              </div>
            </div>`
        });
        break;

      case VIEW_MODE.listMode:
        rawHTML = `<ul class="list-group" id="list-group">`
        data.forEach(item => {
          rawHTML += `
          <li class="list-group-item d-flex justify-content-between" data.id="${item.id}">
            <img src="${POSTER_URL}${item.image}" alt="">
              <h5>${item.id}. ${item.title}</h5>
            </div>
            <div>
              <button href="#" class="btn btn-primary me-1 btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-more"data-id="${item.id}">More</button>
              ${this.getFavoriteBtn(item)}
            </div>
          </li>
          `
        });
        rawHTML += `</ul>`
        break;
    }
    dataPanel.innerHTML = rawHTML
  },

  getFavoriteBtn(item){

    const isFavorite = model.favoriteMovies.some(movie => movie.id === item.id);
    const buttonClass = isFavorite ? 'btn-danger' : 'btn-info';
    const buttonText = isFavorite ? 'X' : '+';

    return `<button href="#" class="btn ${buttonClass} btn-favorite" data-id="${item.id}">${buttonText}</button>`

  },

  showMovieModal(movie) {
    const movieTitle = document.querySelector('#movie-modal-title');
    const movieImage = document.querySelector('#movie-modal-image');
    const movieDate = document.querySelector('#movie-modal-date');
    const movieDescription = document.querySelector('#movie-modal-description');

    movieTitle.textContent = movie.title
    movieImage.innerHTML = `<img src="${POSTER_URL}${movie.image}" alt="movie-poster" class="img-fluid">`;
    movieDate.textContent = `Release Date : ${movie.release_date}`
    movieDescription.textContent = `"${movie.description}"`
  },

  renderPaginator(amount){
    const numberOfPage = Math.ceil(amount / model.MOVIE_PRE_PAGE)

    let rawHTML = ''

    for(let page = 1; page <= numberOfPage; page++){
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
    }

    paginator.innerHTML = rawHTML

  }

}

//-----CONTROLLER-----//
const controller = {

  //網頁初始化
  generateMoviesList() {
    model.AXIOS_API()
      .then(() => {
        view.renderMovies(model.getMovieByPage(1));
        view.renderPaginator(model.movies.length);
        this.setupEventListener();
      })
      .catch(err => console.log(err));
  },

  //控制所有監聽器
  setupEventListener() {

    const searchForm = document.querySelector('#search-form')
    const modeSwitch = document.querySelector('#mode-switch')


    modeSwitch.addEventListener('click', this.handleModeSwitch.bind(this))
    searchForm.addEventListener('submit', this.handleSearchForm.bind(this))
    dataPanel.addEventListener('click', this.handleCardButton.bind(this))
    paginator.addEventListener('click', this.handlePaginator.bind(this))


  },
  //mode switch 監聽
  handleModeSwitch(event) {
    if (event.target.classList.contains('fa-solid')) {
      if (event.target.classList.contains('fa-grip')) {
        model.setCurrentModel(VIEW_MODE.cardsMode)
      } else if (event.target.classList.contains('fa-bars')) {
        model.setCurrentModel(VIEW_MODE.listMode)
      }
      view.renderMovies(model.getMovieByPage(1));
      console.log(model.currentMode);
    }
  },
  //search 監聽
  handleSearchForm(event) {

    event.preventDefault();
    const keyword = document.querySelector('#search-input').value.trim().toLowerCase();

    model.filteredMovies = model.movies.filter(movie =>
      movie.title.trim().toLowerCase().includes(keyword)
    );

    if (model.filteredMovies.length === 0) {
      return alert('找不到電影：' + keyword);
    }
    view.renderMovies(model.getMovieByPage(1))
    view.renderPaginator(model.filteredMovies.length)
  },

  //card btn 監聽
  handleCardButton(event) {

    const target = event.target
    const id = Number(event.target.dataset.id)
    const movie = model.getMovieByID(id)

    if (event.target.matches('.btn-show-movie')) {
      view.showMovieModal(movie);
    } else if (target.matches('.btn-favorite')) {
      const isFavorite = model.isFavorite(id);
      if (isFavorite) {
        model.removeFavoriteMovie(id);
        target.classList.replace('btn-danger', 'btn-info')
        target.textContent = '+'
      } else {
        model.favoriteMovies.push(movie);
        target.classList.replace('btn-info', 'btn-danger')
        target.textContent = 'X'
      }
      localStorage.setItem('favoriteMovies', JSON.stringify(model.favoriteMovies))
    }
  },
  
  handlePaginator(event){
    const page = Number(event.target.dataset.page)
    if(event.target.tagName !== 'A') return
    view.renderMovies(model.getMovieByPage(page))
  }

}
controller.generateMoviesList();
