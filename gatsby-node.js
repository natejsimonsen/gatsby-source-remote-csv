const fetch = require("node-fetch")
const Papa = require("papaparse")
const { createRemoteFileNode } = require("gatsby-source-filesystem")
const _ = require("lodash")

const transformToJson = async (csvData, transHeader, transData) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      transformHeader(header) {
        if (!transHeader) return header
        return _.camelCase(header)
      },
      transform(val, field) {
        if (!transData) return val
        return transData(val, field)
      },
      complete(results) {
        if (results.data.length > 0) return resolve(results)
        return reject(results.errors)
      },
    })
  })
}

const validateRemoteImage = str =>
  new String(str).match(
    /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp|jpeg)/g
  )

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions
  const { transformHeader = true, transData = false } = pluginOptions
  try {
    const res = await fetch(pluginOptions.url)

    if (!res.ok)
      throw new Error(
        "Could not fetch data from google sheets make sure the url is correct and the file is exported"
      )

    const csvData = await res.text()
    const { data, errors } = await transformToJson(
      csvData,
      transformHeader,
      transData
    )

    if (errors.length > 0)
      throw new Error(
        "Error while parsing csv data, check that the csv url is returning csv and that it is valid csv"
      )

    data.forEach((item, i) => {
      const node = {
        ...item,
        id: createNodeId(`${item?.id || i}`),
        parent: null,
        children: [],
        internal: {
          type: "RemoteCsv",
          mediaType: "text/json",
          content: JSON.stringify(item),
          contentDigest: createContentDigest(item),
        },
      }
      createNode(node)
    })
  } catch (e) {
    throw e
  }
}

exports.onCreateNode = async (
  { node, actions: { createNode }, createNodeId, getCache },
  { optimizeImages = true }
) => {
  if (!optimizeImages) return

  if (node.internal.type === "RemoteCsv") {
    for (const key in node) {
      if (validateRemoteImage(node[key])) {
        const fileNode = await createRemoteFileNode({
          url: node[key],
          parentNodeId: node.id,
          createNode,
          createNodeId,
          getCache,
        })
        if (fileNode) {
          node[`${key}Image___NODE`] = fileNode.id
        }
      }
    }
  }
}
