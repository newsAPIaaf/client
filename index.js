


function statusChangeCallback(response) {
console.log('statusChangeCallback');
console.log(response);
if (response.status === 'connected') {
  // Logged into your app and Facebook.
  localStorage.setItem('access_token',response.authResponse.accessToken)
  testAPI();
  $('.fbButton').remove()
} else {
  document.getElementById('status').innerHTML = 'Please log ' +
    'into this app.';
}
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
FB.api('/me', function(response) {
  console.log('Successful login for: ' + response.name);
  localStorage.setItem('user', response.name)
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
    $(`#rowBMI`).append(`
        <div class="card border-success mb-3" style="max-width: 20rem;">
        <div class="card-header">RESULT</div>
        <div class="card-body text-success">
          <h4 class="card-title">${response.data.status}</h4>
          <p class="card-text">if you are a woman, your ideal weight is ${response.data.ideal_weight.woman}</p>
          <p class="card-text">if you are a man, your ideal weight is ${response.data.ideal_weight.man}</p>
          <button type="button" class="btn btn-outline-success" onclick="getRecipes()">Get Recipes</button>
        </div>
      </div>
      
      `)
  })
  .catch(err => {
    console.log(err)
  })
}

// function getRecipes () {
//   axios.get('http://localhost:3000/api/foods?q=')
// }