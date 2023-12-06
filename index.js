//---API---//
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

//-----STATE-----//
const VIEW_MODE = {
  cardsMode: 'cardsMode',
  listMode: 'listMode'
}


//-----
const dataPanel = document.querySelector('#data-panel')


//-----MODEL-----//
const model = {
  movies: [],

  AXIOS_API() {
    return axios.get(INDEX_URL).then(response => {
      this.movies.push(...response.data.results)
    }).catch((err) => console.log(err))
  },


}

//-----VIEW-----//
const view = {
  modeSwitch: document.querySelector('#mode-switch'),

  currentModeCheck() {
    this.modeSwitch.addEventListener('click', (event) => {
      if (event.target.classList.contains('fa-solid')) {
        if (event.target.classList.contains('fa-grip')) {
          controller.currentMode = VIEW_MODE.cardsMode;
        } else if (event.target.classList.contains('fa-bars')) {
          controller.currentMode = VIEW_MODE.listMode;
        }
        this.renderMovies(model.movies);
        console.log(controller.currentMode);
      }
    });
  },

  renderMovies(data) {
    let rawHTML = ''
    switch (controller.currentMode) {

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
                      data-bs-target="#movie-more">More</button>
                    <button href="#" class="btn btn-danger btn-favorite">+</button>
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
          <li class="list-group-item d-flex justify-content-between ">
            <img src="${POSTER_URL}${item.image}" alt="">
            <div>
              <h5>${item.title}</h5>
            </div>
            <div> 
              <button href="#" class="btn btn-primary me-1 btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-more">More</button>
              <button href="#" class="btn btn-danger btn-favorite">+</button>
            </div>
          </li>
          `
        });
        rawHTML += `</ul>`
        break;
    }
    dataPanel.innerHTML = rawHTML
  }
}

//-----CONTROLLER-----//
const controller = {
  currentMode: VIEW_MODE.cardsMode,

  generateMoviesList() {
    model.AXIOS_API()
      .then(() => {
        view.renderMovies(model.movies);
      })
      .catch(err => console.log(err));
  }


};

controller.generateMoviesList();
view.currentModeCheck();

