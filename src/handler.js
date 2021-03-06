const fs = require('fs'); // require fs for app
const path = require('path'); // require path for app
const querystring = require('querystring');
const requests = require('request');
const urlModule = require('url')

const handleHome = (response) => {
  const filePath = path.join(__dirname, `..`, `public`, `index.html`);
  fs.readFile(filePath, (error, file) => {
    if (error) { // if there is an error - print a 500 error message
      response.writeHead(500, `Content-Type: text/html`);
      response.end(`<h1>Sorry, there is a problem with the server </h1>`);
    } else { // if the call went through - serve the file
      response.writeHead(200, `Content-Type: text/html`); // server the html file
      response.end(file); // serve the file
    }
  })
}

const handlePublic = (response, urlPublic) => {
  const extention = urlPublic.split('.')[1]; // taking the part of the file name which is the extention, i.e. "css".
  const extentionType = { //object of the differnet types of files
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    ico: 'image/x-icon',
    png: 'image/png'
  }
  const filePathPublic = path.join(__dirname, '..', urlPublic); // define file path
  fs.readFile(filePathPublic, (error, file) => { // read file and pass error first callback
    if (error) { // if there is an error - print a 500 error message
      response.writeHead(500, `Content-Type: text/html`);
      response.end(`<h1>Sorry, there is a problem with the server </h1>`);
    } else { // if the call went through - serve the file
      response.writeHead(200, `Content-Type: ${extentionType[extention]}`); // server the file that matches the type we are looking for
      response.end(file); // serve the file
    }
  })
}

const handleInput = (request, response) => {
const url = 'https://api.cryptowat.ch/markets/summaries';// url for api call

  const parsedUrl = urlModule.parse(request.url, true);
  var objData = {};
  const search = 'kraken:' + parsedUrl.query.cryptoCurrency + parsedUrl.query.currency;
  const title = parsedUrl.query.cryptoCurrency + ' > ' + parsedUrl.query.currency;
  requests(url, (error, res, body) => {
    const results = JSON.parse(body).result;
    objData.title = title;
    if (JSON.parse(body).error == 'Out of allowance') {
      objData['Error'] = "Sorry, you can't make any more requests this hour. Come back later";
    } 
    else {
      objData['Current Price'] = results[search].price.last;
      objData['Today\'s Highest Price'] = results[search].price.high;
      objData['Today\'s Lowest Price'] = results[search].price.low;
      objData['Price Change'] = results[search].price.change.percentage * 100 + '%';
    }
    res.resume();
    response.writeHead(200, `Content-Type: application/json`);
    response.end(JSON.stringify(objData));

  })
}

module.exports = {
  handleHome,
  handlePublic,
  handleInput
}
