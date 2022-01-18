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
      list.map(async (item, index) => {( promises[index] = getPages({id: item.id}))});
         await Promise.allSettled(promises).
         then((res) => { res.forEach((res) => {
                                             pages.push(res.value)
                                            });
                        }
              );
      return pages;
    } catch (error) {
      console.log(error);
    }
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
 const createJsonObject = ({lessons, blocks}) => {
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
        class: [" relation Id"],
        goal: lessons[0].properties.goal?.multi_select
                        ? lessons[0].properties.goal?.multi_select
                        : '',
        theme: [" relation Id"],
        block: ["relation Id"],
        classId: lessons[0].properties.classId.rollup?.array[0].select.name
                      ? lessons[0].properties.classId.rollup?.array[0].select.name
                      : '',
        contentBlockId: lessons[0].properties.contentBlockId.rollup?.array[0]?.formula.string
                            ? lessons[0].properties.contentBlockId.rollup?.array[0]?.formula.string
                            : '',
        thumbnail: "",
        whatStudentsAreSaying: ["relation Id"],
        scenes: ["relation Id"],
        blockSub: ["relation Id"],
        wpLesson: ["relation Id"],
        comingSoonDate: formatDate(lessons[0].properties.comingSoonDate?.date.start),
        undefined: "",
        blocks,
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
              //get all the related data in pageArray[].
              const block_ID = item.properties.block.relation;
              const pagesBlock = await getPromisesData(block_ID);
              /* const whatStudentsAreSaying_ID = item.properties.whatStudentsAreSaying.relation;
              const pageswhatStudentsAreSaying = await getPromisesData(whatStudentsAreSaying_ID);
    
              const wpLessons_ID = item.properties.wpLessons.relation;
              const pagesWpLessons = await getPromisesData(wpLessons_ID); */
            //Create the lessons Object.
              const lessonObject = createJsonObject({lessons: [item], blocks: pagesBlock});
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

