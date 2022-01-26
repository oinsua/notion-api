require("dotenv").config();
const { Client } = require("@notionhq/client");
const server = require("./helpers/common"); 
/**
 * conection to notion db.
 */
const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Auxiliary function to create JSON Object. Retrieves all the properties of the corresponding relations  
 * @param { list } 
 * @returns { pages[] } 
 */
 const createJsonObject = ({lessons, pagesClass, pagesBlock, pagesWhatStudentsAreSaying, pagesBlockSub, 
                             pagesWpLesson, pagesPPP, pagesScenes}) => {
    /* Get the className property */                        
    const className = server.getPropertiesNameTitle({array: pagesClass});
    /* Get the block property */                        
    const block = server.getPropertiesNameTitle({array: pagesBlock});
    /* Get the blockSub property */                        
    const blockSub = server.getPropertiesNameTitle({array: pagesBlockSub});
    /* Get the wpLesson property */
    const wpLesson = server.getOtherNameTitle({array: pagesWpLesson})
    /* Get the whatStudentsAreSaying property */
    const whatStudentsAreSaying = server.getPropertiesQuoteTitle({array: pagesWhatStudentsAreSaying})
    /* Get the ppp property */
    const ppp = server.getOtherNameTitle({array: pagesPPP});
    /* Get the scenes property */
    const scenes = server.getSceneTitle({array: pagesScenes});

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
        ppp,
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
        goal: lessons[0].properties.goal?.multi_select.length > 0
                        ?  server.getMultiSelectName({array: lessons[0].properties.goal?.multi_select})
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
        scenes,
        blockSub,
        wpLesson,
        comingSoonDate: server.formatDate(lessons[0].properties.comingSoonDate?.date.start),
        undefined: "",
    };
};

 /**
 * function get all the lessons and make the corresponding requests of the related data.
 * @param { databaseId } 
 * @returns { collection: "LESSONS", data: arrayObjects } 
 */
  exports.getLessonPageFromDatabase = async ({lessonId}) => {
    try {
        const pages = [];
      let cursor = undefined
      while (true) {
        const { results, next_cursor } = await notion.databases.query({
          database_id: process.env.NOTION_DB_LESSONS,
          start_cursor: cursor,
          filter: {
              property: 'lessonId',
              formula: {
                  text: {
                      equals: lessonId,
                  },
              },
          }
        })
        pages.push(...results)
        if (!next_cursor) {
          break
        }
        cursor = next_cursor
      }
      console.log(`${pages.length} pages successfully fetched.`)
      let arrayObjects = [];
      let arrayRelation = [];
      let counter = 0;
      // check if the results array contains a supplies
      if (pages.length > 0) {
        const Interval_id = setInterval(() => {
          console.log(counter++);
        }, 1000);
      console.log('lessonId: ', pages[0].properties.lessonId?.formula.string);
       //get all the related data in pageArray[].
      const pagesClass = await server.getPagesFromDatabase({ database_Id: process.env.NOTION_DB_CLASSES, 
                                                        filter: {
                                                        property: 'lessonsId',
                                                        rollup: {
                                                            any: {
                                                                    text: {
                                                                    equals: pages[0].properties.lessonId?.formula.string 
                                                                                ? pages[0].properties.lessonId?.formula.string 
                                                                                : '',
                                                                    } }} }});
      const pagesWhatStudentsAreSaying = await server.getPagesFromDatabase({ database_Id: process.env.NOTION_DB_STUDENTS_REVIEWS,
                                                                        filter: {
                                                                            property: 'lesson_id',
                                                                            rollup: {
                                                                            any: {
                                                                                    text: {
                                                                                        equals: pages[0].properties.lessonId?.formula.string 
                                                                                                    ? pages[0].properties.lessonId?.formula.string 
                                                                                                    : '',
                                                                                    } }} }});

       const block_ID = pages[0].properties.block?.relation;
       const pagesBlock = await server.getPromisesData(block_ID);

       const blockSub_ID = pages[0].properties.blockSub?.relation;
       const pagesBlockSub = await server.getPromisesData(blockSub_ID);

       const wpLesson_ID = pages[0].properties.wpLesson?.relation;
       const pagesWpLesson = await server.getPromisesData(wpLesson_ID);

       const ppp_ID = pages[0].properties.ppp.rollup?.array[0]?.relation;
       const pagesPPP = await server.getPromisesData(ppp_ID);

       const scenes_ID = pages[0].properties.scenes?.relation;
       const pagesScenes = await server.getPromisesData(scenes_ID);

        //Create the lessons Object.
       const lessonObject = createJsonObject({lessons: pages, pagesClass, pagesBlock, pagesWhatStudentsAreSaying, 
                                               pagesBlockSub, pagesWpLesson, pagesPPP, pagesScenes});
        arrayObjects = [...arrayObjects, lessonObject];

        clearInterval(Interval_id);
        //Return the json supplies.
        return {
          collection: "LESSONS",
          data: arrayObjects,
          pageLesson: pages,
          pagesBlock,
          pagesBlockSub,
          pagesWhatStudentsAreSaying,
          pagesWpLesson,
          pagesPPP,
          pagesScenes,
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