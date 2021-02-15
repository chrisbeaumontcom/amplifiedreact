import React, { useEffect, useState } from 'react';
import Amplify, { Storage } from 'aws-amplify';
import { formatBytes } from '../Utils/functions';
import { bucketurl } from '../config.js';
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
      // console.log('List: ', result);
      setFilesList(result);
      setLoaded(true);
    } catch (err) {
      console.log('error listing files:', err);
    }
  }

  async function removeFile(key) {
    try {
      setLoaded(false);
      const result = await Storage.remove(key);
      console.log('Remove: ', result);
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
            Update
          </button>
        </span>
      </h2>
      {!loaded && <div className="loader">Loading file list...</div>}

      {loaded &&
        filesList.map((fileObj) => (
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
