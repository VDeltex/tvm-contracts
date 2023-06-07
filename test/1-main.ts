import {Account} from 'locklift/everscale-client';
import {Token} from "./utils/wrappers/token";
import {TokenWallet} from "./utils/wrappers/token_wallet";
import {Contract, lockliftChai, toNano} from "locklift";
import chai, {expect} from "chai";
import {DeltexClusterAbi, TokenRootUpgradeableAbi} from "../build/factorySource";

const logger = require("mocha-logger");
chai.use(lockliftChai);


describe('Testing liquidity pool mechanics', async function() {
  let user1: Account;
  let user2: Account;
  let owner: Account;

  let token1_root: Token;
  let token2_root: Token;
  let token3_root: Token;

  const TOKEN_DECIMALS = 10 ** 9;
  const ONE = 10**18;

  let root: Contract<DeltexClusterAbi>;

  let user1_token1_wallet: TokenWallet;
  let user2_token1_wallet: TokenWallet;
  let owner_token1_wallet: TokenWallet;
  let owner_token2_wallet: TokenWallet;
  let owner_token3_wallet: TokenWallet;

  describe('Setup contracts', async function() {
    it('Run fixtures', async function() {
      await locklift.deployments.fixture();

      owner = locklift.deployments.getAccount('Owner').account;
      user1 = locklift.deployments.getAccount('User').account;
      user2 = locklift.deployments.getAccount('User1').account;

      root = await locklift.deployments.getContract<DeltexClusterAbi>('DeltexCluster');

      token1_root = new Token(locklift.deployments.getContract<TokenRootUpgradeableAbi>('TOKEN1'), owner);
      token2_root = new Token(locklift.deployments.getContract<TokenRootUpgradeableAbi>('TOKEN2'), owner);
      token3_root = new Token(locklift.deployments.getContract<TokenRootUpgradeableAbi>('TOKEN3'), owner);

      user1_token1_wallet = await token1_root.wallet(user1);
      user2_token1_wallet = await token1_root.wallet(user2);
      owner_token1_wallet = await token1_root.wallet(owner);
      owner_token2_wallet = await token2_root.wallet(owner);
      owner_token3_wallet = await token3_root.wallet(owner);
    });
  })


  describe('Running scenarios', async function() {
    it('Create pool', async function () {
      const {traceTree} = await locklift.tracing.trace(root.methods.createPool({
        tokens: [token1_root.address, token2_root.address, token3_root.address],
        normalizedWeights: [ONE / 3, ONE / 3, ONE / 3],
        scalingFactors: [9, 9, 9],
        meta: {call_id: 1, send_gas_to: owner.address}
      }).send({from: owner.address, amount: toNano(10)}));

      expect(traceTree)
        .to.emit('NewPool')
        .withNamedArgs({
          call_id: '1'
        })
    });

    it('Initiazlize pool', async function() {
      const {traceTree} = await locklift.tracing.trace(
        root.methods.initializePool(
          {poolId: 0, amountsIn: [100 * 10**9, 100 * 10**9, 100 * 10**9]}
        ).send({from: owner.address, amount: toNano(10)})
      );
    });

    it('Supply token', async function() {
      const amount = 10**9 * 100;
      const payload = await root.methods.encodeJoinPayload({poolId: 0, inTokenId: 0, call_id: 2}).call();
      const {traceTree} = await locklift.tracing.trace(
        user1_token1_wallet.transfer(amount, root.address, payload.value0, toNano(5)
        ));

      expect(traceTree)
        .to.emit('Join')
        .withNamedArgs({
          call_id: '2',
          amount: amount.toString()
        });

      const amount2 = 10**9 * 1000;
      await locklift.tracing.trace(
        owner_token1_wallet.transfer(amount2, root.address, payload.value0, toNano(5)
        ));
      await locklift.tracing.trace(
        owner_token2_wallet.transfer(amount2, root.address, payload.value0, toNano(5)
        ));
      await locklift.tracing.trace(
        owner_token3_wallet.transfer(amount2, root.address, payload.value0, toNano(5)
        ));
    });

    it('Swap', async function() {
      const amount = 10**9 * 30;

      const payload = await root.methods.encodeSwapPayload({poolId: 0, inTokenId: 0, outTokenId: 1, call_id: 2}).call();
      const {traceTree} = await locklift.tracing.trace(
        user1_token1_wallet.transfer(amount, root.address, payload.value0, toNano(5)
        ));

      // await traceTree?.beautyPrint();
    });

  });
});