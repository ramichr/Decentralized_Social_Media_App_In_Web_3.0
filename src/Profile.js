/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Card, ListGroup, Col } from "react-bootstrap";
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

const Profile = ({ contract }) => {
  const [profile, setProfile] = useState("");
  const [profileDatas, setProfileDatas] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const loadMyProfiles = async () => {
    const results = await contract.getMyProfiles();

    let profileDatas = await Promise.all(
      results.map(async (i) => {
        try {
          const uri = await contract.tokenURI(i);
          console.log(uri);

          const response = await fetch(uri);

          const metadata = await response.json();
          return {
            id: i,
            username: metadata.username,
            avatar: metadata.avatar,
          };
        } catch (error) {
          console.log(error);
        }
      })
    );
    setProfileDatas(profileDatas);
    getProfile(profileDatas);
  };
  const getProfile = async (profileDatas) => {
    const address = await contract.signer.getAddress();
    const id = await contract.profiles(address);
    const profile = profileDatas.find((i) => i.id.toString() === id.toString());
    setProfile(profile);
    setLoading(false);
  };
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        setAvatar(`https://dsocialappipfs.infura-ipfs.io/ipfs/${result.path}`);
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const mintProfile = async (event) => {
    if (!avatar || !username) return;
    try {
      const result = await client.add(JSON.stringify({ avatar, username }));
      setLoading(true);
      await (
        await contract.mint(
          `https://dsocialappipfs.infura-ipfs.io/ipfs/${result.path}`
        )
      ).wait();
      loadMyProfiles();
    } catch (error) {
      window.alert("ipfs uri upload error: ", error);
    }
  };
  const switchProfile = async (profileData) => {
    setLoading(true);
    await (await contract.setProfile(profileData.id)).wait();
    getProfile(profileDatas);
  };
  useEffect(() => {
    if (!profileDatas) {
      loadMyProfiles();
    }
  });
  if (loading)
    return (
      <div className="text-center">
        <main style={{ padding: "1rem 0" }}>
          <h2>Wird geladen...</h2>
        </main>
      </div>
    );
  return (
    <div className="mt-4 text-center">
      <div className="row">
        <div className="col-lg-4 border-end-lg border-grey d-flex justify-content-center align-items-center spacing-bottom">
          <main
            role="main"
            className="mx-auto text-center"
            style={{ maxWidth: "500px" }}
          >
            <div className="content mx-auto">
              <Row className="g-4">
                <h3>Erstellen Sie ein Profil</h3>
                <Form.Control
                  type="file"
                  required
                  name="file"
                  onChange={uploadToIPFS}
                />
                <Form.Control
                  onChange={(e) => setUsername(e.target.value)}
                  size="lg"
                  required
                  type="text"
                  placeholder="Username"
                />
                <div className="d-grid px-0">
                  <Button onClick={mintProfile} variant="primary" size="lg">
                    Profil erstellen
                  </Button>
                </div>
              </Row>
            </div>
          </main>
        </div>

        <div className="col-lg-8 py-md-3 spacing-top">
          <div className="row">
            <div className="col-lg-12">
              {profile ? (
                <div className="mb-3 mt-md-3 text-center text-md-left">
                  <h3 className="mb-3">Ihre aktueller Profil</h3>
                  <h5 className="mb-3">{profile.username}</h5>
                  <img
                    className="profile-image mb-3"
                    src={profile.avatar}
                    alt=""
                  />
                </div>
              ) : (
                <h4 className="mb-4">
                  Sie haben kein Profil, bitte erstellen Sie eines...
                </h4>
              )}
            </div>

            <div className="col-lg-12">
              <div className="px-5 container">
                <Row xs={1} md={1} lg={4} className="g-4 py-5">
                  {profileDatas.map((profileData, idx) => {
                    if (profileData.id === profile.id) return;
                    return (
                      <Col
                        key={idx}
                        className="col-12 col-lg-4 overflow-hidden"
                      >
                        <Card
                          style={{
                            backgroundColor: "#282c34",
                            borderColor: "#0d6efd",
                          }}
                        >
                          <Card.Img variant="top" src={profileData.avatar} />
                          <Card.Body color="secondary">
                            <Card.Title>{profileData.username}</Card.Title>
                          </Card.Body>
                          <Card.Footer className="dark-footer">
                            <div className="d-grid">
                              <Button
                                onClick={() => switchProfile(profileData)}
                                variant="primary"
                                size="lg"
                              >
                                Als Standard festlegen
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
