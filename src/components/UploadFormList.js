import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Amplify, { API, Storage } from 'aws-amplify';
import { createFilestore, deleteFilestore } from '../graphql/mutations';
import { listFilestores } from '../graphql/queries';
import { slugify, formatBytes } from '../Utils/functions';
import { bucketurl } from '../config.js';
//import ListFiles from './ListFiles';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

export default function UploadFormList() {
  const { register, handleSubmit, errors } = useForm();
  const [buttonState, setButtonState] = useState(false);
  const [recordsList, setRecordsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  useEffect(() => {
    listFiles();
  }, []);

  async function listFiles() {
    try {
      setFilesLoaded(false);
      const result = await Storage.list('');
      // console.log('List: ', result);
      setFilesList(result);
      setFilesLoaded(true);
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  async function removeFile(key) {
    try {
      setFilesLoaded(false);
      //const result =
      await Storage.remove(key);
      // console.log('Remove: ', result);
      listFiles();
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmit = async (data, e) => {
    setButtonState(true);
    setLoading(true);
    const file = data.uploadfile[0];
    if (!file) {
      return;
    }
    const filename = slugify(file.name);
    const fileStoreObj = {
      name: data.name,
      description: data.description,
      filename: filename,
      link: bucketurl + filename,
    };
    //console.log(fileStoreObj);
    //const result =
    await Storage.put(filename, file);
    //console.log('File upload:', result);
    //const addresult =
    await API.graphql({
      query: createFilestore,
      variables: { input: fileStoreObj },
    });
    //console.log('Add Result:', addresult);
    e.target.reset();
    fetchRecords();
    setLoading(false);
    setButtonState(false);
    listFiles();
  };

  async function fetchRecords() {
    try {
      setLoading(true);
      const apiData = await API.graphql({ query: listFilestores });
      const fileStoreFromAPI = apiData.data.listFilestores.items;
      const sortedRecords = fileStoreFromAPI.sort((a, b) => {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
      // console.log('Records:', fileStoreFromAPI);
      setRecordsList(sortedRecords);
      setLoading(false);
    } catch (err) {
      console.log('Error creating listing records:', err);
    }
  }

  async function removeFilestore(key) {
    try {
      setLoading(true);
      const fileStore = {
        id: key,
      };
      const result = await API.graphql({
        query: deleteFilestore,
        variables: { input: fileStore },
      });
      const keyForS3File = result.data.deleteFilestore?.filename || '';
      if (keyForS3File) {
        removeFile(keyForS3File);
      }
      //console.log('Del FileStore: ', result);
      fetchRecords();
    } catch (err) {
      console.log('error deleting filestore:', err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label for="name" className="input-group-text label">
            Name
          </label>
          <input
            name="name"
            ref={register({ required: true })}
            className="form-control"
          />{' '}
          <div>{errors.name && <span>This field is required</span>}</div>
        </div>

        <div>
          <label for="description" className="input-group-text label">
            Description
          </label>
          <input name="description" ref={register} className="form-control" />
        </div>
        <div>
          <input
            type="file"
            name="uploadfile"
            ref={register({ required: true })}
            className="form-control"
          />
          <div>
            {errors.uploadfile && <span>A selected file is required</span>}
          </div>
        </div>

        <div>
          <button type="submit" className="action" disabled={buttonState}>
            Add File
          </button>
        </div>
      </form>
      <div className="hr"></div>
      <ListRecords
        records={recordsList}
        remove={removeFilestore}
        load={loading}
      />
      <div className="hr"></div>
      <ListFiles
        loaded={filesLoaded}
        files={filesList}
        list={listFiles}
        remove={removeFile}
      />
    </div>
  );
}

// Display lists as their own components
function ListRecords(props) {
  return (
    <>
      <h2>Records:</h2>
      {props.load && <div className="loader">Loading list...</div>}
      {!props.load &&
        props.records.map((item, index) => (
          <div key={item.id ? item.id : index} className="item">
            <h3>
              {item.name}
              <span className="right-span">
                <button
                  className="btn-primary"
                  onClick={() => props.remove(item.id)}
                >
                  Remove
                </button>
              </span>
            </h3>
            <p>{item.description}</p>
            {item.filename && (
              <p>
                <a href={item.link}>{item.filename}</a>
              </p>
            )}
          </div>
        ))}
    </>
  );
}

function ListFiles(props) {
  return (
    <>
      <h2>
        Files:
        <span className="right-span">
          <button
            className="action"
            onClick={() => {
              props.list();
            }}
          >
            Update
          </button>
        </span>
      </h2>
      <p>This section is just for bucket management during dev.</p>
      {!props.loaded && <div className="loader">Loading file list...</div>}

      {props.loaded &&
        props.files.map((fileObj) => (
          <p key={fileObj.key}>
            <a
              href={bucketurl + fileObj.key}
              rel="noreferrer noopener"
              target="_blank"
            >
              {fileObj.key}
            </a>
            <span className="right-span">
              {formatBytes(fileObj.size)}{' '}
              <button
                onClick={() => props.remove(fileObj.key)}
                className="btn-primary"
              >
                Remove
              </button>
            </span>
          </p>
        ))}
    </>
  );
}
