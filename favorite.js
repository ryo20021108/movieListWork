//-----API-----//
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

//-----STATE-----//
const VIEW_MODE = {
  cardsMode: 'cardsMode',
  listMode: 'listMode'
}

//-----GLOBAL SELECTOR-----//
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

  //接受API資料放進movies
  AXIOS_API() {
    return axios.get(INDEX_URL).then(response => {
      this.movies.push(...response.data.results)
    }).catch((err) => console.log(err))
  },

  //設定目前模式
  setCurrentModel(mode) {
    return this.currentMode = mode;
  },

  //從id尋找當前電影資料
  getMovieByID(id) {
    return this.movies.find(movie => movie.id === id)
  },

  //從收藏裡刪除電影
  removeFavoriteMovie(id) {

    const favoriteIndex = model.favoriteMovies.findIndex(movie => movie.id === id)
    model.favoriteMovies.splice(favoriteIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(model.favoriteMovies))
    view.renderMovies(model.favoriteMovies)

    view.renderPaginator(this.favoriteMovies.length)
  },

  //將電影分頁，回傳分頁後的資料
  getMovieByPage(page) {

    const data = this.filteredMovies.length ? this.filteredMovies : this.favoriteMovies
    const startIndex = (page - 1) * this.MOVIE_PRE_PAGE

    return data.slice(startIndex, startIndex + this.MOVIE_PRE_PAGE)
  },

//一鍵重置收藏
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

    //card/list模式切換
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
                    <button href="#" class="btn btn-danger btn-favorite" data-id="${item.id}">Ｘ</button>
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
              <button href="#" class="btn btn-danger btn-favorite" data-id="${item.id}">Ｘ</button>
            </div>
          </li>
          `
        });
        rawHTML += `</ul>`
        break;
    }

    if (model.favoriteMovies.length === 0) {
      dataPanel.innerHTML = `<h2>暫無收藏</h2>`
    } else {
      dataPanel.innerHTML = rawHTML
    }
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
        view.renderPaginator(model.favoriteMovies.length)
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
      //切換模式時依照當前頁面重新渲染
      view.renderMovies(model.getMovieByPage(model.currentPage));
      console.log(model.currentMode);
    }
  },
  //search 監聽
  handleSearchForm(event) {

    event.preventDefault();
    const keyword = document.querySelector('#search-input').value.trim().toLowerCase();

    model.filteredMovies = model.favoriteMovies.filter(movie =>
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

    const id = Number(event.target.dataset.id)
    const movie = model.getMovieByID(id)
    //初始化toast
    const toastLive = document.querySelector('#liveToast')
    const toast = new bootstrap.Toast(toastLive)

    if (event.target.matches('.btn-show-movie')) {
      view.showMovieModal(movie)
    } else if (event.target.matches('.btn-favorite')) {
      model.removeFavoriteMovie(id)
      toast.show()
    }
  },

  //控制分頁器
  handlePaginator(event) {
    const page = Number(event.target.dataset.page)
    if (event.target.tagName !== 'A') return
    model.currentPage = page
    view.renderMovies(model.getMovieByPage(model.currentPage))
  },

  //控制收藏重置按鈕
  handleResetBtn(event) {
    //初始化toast
    const toastLive = document.querySelector('#liveToast')
    const toast = new bootstrap.Toast(toastLive)

    if (event.target.id === 'reset')
      model.resetFavorite();
    view.renderMovies(model.getMovieByPage(1))
    view.renderPaginator(model.filteredMovies.length)
    toast.show();
  }

}
controller.generateMoviesList();
