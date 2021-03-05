import React, { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import Amplify, { API, Storage, Auth } from 'aws-amplify';
import { createFilestore, deleteFilestore } from '../graphql/mutations';
import { listFilestores } from '../graphql/queries';
import { slugify, formatBytes } from '../Utils/functions';
import ListFiles from './ListFiles';
import ProgressBar from './ProgressBar';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

const initialState = {
  username: '',
  recordsList: [],
  loading: false,
  buttonState: false,
  errorMessage: '',
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
    case 'setErrorMessage':
      return { ...state, errorMessage: action.payload };
    // case 'setProgress':
    //     return { ...state, progress: action.payload };
    default:
      return state;
  }
};

export default function UploadFormList() {
  const { register, handleSubmit, errors } = useForm();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [progress, setProgress] = useState(0);

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

    // Store file // const result =
    await Storage.put(filename, file, {
      contentType: file.type,
      progressCallback(progress) {
        setProgress(Math.round((progress.loaded / progress.total) * 100));
      },
    });
    // Get presigned URL of the file //
    const presignedURL = await Storage.get(filename);

    // Store data about file
    const fileStoreObj = {
      name: data.name,
      description: data.description,
      filename: filename,
      link: presignedURL,
      owner: state.username,
      filesize: file.size,
    };

    // const addresult =
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
      // console.log('Test API:', apiData);
      const fileStoreFromAPI = apiData.data.listFilestores.items;
      const sortedRecords = fileStoreFromAPI.sort((a, b) => {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
      // Add link copy state
      const updatedRecords = sortedRecords.map((record) => {
        return { ...record, copied: false };
      });

      dispatch({ type: 'setRecordsList', payload: updatedRecords });
      dispatch({ type: 'setLoading', payload: false });
    } catch (err) {
      console.log('Error creating listing records:', err);
      dispatch({
        type: 'setErrorMessage',
        payload: 'Error listing records: ' + err?.errors[0]?.message,
      });
    }
  }

  function handleCopyLink(id, link) {
    copyToClipboard(link);
    const updatedRecords = state.recordsList.map((record) => {
      if (record.id === id) {
        return { ...record, copied: true };
      }
      return { ...record, copied: false };
    });
    dispatch({ type: 'setRecordsList', payload: updatedRecords });
  }
  async function copyToClipboard(textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeFile(key) {
    try {
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

  function resetProgress() {
    setProgress(0);
  }

  return (
    <div>
      {state.username && <p className="right">User: {state.username}</p>}

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
          <div className="error">
            {errors.name && <span>This field is required</span>}
          </div>
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
            onClick={() => {
              resetProgress();
            }}
          />
          <div className="error">
            {errors.uploadfile && <span>A selected file is required</span>}
          </div>
        </div>
        {progress > 0 && <ProgressBar progress={progress} />}
        {progress === 100 && <p>Done!</p>}
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
      {state.recordsList.length === 0 && state.errorMessage && (
        <p>{state.errorMessage}</p>
      )}
      {state.recordsList.length > 0 && (
        <ListRecords
          records={state.recordsList}
          remove={removeFilestore}
          load={state.loading}
          copyLink={handleCopyLink}
        />
      )}
      <div className="hr"></div>
      <ListFiles />
      <div className="hr"></div>
    </div>
  );
}

// Display list as its own component
function ListRecords(props) {
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
                  onClick={() => {
                    props.copyLink(item.id, item.link);
                  }}
                  style={copybutStyle}
                >
                  {item.copied ? 'Copied!' : 'Copy link'}
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
