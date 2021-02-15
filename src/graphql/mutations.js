/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodo = /* GraphQL */ `
  mutation CreateTodo(
    $input: CreateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    createTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo(
    $input: UpdateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    updateTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo(
    $input: DeleteTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    deleteTodo(input: $input, condition: $condition) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;
export const createFilestore = /* GraphQL */ `
  mutation CreateFilestore(
    $input: CreateFilestoreInput!
    $condition: ModelFilestoreConditionInput
  ) {
    createFilestore(input: $input, condition: $condition) {
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
export const updateFilestore = /* GraphQL */ `
  mutation UpdateFilestore(
    $input: UpdateFilestoreInput!
    $condition: ModelFilestoreConditionInput
  ) {
    updateFilestore(input: $input, condition: $condition) {
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
export const deleteFilestore = /* GraphQL */ `
  mutation DeleteFilestore(
    $input: DeleteFilestoreInput!
    $condition: ModelFilestoreConditionInput
  ) {
    deleteFilestore(input: $input, condition: $condition) {
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
