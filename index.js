require("dotenv").config();
const { Client } = require("@notionhq/client");
/**
 * conection to notion db.
 */
const notion = new Client({ auth: process.env.NOTION_API_KEY });

/*****************************************************************************************
 * STEPS
 ******************************************************************************************/
/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
exports.getStepsDatabase = async function () {
  const databaseId = process.env.NOTION_DB_STEPS;
  const response = await notion.databases.query({ 
                                                  database_id: databaseId
                                                });
  console.log("response.result: ", response.results.length);
  console.log("response.result[0]: ", response.results[0]);
  const responseResults = response.results.map((page) => {
    return {
      id: page.id,
      description: page.properties.description.rich_text[0]?.plain_text,
      stepNumber: page.properties.stepNumber.title[0]?.plain_text,
      stepId: page.properties.stepId.formula?.plain_text,
      incode: page.properties.incode.rich_text[0]?.plain_text,
      outcode: page.properties.outcode.rich_text[0]?.plain_text,
      AdeenasIdeas: page.properties.AdeenasIdeas.rich_text[0]?.plain_text,
      contentBlockMainId: page.properties.contentBlockMainId.rollup,
      contentBlockSubId: page.properties.contentBlockSubId.rollup,
      classId: page.properties.classId.rollup,
      suppliesId: page.properties.suppliesId.rollup,
    };
  });
  return responseResults;
};

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
 exports.getAllStepsToDatabase = async function () {
  const databaseId = process.env.NOTION_DB_STEPS;
  const pages = []
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
 return pages.map(page => {
    return {
      id: page.id,
      description: page.properties.description.rich_text[0]?.plain_text,
      stepNumber: page.properties.stepNumber.title[0]?.plain_text,
      incode: page.properties.incode.rich_text[0]?.plain_text,
      outcode: page.properties.outcode.rich_text[0]?.plain_text,
      contentBlockMainId: page.properties.contentBlockMainId.rollup.array[0],
      contentBlockSubId: page.properties.contentBlockSubId.rollup.array[0],
      classId: page.properties.classId.rollup.array[0].select.name,
      suppliesId: page.properties.suppliesId.rollup.array[0],
    }
  }) 
}

/*****************************************************************************************
 * CLASSES
 ******************************************************************************************/
/**
 * Gets pages from the Notion database.
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
 exports.getClassesDatabase = async function () {
  const databaseId = process.env.NOTION_DB_CLASSES;
  const response = await notion.databases.query({ 
                                                  database_id: databaseId
                                                });
  console.log("response.result: ", response.results.length);
  const responseResults = response.results.map((page) => {
    return {
      id: page.id,
    };
  });
  return responseResults;
}; 

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
 exports.getAllClassesToDatabase = async function () {
  const databaseId = process.env.NOTION_DB_CLASSES;
  const pages = []
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
 return pages.map(page => {
    return {
      id: page.id,
    }
  }) 
}
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

const getProperties = ({array}) => {
   let elements = [];
   if(array.length > 1){
      for (const item of array) {
        elements.push(item.name)
      }
    }  else if(array.length === 1){
          elements = array[0].name;
    } else{ elements = '';}
 return elements;
};

const getPropertiesNameTitle = ({array}) => {
    let arrayElements = [];
    if(array.length > 10){
      for (let index = 0; index < 10; index++) {
        arrayElements = [...arrayElements, array[index].properties.name.title[0].plain_text]; 
      }
      arrayElements = [...arrayElements, `${array.length - 10} more…`];
    } else{
      for (const item of array) {
        arrayElements = [...arrayElements, item.properties.name.title[0].plain_text];
      }
    }
    return arrayElements;
};

const getLessons = ({lessonss}) => {
   let arrayLessons = [];
   if(lessonss.length > 10){
     for (let index = 0; index < 10; index++) {
       arrayLessons = [...arrayLessons, lessonss[index].properties.name.rich_text[0].plain_text];
     }
     arrayLessons = [...arrayLessons, `${lessonss.length - 10} more…`]
   }else{
     for (const item of lessonss) {
       arrayLessons = [...arrayLessons, item.properties.name.rich_text[0].plain_text];
     }
   }
   return arrayLessons;
};

const getLessonIds = ({array}) => {
  let arrayLessonIds = [];
  for (const item of array) {
    arrayLessonIds = [...arrayLessonIds, item.formula.string];
  }
  return arrayLessonIds;
};

const getTechniques = ({techniquess}) => {
  let arraytechniques = [];
  if(techniquess.length > 10){
    for (let index = 0; index < 10; index++) {
      arraytechniques = [...arraytechniques, techniquess[index].properties.techniqueId.title[0].plain_text];
    }
    arraytechniques = [...arraytechniques, `${techniquess.length - 10} more…`]
  }else{
    for (const item of techniquess) {
      arraytechniques = [...arraytechniques, item.properties.techniqueId.title[0].plain_text];
    }
  }
  return arraytechniques;
};

const getOtherNameTitle = ({array}) => {
  let arrayobjects = [];
  if(array.length > 10){
    for (let index = 0; index < 10; index++) {
      arrayobjects = [...arrayobjects, array[index].properties.Name.title[0].plain_text];
    }
    arrayobjects = [...arrayobjects, `${array.length - 10} more…`]
  }else{
    for (const item of array) {
      arrayobjects = [...arrayobjects, item.properties.Name.title[0].plain_text];
    }
  }
  return arrayobjects;
};

const getDisplayGroupItems = ({displayGroupItemss}) => {
  let arrayItems = [];
  if(displayGroupItemss.length > 10){
    for (let index = 0; index < 10; index++) {
      arrayItems = [...arrayItems, displayGroupItemss[index].properties.title.rich_text[0].plain_text];
    }
    arrayItems = [...arrayItems, `${displayGroupItemss.length - 10} more…`]
  }else{
    for (const item of displayGroupItemss) {
      arrayItems = [...arrayItems, item.properties.title.rich_text[0].plain_text];
    }
  }
  return arrayItems;

};

const createJsonObject = ({classes, lessonss, chefs, dishess, displayGroupItemss, 
                           shorthands, suppliess, techniquess, objectss, wpLessonss }) => {
    /* Get the metaTags property */
    const metaTags = getProperties({array: classes[0].properties.metaTags.multi_select});
    /* Get the cuisineTags property */
    const cuisineTags = getProperties({array: classes[0].properties.cuisineTags.multi_select})
    /* Get the location property */
    const location = getProperties({array: classes[0].properties.location.rollup.array[0].multi_select})
    /* Get the dishes property */
    const dishes = getPropertiesNameTitle({array: dishess});
    /* Get the lessons property */
    const lessons = getLessons({lessonss});
    /* Get the lessonIds property */
    const lessonsId = getLessonIds({array: classes[0].properties.lessonsId.rollup.array});
    /* Get the shorthand property */
    const shorthand = getPropertiesNameTitle({array: shorthands});
    /* Get the supplies property */
    const supplies = getProperties({array: suppliess});
    /* Get the techniques property */
    const techniques = getTechniques({techniquess});
    /* Get the objects property */
    const objects = getOtherNameTitle({array: objectss});
    /* Get the wpLessons property */
    const wpLessons = getOtherNameTitle({array: wpLessonss});
    /* Get the displayGroupItems property */
    const displayGroupItems = getDisplayGroupItems({displayGroupItemss});

  return {
          classId: classes[0].properties.classId.select.name,
          order: classes[0].properties.order.number,
          name: chefs[0].properties.name.title[0].plain_text,
          title: classes[0].properties.title.rich_text[0].plain_text,
          description: classes[0].properties.description.rich_text[0].plain_text,
          pppChef: classes[0].properties.name.title[0].plain_text,
          metaTags,
          cuisineTags,
          permissions: classes[0].properties.permissions.select.name,
          classHours: classes[0].properties.classHours.number,
          comingLater: classes[0].properties.comingLater.checkbox,
          hidden: classes[0].properties.hidden.checkbox,
          location,
          ppp: [],
          scenes: ["An introduction to chef Edward Lee's story.","YesChef logo."],
          chefId: classes[0].properties.chefId.rollup.array[0].formula.string,
          chefClass: classes[0].properties.name.title[0].plain_text,
          photo: '',
          productionDates: `${classes[0].properties.productionDates.date.start} → ${classes[0].properties.productionDates.date.end}`,
          dishes,
          steps: [],
          lessons,
          lessonsId,
          shorthand,
          supplies,
          techniques,
          staging: classes[0].properties.staging.checkbox,
          comingSoon: classes[0].properties.comingSoon.checkbox,
          trailer: "",
          objects,
          wpLessons,
          descriptionShort: classes[0].properties.descriptionShort.rich_text[0].plain_text,
          displayGroupItems,
          pdfExist: classes[0].properties.pdfExist.checkbox,
          pdfLink: classes[0].properties.pdfLink.formula.string,
          pdfLinkShort: classes[0].properties.pdfLinkShort.url,
          pdfName: classes[0].properties.pdfName.rich_text[0].plain_text,
          undefined: "",
    }
};

exports.findClassById = async ({ classId }) => {
  const databaseId = process.env.NOTION_DB_CLASSES;
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: {
              property: 'classId',
              select: {
                equals : classId,
              },
      },
    });
    // check if the results array contains a user
    if (results.length > 0) {
      const lessons_ID = results[0].properties.lessons.relation;
      const pagesLesson = await getPromisesData(lessons_ID);

      const chefClass_ID = results[0].properties.chefClass.relation;
      const pagesChefs = await getPromisesData(chefClass_ID);

      const dishes_ID = results[0].properties.dishes.relation;
      const pagesDishes = await getPromisesData(dishes_ID);

      const display_Groups_ID = results[0].properties.displayGroupItems.relation;
      const pagesDisplayGroups = await getPromisesData(display_Groups_ID);

      const shortHands_ID = results[0].properties.shorthand.relation;
      const pagesShortHands = await getPromisesData(shortHands_ID);

      const supplies_ID = results[0].properties.supplies.relation;
      const pagesSupplies = await getPromisesData(supplies_ID);
      
      const techniques_ID = results[0].properties.techniques.relation;
      const pagesTechniques = await getPromisesData(techniques_ID);

      const objects_ID = results[0].properties.objects.relation;
      const pagesObjects = await getPromisesData(objects_ID);

      const wpLessons_ID = results[0].properties.wpLessons.relation;
      const pagesWpLessons = await getPromisesData(wpLessons_ID);

      const classObject = createJsonObject({classes: results, lessonss: pagesLesson, chefs: pagesChefs,
                                            dishess: pagesDishes, displayGroupItemss: pagesDisplayGroups,
                                            shorthands: pagesShortHands, suppliess: pagesSupplies, 
                                            techniquess: pagesTechniques, objectss:  pagesObjects, wpLessonss: pagesWpLessons});
      return classObject; /* {
        classInDB: true,
        classId: results[0].properties.classId.select.name,
        classes: results,
        lessons: pagesLesson || [{}],
        chefs: pagesChefs || [{}],
        dishes: pagesDishes || [{}],
        displayGroupItems: pagesDisplayGroups,
        shorthand: pagesShortHands,
        supplies: pagesSupplies,
        techniques: pagesTechniques,
        objects: pagesObjects,
        wpLessons: pagesWpLessons,
      }; */  
    }
    return {
      classInDB: false,
      classes: results
    };
  } catch (error) {
    console.log(error);
  }
};

exports.getAllPageFromDatabase = async (databaseId, prefixNumbers) => {
  let allPages= [];

  const getPages = async (cursor) => {
    const requestPayload = {
      path: `databases/${databaseId}/query`,
      method: "post",
      body: {
        filter: {
          or: prefixNumbers.map(prefix => {
            return {
              property: "Name",
              text: {
                starts_with: `${String(prefix)}-`,
              },
            };
          }),
        },
      },
    };
    if (cursor) requestPayload.body = { start_cursor: cursor };
    let pages = null;
    try {
      pages = (await this.notion.request(
        requestPayload
      ));
    } catch (e) {
      throw e;
    }

    for (const page of pages.results) {
      if (page.archived) continue;
      allPages.push(page);
      console.log(page.url);
    }
    if (pages.has_more) {
      await getPages(pages.next_cursor ?? undefined);
    }
  };
  await getPages();
  return allPages;
}