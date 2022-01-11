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
  console.log("response.result[0]: ", response.results[0]);
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

const getPages = async function ({id}) {
        try {
          const response = await notion.pages.retrieve({page_id: id})
          return response;
        } catch (error) {
          console.log(error);
        }
}

const getPromises = async function (list) {
  const promises = [];
  const pages = [];
  try {
    list.map(async (lessons, index) => {( promises[index] = getPages({id: lessons.id}))});
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
}

exports.findClassById = async ({ classId }) => {
  const databaseId = process.env.NOTION_DB_CLASSES;
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and : [
          {
            property: 'classId',
            select: {
              equals : classId,
            },
          },
          { 
            property: 'lessons',
            relation: {
                     contains: '1f27b893-0adc-4a02-8d76-305396b4c2c2',
            },
          },
        ]
      },
    });
    // check if the results array contains a user
    const promises = [];
    const pages = [];
    if (results.length > 0) {
       const lessons_ID = results[0].properties.lessons.relation;
       lessons_ID.map(async (lessons, index) => {( promises[index] = getPages({id: lessons.id}))});
       await Promise.allSettled(promises).
       then((res) => { res.forEach((res) => {
                                           pages.push(res.value)
                                          });
                      }
            );
      return {
        isClassInDB: true,
        classes: results,
        lessons: pages
      };  
    }
    return {
      isClassInDB: false,
      classes: results,
      lessons: pages
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