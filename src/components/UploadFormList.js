import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Amplify, { API, Storage, Auth } from 'aws-amplify';
import { createFilestore, deleteFilestore } from '../graphql/mutations';
import { listFilestores } from '../graphql/queries';
import { slugify, formatBytes } from '../Utils/functions';
import { bucketurl } from '../config.js';
import ListFiles from './ListFiles';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

export default function UploadFormList() {
  const [username, setUsername] = useState(null);
  const { register, handleSubmit, errors } = useForm();
  const [buttonState, setButtonState] = useState(false);
  const [recordsList, setRecordsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    Auth.currentAuthenticatedUser({ bypassCache: false })
      .then((user) => {
        //console.log(user);
        const { username } = user;
        setUsername(username);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const onSubmit = async (data, e) => {
    setButtonState(true);
    setLoading(true);
    const file = data.uploadfile[0];
    // console.log('File info:', file);
    if (!file) {
      setButtonState(false);
      setLoading(false);
      return;
    }
    const filename = slugify(file.name);
    const fileStoreObj = {
      name: data.name,
      description: data.description,
      filename: filename,
      link: bucketurl + filename,
      owner: username,
      filesize: file.size,
    };
    // console.log(fileStoreObj);
    //const result =
    await Storage.put(filename, file);
    // console.log('File upload:', result);
    //const addresult =
    await API.graphql({
      query: createFilestore,
      variables: { input: fileStoreObj },
    });
    //  console.log('Add Result:', addresult);
    e.target.reset();
    fetchRecords();
    setLoading(false);
    setButtonState(false);
    //listFiles();
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

  async function removeFile(key) {
    try {
      //setFilesLoaded(false);
      //const result =
      await Storage.remove(key);
      // console.log('Remove: ', result);
      //listFiles();
    } catch (err) {
      console.log('error listing files:', err);
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
      {username && <p>User: {username}</p>}
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
      <ListFiles />
      <div className="hr"></div>
    </div>
  );
}

// Display lists as their own components
function ListRecords(props) {
  function copyToClipboard(vlink, event) {
    navigator.clipboard.writeText(vlink).then(
      function () {
        //setCopySuccess('Link to doc copied!');
        event.target.textContent = 'Copied!';
        //console.log(event.target);
      },
      function () {
        //setCopySuccess('Link copy failed.');
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

/* 
  const [filesList, setFilesList] = useState([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  <ListFiles
  loaded={filesLoaded}
  files={filesList}
  list={listFiles}
  remove={removeFile}
  /> 

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



*/

// function ListFiles(props) {
//   return (
//     <>
//       <h2>
//         Files:
//         <span className="right-span">
//           <button
//             className="action"
//             onClick={() => {
//               props.list();
//             }}
//           >
//             Update
//           </button>
//         </span>
//       </h2>
//       <p>This section is just for bucket management during dev.</p>
//       {!props.loaded && <div className="loader">Loading file list...</div>}

//       {props.loaded &&
//         props.files.map((fileObj) => (
//           <p key={fileObj.key}>
//             <a
//               href={bucketurl + fileObj.key}
//               rel="noreferrer noopener"
//               target="_blank"
//             >
//               {fileObj.key}
//             </a>
//             <span className="right-span">
//               {formatBytes(fileObj.size)}{' '}
//               <button
//                 onClick={() => props.remove(fileObj.key)}
//                 className="btn-primary"
//               >
//                 Remove
//               </button>
//             </span>
//           </p>
//         ))}
//     </>
//   );
// }
