import React, { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';

function App() {
  const [apiResponse, setApiResponse] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pdf, setPdf] = useState<File>();
  const [responseHeaders, setResponseHeaders] = useState();
  const [text, setText] = useState();

  const [textAreaValue, setTextAreaValue] = useState("");
  const [parsedText, setParsedText] = useState<String[][]>([]);

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
    setParsedText([]);
    var temp: string[] = [];


    // paragraphs in cst
    for (var i = 0; i < cst.children.length; i++) {
      // sentences
      for (var j = 0; j < cst.children[i].children.length; j++) {
        console.log("length: ", cst.children[i].children.length)
        console.log("j: ", j)
        if (!cst.children[i].children[j].children) {
          continue
        }
        // words
        for (var k = 0; k < cst.children[i].children[j].children.length; k++) {
          var node = cst.children[i].children[j].children[k]
          if (node.type === "WordNode") {
            for (var l = 0; l < node.children.length; l++) {
              temp.push(node.children[l].value)
            }
          } else {
            temp.push(node.value)
          }
          console.log(temp)
        }
        console.log("done words")
      }
      console.log("done sentences")
      setParsedText([...parsedText, temp])
      console.log("temp: ", temp)
      temp = [];
    }

    console.log("parsedText: ", parsedText)

  }

  const prettyJson = responseHeaders && JSON.stringify(responseHeaders, null, '\t');
  const pdfText = responseHeaders && text;

  console.log("pdfText");
  console.log(pdfText);


  return (
    <Container>
      {/* FOR WHEN WE CAN PROPERLY PARSE JAPANESE PDFS */}
      {/* <p>{apiResponse}</p>
      <button onClick={onClickHandler}>Send file</button>
      <input type="file" onChange={handleInputOnChange}/>
      <div>
        <h2>json text here</h2>
        <p>{prettyJson}</p>
      </div> */}

      <h2>Enter japanese text</h2>
      <TextArea value={textAreaValue} onChange={(e) => setTextAreaValue(e.target.value)} />
      <button onClick={textOnClickHandler}>Send text</button>

      <h2>Parsed text</h2>
      <p>{pdfText}</p>
      {parsedText.map((s, i) => {
        return (
          <p>{s}</p>
        )
      })}

    </Container>
  );
}

const Container = styled.div`
  width: 80%;
  max-width: 800px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextArea = styled.textarea`
  width: 50%;
  height: 250px;
  margin-bottom: 24px;
`;

export default App;
