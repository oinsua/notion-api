require("dotenv").config();
const { Client } = require("@notionhq/client");

/**
 * conection to notion db.
 */
 const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * auxiliary function to make request and to get response
 * @param { id } 
 * @returns { response }  
 */
  const getPages = async function ({id}) {
    try {
      const response = await notion.pages.retrieve({page_id: id})
      return response;
    } catch (error) {
      console.log(error);
    }
}

 /**
 * auxiliary function to create many promises to get all pages.
 * @param { list } 
 * @returns { pages[] } 
 */
 const getPromisesData = async function (list) {
    const promises = [];
    const pages = [];
    try {
      if(list?.length > 0){
        list.map(async (item, index) => {( promises[index] = getPages({id: item.id}))});
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
 const getPagesFromDatabase = async ({filter, database_Id}) => {
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
 * auxiliary function to retrieves all properties of Name->Title of class.
 * @param { array[{}] } 
 * @returns { arrayElements[""] } 
 */
 const getPropertiesNameTitle = ({array}) => {
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
 const getPropertiesQuoteTitle = ({array}) => {
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
 const getOtherNameTitle = ({array}) => {
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
  const formatDate = (date) => {
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

/**
 * Auxiliary function to create JSON Object. Retrieves all the properties of the corresponding relations  
 * @param { list } 
 * @returns { pages[] } 
 */
 const createJsonObject = ({lessons, classes, blocks, whatStudentsAreSayings, blockSubs, wpLessons }) => {
    /* Get the className property */                        
    const className = getPropertiesNameTitle({array: classes});
    /* Get the block property */                        
    const block = getPropertiesNameTitle({array: blocks});
    /* Get the blockSub property */                        
    const blockSub = getPropertiesNameTitle({array: blockSubs});
    /* Get the wpLesson property */
    const wpLesson = getOtherNameTitle({array: wpLessons})
    /* Get the whatStudentsAreSaying property */
    const whatStudentsAreSaying = getPropertiesQuoteTitle({array: whatStudentsAreSayings})

    /* Get the lessons property */
    return {
        lesson_num: lessons[0].properties.lesson_num.title[0]?.plain_text
                      ? lessons[0].properties.lesson_num.title[0]?.plain_text
                      : '',
        lesson_order: lessons[0].properties.lesson_order?.number
                        ? lessons[0].properties.lesson_order?.number
                        : '',
        title: lessons[0].properties.name.rich_text[0]?.plain_text 
                   ? lessons[0].properties.name.rich_text[0]?.plain_text
                   : '',
        ppp: [],
        hidden: lessons[0].properties.hidden?.checkbox
                    ? lessons[0].properties.hidden?.checkbox
                    : '',
        permissions: lessons[0].properties.permissions?.select.name
                        ? lessons[0].properties.permissions?.select.name
                        : '', 
        overviewPermissions: lessons[0].properties.overviewPermissions?.select.name
                                ? lessons[0].properties.overviewPermissions?.select.name
                                : '',
        supplyPermissions: lessons[0].properties.supplyPermissions?.select.name
                                ? lessons[0].properties.supplyPermissions?.select.name
                                : '',
        shorthandPermissions: lessons[0].properties.shorthandPermissions?.select.name
                                ? lessons[0].properties.shorthandPermissions?.select.name
                                : '',
        stepsPermissions: lessons[0].properties.stepsPermissions?.select.name
                                ? lessons[0].properties.stepsPermissions?.select.name
                                : '',
        comingSoon: lessons[0].properties.comingSoon?.checkbox
                                ? lessons[0].properties.comingSoon?.checkbox
                                : '',
        name: lessons[0].properties.name.rich_text[0]?.plain_text 
                        ? lessons[0].properties.name.rich_text[0]?.plain_text
                        : '',
        lessonId: lessons[0].properties.lessonId?.formula.string
                        ? lessons[0].properties.lessonId?.formula.string
                        : '',
        class: className,
        goal: lessons[0].properties.goal?.multi_select
                        ? lessons[0].properties.goal?.multi_select
                        : '',
        theme: "",
        block,
        classId: lessons[0].properties.classId.rollup?.array[0].select.name
                      ? lessons[0].properties.classId.rollup?.array[0].select.name
                      : '',
        contentBlockId: lessons[0].properties.contentBlockId.rollup?.array[0]?.formula.string
                            ? lessons[0].properties.contentBlockId.rollup?.array[0]?.formula.string
                            : '',
        thumbnail: "",
        whatStudentsAreSaying,
        scenes: "",
        blockSub,
        wpLesson,
        comingSoonDate: formatDate(lessons[0].properties.comingSoonDate?.date.start),
        undefined: "",
    };
};

/**
 * function get all the lessons and make the corresponding requests of the related data.
 * @param { databaseId } 
 * @returns { collection: "LESSONS", data: arrayObjects } 
 */
 exports.getAllLessonsFromDatabase = async ({databaseId}) => {
    try {
        const pages = [];
      let cursor = undefined
      while (true) {
        const { results, next_cursor } = await notion.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
        })
        pages.push(...results)
        if (!next_cursor) {
          break
        }
        cursor = next_cursor
      }
      console.log(`${pages.length} pages successfully fetched.`)
      let arrayObjects = [];
      // check if the results array contains a class
      if (pages.length > 0) {
        for (const item of pages) {
          console.log('lessonId: ', item.properties.lessonId?.formula.string);
              //get all the related data in pageArray[].
              const pagesClass = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_CLASSES, 
                                                               filter: {
                                                                  property: 'lessonsId',
                                                                  rollup: {
                                                                    any: {
                                                                            text: {
                                                                              equals: item.properties.lessonId?.formula.string 
                                                                                          ? item.properties.lessonId?.formula.string 
                                                                                          : '',
                                                                            } }} }});
              const pagesWhatStudentsAreSaying = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_STUDENTS_REVIEWS,
                                                                                  filter: {
                                                                                    property: 'lesson_id',
                                                                                    rollup: {
                                                                                      any: {
                                                                                              text: {
                                                                                                equals: item.properties.lessonId?.formula.string 
                                                                                                            ? item.properties.lessonId?.formula.string 
                                                                                                            : '',
                                                                                              } }} }});

              const block_ID = item.properties.block?.relation;
              const pagesBlock = await getPromisesData(block_ID);

              const blockSub_ID = item.properties.blockSub?.relation;
              const pagesBlockSub = await getPromisesData(blockSub_ID);

              const wpLesson_ID = item.properties.wpLesson?.relation;
              const pagesWpLesson = await getPromisesData(wpLesson_ID);

            //Create the lessons Object.
              const lessonObject = createJsonObject({lessons: [item], classes: pagesClass, blocks: pagesBlock, 
                                                        whatStudentsAreSayings: pagesWhatStudentsAreSaying, 
                                                        blockSubs: pagesBlockSub, wpLessons: pagesWpLesson});
              arrayObjects = [...arrayObjects, lessonObject];
        }
        //Return the json classes.
        return {
          collection: "LESSONS",
          data: arrayObjects
        }; 
      }
      return {
        classInDB: false,
        classes: pages
      };
    } catch (error) {
        console.log(error)
    }
 };

