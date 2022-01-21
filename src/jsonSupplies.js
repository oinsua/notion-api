require("dotenv").config();
const { Client } = require("@notionhq/client");
const server = require("./helpers/common"); 

/**
 * conection to notion db.
 */
 const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * auxiliary function to retrieves all properties of StepNumber->Title of class.
 * @param { array[{}] } 
 * @returns { arrayElements[""] } 
 */
 const getPropertiesStepNumberTitle = ({array}) => {
  let arrayElements = [];
  for (let index = 0; index < array?.length; index++) {
    arrayElements = [...arrayElements, array[index]?.properties.stepNumber?.title[0]?.plain_text]; 
  }
  return arrayElements;
};

 /**
 * Auxiliary function to create JSON Object. Retrieves all the properties of the corresponding relations  
 * @param { list } 
 * @returns { pages[] } 
 */
  const createJsonObject = ({supplies, classes, contentBlockMains, contentBlockSubs, shorthands, stepss, suppliesMasters }) => {
    /* Get the className property */                        
    const className = server.getPropertiesNameTitle({array: classes});                       
    /* Get the contentBlockMain property */                        
    const contentBlockMain = server.getPropertiesNameTitle({array: contentBlockMains});                       
    /* Get the contentBlockSub property */                        
    const contentBlockSub = server.getPropertiesNameTitle({array: contentBlockSubs});                       
    /* Get the shorthand property */                        
    const shorthand = server.getPropertiesNameTitle({array: shorthands}); 
    /* Get the steps property */ 
    const steps = getPropertiesStepNumberTitle({array: stepss})                     
    /* Get the suppliesMaster property */                        
    const suppliesMaster = server.getPropertiesNameTitle({array: suppliesMasters});                       
    
  
    /* Get the supplies property */
    return {
          name: supplies[0].properties.name.title[0]?.plain_text 
                     ? supplies[0].properties.name.title[0]?.plain_text 
                     : '',
          contentBlockSub,
          supplyId: supplies[0].properties.supplyId?.formula?.string 
                          ? supplies[0].properties.supplyId?.formula?.string  
                          : '',
          quantity: "",
          unit: "",
          details: supplies[0].properties.details.rich_text[0]?.plain_text
                        ? supplies[0].properties.details.rich_text[0]?.plain_text 
                        : '',
          type: supplies[0].properties.type.select.name
                      ? supplies[0].properties.type.select.name 
                      : '',
          suppliesMaster,
          num: supplies[0].properties.num.rich_text[0]?.plain_text
                    ? supplies[0].properties.num.rich_text[0]?.plain_text 
                    : '',
          technique: "",
          "modifiable?":  supplies[0].properties["modifiable?"]?.checkbox ? "true" : "false",
          codename: supplies[0].properties.codename?.formula?.string 
                        ? supplies[0].properties.codename?.formula?.string  
                        : '',
          contentBlockSubId: supplies[0].properties.contentBlockSubId.rollup.array[0]?.formula?.string
                                ? supplies[0].properties.contentBlockSubId.rollup.array[0]?.formula?.string 
                                : '',
          contentBlockMain,
          steps,
          substitutedSupply: supplies[0].properties.substitutedSupply.rollup.array[0]?.formula?.string
                                ? supplies[0].properties.substitutedSupply.rollup.array[0]?.formula?.string 
                                : '',
          contentBlockMainId: supplies[0].properties.contentBlockMainId.rollup.array[0]?.formula?.string
                                ? supplies[0].properties.contentBlockMainId.rollup.array[0]?.formula?.string 
                                : '',
          class: className,
          classId: supplies[0].properties.classId.rollup.array[0]?.select?.name
                        ? supplies[0].properties.classId.rollup.array[0]?.select?.name
                        : '',
          shorthand,
          date: supplies[0].properties.date.created_time
                    ? supplies[0].properties.date.created_time
                    : '',
          substitute: "",
          aka: supplies[0].properties.aka.rich_text[0]?.plain_text
                    ? supplies[0].properties.aka.rich_text[0]?.plain_text 
                    : '',
          "substitute?": supplies[0].properties["substitute?"].checkbox ? "true": "false",
          created: "",
          optional: supplies[0].properties.optional.checkbox ? "true" : "false",
          undefined: "",
        };
};

 /**
 * function get all the lessons and make the corresponding requests of the related data.
 * @param { databaseId } 
 * @returns { collection: "LESSONS", data: arrayObjects } 
 */
  exports.getAllSuppliesFromDatabase = async ({databaseId}) => {
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
      let arrayRelation = [];
      let counter = 0;
      // check if the results array contains a supplies
      if (pages.length > 0) {
        const Interval_id = setInterval(() => {
          console.log(counter++);
        }, 1000);
        for (let index = 0; index < pages.length; index++) {
          console.log(`${index}/${pages.length} - name: ${pages[index].properties.name.title[0]?.plain_text}`);
          const class_ID = [...pages[index].properties.class?.relation];
          if(class_ID?.length > 0){
            arrayRelation = [...class_ID]
          }
          const contentBlockMain_ID = [...pages[index].properties.contentBlockMain?.relation];
          if(contentBlockMain_ID?.length > 0){
            arrayRelation = [...arrayRelation, ...contentBlockMain_ID];
          }
          const contentBlockSub_ID = [...pages[index].properties.contentBlockSub.relation];
          if(contentBlockSub_ID?.length > 0){
            arrayRelation = [...arrayRelation, ...contentBlockSub_ID];
          }
          const shorthand_ID = [...pages[index].properties.shorthand.relation];
          if(shorthand_ID?.length > 0){
            arrayRelation = [...arrayRelation, ...shorthand_ID];
          }
          const steps_ID = [...pages[index].properties.steps.relation];
          if(steps_ID?.length > 0){
            arrayRelation = [...arrayRelation, ...steps_ID];
          }
          const suppliesMaster_ID = pages[index].properties.suppliesMaster.relation;
          if(suppliesMaster_ID?.length > 0){
            arrayRelation = [...arrayRelation, ...suppliesMaster_ID];
          }
          const pagesAll = await server.getPromisesData(arrayRelation);
          //Get the array corresponding to each object.
          const pagesClass = server.getDataIdArray({array: class_ID, pages: pagesAll});
          const pagescontentBlockMain = server.getDataIdArray({array: contentBlockMain_ID, pages: pagesAll});
          const pagescontentBlockSub = server.getDataIdArray({array: contentBlockSub_ID, pages: pagesAll});
          const pagesshorthand = server.getDataIdArray({array: shorthand_ID, pages: pagesAll});
          const pagessteps = server.getDataIdArray({array: steps_ID, pages: pagesAll});
          const pagessuppliesMaster = server.getDataIdArray({array: suppliesMaster_ID, pages: pagesAll});
          //Create the supplies Object.
            const suppliesObject = createJsonObject({supplies: [pages[index]], classes: pagesClass, contentBlockMains: pagescontentBlockMain,
                                                     contentBlockSubs: pagescontentBlockSub, shorthands: pagesshorthand, 
                                                     stepss: pagessteps, suppliesMasters: pagessuppliesMaster});
            arrayObjects = [...arrayObjects, suppliesObject];
        }
        clearInterval(Interval_id);
        //Return the json supplies.
        return {
          collection: "SUPPLIES",
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