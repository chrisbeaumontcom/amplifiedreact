/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFilestore = /* GraphQL */ `
  query GetFilestore($id: ID!) {
    getFilestore(id: $id) {
      id
      name
      description
      filename
      link
      filesize
      owner
      createdAt
      updatedAt
    }
  }
`;
export const listFilestores = /* GraphQL */ `
  query ListFilestores(
    $filter: ModelFilestoreFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFilestores(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        filename
        link
        filesize
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
