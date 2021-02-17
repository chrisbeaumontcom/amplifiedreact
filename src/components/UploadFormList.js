import React, { useEffect, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import Amplify, { API, Storage, Auth } from 'aws-amplify';
import { createFilestore, deleteFilestore } from '../graphql/mutations';
import { listFilestores } from '../graphql/queries';
import { slugify, formatBytes } from '../Utils/functions';
import { bucketurl } from '../config.js';
import ListFiles from './ListFiles';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

const initialState = {
  username: '',
  recordsList: [],
  loading: false,
  buttonState: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setUsername':
      return { ...state, username: action.payload };
    case 'setRecordsList':
      return { ...state, recordsList: action.payload };
    case 'setLoading':
      return { ...state, loading: action.payload };
    case 'setButtonState':
      return { ...state, buttonState: action.payload };
    default:
      return state;
  }
};

export default function UploadFormList() {
  const { register, handleSubmit, errors } = useForm();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    Auth.currentAuthenticatedUser({ bypassCache: false })
      .then((user) => {
        const { username } = user;
        dispatch({ type: 'setUsername', payload: username });
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmit = async (data, e) => {
    dispatch({ type: 'setButtonState', payload: true });
    dispatch({ type: 'setLoading', payload: true });
    const file = data.uploadfile[0];
    if (!file) {
      dispatch({ type: 'setButtonState', payload: false });
      dispatch({ type: 'setLoading', payload: false });
      return;
    }
    const filename = slugify(file.name);
    const fileStoreObj = {
      name: data.name,
      description: data.description,
      filename: filename,
      link: bucketurl + filename,
      owner: state.username,
      filesize: file.size,
    };
    //const result =
    await Storage.put(filename, file);
    //const addresult =
    await API.graphql({
      query: createFilestore,
      variables: { input: fileStoreObj },
    });
    e.target.reset();
    fetchRecords();
    dispatch({ type: 'setLoading', payload: false });
    dispatch({ type: 'setButtonState', payload: false });
  };

  async function fetchRecords() {
    try {
      dispatch({ type: 'setLoading', payload: true });
      const apiData = await API.graphql({ query: listFilestores });
      const fileStoreFromAPI = apiData.data.listFilestores.items;
      const sortedRecords = fileStoreFromAPI.sort((a, b) => {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
      dispatch({ type: 'setRecordsList', payload: sortedRecords });
      dispatch({ type: 'setLoading', payload: false });
    } catch (err) {
      console.log('Error creating listing records:', err);
    }
  }

  async function removeFile(key) {
    try {
      //const result =
      await Storage.remove(key);
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  async function removeFilestore(key) {
    try {
      dispatch({ type: 'setLoading', payload: true });
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
      fetchRecords();
    } catch (err) {
      console.log('error deleting filestore:', err);
    }
  }

  return (
    <div>
      {state.username && <p>User: {state.username}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label for="name" className="input-group-text label">
            Name
          </label>
          <input
            name="name"
            ref={register({ required: true })}
            className="form-control"
          />
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
          <button type="submit" className="action" disabled={state.buttonState}>
            Add File
          </button>
        </div>
      </form>
      <div className="hr"></div>
      <span className="right-span">
        <button
          className="action"
          onClick={() => {
            fetchRecords();
          }}
        >
          Refresh
        </button>
      </span>
      <ListRecords
        records={state.recordsList}
        remove={removeFilestore}
        load={state.loading}
      />
      <div className="hr"></div>
      <ListFiles />
      <div className="hr"></div>
    </div>
  );
}

// Display list as its own component
function ListRecords(props) {
  function copyToClipboard(vlink, event) {
    navigator.clipboard.writeText(vlink).then(
      function () {
        event.target.textContent = 'Copied!';
      },
      function () {
        event.target.textContent = 'Failed to copy';
      }
    );
  }

  const copybutStyle = {
    backgroundColor: '#0066ff',
    color: '#ffffff',
    padding: '2px 5px',
    margin: '0 10px',
    borderRadius: 5,
    outline: 'none',
    border: 'none',
    fontSize: 12,
  };

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
                <button
                  onClick={(e) => copyToClipboard(item.link, e)}
                  style={copybutStyle}
                >
                  Copy Link
                </button>

                <br />
                <small>
                  {item.filesize && (
                    <span className="filesize">
                      {formatBytes(item.filesize)}
                    </span>
                  )}{' '}
                  Last modified: {new Date(item.updatedAt).toLocaleString()} by{' '}
                  {item.owner}
                </small>
              </p>
            )}
          </div>
        ))}
    </>
  );
}
