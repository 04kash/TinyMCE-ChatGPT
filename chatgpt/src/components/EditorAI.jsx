import {React,useEffect,useState, useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import '../App.css';
function EditorAI(){
    const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
    //const [prompt, setPrompt] = useState("");
    const [image, setImage] = useState("");
    const editorRef = useRef('')
    useEffect(() => {
      if (editorRef.current && image) {
        const content = editorRef.current.editor.getContent()
        var tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        var desiredTag = tempElement.querySelector('.square');
        var newElement = document.createElement('img');
        newElement.setAttribute('src', image);
        var parentNode = desiredTag.parentNode
        parentNode.replaceChild(newElement,desiredTag)
        editorRef.current.editor.setContent(tempElement.innerHTML)
      }
    }, [image]);
  
    return (
      <div>
      <Editor
         apiKey="3kwyco0zldkd0ugbqinyz3bgpdqlaiszz61uijjofpqkx6ok"
        initialValue= "<p>This is the initial content of the editor.</p>"
        ref = {editorRef}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount','textpattern'
          ],
          text_patterns: [
        {start: '@gpt',cmd:'reply'},
        {start: '@draw', cmd: 'image'}

    ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | AskChatGPT' ,
          content_style: "div.square{height: 250px; width: 250px; display: flex; justify-content: center; border-style: solid;align-items: center;}"+'div.answer { font-family: Consolas,monaco,monospace;  background-color: black; color: white; padding: 2px; }',
  
      setup: function (editor) {
        // Register ChatGPT's reply
        editor.addCommand('reply', async function () {
      
         const { message } = await llm.chat({
          messages: [{ role: "user", content: editor.getContent({format : 'text'})}],
        });
         editor.dom.add(editor.getBody(),'div', {class:"answer"},message.content)
        editor.dom.add(editor.getBody(), 'p', { }, 'Next prompt?')
      }
      );
      //Image generation
      editor.addCommand('image',  async function () {
      editor.dom.add(editor.getBody(),'div', {class:"square"},'Generating...')
      const prompt = editor.getContent({format:'text'})
      const { images } = await llm.generateImage({prompt});
      setImage(images[0])
      
   }
   );
    }
          }}

      
  
          
         />
        </div>)
}

export default EditorAI;