
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
  currentPage: 1,

  //從API獲取資料放入movies
  AXIOS_API() {
    return axios.get(INDEX_URL).then(response => {
      this.movies.push(...response.data.results)
    }).catch((err) => console.log(err))
  },

  //將傳入模式設定為當前模式後回傳
  setCurrentModel(mode) {
    return this.currentMode = mode;
  },

  //透過id尋找特定電影資料
  getMovieByID(id) {
    return this.movies.find(movie => movie.id === id)
  },

  //用id從收藏清除單筆電影資料
  removeFavoriteMovie(id) {

    const favoriteIndex = model.favoriteMovies.findIndex(movie => movie.id === id)
    model.favoriteMovies.splice(favoriteIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(model.favoriteMovies))
  },

  //確認該電影是否有在收藏中，有則回傳該筆資料
  isFavorite(id) {
    return this.favoriteMovies.some(movie => movie.id === id)
  },

  //將電影分頁，回傳分頁後的資料
  getMovieByPage(page) {

    const data = this.filteredMovies.length ? this.filteredMovies : this.movies
    const startIndex = (page - 1) * this.MOVIE_PRE_PAGE
    return data.slice(startIndex, startIndex + this.MOVIE_PRE_PAGE)
  },

  //一鍵 重置收藏資料
  resetFavorite() {
    this.favoriteMovies = []
    localStorage.removeItem('favoriteMovies')
  }

}

//-----VIEW-----//
const view = {

  //主頁面渲染
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

  //一開始渲染時候在收藏中搜尋是否有重複id 並切換button css
  getFavoriteBtn(item) {

    const isFavorite = model.isFavorite(item.id)
    const buttonClass = isFavorite ? 'btn-danger' : 'btn-info';
    const buttonText = isFavorite ? 'X' : '+';

    return `<button href="#" class="btn ${buttonClass} btn-favorite" data-id="${item.id}">${buttonText}</button>`

  },

  //渲染modal
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

  //渲染分頁器
  renderPaginator(amount) {
    const numberOfPage = Math.ceil(amount / model.MOVIE_PRE_PAGE)

    let rawHTML = ''

    for (let page = 1; page <= numberOfPage; page++) {
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
    const resetBtn = document.querySelector('#reset')


    modeSwitch.addEventListener('click', this.handleModeSwitch.bind(this))
    searchForm.addEventListener('submit', this.handleSearchForm.bind(this))
    dataPanel.addEventListener('click', this.handleCardButton.bind(this))
    paginator.addEventListener('click', this.handlePaginator.bind(this))
    resetBtn.addEventListener('click', this.handleResetBtn.bind(this))


  },
  //mode switch 監聽
  handleModeSwitch(event) {

    const button = event.target.closest('.mode-btn')

    if (button) {
      if (button.id === 'cards-mode') {
        model.setCurrentModel(VIEW_MODE.cardsMode)
      } else if (button.id === 'list-mode') {
        model.setCurrentModel(VIEW_MODE.listMode)
      }
      view.renderMovies(model.getMovieByPage(model.currentPage));
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

    //toast初始化
    const toastLive = document.querySelector('#liveToast')
    const toast = new bootstrap.Toast(toastLive)

    if (event.target.matches('.btn-show-movie')) {
      view.showMovieModal(movie);
    } else if (target.matches('.btn-favorite')) {
      const isFavorite = model.isFavorite(id);
      //按下後依照收藏是否有該筆資料切換按鈕狀態
      if (isFavorite) {
        model.removeFavoriteMovie(id);
        target.classList.replace('btn-danger', 'btn-info')
        target.textContent = '+'
        toast.show()
      } else {
        model.favoriteMovies.push(movie);
        target.classList.replace('btn-info', 'btn-danger')
        target.textContent = 'X'
        toast.show()
      }
      localStorage.setItem('favoriteMovies', JSON.stringify(model.favoriteMovies))
    }
  },

  //控制分頁器
  handlePaginator(event) {
    const page = Number(event.target.dataset.page)
    if (event.target.tagName !== 'A') return

    model.currentPage = page;
    view.renderMovies(model.getMovieByPage(page))
  },

  //控制收藏重置
  handleResetBtn(event) {
    if (event.target.id === 'reset')
      model.resetFavorite();
    view.renderMovies(model.getMovieByPage(1))
  }
}
controller.generateMoviesList();
