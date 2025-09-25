### Setup / Tools
- IDE: VS Code https://code.visualstudio.com/download
    - Extensions:
        - AWS Toolkit
    - Clone Repo:
        - In the search bar at the top of the screen, enter `>git: clone`
        - Paste in the repo URL
        - Sign in using your project token name as the username, and the actual token as the password.
    

- NodeJS
    - Install: https://nodejs.org/dist/latest-v22.x/node-v22.19.0-x64.msi
    - During installation, make sure to check "Automatically install the necessary tools"
    - Verify installation by checking node version with `node -v`
        - If node is not detected, add it to PATH with `setx PATH "$env:Path;C:\Program Files\node-js"`
    - Verify npm works. Run `npm -v`
        - If running scripts is disabled, run the following in Powershell: 
        - ```Powershell
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
            ```
    - If npm works, run command `npm install`. This should install all the necessary dependencies.
    - May need to add npm to PATH with `setx PATH "$env:Path;C:\Users\<YourUser>\AppData\Roaming\npm"`

- Test web app by running `npm run dev` and follow link
    - Any saved changes will refresh the page in browser

- AWS CLI (will need in the future to deploy to AWS)
    - Install link https://awscli.amazonaws.com/AWSCLIV2.msi
    - verify with `aws --version`
    - verify `cdk --version`

- Testing Lambdas locally with Node (example)
    - Navigate to the desired lambda folder, `cd lambdas/example`
    - Run `npx tsc` to compile latest typescript
    - Run the javascript file, `node dist/index.js`