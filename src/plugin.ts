import * as fs from 'fs'

import { CodegenPlugin } from '@graphql-codegen/plugin-helpers'

const typedQueryName = 'TypedQuery'

const plugin: CodegenPlugin = {
  plugin: (schema, documents, config) => {
    // `_result` key prevents no-unused-variables error.
    let result = `
export interface ${typedQueryName}<Result> {
  rawDocument: string
  _result?: Result
}
`

    documents.forEach(document => {
      const content = fs.readFileSync(document.filePath, { encoding: 'utf8' })

      document.content.definitions.forEach(definition => {
        if (definition.kind === 'OperationDefinition') {
          const { name } = definition

          const queryResultTypeName = `${name.value}Query`
          const queryObjectName = queryResultTypeName

          result += `
export const ${queryObjectName}: ${typedQueryName}<${queryResultTypeName}> = {
  rawDocument: \`${content}\`
}
`
        }
      })
    })

    return result
  },
}

module.exports = plugin
