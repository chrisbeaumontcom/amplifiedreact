/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
      filesize
      owner
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
      filesize
      owner
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
      filesize
      owner
      createdAt
      updatedAt
    }
  }
`;
