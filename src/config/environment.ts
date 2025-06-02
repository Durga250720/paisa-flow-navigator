
export const environments = {
  development: {
    baseURL: 'https://dev-paisa108.tejsoft.com/',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'ap-south-1:129b6f74-5a5e-47a5-ab34-e3d0f67710e9',
            Region: 'ap-south-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'test-prod-cmis',
          Region: 'ap-south-1',
        },
      },
    }
  },
  staging: {
    baseURL: 'https://staging-api.paisa108.com/api',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'ap-south-1:129b6f74-5a5e-47a5-ab34-e3d0f67710e9',
            Region: 'ap-south-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'test-prod-cmis',
          Region: 'ap-south-1',
        },
      },
    }
  },
  production: {
    baseURL: 'https://api.paisa108.com/api',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'ap-south-1:129b6f74-5a5e-47a5-ab34-e3d0f67710e9',
            Region: 'ap-south-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'test-prod-cmis',
          Region: 'ap-south-1',
        },
      },
    }
  }
};

export const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  return environments[env as keyof typeof environments] || environments.development;
};

export const config = getEnvironment();
