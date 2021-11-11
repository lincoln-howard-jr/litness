import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { useEffect, useState } from 'react';
import { FreezeFn } from '../AppProvider';

// get if number is in use
const userExists = (number:string) => new Promise<boolean> (async (resolve, reject) => {
  try {
    const req = await fetch (`https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/usernames/${number}`);
    resolve (await req.json ());
  } catch (e) {
    reject (e);
  }
});

const poolDetails = {
  ClientId: '2nl7v5gphbluvp0lhu8aooqhe3',
  UserPoolId:	'us-east-1_Xsf7vUqcY'
}

interface AnswerFunction {
  (answer: string): void;
}

interface UserDetail {
  attributeName: string;
  attributeValue: string;
  dateCreated: number;
  id: string;
}

export interface UserHook {
  isAuthenticated: boolean;
  promptForCode: boolean;
  headers: {
    get: {
      'x-amz-access-token'?: string
    }
    post: {
      'Content-Type': string,
      'x-amz-access-token'?: string
    }
  };
  authError: string | null;
  userDetails: UserDetail[];
  getCode: (phoneNumber: string) => void;
  answer: AnswerFunction;
  createDetail: (attributeName: string, attributeValue: string) => Promise<void>;
  getDetails: () => Promise<void>;
  hasDetail: (name: string) => boolean;
  detail: (name: string) => string | undefined;
  logout: () => Promise<void>;
}

export const mockUseUser:UserHook = {
  isAuthenticated: false,
  promptForCode: false,
  headers: {
    get: {},
    post: {
      'Content-Type': 'application/json'
    }
  },
  authError: null,
  userDetails: [],
  getCode: () => {},
  answer: () => {},
  createDetail: () => new Promise (r => r()),
  getDetails: () => new Promise (r => r()),
  hasDetail: () => false,
  detail: () => undefined,
  logout: () => new Promise<void> (r => r())
} 

export default function useUser (freeze: FreezeFn):UserHook {
  // local vars
  let Pool = new AmazonCognitoIdentity.CognitoUserPool (poolDetails);
  let user = Pool.getCurrentUser ();;
  let authDetails:any;
  // state so the headers work
  const [accessToken, setAccessToken] = useState<string> ('');
  const [refreshToken, setRefreshToken] = useState <AmazonCognitoIdentity.CognitoRefreshToken | null> (null);
  // request headers
  const headers = {
    get: {
      'x-amz-access-token': accessToken
    },
    post: {
      'Content-Type': 'application/json',
      'x-amz-access-token': accessToken
    }
  }

  // state
  const [authError, setError] = useState<string | null> (null);
  const [userDetails, setDetails] = useState<UserDetail[]> ([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean> (false);
  const [promptForCode, setPromptForCode] = useState<boolean> (false);
  const [answer, setAnswer] = useState<AnswerFunction> ((answer:string) => {});

  // private method gets access and refresh tokens - call after authenticating 
  const retrieveAccessTokens = async () => {
    if (user) user.getSession ((error:any, session:any) => {
      if (error) return Promise.reject (error);
      setAccessToken (session.getAccessToken ().getJwtToken ());
      setRefreshToken (new AmazonCognitoIdentity.CognitoRefreshToken ({RefreshToken: session.getRefreshToken ().getToken ()}));
      setIsAuthenticated (true);
      return Promise.resolve ();
    });
    else return Promise.reject ('user dne');
  }

  // private method - refresh session should be called on init
  const refreshSession = async () => {
    if (user && refreshToken) user.refreshSession (refreshToken, (err: any) => {
      if (err) return Promise.reject (err);
      return retrieveAccessTokens ();
    })
  }

  // public method - register user with username/password/email
  const register = async (phoneNumber: string) => new Promise<void> (async (resolve, reject) => {
    let attrs = [
      new AmazonCognitoIdentity.CognitoUserAttribute ({
        Name: 'phone_number',
        Value: phoneNumber
      })
    ]
    Pool.signUp (phoneNumber, 'Passwords are useless!', attrs, [], (err, result) => {
      if (err) return reject (err);
      if (result?.user) user = result.user;
      return resolve ();
    })
  })

  const getCode = async (phoneNumber:string) => {
    let unfreeze = freeze ();
    // check if user exists
    let exists = true;
    try {
      exists = await userExists (phoneNumber);
    } catch (e) {
      setError ('error while checking if user exists');
    }
    // if user doesn't exist, register user
    if (!exists) {  
      try {
        await register (phoneNumber);
      } catch (e) {
        setError ('error while registering user');
        return;
      } 
    }
    authDetails = new AmazonCognitoIdentity.AuthenticationDetails ({Username: phoneNumber, ClientMetadata: {phoneNumber}});
    user = new AmazonCognitoIdentity.CognitoUser ({Username: phoneNumber, Pool});
    user.setAuthenticationFlowType ('CUSTOM_CHALLENGE');
    user.initiateAuth (authDetails, {
      onSuccess: () => {
        retrieveAccessTokens ();
        unfreeze ();
      },
      onFailure: e => {
        setError (e);
        unfreeze ();
      },
      customChallenge: function () {
        setAnswer (() => (answer:string) => {
          user?.sendCustomChallengeAnswer (answer, this);
          unfreeze = freeze ();
        })
        setPromptForCode (true);
      }
    });
  }
  
  // create a user detail
  const createDetail = async (attributeName:string, attributeValue:string) => new Promise<void> (async (resolve, reject) => {
    try {
      const req = await fetch ('https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/user-details', {
        method: 'post',
        headers: headers.post,
        body: JSON.stringify ({attributeName, attributeValue})
      });
      const data = await req.json ();
      setDetails (ds => [data, ...ds]);
      resolve ();
    } catch (e) {
      reject (e);
    }
  });

  // get user details
  const getDetails = async () => new Promise<void> (async (resolve, reject) => {
    try {
      const req = await fetch ('https://1ge3owx5sf.execute-api.us-east-1.amazonaws.com/Prod/user-details', {
        headers: headers.get
      })
      const data = (await req.json ()) as UserDetail[];
      data.sort ((a, b) => b.dateCreated - a.dateCreated);
      setDetails (data);
      resolve ();
    } catch (e) {
      reject (e);
    }
  });

  // access details
  const hasDetail = (name: string) => !!userDetails.find (d => d.attributeName === name);
  const detail = (name: string) => userDetails.find (d => d.attributeName === name)?.attributeValue;

  // public method - sign user out
  const logout = () => new Promise<void> (async (resolve, reject) => {
    if (user) {
      return resolve (user.signOut ());
    }
    else return reject ('user dne');
  })

  const init = async () => {
    await retrieveAccessTokens ();
    await refreshSession ();
  }

  useEffect (() => {
    init ();
  }, [])

  useEffect (() => {
    if (isAuthenticated) getDetails ();
  }, [isAuthenticated])

  return {
    isAuthenticated,
    promptForCode,
    headers,
    userDetails,
    authError,
    getCode,
    answer,
    createDetail,
    getDetails,
    hasDetail,
    detail,
    logout
  }

}