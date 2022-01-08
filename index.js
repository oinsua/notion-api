require("dotenv").config();
const { Client } = require("@notionhq/client");
/**
 * conection to notion db.
 */
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
exports.getLessonsDatabase = async function () {
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
 exports.getSuppliesToDatabase = async function () {
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
