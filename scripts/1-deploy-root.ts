import {deployUser, isValidEverAddress, setupDeltexCluster} from "../test/utils/common";
import {readFileSync} from "fs";
import {toNano} from "locklift";

const prompts = require('prompts');
const ora = require('ora');


async function main() {
  console.log('\x1b[1m', '\n\nDeploy Deltex Root:')
  const response = await prompts([
    {
      type: 'text',
      name: '_owner',
      message: 'Deltex Root owner address',
      validate: (value: string) => isValidEverAddress(value) ? true : 'Invalid Everscale address'
    }
  ]);
  console.log('\x1b[1m', '\nSetup complete! ✔');

  const spinner = ora('Deploying Deltex Root...').start();
  const root = await setupDeltexCluster(response._owner);
  spinner.succeed(`Deltex Root deployed: ${root.address}`);

}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
