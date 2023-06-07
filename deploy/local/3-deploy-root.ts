import {setupDeltexCluster} from "../../test/utils/common";


export default async () => {
  const signer = await locklift.keystore.getSigner("0");
  const owner = await locklift.deployments.getAccount("Owner");
  const root = await setupDeltexCluster(owner.account.address);

  await locklift.deployments.saveContract({
    deploymentName: 'DeltexCluster',
    address: root.address,
    contractName: 'DeltexCluster'
  })
};

export const tag = "root";