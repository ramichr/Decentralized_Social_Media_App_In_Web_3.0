/* eslint-disable default-case */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Card, ListGroup } from "react-bootstrap";
import { Buffer } from "buffer";

const ipfsClient = require("ipfs-http-client");

const projectId = "2TP0cEzoCYsOHSMVXzTGSW0GWH6";

const projectSecret = "c4aa35429f8b8c7db2b62ca20ebb0c18";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const Home = ({ contract }) => {
  const [posts, setPosts] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [post, setPost] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState(null);

  const loadPosts = async () => {
    let address = await contract.signer.getAddress();
    setAddress(address);

    const balance = await contract.balanceOf(address);
    setHasProfile(() => balance > 0);

    let results = await contract.getAllPosts();

    let posts = await Promise.all(
      results.map(async (i) => {
        let response = await fetch(
          `https://dsocialappipfs.infura-ipfs.io/ipfs/${i.hash}`
        );

        console.log(response);
        const metadataPost = await response.json();

        const nftId = await contract.profiles(i.author);

        const uri = await contract.tokenURI(nftId);

        response = await fetch(uri);
        const metadataProfile = await response.json();

        const author = {
          address: i.author,
          username: metadataProfile.username,
          avatar: metadataProfile.avatar,
        };

        let post = {
          id: i.id,
          content: metadataPost.post,
          mediaHash: i.mediaHash,
          fileType: i.fileType,
          tipAmount: i.tipAmount,
          author,
        };

        console.log("loadPosts: " + post.mediaHash);
        console.log("loadPosts: " + post.fileType);
        return post;
      })
    );
    posts = posts.sort((a, b) => b.tipAmount - a.tipAmount);

    setPosts(posts);
    setLoading(false);
  };
  useEffect(() => {
    if (!posts) {
      loadPosts();
    }
  });

  const uploadPost = async () => {
    if (!post || !image) return;
    let postHash;
    let mediaHash;
    let fileType;

    try {
      const postResult = await client.add(JSON.stringify({ post }));
      postHash = postResult.path;
    } catch (error) {
      window.alert("ipfs post upload error: ", error);
    }

    try {
      const imageResult = await client.add(image);
      mediaHash = imageResult.path;

      fileType = image.type.split("/")[0];

      console.log(mediaHash);
    } catch (error) {
      window.alert("ipfs image upload error: ", error);
    }

    await (await contract.uploadPost(postHash, mediaHash, fileType)).wait();
    loadPosts();
  };

  const deletePostFromBlockchain = async (postId) => {
    try {
      await (await contract.deletePost(postId)).wait();
      loadPosts();
    } catch (error) {
      window.alert("Error deleting the post: ", error);
    }
  };

  const tip = async (post) => {
    await (
      await contract.tipPostOwner(post.id, {
        value: ethers.utils.parseEther("0.1"),
      })
    ).wait();
    loadPosts();
  };
  if (loading)
    return (
      <div className="text-center">
        <main style={{ padding: "1rem 0" }}>
          <h2>Wird geladen...</h2>
        </main>
      </div>
    );
  return (
    <div className="container-fluid mt-5">
      {hasProfile ? (
        <div className="row">
          <main
            role="main"
            className="col-12 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mx-auto">
              <Row className="g-4">
                <h3>Beitrag erstellen</h3>
                <Form.Control
                  type="file"
                  onChange={(event) => setImage(event.target.files[0])}
                />
                <Form.Control
                  onChange={(e) => setPost(e.target.value)}
                  size="lg"
                  required
                  as="textarea"
                />
                <div className="d-grid px-0">
                  <Button onClick={uploadPost} variant="primary" size="lg">
                    Posten!
                  </Button>
                </div>
              </Row>
            </div>
          </main>
        </div>
      ) : (
        <div className="text-center">
          <main style={{ padding: "1rem 0" }}>
            <h2>Sie müssen ein Profil haben, um zu veröffentlichen.</h2>
          </main>
        </div>
      )}

      <p>&nbsp;</p>
      <hr />
      <p className="my-auto">&nbsp;</p>
      {posts.length > 0 ? (
        posts.map((post, key) => {
          return (
            <div
              key={key}
              className="col-12 my-3 mx-auto"
              style={{ maxWidth: "700px", color: "white" }}
            >
              <Card border="primary" className="bg-dark text-white">
                <Card.Header style={{ backgroundColor: "black" }}>
                  <div className="d-inline mt-auto float-start">
                    <img
                      className="mr-2"
                      width="30"
                      height="30"
                      src={post.author.avatar}
                      alt=""
                    />
                    <small className="ms-2 me-auto d-inline">
                      {post.author.username}
                    </small>
                  </div>
                  <small className="mt-1 float-end d-inline">
                    {post.author.address}
                  </small>
                </Card.Header>

                {post.content && <Card.Title>{post.content}</Card.Title>}
                <Card.Body color="secondary">
                  {post.fileType === "image" ? (
                    <Card.Img
                      src={`https://dsocialappipfs.infura-ipfs.io/ipfs/${post.mediaHash}`}
                      alt="image"
                    />
                  ) : post.fileType === "video" ? (
                    <video
                      controls
                      src={`https://dsocialappipfs.infura-ipfs.io/ipfs/${post.mediaHash}`}
                      alt="video"
                      style={{ width: "100%" }}
                    />
                  ) : null}
                </Card.Body>

                <Card.Footer className="list-group-item bg-dark text-white">
                  <div className="d-inline mt-auto float-start">
                    Trinkgeld-Betrag: {ethers.utils.formatEther(post.tipAmount)}{" "}
                    ETH
                  </div>
                  {address === post.author.address || !hasProfile ? null : (
                    <div className="d-inline float-end">
                      <Button
                        onClick={() => tip(post)}
                        className="px-0 py-0 font-size-16"
                        variant="link"
                        size="md"
                      >
                        Trinkgeld für 0,1 ETH
                      </Button>
                    </div>
                  )}

                  {address === post.author.address && !post.isDeleted ? (
                    <div className="d-inline float-end">
                      <Button
                        onClick={() => deletePostFromBlockchain(post.id)}
                        variant="danger"
                      >
                        Löschen
                      </Button>
                    </div>
                  ) : null}
                </Card.Footer>
              </Card>
            </div>
          );
        })
      ) : (
        <div className="text-center">
          <main style={{ padding: "1rem 0" }}>
            <h2>Noch keine Beiträge</h2>
          </main>
        </div>
      )}
    </div>
  );
};

export default Home;
