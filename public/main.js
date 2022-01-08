const getDataFromBackend = async () => {
  const rest = await fetch("http://localhost:8000/lessons");
  const data = await rest.json();
  return data;
};

const container = document.getElementById("container");
const searchButton = document.getElementById("newUserButton");

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

