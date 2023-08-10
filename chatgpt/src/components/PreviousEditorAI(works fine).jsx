import {React,useEffect,useState, useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import '../App.css';
//import PlaceHolder from '../components/placeHolderImg.png';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


function EditorAI(){
  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
  const editorRef = useRef('')

  const [llmButtonsTop, setLlmButtonsTop] = useState("");
  const [llmButtonsLeft, setLlmButtonsLeft] = useState("");
  //const [llmButtonsVisible, setLlmButtonsVisible] = useState(false);
  const [llmStopButtonVisible, setLlmStopButtonVisible] = useState(false);

  //const [llmResult, setLlmResult] = useState({});
  const [llmResult,setLlmResult] = useState('')
  const [llmPrompt, setLlmPrompt] = useState("");
  const [llmStreaming, setLlmStreaming] = useState(false);
  //const [llmImage, setLlmImage] = useState("");
  const [llmPrompts, setLlmPrompts] = useState([])
  const [llmId, setLlmId] = useState([])
  const [templates, setLlmTemplates] = useState(['email', 'travel', 'meeting'])
  
  useEffect(() => {
    if (llmStreaming) {
      const nodeArray = editorRef.current.editor.dom.select(".answer");
      console.log('nodeArray:')
      console.log(nodeArray)
      console.log(llmResult)
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
        editorRef.current.editor.dom.add(
          node,
          "span",
          { id: "llmresult" },
          llmResult.replace(/(?:\r\n|\r|\n)/g, `<br>`)
        );
        //node.innerHTML = llmResult
        //[llmId[llmId.length-1]]['result']
      }
    }
  }, [llmResult, llmStreaming,llmId]);


  
  // useEffect(() => {
  //   if (llmImage !== "") {
  //     updateLlmButtonLocation();
  //     const nodeId = 'id'+llmId[llmId.length-1]
  //     editorRef.current.editor.selection.setContent(
  //       `<img src="${llmImage}" width="256" height="256" class="shadow currImg ${nodeId}">`
  //     );
  //     editorRef.current.editor.dom.remove('placeHolder')
  //   }
  // }, [llmImage]);

  useEffect(() => {
    if (!llmStreaming && llmPrompt !== '') {
     console.log(llmPrompts)
    }
  },[llmStreaming,llmPrompt,llmPrompts]);

    const updateLlmButtonLocation = () => {
      const nodeArray = editorRef.current.editor.dom.select(".llmparagraph");
      if (nodeArray[0]) {
        let node = nodeArray[0];
        let nodeRect = node.getBoundingClientRect();
  
        // console.log(rect.top, rect.right, rect.bottom, rect.left);
        setLlmButtonsTop(nodeRect.top + 20 + "px");
        setLlmButtonsLeft(nodeRect.right - 280 + "px");
        // if (llmPrompt.includes("image") || llmPrompt.includes("picture")) {
        //   setLlmButtonsTop(nodeRect.top + 20 + "px");
        // setLlmButtonsLeft(nodeRect.right - 200 + "px");
        // }
      }
    };
  
    async function getLLMResult(promptText, promptNode) {
      const currPrompts = llmPrompts
      currPrompts.push(promptText);
      setLlmPrompts(currPrompts)
      //let newResult = Object.assign(llmResult)
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
        
        // if (promptText.includes("image") || promptText.includes("picture")) {
        //   //editorRef.current.editor.dom.add(editorRef.current.editor.getBody(),'div', {class:"square", id:"placeHolder"},'Generating...')
        //   editorRef.current.editor.selection.setContent(
        //     `<img id= 'placeHolder' src=${PlaceHolder} width="256" height="256">`
        //   );
        //   setLlmImage("");
        //   const { images } = await llm.generateImage({ prompt: promptText });
        //   setLlmImage(images[0]);
          
        // } else {
          //setLlmImage("");
          //setLlmContinue(true);
          console.log('PromptText before streaming:')
          console.log(promptText)
          await llm.chat({
            messages: [{ role: "user", content: promptText}],
            stream: true,
            onStream: ({ message }) => {
               //newResult[llmId[llmId.length-1]]= {'result':message.content,'continue':true}
              //setLlmResult(newResult);
              setLlmResult(message.content)
              setLlmStreaming(true);
            },
          });
        
      } catch (error) {
        console.error("Something went wrong!", error);
      } finally {
        setLlmStreaming(false);
        const nodeArray = editorRef.current.editor.dom.select(".answer");
        // console.log('finally block' )
        // console.log(nodeArray[0].children)
        // const para = document.createElement('p')
        // para.innerHTML = nodeArray[0].children[0].innerHTML
        // console.log(para)
        // nodeArray[0].replaceChild(para,nodeArray[0].children[0])
        editorRef.current.editor.dom.removeClass(nodeArray, "answer");
        editorRef.current.editor.dom.removeAllAttribs("llmresult");
        setLlmPrompt(promptText);
        setLlmStopButtonVisible(false);
      }
    }}
  
    const handleLlmButtonAdjust = () => {
      console.log("llm adjust button clicked");
      let node = editorRef.current.editor.selection.getNode()
      // if (node.nodeName === 'IMG') {
      //   let classes = editorRef.current.editor.dom.getParent(node,'img').classList
      //   let nodeId = ''
      //   for(let i=0;i<classes.length;i++){
      //     if(classes[i].includes('id')){
      //        nodeId = classes[i]
      //     }}
      //   let index = Number(nodeId.slice(2))
      //   if(nodeId !== ''){
      //   editorRef.current.editor.dom.remove(
      //     editorRef.current.editor.dom.select(`.${nodeId}`)
      //   );
      //     editorRef.current.editor.selection.setContent(
      //     "@ai:" + llmPrompts[index]
      //   );}
      // }else{
        if(editorRef.current.editor.dom.getParent(node,'.llmparagraph')!==null){
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
            "@ai:" + llmPrompts[index]
          );
          
        }

     }
      setLlmPrompt("");
    };
  
    const handleLlmButtonInsert = () => {
      console.log("llm insert button clicked");
      let node = editorRef.current.editor.selection.getNode()
      console.log(node)
      console.log(editorRef.current.editor.dom.getParent(node,'.img'))
      // if (node.nodeName==='IMG') {
      //   editorRef.current.editor.dom.getParent(node,'img').classList.remove('shadow')
      // }else{
        if(editorRef.current.editor.dom.getParent(node,'.llmparagraph')!== null){
        editorRef.current.editor.dom.getParent(node,'.llmparagraph').classList.remove('llmparagraph')
      }

      setLlmPrompt("");
    ;}
  
    const handleLlmButtonDiscard = () => {
      console.log("llm discard button clicked");
      let node = editorRef.current.editor.selection.getNode()
      console.log(node.nodeName)
    //   if (node.nodeName==='IMG') {
    //     editorRef.current.editor.dom.remove(
    //       editorRef.current.editor.dom.getParent(node,'img')
    //     );
    // }else{
      if(editorRef.current.editor.dom.getParent(node,'.llmparagraph')!== null){
      editorRef.current.editor.dom.remove(
        editorRef.current.editor.dom.getParent(node,'.llmparagraph')
      );}
      setLlmPrompt("");
    };
  
    const handleLlmButtonStop = () => {
      console.log("llm stop generating button clicked");
      let node = editorRef.current.editor.selection.getNode()
      console.log( editorRef.current.editor.dom.getParent(node,'.llmparagraph'))
      //setLlmContinue(false);
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
              </div> 
              <Editor
         apiKey={process.env.REACT_APP_API_KEY}
        initialValue= "This is the initial content <span><br></span> Hi"
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
        {start: '@ai:',cmd:'reply'},

    ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | LLMRecipes IdeaBucket @ai-Templates' ,
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
      trigger: '@ai:',
      minChars: 1,
      //columns: 1,
      highlightOn: ['char_name'],
      onAction: onAction,
      fetch: (pattern) => {
        return new Promise((resolve) => {
          const results = getMatchedChars(pattern).map(char => ({
            type: 'cardmenuitem',
            value: '@ai:'+char,
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

    // editor.ui.registry.addGroupToolbarButton('@ai-Templates', {
    //   icon: 'templates',
    //   text: '@ai Templates',
    //   tooltip: 'Select one of these @ai prompt templates to get started!',
    //   items: templates.join(' ') + ' newTemplates'
    // });

    var items = [
      {
        type: 'menuitem',
        icon: 'paperclip',
        text: 'Email',
        onAction: (_) => editor.insertContent(`<p>@ai:Compose an email addressing the topic of <strong>[INSERT SPECIFIC TOPIC: e.g., Sustainable Travel Practices]</strong> tailored for <strong>[INTENDED RECIPIENT: e.g., Travel Enthusiasts, Corporate Clients]</strong>. Please adopt a <strong>[TONE OF VOICE AND LANGUAGE: e.g., friendly and informative, formal and professional]</strong> tone. Your email should effectively convey key information and engage the recipient.</p>`)
        },
      {
        type: 'menuitem',
      icon:'paperclip',
      text: 'Travel Itinerary',
      onAction: (_) => editor.insertContent(`<p>@ai:Develop a detailed travel itinerary for a <strong>[TYPE OF TRIP: e.g., week-long family vacation, romantic weekend getaway]</strong> to <strong>[DESTINATION: e.g., Paris, Bali]</strong> during the month of <strong>[MONTH OF VISIT: e.g., August]</strong>. Design the itinerary for <strong>[NUMBER OF DAYS: e.g., 5 days]</strong>, focusing on <strong>[TYPE OF ACTIVITIES: e.g., cultural exploration, outdoor adventures, relaxation]</strong>. Ensure that the itinerary includes a balanced mix of <strong>[SPECIFIC TYPES OF ACTIVITIES OR ATTRACTIONS: e.g., museums, hiking trails, local markets]</strong>. </p>`)
      },
      {
        type:'menuitem',
        icon:'paperclip',
        text: 'Meeting Agenda',
      onAction: (_) => editor.insertContent(`<p>@ai:Create a comprehensive meeting agenda for a <strong>[TYPE OF MEETING: e.g., Project Kickoff, Monthly Review]</strong> scheduled on <strong>[DATE AND TIME: e.g., August 15th, 10:00 AM]</strong>. Develop an agenda that covers <strong>[MAIN TOPICS: e.g., progress updates, goal setting, team collaboration]</strong> and ensures active participation. Organize the agenda with clear time allocations for each item and include any <strong>[REQUIRED PREPARATION: e.g., data presentation, research summaries]</strong> necessary. Focus on maintaining a productive approach to facilitate a successful meeting.</p>`)
      },
      
    ];


    editor.ui.registry.addMenuButton('@ai-Templates', {
      icon : 'templates',
      text: '@ai Templates',
      fetch: function (callback) {
        callback(items.concat(      {
        type: 'menuitem',
        icon:'plus',
        text: 'Create New Template',
      onAction: (_) => editor.windowManager.open(dialogConfig)
      }));
      }
    });


    // editor.ui.registry.addButton('email', {
    //   icon:'envelope',
    //   text: 'Email',
    //   onAction: (_) => editor.insertContent(`<p>@ai:Compose an email addressing the topic of <strong>[INSERT SPECIFIC TOPIC: e.g., Sustainable Travel Practices]</strong> tailored for <strong>[INTENDED RECIPIENT: e.g., Travel Enthusiasts, Corporate Clients]</strong>. Please adopt a <strong>[TONE OF VOICE AND LANGUAGE: e.g., friendly and informative, formal and professional]</strong> tone. Your email should effectively convey key information and engage the recipient.</p>`)
    // });
    // editor.ui.registry.addButton('newTemplates', {
    //   icon:'plus',
    //   //text: 'Create New Template',
    //   onAction: (_) => editor.windowManager.open(dialogConfig)
      
    // });
    // editor.ui.registry.addButton('travel', {
    //   icon:'travel',
    //   text: 'Travel Itinerary',
    //   onAction: (_) => editor.insertContent(`<p>@ai:Develop a detailed travel itinerary for a <strong>[TYPE OF TRIP: e.g., week-long family vacation, romantic weekend getaway]</strong> to <strong>[DESTINATION: e.g., Paris, Bali]</strong> during the month of <strong>[MONTH OF VISIT: e.g., August]</strong>. Design the itinerary for <strong>[NUMBER OF DAYS: e.g., 5 days]</strong>, focusing on <strong>[TYPE OF ACTIVITIES: e.g., cultural exploration, outdoor adventures, relaxation]</strong>. Ensure that the itinerary includes a balanced mix of <strong>[SPECIFIC TYPES OF ACTIVITIES OR ATTRACTIONS: e.g., museums, hiking trails, local markets]</strong>. </p>`)
    // });
    // editor.ui.registry.addButton('meeting', {
    //   icon:'meeting',
    //   text: 'Meeting Agenda',
    //   onAction: (_) => editor.insertContent(`<p>@ai:Create a comprehensive meeting agenda for a <strong>[TYPE OF MEETING: e.g., Project Kickoff, Monthly Review]</strong> scheduled on <strong>[DATE AND TIME: e.g., August 15th, 10:00 AM]</strong>. Develop an agenda that covers <strong>[MAIN TOPICS: e.g., progress updates, goal setting, team collaboration]</strong> and ensures active participation. Organize the agenda with clear time allocations for each item and include any <strong>[REQUIRED PREPARATION: e.g., data presentation, research summaries]</strong> necessary. Focus on maintaining a productive approach to facilitate a successful meeting.</p>`)
    // });
    editor.ui.registry.addIcon('templates',"<svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d='M288 448H64V224h64V160H64c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V384H288v64zm-64-96H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64z'/></svg>");
    editor.ui.registry.addIcon('envelope','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>')
    editor.ui.registry.addIcon('travel','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>');
    editor.ui.registry.addIcon('meeting','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z"/></svg>');
    editor.ui.registry.addIcon('plus','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>');
    editor.ui.registry.addIcon('paperclip','<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/></svg>')
//adding more templates 
var dialogConfig =  {
  title: 'Create A New Template',
  body: {
    type: 'panel',
    items: [
      {
        type: 'input',
        name: 'templateName',
        label: 'Enter the name of the new template:'
      },
      {
        type: 'input',
        name: 'templatePrompt',
        label: 'Enter the prompt:'
      }
    ]
  },
  buttons: [
    {
      type: 'cancel',
      name: 'closeButton',
      text: 'Cancel'
    },
    {
      type: 'submit',
      name: 'submitButton',
      text: 'Create',
      primary: true
    }
  ],
  initialData: {
   templateName: '',
   templatePrompt: ''
   },
  onSubmit: function (api) {
    var data = api.getData();

    items.push({
      type:'menuitem',
      icon:'paperclip',
      text: data.templateName,
      onAction: (_) => editor.insertContent(`<p>@ai:${data.templatePrompt} </p>`)
    });
    api.close();
  }
};


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
    // editor.ui.registry.addContextToolbar('image',{
    //   predicate: (node) => editor.dom.hasClass(node,'currImg'),
    //   items: 'Insert Adjust Discard',
    //   position: 'node',
    //   scope: 'node'
    // });
                    }
          }}

      
  
          
         />

        </div>)
}

export default EditorAI;