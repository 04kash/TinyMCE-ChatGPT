import React, { useRef } from 'react';
import { Editor, tinymce } from '@tinymce/tinymce-react';

function App() {
  return (
    <>
    <Editor
      apiKey="3kwyco0zldkd0ugbqinyz3bgpdqlaiszz61uijjofpqkx6ok"
      initialValue="<p>This is the initial content of the editor.</p>"
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
        setup: (editor) => {editor.ui.registry.addButton('AskChatGPT', {text: "Ask ChatGPT",
    icon: "highlight-bg-color",
    tooltip: "Highlight a prompt and click this button to query ChatGPT",
    enabled: true,
    onAction: (_) => {} },)
      }}}
    />
  </>
  );
}

export default App;
