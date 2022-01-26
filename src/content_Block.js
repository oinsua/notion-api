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
 const createJsonObject = ({blocks,/*  pagesSupplies, pagesShorthand, pagesSteps, pagesChildBlocks, 
                            pagesHowTo,  pagesPPP, pagesPulls, pagesScenes, pagesTechniques, 
                            pagesTerms, pagesWpLessons */}) => {

    /* Get the lessons property */
    return {
        lesson: blocks[0].properties.lessonExport.rich_text[0]?.plain_text
                       ? blocks[0].properties.lessonExport.rich_text[0]?.plain_text
                       : '',
        lessonSubs: '',
        codeName: blocks[0].properties.codeName.rich_text[0]?.plain_text
                        ? blocks[0].properties.codeName.rich_text[0]?.plain_text
                        : '',
        codeNameClass: blocks[0].properties.codeNameClass.rich_text[0]?.plain_text
                        ? blocks[0].properties.codeNameClass.rich_text[0]?.plain_text
                        : '',
        brightcoveVideoId: blocks[0].properties.brightcoveVideoId.rich_text[0]?.plain_text
                        ? blocks[0].properties.brightcoveVideoId.rich_text[0]?.plain_text
                        : '',
        name: blocks[0].properties.name.title[0]?.plain_text
                        ? blocks[0].properties.name.title[0]?.plain_text
                        : '',
        vimeoHLSUrlOld: blocks[0].properties.vimeoHLSUrlOld.url
                        ? blocks[0].properties.vimeoHLSUrlOld.url
                        : '',
        ppp: '[]',
        description: blocks[0].properties.description.rich_text[0]?.plain_text
                        ? blocks[0].properties.description.rich_text[0]?.plain_text
                        : '',
        tags: blocks[0].properties.tags.multi_select.length > 0
                        ?  server.getMultiSelectName({array: blocks[0].properties.tags.multi_select})
                        : '',
        videoStage: blocks[0].properties.videoStage.select.name
                        ? blocks[0].properties.videoStage.select.name
                        : '',
        videoUrl: blocks[0].properties.videoUrl.url
                        ? blocks[0].properties.videoUrl.url
                        : '',
        vimeoUrl: blocks[0].properties.vimeoUrl.url
                        ? blocks[0].properties.vimeoUrl.url
                        : '',
        techniques: '[]',
        child: '[]',
        status: blocks[0].properties.status.select.name
                        ? blocks[0].properties.status.select.name
                        : '',
        family: blocks[0].properties.family.formula.string
                        ? blocks[0].properties.family.formula.string
                        : '',
        order: blocks[0].properties.order.number
                        ? blocks[0].properties.order.number
                        : '',
        type: blocks[0].properties.type.select.name
                        ? blocks[0].properties.type.select.name
                        : '',
        parent: blocks[0].properties.parent.relation
                        ? blocks[0].properties.parent.relation
                        : '',
        contentBlockId: blocks[0].properties.contentBlockId.formula.string
                        ? blocks[0].properties.contentBlockId.formula.string
                        : '',
        parentId: blocks[0].properties.parentId.rollup.array[0]?.text[0]?.plain_text
                        ? blocks[0].properties.parentId.rollup.array[0]?.text[0]?.plain_text
                        : '',
        childId: '[]',
        backstory: blocks[0].properties.backstory.rich_text[0]?.plain_text
                        ? blocks[0].properties.backstory.rich_text[0]?.plain_text
                        : '',
        servingSize: blocks[0].properties.servingSize.number
                        ? blocks[0].properties.servingSize.number
                        : '',
        suppliesSub: ['relation'],
        duration: blocks[0].properties.duration.rich_text[0]?.plain_text
                        ? blocks[0].properties.duration.rich_text[0]?.plain_text
                        : '',
        supplies: '[]',
        stepsMain: '[]',
        cuisine: blocks[0].properties.cuisine.multi_select?.length > 0
                        ?  server.getMultiSelectName({array: blocks[0].properties.cuisine.multi_select})
                        : '',
        dietary: blocks[0].properties.dietary.multi_select?.length > 0
                        ?  server.getMultiSelectName({array: blocks[0].properties.dietary.multi_select})
                        : '',
        shorthandMain: '[]',
        shorthandDishSub: ['relation'],
        suppliesId: '[]',
        class: '',
        classId: blocks[0].properties.classId.rollup.array[0]?.select.name
                        ? blocks[0].properties.classId.rollup.array[0]?.select.name
                        : '',
        stepsDishSub: ['relation'],
        handsOnTime: blocks[0].properties.handsOnTime.number
                        ? blocks[0].properties.handsOnTime.number
                        : '',
        totalTime: blocks[0].properties.totalTime.number
                        ? blocks[0].properties.totalTime.number
                        : '',
        timeComment: blocks[0].properties.timeComment.rich_text[0]?.plain_text
                        ? blocks[0].properties.timeComment.rich_text[0]?.plain_text
                        : '',
        permissions: '',
        pulls: '[]',
        scenes: '[]',
        vimeoHLSUrl: blocks[0].properties.vimeoHLSUrl.formula.string
                        ? blocks[0].properties.vimeoHLSUrl.formula.string
                        : '',
        pdfName: blocks[0].properties.pdfName.formula.string
                        ? blocks[0].properties.pdfName.formula.string
                        : '',
        pdfRelativePathLesson: blocks[0].properties.pdfRelativePathLesson.formula.string
                        ? blocks[0].properties.pdfRelativePathLesson.formula.string
                        : '',
        pdfRelativePath: blocks[0].properties.pdfRelativePath.rollup.array[0]?.formula.string
                        ? blocks[0].properties.pdfRelativePath.rollup.array[0]?.formula.string
                        : '',
        undefined: '',
                        
    };
};

 /**
 * function get all the BLOCK and make the corresponding requests of the related data.
 * @param { blockId } 
 * @returns { collection: "CONTENT_BLOCKS", data: arrayObjects } 
 */
  exports.getBlockDataFromDatabase = async ({lessonId}) => {
    let Interval_id = 0;
    try {
        const pages = [];
      let cursor = undefined
      while (true) {
        const { results, next_cursor } = await notion.databases.query({
          database_id: process.env.NOTION_DB_CONTENT_BLOCKS,
          start_cursor: cursor,
          filter: {
            property: 'lessonId',
                rollup: {
                any: {
                        text: {
                            equals: lessonId,
                        }
                        }
                }
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
      let counter = 0;
      // check if the results array contains a supplies
      if (pages.length > 0) {
        Interval_id = setInterval(() => {
          console.log(counter++);
        }, 1000);
      console.log('blockId: ', pages[0].properties.contentBlockId.formula.string);
      const filter = {
                    property: 'contentBlockMainId',
                    rollup: {
                    any: {
                            text: {
                                equals: pages[0].properties.contentBlockId.formula.string 
                                            ? pages[0].properties.contentBlockId.formula.string 
                                            : '',
                        } }} 
                     };
       //get all the related data in pageArray[].
      const pagesSupplies = await server.getPagesFromDatabase({ database_Id: process.env.NOTION_DB_SUPPLIES, filter});
      const pagesShorthand = await server.getPagesFromDatabase({ database_Id: process.env.NOTION_DB_SHORTHANDS, filter});
      const pagesSteps = await server.getPagesFromDatabase({ database_Id: process.env.NOTION_DB_STEPS, filter});
      

       const child_ID = pages[0].properties.child.relation;
       const pagesChildBlocks = await server.getPromisesData(child_ID);

       const howTo_ID = pages[0].properties.howTo.relation;
       const pagesHowTo = await server.getPromisesData(howTo_ID);

       const ppp_ID = pages[0].properties.ppp.relation;
       const pagesPPP = await server.getPromisesData(ppp_ID);

       const pulls_ID = pages[0].properties.pulls.relation;
       const pagesPulls = await server.getPromisesData(pulls_ID);

       const scenes_ID = pages[0].properties.scenes?.relation;
       const pagesScenes = await server.getPromisesData(scenes_ID);

       const techniques_ID = pages[0].properties.techniques.relation;
       const pagesTechniques = await server.getPromisesData(techniques_ID);

       const terms_ID = pages[0].properties.terms.relation;
       const pagesTerms = await server.getPromisesData(terms_ID);

       const wpLessons_ID = pages[0].properties.wpLessons.relation;
       const pagesWpLessons = await server.getPromisesData(wpLessons_ID);

        //Create the lessons Object.
       const blockObject = createJsonObject({blocks: pages, pagesSupplies, pagesShorthand, pagesSteps, pagesChildBlocks, 
                                              pagesHowTo,  pagesPPP, pagesPulls, pagesScenes, pagesTechniques, 
                                              pagesTerms, pagesWpLessons});
        arrayObjects = [...arrayObjects, blockObject];

        clearInterval(Interval_id);
        //Return the json supplies.
        return {
          collection: "CONTENT_BLOCKS",
          data: arrayObjects,
          pageBlock: pages,
          pagesSupplies,
          pagesShorthand,
          pagesSteps,
          pagesChildBlocks,
          pagesHowTo,
          pagesPPP,
          pagesPulls,
          pagesScenes,
          pagesTechniques,
          pagesTerms,
          pagesWpLessons,
        }; 
    }
    } catch (error) {
        console.log(error);
        clearInterval(Interval_id);
    }
 };