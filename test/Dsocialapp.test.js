/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */

// it("Should mint a new token", async function () {
//   await dsocialapp.mint("tokenURI");
//   expect(await dsocialapp.tokenCount()).to.equal(1);
// });

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dsocialapp Contract", function () {
  let dsocialapp;

  beforeEach(async function () {
    const Dsocialapp = await ethers.getContractFactory("Dsocialapp");
    dsocialapp = await Dsocialapp.deploy();
    await dsocialapp.deployed();
  });

  it("Should set the profile for the user", async function () {
    await dsocialapp.mint("tokenURI");
    await dsocialapp.setProfile(1);
    expect(
      await dsocialapp.profiles(await ethers.provider.getSigner().getAddress())
    ).to.equal(1);
  });

  it("Should upload a post", async function () {
    await dsocialapp.mint("tokenURI");
    await dsocialapp.uploadPost("hash", "mediaHash", "fileType");
    const post = await dsocialapp.posts(1);
    expect(post.id).to.equal(1);
  });

  it("Should tip a post", async function () {
    await dsocialapp.mint("tokenURI");
    await dsocialapp.uploadPost("hash", "mediaHash", "fileType");

    const [_, addr1] = await ethers.getSigners();

    await dsocialapp
      .connect(addr1)
      .tipPostOwner(1, { value: ethers.utils.parseEther("0.1") });

    const post = await dsocialapp.posts(1);
    expect(post.tipAmount).to.equal(ethers.utils.parseEther("0.1"));
  });

  it("Should delete a post", async function () {
    await dsocialapp.mint("tokenURI");
    await dsocialapp.uploadPost("hash", "mediaHash", "fileType");
    await dsocialapp.deletePost(1);
    const post = await dsocialapp.posts(1);
    expect(post.isDeleted).to.equal(true);
  });

  it("Should display all posts", async function () {
    await dsocialapp.mint("tokenURI");
    await dsocialapp.uploadPost("hash1", "mediaHash1", "fileType1");
    await dsocialapp.uploadPost("hash2", "mediaHash2", "fileType2");
    await dsocialapp.uploadPost("hash3", "mediaHash3", "fileType3");
    await dsocialapp.deletePost(2);

    const allPosts = await dsocialapp.getAllPosts();

    expect(allPosts.length).to.equal(2);
    expect(allPosts[0].id).to.equal(3);
    expect(allPosts[1].id).to.equal(1);
  });

  it("Should get profiles owned by the user", async function () {
    await dsocialapp.mint("tokenURI1");
    await dsocialapp.mint("tokenURI2");
    await dsocialapp.mint("tokenURI3");

    const myProfiles = await dsocialapp.getMyProfiles();
    expect(myProfiles.length).to.equal(3);
    expect(myProfiles[0]).to.equal(1);
    expect(myProfiles[1]).to.equal(2);
    expect(myProfiles[2]).to.equal(3);
  });

  it("Should return an empty array if no profiles are owned by the user", async function () {
    const [_, addr1] = await ethers.getSigners();
    const myProfiles = await dsocialapp.connect(addr1).getMyProfiles();
    expect(myProfiles.length).to.equal(0);
  });
});
