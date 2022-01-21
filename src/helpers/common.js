require("dotenv").config();
const { Client } = require("@notionhq/client");

/**
 * conection to notion db.
 */
 const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * auxiliary function to create many promises to get all pages.
 * @param { list } 
 * @returns { pages[] } 
 */
  exports.getPromisesData = async function (list) {
    const promises = [];
    const pages = [];
    try {
      if(list?.length > 0){
        list.map(async (item, index) => {( promises[index] = notion.pages.retrieve({page_id: item.id}))});
          await Promise.allSettled(promises).
          then((res) => { res.forEach((res) => {
                                              pages.push(res.value)
                                              });
                          }
                );
      }
      return pages;
    } catch (error) {
      console.log(error);
    }
  };

/**
 * function  get all the pages of a database filtered by the classId.  
 * @param { filter: {}, database_Id:  "" } 
 * @returns { pages[] } 
 */
 exports.getPagesFromDatabase = async ({filter, database_Id}) => {
  try {
    const pages = []
    let cursor = undefined
    while (true) { 
      const { results, next_cursor } = await notion.databases.query({
        database_id: database_Id,
        start_cursor: cursor,
        filter,
      })
      pages.push(...results)
      if (!next_cursor) {
        break
      }
      cursor = next_cursor
    }
    console.log(`${pages.length} pages successfully fetched.`)
   return pages;
  } catch (error) {
    console.log(error);
  }
};

/**
 * function  get the pages of a array filtered by other all pages.  
 * @param { array: [{}], pages: [{}] } 
 * @returns { pages[] } 
 */
 exports.getDataIdArray = ({array, pages}) => {
  let pagesClass = [];
  if(array?.length > 0 && pages?.length > 0){
    array.filter((obj) => {
      pages.filter((page) => {
            if(obj?.id === page?.id){
              pagesClass = [...pagesClass, page];
            }  
          })
    })
  };
  return pagesClass;
 };

/**
 * auxiliary function to retrieves all properties of Name->Title of class.
 * @param { array[{}] } 
 * @returns { arrayElements[""] } 
 */
 exports.getPropertiesNameTitle = ({array}) => {
  let arrayElements = [];
  for (let index = 0; index < array.length; index++) {
    arrayElements = [...arrayElements, array[index]?.properties.name.title[0].plain_text]; 
  }
  return arrayElements;
};

/**
 * auxiliary function to retrieves all properties of Name->Rich_Text of class.
 * @param { array[{}] } 
 * @returns { arrayElements[""] } 
 */
 exports.getPropertiesQuoteTitle = ({array}) => {
  let arrayElements = [];
  for (let index = 0; index < array.length; index++) {
    arrayElements = [...arrayElements, array[index]?.properties.quote.title[0].plain_text]; 
  }
  return arrayElements;
};

/**
 * auxiliary function to retrieves all properties of other Name->Title of class.
 * @param { array[{}] } 
 * @returns { arrayobjects[""] } 
 */
 exports.getOtherNameTitle = ({array}) => {
  let arrayobjects = [];
  for (let index = 0; index < array.length; index++) {
    arrayobjects = [...arrayobjects, array[index].properties.Name.title[0].plain_text];
  }
  return arrayobjects;
};

 /**
 * auxiliary function to format the date ( "Noviembre 19, 2021" ).
 * @param { date ( 2021-11-19) } 
 * @returns { `Noviembre 19, 2021` } 
 */
  exports.formatDate = (date) => {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    if(date){
    const formatD = date.split('-');
    return `${monthNames[formatD[1]-1]} ${formatD[2]}, ${formatD[0]}`;
    }
    return '';
  }