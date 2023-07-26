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

  const [llmResult, setLlmResult] = useState({});
  const [llmPrompt, setLlmPrompt] = useState("");
  const [llmStreaming, setLlmStreaming] = useState(false);
  const [llmImage, setLlmImage] = useState("");
  const [llmContinue, setLlmContinue] = useState(true);
  const [llmPrompts, setLlmPrompts] = useState([])
  const [llmId, setLlmId] = useState([])
    
  
  useEffect(() => {
    if (llmStreaming && llmContinue && editorRef !== "") {
      const nodeArray = editorRef.current.editor.dom.select(".answer");
      console.log('nodeArray:')
      console.log(nodeArray)
      //console.log("Result:")
      setLlmStopButtonVisible(true);
      const nodeId = 'id'+llmId[llmId.length-1]
      updateLlmButtonLocation();
      if (nodeArray) {
        let node = nodeArray[0];
        editorRef.current.editor.dom.addClass(node, "llmparagraph");
        editorRef.current.editor.dom.addClass(node,`${nodeId}`)
        editorRef.current.editor.dom.remove("llmresult");
        //console.log(editorRef.current.editor.dom.hasClass(node,'1'))
        //let promptNode = editorRef.current.editor.selection.getNode();
        console.log(node.classList)
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
      const nodeId = 'id'+llmId[llmId.length-1]
      editorRef.current.editor.selection.setContent(
        `<img src="${llmImage}" width="256" height="256" class="shadow currImg ${nodeId}">`
      );
      editorRef.current.editor.dom.remove('placeHolder')
    }
  }, [llmImage]);

  useEffect(() => {
    if (!llmStreaming && llmPrompt !== '') {
     setLlmButtonsVisible(true)
     console.log(llmPrompts)
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
      llmPrompts.push(promptText);
      const idArray = llmId
      console.log(idArray)
      let index = -1
      if(llmId.length === 0){
            index = -1;
          }else{
            index = llmId[llmId.length-1]
            console.log('array:')
            console.log(llmId)
          }
          llmId.push(index+1)
          setLlmId(llmId)
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
      let node = editorRef.current.editor.selection.getNode()
      if (node.nodeName === 'IMG') {
        let classes = editorRef.current.editor.dom.getParent(node,'img').classList
        let nodeId = ''
        for(let i=0;i<classes.length;i++){
          if(classes[i].includes('id')){
             nodeId = classes[i]
          }}
        let index = Number(nodeId.slice(2))
        if(nodeId !== ''){
        editorRef.current.editor.dom.remove(
          editorRef.current.editor.dom.select(`.${nodeId}`)
        );
          editorRef.current.editor.selection.setContent(
          "@ai " + llmPrompts[index]
        );}
      }else{
        let classes = editorRef.current.editor.dom.getParent(node,'.llmparagraph').classList
        editorRef.current.editor.dom.getParent(node,'.llmparagraph').classList.remove('llmparagraph')
        let nodeId = ''
        for(let i=0;i<classes.length;i++){
          if(classes[i].includes('id')){
             nodeId = classes[i]
          }
        }
        let index = Number(nodeId.slice(2))
        if (nodeId !== ''){
          editorRef.current.editor.dom.setHTML(
            editorRef.current.editor.dom.select(`.${nodeId}`),
            "@ai " + llmPrompts[index]
          );
          
        }

     }
    
      setLlmButtonsVisible(false);
      setLlmPrompt("");
    };
  
    const handleLlmButtonInsert = () => {
      console.log("llm insert button clicked");
      let node = editorRef.current.editor.selection.getNode()
      console.log(editorRef.current.editor.dom.getParent(node,'.llmparagraph'))
      //console.log(editorRef.current.props.prompt)
      if (node.nodeName==='IMG') {
        editorRef.current.editor.dom.getParent(node,'img').classList.remove('shadow')
      }else{
        editorRef.current.editor.dom.getParent(node,'.llmparagraph').classList.remove('llmparagraph')
      }
      setLlmButtonsVisible(false);

      setLlmPrompt("");
    };
  
    const handleLlmButtonDiscard = () => {
      console.log("llm discard button clicked");
      let node = editorRef.current.editor.selection.getNode()
      console.log(node.nodeName)
      if (node.nodeName==='IMG') {
      let classes = editorRef.current.editor.dom.getParent(node,'img').classList
      let nodeId = ''
      for(let i=0;i<classes.length;i++){
        if(classes[i].includes('id')){
           nodeId = classes[i]
        }
      if(nodeId!== ''){
        editorRef.current.editor.dom.remove(
          editorRef.current.editor.dom.select(`.${nodeId}`)
        );}
      }
    }else{
      let classes = editorRef.current.editor.dom.getParent(node,'.llmparagraph').classList
      let nodeId = ''
      for(let i=0;i<classes.length;i++){
        if(classes[i].includes('id')){
           nodeId = classes[i]
        }
      }
      if (nodeId !== ''){
      editorRef.current.editor.dom.remove(
        editorRef.current.editor.dom.select(`.${nodeId}`)
      );}}
  
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
                {/*<ButtonGroup
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
                </ButtonGroup> */}
              </div> 
              <Editor
         apiKey={process.env.REACT_APP_API_KEY}
        initialValue= "<p>This is the initial content</p>"
        ref = {editorRef}
        prompt = {llmPrompt}
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
          'alignright alignjustify | bullist numlist outdent indent '+ '| LLMRecipes IdeaBucket' ,
          content_style: " #llmresult { color:gray } .llmparagraph { border: 0px solid; background-color: #fafaf7; padding: 2px 5px; margin: 2px 2px; border-radius: 5px;} .shadow{box-shadow:0 0 15px 15px #F0F0F0;}",
  
      setup: (editor) => {
        const onAction = (autocompleteApi, rng, value) => {
      editor.selection.setRng(rng);
      editor.insertContent(value);
      autocompleteApi.hide();
    };

    const getMatchedChars = (pattern) => {
      let uniquePrompts = [...new Set(llmPrompts)]
      return uniquePrompts.filter(prompt => prompt.indexOf(pattern) !== -1);
    };

    //
    editor.ui.registry.addAutocompleter('prompts', {
      trigger: '@ai',
      minChars: 1,
      //columns: 1,
      highlightOn: ['char_name'],
      onAction: onAction,
      fetch: (pattern) => {
        return new Promise((resolve) => {
          const results = getMatchedChars(pattern).map(char => ({
            type: 'cardmenuitem',
            value: '@ai'+char,
            //label: char,
            items: [
              {
                type: 'cardcontainer',
                direction: 'vertical',
                items: [
                  {
                    type: 'cardtext',
                    text: char,
                    name: 'char_name'
                  }
                ]
              }
            ]
          }));
          resolve(results);
        });
      }
    });

//
                    editor.addCommand("reply", async function () {
                      let promptNode = editor.selection.getNode().parentElement;
                      if(promptNode.nodeName==='BODY'){
                        promptNode = editor.selection.getNode()
                      }
                      let promptText = promptNode.textContent
                      console.log('Initial value of PromptText:')
                      console.log(promptNode.textContent)
                      console.log('node:')
                      console.log(promptNode)
                      getLLMResult(promptText, promptNode);
                    })
                    editor.ui.registry.addButton('Insert',{
                      text: 'Insert',
                      onAction: handleLlmButtonInsert}
                    )
                    editor.ui.registry.addButton('Adjust',{
                      text: 'Adjust',
                      onAction: handleLlmButtonAdjust}
                    )
                    editor.ui.registry.addButton('Discard',{
                      text: 'Discard',
                      onAction: handleLlmButtonDiscard}
                    )
                    editor.ui.registry.addButton('LLMRecipes',{icon:'WandMagic', 
                    text: 'LLM Recipes',
                    enabled: false,
                    onAction: function() {console.log('Clicked LLM Recipes Button')},
                    onSetup: (buttonApi) => {
        const editorEventCallback = (eventApi) => {
          buttonApi.setEnabled(eventApi.element.nodeName.toLowerCase() !== 'p');
        };
        editor.on('NodeChange', editorEventCallback);

        /* onSetup should always return the unbind handlers */
        return () => editor.off('NodeChange', editorEventCallback);
      }
                    })
                    editor.ui.registry.addButton('IdeaBucket',{
                    icon:'IdeaBucket', 
                    text: 'Idea Bucket',
                    onAction: function() {console.log('Clicked Idea Bucket Button')},
                    
        
        })
                    
      //adding custom icons
      editor.ui.registry.addIcon('WandMagic', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg>');         
      editor.ui.registry.addIcon('IdeaBucket','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/></svg>');
    
     //adding Insert, Adjust and Discard buttons to the context toolbar
      editor.ui.registry.addContextToolbar('text', {
      predicate: (node) => editor.dom.hasClass(node,'llmparagraph'),
      items: 'Insert Adjust Discard',
      position: 'node',
      scope: 'node'
    });
    editor.ui.registry.addContextToolbar('image',{
      predicate: (node) => editor.dom.hasClass(node,'currImg'),
      items: 'Insert Adjust Discard',
      position: 'node',
      scope: 'node'
    });
                    }
          }}

      
  
          
         />

        </div>)
}

export default EditorAI;