const container = document.getElementById("container");
const searchButton = document.getElementById("newUserButton");

const openFormButton = document.getElementById("findClassId");
const closeFormButton = document.getElementById("closeFormButton");
const classIdFormContainer = document.getElementById("classIdFormContainer");
const button_container = document.getElementById("button_container");
const submitFormInput = document.getElementById("submitFormInput");
const classIdForm = document.getElementById("classIdForm");

classIdForm.addEventListener('submit', (e) => {
   e.preventDefault();
   const classId = document.getElementById("classId").value
   findByClassID({classId});
   classIdFormContainer.style.display = "none";
   button_container.style.display = "block";
});

openFormButton.addEventListener("click", () => {
  classIdFormContainer.style.display = "flex";
  button_container.style.display = "none";
});

closeFormButton.addEventListener("click", () => {
  classIdFormContainer.style.display = "none";
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


const findByClassID = ({classId}) => {
  const url = `http://localhost:8000/${classId}`;
  console.log('url: ', url);
     fetch(url)
    .then(res => res.json())
    .then(response => {
                        console.log('Success:', response);
                        const div = document.createElement("div");
                        div.classList.add("userContainer");
                        div.innerHTML = `
                            <div class="divContainer">
                            <h3>ClassId: ${response.classId}</h3>
                            <p>Class Name: ${response.classes[0].properties.title.rich_text[0].plain_text}</p>
                            <p>Chef Name: ${response.classes[0].properties.name.title[0].plain_text}</p>
                            <p>Description: ${response.classes[0].properties.description.rich_text[0].plain_text}</p>
                            </div>
                        `;
                        container.append(div);
                      })
    .catch(error => console.log('Error:', error));
}

