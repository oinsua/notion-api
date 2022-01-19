const container = document.getElementById("jsoneditor");
const searchButton = document.getElementById("newUserButton");

const openFormButton = document.getElementById("findClassId");
const closeFormButton = document.getElementById("closeFormButton");
const closeFormButtonPage = document.getElementById("closeFormButtonPage");
const closeFormButtonAll = document.getElementById("closeFormButtonAll");
const classIdFormContainer = document.getElementById("classIdFormContainer");
const classIdFormContainerPage = document.getElementById("classIdFormContainerPage");
const button_container = document.getElementById("button_container");
const submitFormInput = document.getElementById("submitFormInput");
const classIdForm = document.getElementById("classIdForm");
const classIdFormPage = document.getElementById("classIdFormPage");
const classIdFormAll = document.getElementById("classIdFormAll");
const AllPagesContainer = document.getElementById("AllPagesContainer");
const findAllClass = document.getElementById("findAllClass");
const getPages = document.getElementById("getPages");

classIdForm.addEventListener('submit', (e) => {
   e.preventDefault();
   const classId = document.getElementById("classId").value
   findByClassID({classId});
   classIdFormContainer.style.display = "none";
   button_container.style.display = "none";
   openFormButton.style.display = "none";
   searchButton.style.display = "none";

});

classIdFormAll.addEventListener('submit', (e) => {
  e.preventDefault();
  const select= document.getElementById("databaseId")
  const array = select.options[select.selectedIndex].value.split('-');
  getAllPagesFromDatabase({json: array[0], databaseId: array[1] });
  AllPagesContainer.style.display = "none";
  button_container.style.display = "none";
  openFormButton.style.display = "none";
  searchButton.style.display = "none";
});

classIdFormPage.addEventListener('submit', (e) => {
  e.preventDefault();
  const pageId = document.getElementById("pageId").value
  getPagesById({pageId});
  classIdFormContainerPage.style.display = "none";
  button_container.style.display = "none";
});



findAllClass.addEventListener('click',() => {
  AllPagesContainer.style.display = "flex";
  button_container.style.display = "none";
});

openFormButton.addEventListener("click", () => {
  classIdFormContainer.style.display = "flex";
  button_container.style.display = "none";
});

getPages.addEventListener("click", () => {
  classIdFormContainerPage.style.display = "flex";
  button_container.style.display = "none";
});

closeFormButton.addEventListener("click", () => {
  classIdFormContainer.style.display = "none";
  button_container.style.display = "block";
});

closeFormButtonPage.addEventListener("click", () => {
  classIdFormContainer.style.display = "none";
  button_container.style.display = "block";
});

closeFormButtonAll.addEventListener("click", () => {
  AllPagesContainer.style.display = "none";
  button_container.style.display = "block";
});

searchButton.addEventListener("click", () => {
  addData();
});


// Add data to HTML
const addData = async () => {
  const data = await getDataFromBackend();
  console.log('data: ', data);
  const count = data.length;
  data.forEach((value, index) => {
    const div = document.createElement("div");
    div.classList.add("userContainer");
    div.innerHTML = `
        <h3>${index+1}/${count}</h3>
        <p>stepNumber: ${value.stepNumber}</p>
        <p>classId: ${value.classId}</p>
        <p>incode: ${value.incode}</p>
        <p>outcode: ${value.outcode}</p>
        <p>description: ${value.description}</p>
    `;
    container.append(div);
  }); 
};

const getDataFromBackend = async () => {
  const rest = await fetch("http://localhost:8000/classes");
  const data = await rest.json();
  return data;
};

const syntaxHighlight = ({json, container}) => {
  if (typeof json != 'string') {
       json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
};

const findByClassID = ({classId}) => {
  const url = `http://localhost:8000/${classId}`;
  console.log('url: ', url);
     fetch(url)
    .then(res => res.json())
    .then(response => {
                        console.log('Success:',response);
                        const json = JSON.stringify(response, undefined, 4);

                        container.innerHTML = `<pre>${syntaxHighlight({json})}</pre>`;
                      })
    .catch(error => console.log('Error:', error));
}

const getAllPagesFromDatabase = ({json, databaseId}) => {
  const url = `http://localhost:8000/all/${json}/${databaseId}`;
  console.log('url: ', url);
  fetch(url)
  .then(res => res.json())
  .then(response => {
                     console.log('Success: ', response);
                     const json = JSON.stringify(response, undefined, 4);
                     const {collection, data} = response;
                     if(collection === 'SUPPLIES'){
                      const container = document.getElementById('jsoneditor');
                      container.classList.add('jsonEditor');
                      const options = {};
                      const editor = new JSONEditor(container, options);
                      editor.set(response);
                     }else{
                      container.innerHTML = `<pre>${syntaxHighlight(json)}</pre>`;
                     }                    
                    });
};

const getPagesById = ({pageId}) => {
  const url = `http://localhost:8000/page/${pageId}`;
  console.log('url: ', url);
  fetch(url)
  .then(res => res.json())
  .then(response => {
                     console.log('Success: ', response)
                     const json = JSON.stringify(response, undefined, 4);
                     container.innerHTML = `<pre>${syntaxHighlight({json})}</pre>`;
                    });
};

