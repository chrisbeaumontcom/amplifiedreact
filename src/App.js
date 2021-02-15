import React from 'react';
import './App.css';
import UploadFormList from './components/UploadFormList';
import Amplify from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const App = () => {
  return (
    <div className="container">
      <h1>File Storage App</h1>
      <UploadFormList />
      <AmplifySignOut />
    </div>
  );
};

export default withAuthenticator(App);
