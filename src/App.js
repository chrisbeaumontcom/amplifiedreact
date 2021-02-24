import React from 'react';
import './App.css';
import UploadFormList from './components/UploadFormList';
import Amplify from 'aws-amplify';
//import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import {
  AmplifyAuthenticator,
  AmplifySignIn,
  AmplifySignOut,
} from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

import awsExports from './aws-exports';

Amplify.configure(awsExports);

const App = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <div className="container">
      <h1>File Storage App</h1>

      <UploadFormList />
      <AmplifySignOut />
    </div>
  ) : (
    <AmplifyAuthenticator>
      <AmplifySignIn
        headerText="Storage App Sign In"
        slot="sign-in"
        hideSignUp={true}
      ></AmplifySignIn>
    </AmplifyAuthenticator>
  );

  // return (
  //   <div className="container">
  //     <h1>File Storage App</h1>

  //     <UploadFormList />
  //     <AmplifySignOut />
  //   </div>
  // );
};

export default App;
