import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import airdropList from '../airdrops';

let holders: any[] = [];
let counts: any[] = [];

airdropList.map((account : any[]) => {
  holders.push(account[0]);
  counts.push(account[1]);
})

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployNoBuddiesFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NoBuddies = await ethers.getContractFactory("NoBuddies");
    const nobuddies = await NoBuddies.deploy();

    await nobuddies.setTeamWallet(owner.address);

    await nobuddies.setMintrate('10000000000');
    await nobuddies.setURI('https://test.uri/');

    return { nobuddies, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { nobuddies, owner } = await loadFixture(deployNoBuddiesFixture);

      const txHandle = await nobuddies.airdropNFTs(holders, counts);
      await txHandle.wait();
      for (let i = 0; i < 250; i++)
        await nobuddies.mint(2, {value: '100000000000000000'});
      // await expect(await nobuddies.totalMinted()).to.equal(2750);
      // await expect(nobuddies.mint(1, {value: '100000000000000000'})).to.revertedWith(
      //   "Limit exceed"
      // );
      await expect(await nobuddies.balanceOf('0x6c205540Dcd4c54952FE921c0A779780545530F3', 0)).to.be.equal(26);
      await expect(await nobuddies.balanceOf('0x61B18560Efaff05bA3F0FdeF7704f518027182bd', 0)).to.be.equal(2);
      await expect(await nobuddies.balanceOf('0xfe1718181D58BA8D6bEbABb7D3090Ea2F2662509', 0)).to.be.equal(1);
      expect(await nobuddies.uri(1)).to.equal("https://test.uri/");
      console.log(await nobuddies.walletOfOwner('0x6c205540Dcd4c54952FE921c0A779780545530F3'));
      console.log(await nobuddies.walletOfOwner(owner.address));

      await expect(nobuddies.withdraw()).to.changeEtherBalance(
        owner,
        '2500000000000000000'
      )
    });    
  });
});
