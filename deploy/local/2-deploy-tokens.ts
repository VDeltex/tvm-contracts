import {getRandomNonce} from "locklift";
import {setupTokenRoot} from "../../test/utils/common";


export default async () => {
  const token_name1 = `TOKEN_${getRandomNonce()}`;
  const token_name2 = `TOKEN_${getRandomNonce()}`;
  const token_name3 = `TOKEN_${getRandomNonce()}`;

  const {account:owner} = await locklift.deployments.getAccount('Owner');
  const {account:user} = await locklift.deployments.getAccount('User');
  const {account:user1} = await locklift.deployments.getAccount('User1');

  const token1_root = await setupTokenRoot(token_name1, token_name1, owner, 9);
  const token2_root = await setupTokenRoot(token_name2, token_name2, owner, 9);
  const token3_root = await setupTokenRoot(token_name3, token_name3, owner, 9);

  const TOKEN_DECIMALS = 10 ** 9;
  await token1_root.mint(1000000000 * TOKEN_DECIMALS, owner);
  await token2_root.mint(1000000000 * TOKEN_DECIMALS, owner);
  await token3_root.mint(1000000000 * TOKEN_DECIMALS, owner);

  await token1_root.mint(1000000000 * TOKEN_DECIMALS, user);
  await token1_root.mint(1000000000 * TOKEN_DECIMALS, user1);

  await locklift.deployments.saveContract({
    deploymentName: "TOKEN1",
    address: token1_root.address,
    contractName: "TokenRootUpgradeable"
  });
  await locklift.deployments.saveContract({
    deploymentName: "TOKEN2",
    address: token2_root.address,
    contractName: "TokenRootUpgradeable"
  });  await locklift.deployments.saveContract({
    deploymentName: "TOKEN3",
    address: token3_root.address,
    contractName: "TokenRootUpgradeable"
  });
};

export const tag = "token";