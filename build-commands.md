
# Build Commands for package.json

Add the following scripts to your package.json file:

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging", 
    "build:prod": "vite build --mode production",
    "start": "vite preview",
    "preview": "vite preview"
  }
}
```

These commands will use the environment files:
- `.env.development` for dev mode
- `.env.staging` for staging builds
- `.env.production` for production builds
