import {React,useEffect,useState, useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import '../App.css';
import PlaceHolder from '../components/placeHolderImg.png';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function EditorAI(){
  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
  const editorRef = useRef('')

  const [llmButtonsTop, setLlmButtonsTop] = useState("");
  const [llmButtonsLeft, setLlmButtonsLeft] = useState("");
  const [llmButtonsVisible, setLlmButtonsVisible] = useState(false);
  const [llmStopButtonVisible, setLlmStopButtonVisible] = useState(false);

  const [llmResult, setLlmResult] = useState("");
  const [llmPrompt, setLlmPrompt] = useState("");
  const [llmStreaming, setLlmStreaming] = useState(false);
  const [llmImage, setLlmImage] = useState("");
  const [llmContinue, setLlmContinue] = useState(true);
    
  
  useEffect(() => {
    if (llmStreaming && llmContinue && editorRef !== "") {
      const nodeArray = editorRef.current.editor.dom.select(".answer");
      //console.log(nodeArray)
      //console.log("Result:")
      //console.log(llmResult)
      setLlmStopButtonVisible(true);
      updateLlmButtonLocation();
      if (nodeArray) {
        let node = nodeArray[0];
        editorRef.current.editor.dom.addClass(node, "llmparagraph");
        editorRef.current.editor.dom.remove("llmresult");
        editorRef.current.editor.dom.add(
          node,
          "span",
          { id: "llmresult" },
          llmResult.replace(/(?:\r\n|\r|\n)/g, "<br>")
        );
      }
    }
  }, [llmResult, llmStreaming, llmContinue]);


  
  useEffect(() => {
    if (llmImage !== "") {
      updateLlmButtonLocation();
      editorRef.current.editor.selection.setContent(
        `<img src="${llmImage}" width="256" height="256" class="shadow currImg">`
      );
      editorRef.current.editor.dom.remove('placeHolder')
    }
  }, [llmImage]);

  useEffect(() => {
    if (!llmStreaming && llmPrompt !== '') {
     setLlmButtonsVisible(true)
    }
  },[llmStreaming,llmPrompt]);

    const updateLlmButtonLocation = () => {
      const nodeArray = editorRef.current.editor.dom.select(".llmparagraph");
      if (nodeArray[0]) {
        let node = nodeArray[0];
        let nodeRect = node.getBoundingClientRect();
  
        // console.log(rect.top, rect.right, rect.bottom, rect.left);
        setLlmButtonsTop(nodeRect.top + 20 + "px");
        setLlmButtonsLeft(nodeRect.right - 280 + "px");
        if (llmPrompt.includes("image") || llmPrompt.includes("picture")) {
          setLlmButtonsTop(nodeRect.top + 20 + "px");
        setLlmButtonsLeft(nodeRect.right - 200 + "px");
          
        }
      }
    };
  
    async function getLLMResult(promptText, promptNode) {
      if(editorRef !== ''){
      try {
        editorRef.current.editor.dom.addClass(promptNode, "answer");
        editorRef.current.editor.dom.setHTML(promptNode, "");
        
        if (promptText.includes("image") || promptText.includes("picture")) {
          //editorRef.current.editor.dom.add(editorRef.current.editor.getBody(),'div', {class:"square", id:"placeHolder"},'Generating...')
          editorRef.current.editor.selection.setContent(
            `<img id= 'placeHolder' src=${PlaceHolder} width="256" height="256">`
          );
          setLlmImage("");
          const { images } = await llm.generateImage({ prompt: promptText });
          setLlmImage(images[0]);
        } else {
          setLlmImage("");
          setLlmContinue(true);
          console.log('PromptText before streaming:')
          console.log(promptText)
          await llm.chat({
            messages: [{ role: "user", content: promptText }],
            stream: true,
            onStream: ({ message }) => {
              setLlmResult(message.content);
              setLlmStreaming(true);
            },
          });
        }
      } catch (error) {
        console.error("Something went wrong!", error);
      } finally {
        setLlmStreaming(false);
        const nodeArray = editorRef.current.editor.dom.select(".answer");
        editorRef.current.editor.dom.removeClass(nodeArray, "answer");
        editorRef.current.editor.dom.removeAllAttribs("llmresult");
        setLlmPrompt(promptText);
        setLlmButtonsVisible(true);
        setLlmStopButtonVisible(false);
      }
    }}
  
    const handleLlmButtonAdjust = () => {
      console.log("llm adjust button clicked");
      console.log('llmPrompt:')
        console.log(llmPrompt)
      editorRef.current.editor.dom.setHTML(
        editorRef.current.editor.dom.select(".llmparagraph"),
        "@ai " + llmPrompt
      );
      editorRef.current.editor.dom.removeClass(
        editorRef.current.editor.dom.select(".llmparagraph"),
        "llmparagraph"
      );
      if (llmPrompt.includes("image") || llmPrompt.includes("picture")) {
        editorRef.current.editor.dom.remove(
          editorRef.current.editor.dom.select(".currImg")
        );
          editorRef.current.editor.selection.setContent(
          "@ai " + llmPrompt
        );
      }
      setLlmButtonsVisible(false);
      setLlmPrompt("");
    };
  
    const handleLlmButtonInsert = () => {
      console.log("llm insert button clicked");
      editorRef.current.editor.dom.removeClass(
        editorRef.current.editor.dom.select(".llmparagraph"),
        "llmparagraph"
      );
      if (llmPrompt.includes("image") || llmPrompt.includes("picture")) {
        editorRef.current.editor.dom.removeClass(
          editorRef.current.editor.dom.select(".shadow"),
          "shadow"
        );
        editorRef.current.editor.dom.removeClass(
          editorRef.current.editor.dom.select(".currImg"),
          "currImg"
        );
      }
      setLlmButtonsVisible(false);

      setLlmPrompt("");
    };
  
    const handleLlmButtonDiscard = () => {
      console.log("llm discard button clicked");
      editorRef.current.editor.dom.remove(
        editorRef.current.editor.dom.select(".llmparagraph")
      );
      if (llmPrompt.includes("image") || llmPrompt.includes("picture")) {
        editorRef.current.editor.dom.remove(
          editorRef.current.editor.dom.select(".currImg")
        );
      }
      setLlmButtonsVisible(false);
      setLlmPrompt("");
    };
  
    const handleLlmButtonStop = () => {
      console.log("llm stop generating button clicked");
      setLlmContinue(false);
        // const nodeArray = editorRef.current.editor.dom.select("p.answer");
        // editorRef.current.editor.dom.removeClass(nodeArray, "answer");
        // editorRef.current.editor.dom.removeAllAttribs("llmresult");
        setLlmStopButtonVisible(false);
      console.log("llmPrompt Inside Stop:")
      console.log(llmPrompt)
    };
  
  
    return (
      <div>
      <div className="llm-buttons">
                <ButtonGroup
                  size="sm"
                  style={{
                    visibility: llmStopButtonVisible ? "visible" : "hidden",
                    top: llmButtonsTop,
                    left: llmButtonsLeft,
                  }}
                >
                  <Button
                    variant="light"
                    onClick={() => {
                      handleLlmButtonStop();
                    }}
                  >
                    Stop Generating
                  </Button>
                </ButtonGroup>
                <ButtonGroup
                  size="sm"
                  style={{
                    visibility: llmButtonsVisible ? "visible" : "hidden",
                    top: llmButtonsTop,
                    left: llmButtonsLeft,
                    display: llmButtonsVisible ? "flex" : "none",
                  }}
                >
                  <Button
                    variant="light"
                    onClick={() => {
                      handleLlmButtonInsert();
                    }}
                  >
                    Insert
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => {
                      handleLlmButtonAdjust();
                    }}
                  >
                    Adjust
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => {
                      handleLlmButtonDiscard();
                    }}
                  >
                    Discard
                  </Button>
                </ButtonGroup>
              </div><Editor
         apiKey=""
        initialValue= "<p>This is the initial content</p>"
        ref = {editorRef}
        init={{
          height: 500,
          selector: 'div',
          menubar: false,
          plugin: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount','textpattern'
          ],
          text_patterns: [
        {start: '@ai',cmd:'reply'},

    ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent ' ,
          content_style: ".square{height: 250px; width: 250px; display: flex; justify-content: center; border-style: solid;align-items: center;} #llmresult { color:gray } p.llmparagraph { border: 0px solid; background-color: #fafaf7; padding: 2px 5px; margin: 2px 2px; border-radius: 5px;} .shadow{box-shadow:0 0 15px 15px #F0F0F0;}",
  
      setup: (editor) => {
                    editor.addCommand("reply", async function () {
                      let promptNode = editor.selection.getNode();
                      let promptText = promptNode.textContent
                      console.log('Initial value of PromptText:')
                      console.log(promptNode.textContent)
                      console.log(promptNode)
                      getLLMResult(promptText, promptNode);
                    })}
          }}

      
  
          
         />

        </div>)
}

export default EditorAI;
