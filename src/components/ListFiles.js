import React, { useEffect, useState } from 'react';
import Amplify, { Storage } from 'aws-amplify';
import { formatBytes } from '../Utils/functions';
import awsExports from '../aws-exports';
Amplify.configure(awsExports);

export default function ListFiles() {
  const [filesList, setFilesList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listFiles();
  }, []);

  async function listFiles() {
    try {
      setLoaded(false);
      const result = await Storage.list('');
      setFilesList(result);
      setLoaded(true);
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  async function removeFile(key) {
    try {
      setLoaded(false);
      //const result =
      await Storage.remove(key);
      // console.log('Remove: ', result);
      listFiles();
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  return (
    <>
      <h2>
        Files:
        <span className="right-span">
          <button
            className="action"
            onClick={() => {
              listFiles();
            }}
          >
            Refresh
          </button>
        </span>
      </h2>
      <p>This section is just for bucket management during dev.</p>
      {!loaded && <div className="loader">Loading file list...</div>}

      {loaded &&
        filesList.map((fileObj) => (
          <p key={fileObj.key}>
            {fileObj.key}
            <span className="filesize">[{formatBytes(fileObj.size)}]</span>
            <span className="right-span">
              <button
                onClick={() => removeFile(fileObj.key)}
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
