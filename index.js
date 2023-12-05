//---API---//
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

//-----STATE-----//
const VIEW_MODE = {
  cardsMode: 'cardsMode',
  listMode: 'listMode'
}


const model = {
  movies: []
}


const view = {
}

const controller = {
  generateMoviesList() {
    axios.get(INDEX_URL).then(response => {
      model.movies.push(...response.data.results)
      console.log(model.movies)
    }).catch((err) => console.log(err))
  }
}

controller.generateMoviesList();