require("dotenv").config();
const { Client } = require("@notionhq/client");
const {queryClass} = require('../common');
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
 * auxiliary function to retrieves all properties of class.
 * @param { array[{}] } 
 * @returns { elements[""] } 
 */
const getProperties = ({array}) => {
    let elements = [];
    if(array?.length > 1){
       for (const item of array) {
         elements.push(item.name)
       }
     }  else if(array?.length === 1){
           elements = array[0].name;
     } else{ elements = '';}
  return elements;
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
 * auxiliary function to retrieves all properties of lessons Id of class.
 * @param { array[{}] } 
 * @returns { arrayLessonIds[""] } 
 */
 const getLessons = ({lessonss}) => {
    let arrayLessons = [];
    for (let index = 0; index < lessonss.length; index++) {
     arrayLessons = [...arrayLessons, lessonss[index].properties.lesson_num?.title[0]?.plain_text];
   }
    return arrayLessons;
 };
 
/**
 * auxiliary function to retrieves all properties of lessons Id of class.
 * @param { array[{}] } 
 * @returns { arrayLessonIds[""] } 
 */
 const getLessonIds = ({array}) => {
   let arrayLessonIds = [];
   for (const item of array) {
     arrayLessonIds = [...arrayLessonIds, `${item.formula.string}`];
   }
   return arrayLessonIds;
 };
 
 /**
 * auxiliary function to retrieves all properties of techniques of class.
 * @param { techniquess[{}] } 
 * @returns { arraytechniques[""] } 
 */
 const getTechniques = ({techniquess}) => {
   let arraytechniques = [];
   for (let index = 0; index < techniquess.length; index++) {
     arraytechniques = [...arraytechniques, techniquess[index].properties.techniqueId.title[0].plain_text];
   }
   return arraytechniques;
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
 * auxiliary function to retrieves all display group items of class.
 * @param { displayGroupItemss[{}] } 
 * @returns { arrayItems[""] } 
 */
 const getDisplayGroupItems = ({displayGroupItemss}) => {
   let arrayItems = [];
   for (let index = 0; index < displayGroupItemss.length ; index++) {
     arrayItems = [...arrayItems, displayGroupItemss[index]?.properties.internalName.title[0].plain_text];
   }
   return arrayItems;
 };
 
 /**
 * auxiliary function to retrieves all scenes of class.
 * @param { scenes ( [{}] ) } 
 * @returns { arrayItems[""] } 
 */
 const getScenes = ({sceness}) => {
   let arrayItems = [];
   for (let index = 0; index < sceness.length ; index++) {
     arrayItems = [...arrayItems, sceness[index]?.properties['scene*']?.title[0]?.plain_text];
   }
   return arrayItems;
 };
 
 /**
 * auxiliary function to retrieves all steps of class.
 * @param { stepss ( [{}] ) } 
 * @returns { arrayItems[""] } 
 */
 const getSteps = ({stepss}) => {
   let arrayItems = [];
   for (let index = 0; index < stepss.length ; index++) {
     arrayItems = [...arrayItems, stepss[index]?.properties.stepNumber?.title[0]?.plain_text];
   }
   return arrayItems;
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
 * Auxiliary function to create JSON Object. Retrieves all the properties of the corresponding relations  
 * @param { list } 
 * @returns { pages[] } 
 */
const createJsonObject = ({classes, lessonss, chefs, dishess, displayGroupItemss, sceness,
            shorthands, stepss, suppliess, techniquess, objectss, wpLessonss }) => {
        /* Get the metaTags property */
        const metaTags = getProperties({array: classes[0].properties.metaTags.multi_select});
        /* Get the cuisineTags property */
        const cuisineTags = getProperties({array: classes[0].properties.cuisineTags.multi_select})
        /* Get the location property */
        const location = getProperties({array: classes[0].properties.location.rollup.array[0]?.multi_select})
        /* Get the dishes property */
        const dishes = getPropertiesNameTitle({array: dishess});
        /* Get the lessons property */
        const lessons = getLessons({lessonss});
        /* Get the lessonIds property */
        const lessonsId = getLessonIds({array: classes[0].properties.lessonsId.rollup.array});
        /* Get the scenes property */
        const scenes = getScenes({sceness});
        /* Get the shorthand property */
        const shorthand = getPropertiesNameTitle({array: shorthands});
        /* Get the supplies property */
        const steps = getSteps({stepss});
        /* Get the supplies property */
        const supplies = getPropertiesNameTitle({array: suppliess});
        /* Get the techniques property */
        const techniques = getTechniques({techniquess});
        /* Get the objects property */
        const objects = getOtherNameTitle({array: objectss});
        /* Get the wpLessons property */
        const wpLessons = getOtherNameTitle({array: wpLessonss});
        /* Get the displayGroupItems property */
        const displayGroupItems = getDisplayGroupItems({displayGroupItemss});

        return {
        classId: classes[0].properties.classId?.select.name
            ? classes[0].properties.classId?.select.name
            : '',
        order: classes[0].properties.order?.number
            ? classes[0].properties.order?.number
            : '',
        name: classes[0].properties.name.title[0]?.plain_text
        ? classes[0].properties.name.title[0]?.plain_text
        : '',
        title: classes[0].properties.title.rich_text[0]?.plain_text
        ? classes[0].properties.title.rich_text[0]?.plain_text
        : '',
        description: classes[0].properties.description.rich_text[0]?.plain_text
                ? classes[0].properties.description.rich_text[0]?.plain_text
                : '',
        pppChef: classes[0].properties.name.title[0]?.plain_text 
            ? classes[0].properties.name.title[0]?.plain_text
            : '',
        metaTags,
        cuisineTags,
        permissions: classes[0].properties.permissions?.select.name
                ? classes[0].properties.permissions?.select.name
                : '',
        classHours: classes[0].properties.classHours?.number
                ? classes[0].properties.classHours?.number
                : '',
        comingLater: classes[0].properties.comingLater.checkbox
            ? classes[0].properties.comingLater.checkbox
            : '',
        hidden: classes[0].properties.hidden.checkbox
            ? classes[0].properties.hidden.checkbox
            : '',
        location,
        ppp: "",
        scenes,
        chefId: classes[0].properties.chefId.rollup.array[0]?.formula.string
            ? classes[0].properties.chefId.rollup.array[0]?.formula.string
            : '',
        chefClass: classes[0].properties.name.title[0]?.plain_text
            ? classes[0].properties.name.title[0]?.plain_text
            : '',
        photo: '',
        productionDates: classes[0].properties.productionDates?.date.start 
            ? 
            `${formatDate(classes[0].properties.productionDates?.date.start)} → ${formatDate(classes[0].properties.productionDates?.date.end)}`
            :
                '',
        dishes,
        steps,
        lessons,
        lessonsId,
        shorthand,
        supplies,
        techniques,
        staging: classes[0].properties.staging.checkbox 
            ? classes[0].properties.staging.checkbox
            : '',
        comingSoon: classes[0].properties.comingSoon.checkbox
            ? classes[0].properties.comingSoon.checkbox
            : '',
        trailer: "",
        objects,
        wpLessons,
        descriptionShort: classes[0].properties.descriptionShort.rich_text[0]?.plain_text 
                    ? classes[0].properties.descriptionShort.rich_text[0]?.plain_text
                    : '',
        displayGroupItems,
        pdfExist: classes[0].properties.pdfExist.checkbox
            ? classes[0].properties.pdfExist.checkbox
            : '',
        pdfLink: classes[0].properties.pdfLink.formula.string
            ? classes[0].properties.pdfLink.formula.string
            : '',
        pdfLinkShort: classes[0].properties.pdfLinkShort?.url
                ? classes[0].properties.pdfLinkShort?.url
                : '',
        pdfName: classes[0].properties.pdfName.rich_text[0]?.plain_text
            ? classes[0].properties.pdfName.rich_text[0]?.plain_text
            : '',
        undefined: "",
        }
};

/**
 * function get all the classes and make the corresponding requests of the related data.
 * @param { databaseId } 
 * @returns { collection: "CLASSES", data: arrayObjects } 
 */
exports.getAllClassesFromDatabase = async ({databaseId}) => {
    try {
      const pages = [];
      let cursor = undefined
      while (true) {
        const { results, next_cursor } = await notion.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
          filter: {
            or:queryClass,
           },
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
           if(item.properties.classId.select.name){
                const filter = {
                  property: 'classId',
                  rollup: {
                    any: {
                            select: {
                              equals: item.properties.classId.select.name,
                            }
                          }
                    }
                };
              //get all the related data in pageArray[].
              const pagesLesson = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_LESSONS, filter});
              const pagesChefs = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_CHEFS, filter});
              const pagesDishes = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_CONTENT_BLOCKS, filter });
              const pagesDisplayGroups = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_DISPLAY_GROUP_ITEMS, filter});
              const pageScenes = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_SCENES, filter});
              const pagesShortHands = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_SHORTHANDS, filter});
              const pagesSteps = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_STEPS, filter});
              const pagesSupplies = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_SUPPLIES, filter});
              const pagesTechniques = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_TECHNIQUES, filter});
              
              const objects_ID = item.properties.objects.relation;
              const pagesObjects = await getPromisesData(objects_ID);
    
              const wpLessons_ID = item.properties.wpLessons.relation;
              const pagesWpLessons = await getPromisesData(wpLessons_ID);
            //Create the class Object.
              const classObject = createJsonObject({classes: [item], lessonss: pagesLesson, chefs: pagesChefs,
                dishess: pagesDishes, displayGroupItemss: pagesDisplayGroups, sceness: pageScenes,
                shorthands: pagesShortHands, stepss: pagesSteps, suppliess: pagesSupplies, 
                techniquess: pagesTechniques, objectss:  pagesObjects, wpLessonss: pagesWpLessons});
              arrayObjects = [...arrayObjects, classObject];
           }
        }
        //Return the json classes.
        return {
          collection: "CLASSES",
          data: arrayObjects
        }; 
      }
      return {
        classInDB: false,
        classes: pages
      };
    } catch (error) {
      console.log(error);
    }
  };