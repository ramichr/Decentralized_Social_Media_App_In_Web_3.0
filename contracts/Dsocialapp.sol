// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Dsocialapp is ERC721URIStorage {
    
    uint256 public tokenCount;

    uint256 public postCount;

    mapping(uint256 => Post) public posts;

    mapping(address => uint256) public profiles;

    struct Post {
        uint256 id;
        string hash;
        string mediaHash;
        string fileType;
        uint256 tipAmount;
        address payable author;
        bool isDeleted; 
    }

    event PostCreated(
    uint256 id,
    string hash,
    string mediaHash,
    string fileType,
    uint256 tipAmount,
    address payable author
    );

    event PostTipped(
        uint256 id,
        string hash,
        string mediaHash,
        string fileType,
        uint256 tipAmount,
        address payable author
    );

    constructor() ERC721("Dsocialapp", "DAPP") {}

     function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        setProfile(tokenCount);
        return (tokenCount);
    }

    function setProfile(uint256 _id) public {
        require(
            ownerOf(_id) == msg.sender,
            "Sie muessen ein Profil als Ihr Standardprofil auswaehlen"
        );
        profiles[msg.sender] = _id;
    }


    function uploadPost(string memory _postHash, string memory _mediaHash, string memory _fileType) external {

        require(
            balanceOf(msg.sender) > 0,
            "Must own a profile to post"
        );

        require(bytes(_postHash).length > 0, "Cannot pass an empty hash");
        require(bytes(_mediaHash).length > 0, "Cannot pass an empty image hash");
        require(bytes(_fileType).length > 0, "Cannot pass an empty file type");
        require(msg.sender!=address(0));

        postCount++;

        posts[postCount] = Post(postCount, _postHash, _mediaHash, _fileType, 0, payable(msg.sender), false);

        emit PostCreated(postCount, _postHash, _mediaHash, _fileType, 0, payable(msg.sender));
    }

    function tipPostOwner(uint256 _id) external payable {

        require(_id > 0 && _id <= postCount, "Invalid post id");

        Post memory _post = posts[_id];
        require(_post.author != msg.sender, "Cannot tip your own post");

        _post.author.transfer(msg.value);

        _post.tipAmount += msg.value;

        posts[_id] = _post;

        emit PostTipped(_id, _post.hash, _post.mediaHash, _post.fileType,  _post.tipAmount, _post.author);
    }


    function deletePost(uint256 _id) external {

        require(_id > 0 && _id <= postCount, "Invalid post id");

        Post storage _post = posts[_id];

        require(_post.author == msg.sender, "You are not the author of this post");

        _post.isDeleted = true;
    }



    function getAllPosts() external view returns (Post[] memory _posts) {
        uint256 count = 0;
        for (uint256 i = 1; i <= postCount; i++) {
            if (!posts[i].isDeleted) {
                count++;
            }
        }
        _posts = new Post[](count);
        uint256 j = 0;
        for (uint256 i = postCount; i > 0; i--) {
            if (!posts[i].isDeleted) {
                _posts[j] = posts[i];
                j++;
            }
        }
    }



    function getMyProfiles() external view returns (uint256[] memory _ids) {
        _ids = new uint256[](balanceOf(msg.sender));
        uint256 currentIndex;
        uint256 _tokenCount = tokenCount;
        for (uint256 i = 0; i < _tokenCount; i++) {
            if (ownerOf(i + 1) == msg.sender) {
                _ids[currentIndex] = i + 1;
                currentIndex++;
            }
        }
    }
}