require(`@babel/polyfill`);

const _ = require(`lodash`);
const { parse, stringify } = require(`flatted/cjs`);
const { DeliveryClient } = require(`kentico-cloud-delivery`);

const validation = require(`./validation`);
const itemNodes = require('./itemNodes');
const typeNodes = require('./typeNodes');

const languageVariantsDecorator =
  require('./decorators/languageVariantsDecorator');
const typeItemDecorator =
  require('./decorators/typeItemDecorator');
const linkedItemsElementDecorator =
  require('./decorators/linkedItemsElementDecorator');
const richTextElementDecorator =
  require('./decorators/richTextElementDecorator');
const { customTrackingHeader } = require('./config');


let lastModified;
let types = [];

exports.sourceNodes =
  async (
    api,
    { deliveryClientConfig, languageCodenames }) => {
    const { actions: { createNode, touchNode }, createNodeId, getNodes } = api;

    console.info(`Generating Kentico Cloud nodes for projectId:\
 ${_.get(deliveryClientConfig, 'projectId')}`);
    console.info(`Provided language codenames: ${languageCodenames}.`);
    console.info(`GATSBY PREVIEW DEVELOPMENT VERSION`);

    const now = new Date();
    if (!lastModified) {
      console.log(`This is the first round run!`);
    } else {
      console.info(`Last modified from last round:
        ${lastModified.toISOString()}`);
    }

    console.info(`Current now: ${now.toISOString()}`);
    if (lastModified && types !== []) {
      // TODO extract method and cover by tests
      console.info(`Update run`);

      const kenticoCloudNodes = getNodes()
        .filter((item) =>
          item.internal.owner === 'gatsby-source-kentico-cloud'
          // TODO  Extract constant to one place and use it from there and normalize
          && item.internal.type.startsWith(`KenticoCloudItem`));

      const client = new DeliveryClient(deliveryClientConfig);
      const itemsToUpdate = await client
        .items()
        .greaterThanFilter(`system.last_modified`, lastModified.toISOString())
        .getPromise();

      console.info(`Items to update: ${itemsToUpdate.items.length}`);
      for (const item of itemsToUpdate.items) {
        console.info(`DUMMY UPDATE: ${item.system.codename}`);
      }

      // TODO Extract and use in itemNodes
      richTextElementDecorator
        .resolveHtml(itemsToUpdate.items);
      const resolvedItemsToUpdate = parse(stringify(itemsToUpdate.items));


      for (const node of kenticoCloudNodes) {
        const updateItem = resolvedItemsToUpdate.find((item) =>
          // TODO use Gatsby Node ID for filtering
          item.system.codename === node.system.codename
          && item.system.language === node.system.language);

        if (updateItem) { // update
          // TODO come up with different approach for updating and decorating! items unify with decorators code
          const itemNode = itemNodes.createContentItemNode(createNodeId, updateItem, types);
          // TODO extract additional data to the constants from typeNodes and ItemNodes to constants
          itemNode.otherLanguages___NODE = node.otherLanguages___NODE;
          itemNode.contentType___NODE = node.contentType___NODE;
          // TODO Add linked items from itemNode.elements.<element>___NODE  = node.elements.<element>___NODE
          // currently the d(ata is lost
          console.info(`updating node ${itemNode.system.codename}`);
          createNode(itemNode);
        } else { // just a touch
          console.info(`touching node ${node.system.codename}`);
          touchNode(node);
        }
      }

      console.info(`Update run finished`);
      lastModified = now;
      return;
    }

    validation.validateLanguageCodenames(languageCodenames);
    const defaultLanguageCodename = languageCodenames[0];
    const nonDefaultLanguageCodenames = languageCodenames.slice(1);

    addHeader(deliveryClientConfig, customTrackingHeader);

    const client = new DeliveryClient(deliveryClientConfig);
    const contentTypeNodes = await typeNodes.get(client, createNodeId);

    if (!lastModified) {
      console.info(`Creating content type nodes.`);
      types = contentTypeNodes;
    }

    const defaultCultureContentItemNodes = await itemNodes.
      getFromDefaultLanguage(
        client,
        defaultLanguageCodename,
        contentTypeNodes,
        createNodeId,
      );

    const nonDefaultLanguageItemNodes = await itemNodes
      .getFromNonDefaultLanguage(
        client,
        nonDefaultLanguageCodenames,
        contentTypeNodes,
        createNodeId,
      );

    languageVariantsDecorator.decorateItemsWithLanguageVariants(
      defaultCultureContentItemNodes,
      nonDefaultLanguageItemNodes
    );

    const allItemNodes = defaultCultureContentItemNodes
      .concat(_.flatten(nonDefaultLanguageItemNodes.values()));
    typeItemDecorator.decorateTypeNodesWithItemLinks(
      allItemNodes,
      contentTypeNodes
    );

    linkedItemsElementDecorator.decorateItemNodesWithLinkedItemsLinks(
      defaultCultureContentItemNodes,
      nonDefaultLanguageItemNodes
    );

    richTextElementDecorator.decorateItemNodesWithRichTextLinkedItemsLinks(
      defaultCultureContentItemNodes,
      nonDefaultLanguageItemNodes
    );

    console.info(`Creating content type nodes.`);
    createNodes(contentTypeNodes, createNode);

    console.info(`Creating content item nodes for default language.`);
    createNodes(defaultCultureContentItemNodes, createNode);

    console.info(`Creating content item nodes for non-default languages.`);
    nonDefaultLanguageItemNodes.forEach((languageNodes) => {
      createNodes(languageNodes, createNode);
    });

    console.info(`Kentico Cloud nodes generation finished.`);
    lastModified = now;
    return;
  };

/**
 *
 * @param {DeliveryClientConfig} deliveryClientConfig
 *  Kentico Cloud JS configuration object
 * @param {IHeader} trackingHeader tracking header name
 */
const addHeader = (deliveryClientConfig, trackingHeader) => {
  let headers = deliveryClientConfig.globalHeaders
    ? _.cloneDeep(deliveryClientConfig.globalHeaders)
    : [];

  if (headers.some((header) => header.header === trackingHeader.header)) {
    console.warn(`Custom HTTP header value with name ${trackingHeader.header}
      will be replaced by the source plugin.
      Use different header name if you want to avoid this behavior;`);
    headers = headers.filter((header) => {
      return header.header !== trackingHeader.header;
    });
  }
  headers.push({
    header: trackingHeader.header,
    value: trackingHeader.value,
  });
  deliveryClientConfig.globalHeaders = headers;
};

/**
 * Call @see createNode function  for all items in @see nodes.
 * @param {Array} nodes Gatsby nodes to create
 * @param {Function} createNode Gatsby API method for Node creation.
 */
const createNodes = (nodes, createNode) => {
  try {
    nodes.forEach((contentTypeNode) => {
      const nodeId = contentTypeNode.id;
      const nodeCodeName = contentTypeNode.system.codename;
      console.info(`Creating node: ${nodeId}(${nodeCodeName})`);
      createNode(contentTypeNode);
    });
  } catch (error) {
    console.error(`Error when creating nodes. Details: ${error}`);
  }
};
