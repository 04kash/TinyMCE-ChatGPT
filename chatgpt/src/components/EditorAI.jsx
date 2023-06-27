import {React} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import '../App.css';
function EditorAI(){
    const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
    
        


    return (
      <div>
      <Editor
         apiKey="3kwyco0zldkd0ugbqinyz3bgpdqlaiszz61uijjofpqkx6ok"
        initialValue= "<p>This is the initial content of the editor.</p>"
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

    ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | AskChatGPT' ,
          content_style: 'div.answer { font-family: Consolas,monaco,monospace;  background-color: black; color: white; padding: 2px; }',
  
      setup: function (editor) {
        // Register ChatGPT's reply
        editor.addCommand('reply', async function () {
      
         const { message } = await llm.chat({
          messages: [{ role: "user", content: editor.getContent()}],
        });
         editor.dom.add(editor.getBody(),'div', {class:"answer"},message.content)
        editor.dom.add(editor.getBody(), 'p', { }, 'Next prompt?')
      }
      );
    }
          }}

      
  
          
         />
        </div>)
}

export default EditorAI;