
var express = require("express");
var multer = require("multer");
var pdf = require('pdf-parse')

var router = express.Router();
var upload = multer();

var ParseJapanese = require('parse-japanese')
var japanese = new ParseJapanese()

var text = '1 これは前段です。これは中段（２文の場合は後段。）です。これは後段です。\n'

japanese.parse(text, (cst) => {
  console.log(cst)
})


router.get("/", function(req, res, next) {
    res.send("API is working properly");
});

router.post('/parse-japanese', (request, response) => {
  console.log("request: ", request)
  console.log("request.body: ", request.body)
  let text = request.body.text;

  japanese.parse(text, (cst) => {
    console.log(cst)
    response.send({cst})
  })
})

router.post('/binary-file', (request, response) => {
  let data = Buffer.from('');

  request.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
  });
  request.on('end', () => {
      response.send({
          headers: request.headers,
          data
      });
  });
})

const cpUpload = upload.fields (
  [
    {name: 'someFile', maxCount: 1},
    {name: 'somePropName', maxCount: 1}
  ]
)

router.post('/form-file', cpUpload, (request, response) => {

  console.log("form-file");
  const files = request.files;
  const file = files?.someFile[0];

  let buff = file.buffer
  console.log(buff)

  pdf(buff).then(function(data) {
    // PDF text
    console.log("text here:")
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata); 
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text
    console.log(data.text); 
    const pdfText = data.text;
    // response.send({ pdfText: data.text })
    response.send({headers: request.headers, file, pdfText});
  })

})

module.exports = router;