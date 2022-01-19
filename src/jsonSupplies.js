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
  const createJsonObject = ({supplies, classes, contentBlockMains, contentBlockSubs, shorthands, stepss, suppliesMasters }) => {
    /* Get the blockSub property */                        
    
  
    /* Get the supplies property */
    return {
          name: supplies[0].properties.name.title[0]?.plain_text 
                     ? supplies[0].properties.name.title[0]?.plain_text 
                     : '',
          contentBlockSub: contentBlockSubs,
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
          suppliesMaster: suppliesMasters,
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
          contentBlockMain: contentBlockMains,
          steps: stepss,
          substitutedSupply: supplies[0].properties.substitutedSupply.rollup.array[0]?.formula?.string
                                ? supplies[0].properties.substitutedSupply.rollup.array[0]?.formula?.string 
                                : '',
          contentBlockMainId: supplies[0].properties.contentBlockMainId.rollup.array[0]?.formula?.string
                                ? supplies[0].properties.contentBlockMainId.rollup.array[0]?.formula?.string 
                                : '',
          class: classes,
          classId: supplies[0].properties.classId.rollup.array[0]?.select?.name
                        ? supplies[0].properties.classId.rollup.array[0]?.select?.name
                        : '',
          shorthand: shorthands,
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
      // check if the results array contains a supplies
      if (pages.length > 0) {
        let count = 0;
        const length = pages.length;
        for (const item of pages) {
          console.log(`${count++}/${length} - name: ${item.properties.name.title[0]?.plain_text}`);
              //get all the related data in pageArray[].
              /* const pagesClass = await getPagesFromDatabase({ database_Id: process.env.NOTION_DB_CLASSES, 
                filter: {
                   property: 'classId',
                   select: {
                               equals: item.properties.classId.rollup.array[0]?.select?.name
                                           ? item.properties.classId.rollup.array[0]?.select?.name
                                           : '',
                             }}}); */
            /* Get the class property */
            const class_ID = item.properties.class.relation;
            const pagesClass = await server.getPromisesData(class_ID);
            /* Get the contentBlockMain property */
            const contentBlockMain_ID = item.properties.contentBlockMain.relation;
            const pagescontentBlockMain = await server.getPromisesData(contentBlockMain_ID);
            /* Get the contentBlockSub property */
            const contentBlockSub_ID = item.properties.contentBlockSub.relation;
            const pagescontentBlockSub = await server.getPromisesData(contentBlockSub_ID);
            /* Get the shorthand property */
            const shorthand_ID = item.properties.shorthand.relation;
            const pagesshorthand = await server.getPromisesData(shorthand_ID);
            /* Get the steps property */
            const steps_ID = item.properties.steps.relation;
            const pagessteps = await server.getPromisesData(steps_ID);
            /* Get the suppliesMaster property */
            const suppliesMaster_ID = item.properties.suppliesMaster.relation;
            const pagessuppliesMaster = await server.getPromisesData(suppliesMaster_ID);

            //Create the supplies Object.
              const suppliesObject = createJsonObject({supplies: [item], classes: pagesClass, contentBlockMains: pagescontentBlockMain,
                                                       contentBlockSubs: pagescontentBlockSub, shorthands: pagesshorthand, 
                                                       stepss: pagessteps, suppliesMasters: pagessuppliesMaster});
              arrayObjects = [...arrayObjects, suppliesObject];
        }
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