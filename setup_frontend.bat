npx.cmd -y create-expo-app@latest frontend --template blank > npx_create.log 2>&1
cd frontend
npx.cmd expo install --fix > expo_install.log 2>&1
