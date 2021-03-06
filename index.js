


function statusChangeCallback(response) {
console.log('statusChangeCallback');
console.log(response);
if (response.status === 'connected') {
  // Logged into your app and Facebook.
  localStorage.setItem('access_token',response.authResponse.accessToken)
  testAPI();
  $('.fbButton').remove()
  $('#fbLogout').show()
} else {
  document.getElementById('status').innerHTML = 'Please log ' +
    'into this app.';
}
}

function fbLogout() {
  FB.logout(function (response) {
    console.log(response, 'logout');
    $('#fbLogout').remove()
    $('.fbButton').show()
  })
}
function checkLoginState() {
FB.getLoginStatus(function(response) {
  statusChangeCallback(response);
});
}
function createNewUser(userData) {
axios.post('http://localhost:3000/users',{
  name: userData
})
.then(result => {
  console.log(result)
})
.catch(err => {
  console.log(err)
})
}
window.fbAsyncInit = function() {
FB.init({
  appId      : '364179410749677',
  cookie     : true,  // enable cookies to allow the server to access
                      // the session
  xfbml      : true,  // parse social plugins on this page
  version    : 'v2.8' // use graph api version 2.8
});
FB.getLoginStatus(function(response) {
  statusChangeCallback(response);
});

};

// Load the SDK asynchronously
(function(d, s, id) {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) return;
js = d.createElement(s); js.id = id;
js.src = "https://connect.facebook.net/en_US/sdk.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
let user = ''
function testAPI() {
console.log('Welcome!  Fetching your information.... ');
FB.api('/me', {fields : 'name, id, email'} , function(response) {
  console.log('Successful login for: ' + response.name);
  localStorage.setItem('user', response.name)
  localStorage.setItem('id', response.id)
  localStorage.setItem('email', response.email)
  console.log(response, 'respon fbapi');
  createNewUser(response.name)
  document.getElementById('status').innerHTML =
    'Thanks for logging in, ' + response.name + '!';
});
}
let dataBMI = ''

function getBMI () {
  console.log($('#weight').val())
  axios.post('http://localhost:3000/bmi', {
    height: $('#height').val(),
    weight: $('#weight').val()
  })
  .then(response => {
    console.log(response.data)
     dataBMI = response.data
     axios.post('http://localhost:3000/users/updateBMI',{
       bodyType: response.data.status,
       name: localStorage.getItem('user')
     })
     .then(result => {
       console.log(result)
     })
     .catch(err => {
       console.log(err)
     })

    $(`#rowBMI`).html('')
    $(`#rowRecipes`).html('')
    $(`#rowBMI`).append(`
      <div class="center">
        <div class="card border-success mb-3 center" style="max-width: 20rem;">
        <div class="card-header">RESULT</div>
        <div class="card-body text-success">
          <h4 class="card-title">${response.data.status}</h4>
          <p class="card-text">if you are a woman, your ideal weight is ${response.data.ideal_weight.woman}</p>
          <p class="card-text">if you are a man, your ideal weight is ${response.data.ideal_weight.man}</p>
          <button type="button" class="btn btn-outline-success" onclick="getRecipes('', '${response.data.status}')">Get All Recipes</button>
        </div>
        <div class="row">
          <div class="form-group">
            <label class="col-form-label col-form-label-sm" for="inputSmall">Search</label>
            <input class="form-control form-control-sm" type="text" placeholder="your food" id="search">
            <span class="badge badge-pill badge-success" onclick="getRecipes(($('#search').val()), '${response.data.status}')">Search</span>
          </div>
      </div>
      </div>
      `)
  })
  .catch(err => {
    console.log(err)
  })
}

function getRecipes(food, status) {
  let result
  if (food) {
    axios.get(`http://localhost:3000/api/foods?q=${food}`)
    .then(function (response) {
      console.log(response.data);
      if (status.indexOf('Obesity') !== -1 || status.indexOf('Overweight') !== -1) {
        result = response.data.foods.filter(food => {
          return (food.diet.indexOf('Low-Carb') !== -1 || food.diet.indexOf('Balanced') !== -1 || food.diet.indexOf('Low-Fat') !== -1 || food.diet.indexOf('Low-Protein') !== -1)
        })
      } else {
        result = response.data.foods.filter(food => {
          return (food.diet.indexOf('Low-Carb') == -1 && food.diet.indexOf('Low-Fat') == -1)
        })
      }
      $(`#rowRecipes`).html('')
      if (result.length > 0) {
        result.forEach(element_food => {
          console.log(element_food);
          $(`#rowRecipes`).append(`
            <div class="col-md-3">
              <div class="card border-success mb-3" style="max-width: 20rem;">
                <div class="card-header">RESULT</div>
                <div class="card-body text-success">
                  <h4 class="card-title">${element_food.name}</h4>
                  <img class="center" src="${element_food.image}" height="150" width="150">
                  <p class="card-text">ingredients    : ${element_food.ingredient.join(', ')}</p>
                  <p class="card-text">health benefit : ${element_food.health.join(', ')}</p>
                  <button type="button" class="btn btn-outline-success" onclick="sendEmail('${{element_food}}')">Send Recipe</button>
                </div>
              </div>
            </div>
            `)
        })
      } else {
        $(`#rowRecipes`).append(`
          <h4 class="text-muted"> No ${status} diet's recipes available </h4>
          `)
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  } else {
    axios.get(`http://localhost:3000/api/foods`)
    .then(function (response) {
      // console.log(response.data.foods);
      // console.log(status);
      if (status.indexOf('Obesity') !== -1 || status.indexOf('Overweight') !== -1) {
        result = response.data.foods.filter(food => {
          console.log(food);
          return (food.diet.indexOf('Low-Carb') !== -1 || food.diet.indexOf('Balanced') !== -1 || food.diet.indexOf('Low-Fat') !== -1 || food.diet.indexOf('Low-Protein') !== -1)
        })
      } else {
        result = response.data.foods.filter(food => {
          return (food.diet.indexOf('Low-Carb') == -1 && food.diet.indexOf('Low-Fat') == -1)
        })
      }
      $(`#rowRecipes`).html('')
      if (result.length > 0) {
        result.forEach(element_food => {
          console.log(element_food);
          $(`#rowRecipes`).append(`
            <div class="col-md-3">
              <div class="card border-success mb-3" style="max-width: 20rem;">
                <div class="card-header">RESULT</div>
                <div class="card-body text-success">
                  <h4 class="card-title">${element_food.name}</h4>
                  <img class="center" src="${element_food.image}" height="150" width="150">
                  <p class="card-text">ingredients    : ${element_food.ingredient.join(', ')}</p>
                  <p class="card-text">health benefit : ${element_food.health.join(', ')}</p>
                  <button type="button" class="btn btn-outline-success" onclick="sendEmail('${element_food.name}', '${element_food.ingredient}', '${element_food.image}', '${element_food.health}', '${element_food.diet}')">Send Recipe</button>
                </div>
              </div>
            </div>
            `)
        })
      } else {
        $(`#rowRecipes`).append(`
          <h4 class="text-muted"> No ${status} diet's recipes available </h4>
          `)
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

}

function sendEmail(name, ingredient, image, health, diet) {
  console.log(ingredient, 'ini ingre');
  console.log(image, 'ini image');
  axios.post(`http://localhost:3000/api/foods`, {
    email : localStorage.getItem('email'),
    ingredient : ingredient,
    name  : name,
    image : image,
    health: health,
    diet : diet
  })
  .then(response => {
    console.log(response)
  })
  .catch(err => {
    console.log(err)
  })
}

// function getRecipes () {
//   axios.get('http://localhost:3000/api/foods?q=')
// }
