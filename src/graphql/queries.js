/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        image
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFilestore = /* GraphQL */ `
  query GetFilestore($id: ID!) {
    getFilestore(id: $id) {
      id
      name
      description
      filename
      link
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
