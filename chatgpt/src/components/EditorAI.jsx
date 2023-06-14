import {React} from 'react';
import { Editor} from '@tinymce/tinymce-react';
import useLLM from "usellm";
import { useState} from "react";

function EditorAI(){
    const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
    const [result, setResult] = useState('');
  
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
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | AskChatGPT' ,
          content_style: 'div.answer { font-family: Consolas,monaco,monospace;  background-color: #023020; color: white; padding: 3px; }',
          setup: (editor) => {
      editor.ui.registry.addButton('AskChatGPT', {text: "Ask ChatGPT",
      icon: "highlight-bg-color",
      tooltip: "Highlight a prompt and click this button to query ChatGPT",
      enabled: true,
      onAction: () => {
              llm.chat({
              messages: [{ role: "user", content: editor.selection.getContent()}],
              stream: true,
              onStream: ({ message }) => setResult(message.content)})
              editor.selection.collapse();
              editor.execCommand('InsertHTML', false, '<div class="answer"></div>');
              editor.insertContent(result);
              }
              
          });
  
          }
        }} /><div>{result}</div>
        </div>)
}

export default EditorAI;