import React, { ChangeEvent, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [apiResponse, setApiResponse] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pdf, setPdf] = useState<File>();
  const [responseHeaders, setResponseHeaders] = useState();
  const [text, setText] = useState();
  const [textAreaValue, setTextAreaValue] = useState("");

  function callAPI() {
      fetch("http://localhost:9000/testAPI")
          .then(res => res.text())
          .then(res => setApiResponse(res));
  }

  if(!mounted){
    callAPI();
  }

  useEffect(() =>{
    setMounted(true)
  },[])

  const handleInputOnChange = (event:ChangeEvent<HTMLInputElement>) => {
    if (event?.target.files && event.target.files[0]) {
      setPdf(event.target.files[0])
    }
  }

  const onClickHandler = async () => {
    console.log("onClickHandler")
    // -> 1. We need to convert imported image to blob
    if (pdf) {

      const formData = new FormData();
      formData.append("someFile", pdf);

      // -> 2. Upload blob-file to server
      const requestOptions = {
        method: 'POST',
        body: formData,
      };

      console.log("formData: ", formData);

      const response = await fetch('http://localhost:9000/testAPI/form-file', requestOptions);

      const {file, headers, pdfText} = await response.json();

      console.log("file", file);
      console.log("headers", headers)
      console.log("pdfText", pdfText)
      setText(pdfText);

      setResponseHeaders({
          pdfText,
          ...headers,
      });

      console.log(JSON.stringify(responseHeaders, null, '\t'));
    }
  }

  const textOnClickHandler = async () => {
    const formData = new FormData();
    formData.append("text", textAreaValue);

    const requestOptions = {
      method: 'POST',
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({"text": textAreaValue}),
    };

    console.log("requestOptions: ", requestOptions);

    const response = await fetch('http://localhost:9000/testAPI/parse-japanese', requestOptions);

    const { cst } = await response.json();

    console.log("cst: ", JSON.stringify(cst));
  }

  const prettyJson = responseHeaders && JSON.stringify(responseHeaders, null, '\t');
  const pdfText = responseHeaders && text;

  console.log("pdfText");
  console.log(pdfText);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="App-intro">{apiResponse}</p>
        <button onClick={onClickHandler}>Send file</button>
        <input type="file" onChange={handleInputOnChange}/>
        <div>
          <h2>json text here</h2>
          <p>{prettyJson}</p>
        </div>

        <div>
          <h2>or put in own text</h2>
          <textarea value={textAreaValue} onChange={(e) => setTextAreaValue(e.target.value)} />
          <button onClick={textOnClickHandler}>Send text</button>
        </div>

        <div>
          <h2>text here</h2>
          <p>{pdfText}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
