import {React} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import '../App.css';
function EditorAI(){
    const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
    async function handleClick(editor) {
      try {
        const { message } = await llm.chat({
          messages: [{ role: "user", content: editor.selection.getContent()}],
        });
        editor.selection.collapse()
        editor.dom.add(editor.getBody(),'div', {class:"answer"},message.content)
        editor.dom.add(editor.getBody(), 'p', { }, 'Next prompt?')
      } catch (error) {
        console.error("Something went wrong!", error);
      }}
        


    return (
      <div>
      <Editor
         apiKey="API-KEY"
        initialValue= "<p>This is the initial content of the editor.</p>"
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount','textpattern'
          ],
          //textpattern_patterns: [
        //{start: '##',cmd:'send'},

    //],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | AskChatGPT' ,
          content_style: 'div.answer { font-family: Consolas,monaco,monospace;  background-color: black; color: white; padding: 2px; }',
          setup: function (editor) {
  
       editor.ui.registry.addButton('AskChatGPT', {text: "Ask ChatGPT",
        icon: "highlight-bg-color",
      tooltip: "Highlight a prompt and click this button to query ChatGPT",
      enabled: true,
      onAction: () =>  handleClick(editor)}
       )
      }
          }}
  
          
         />
        </div>)
}

export default EditorAI;
