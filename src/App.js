/* eslint-disable no-unused-vars */

import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import DsocialappAbi from "./contractsData/dsocialapp.json";
import DsocialappAddress from "./contractsData/dsocialapp-address.json";
import { Spinner, Navbar, Nav, Button, Container } from "react-bootstrap";
import logo from "./logo.svg";
import Home from "./Home.js";
import Profile from "./Profile.js";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState({});

  const web3Handler = async () => {
    if (typeof window.ethereum === "undefined") {
      alert(
        "Sie verwenden einen Nicht-Ethereum-Browser. Versuchen Sie, die Metamask-Erweiterung zu installieren."
      );
    } else {
      let accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", async () => {
        setLoading(true);
        web3Handler();
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const network = await provider.getNetwork();
      const networkId = network.chainId;

      console.log("Current network ID:", networkId);

      if (networkId !== 11155111) {
        alert("Bitte verwenden Sie das Sepolia-Netzwerk.");
      } else {
        const signer = provider.getSigner();
        loadContract(signer);
      }
    }
  };
  const loadContract = async (signer) => {
    const contract = new ethers.Contract(
      DsocialappAddress.address,
      DsocialappAbi.abi,
      signer
    );
    setContract(contract);
    setLoading(false);
  };
  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navbar
            style={{
              width: "100%",
              backgroundColor: "rgba(5, 32, 64, 0.9)",
              position: "fixed",
              top: "0",
              zIndex: "2",
            }}
            expand="lg"
            variant="dark"
          >
            <Container>
              <Navbar.Brand>
                <Nav.Link as={Link} to="/" style={{ color: "white" }}>
                  <img src={logo} width="40" height="40" className="" alt="" />
                  &nbsp; Dsocialapp
                </Nav.Link>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto"></Nav>
                <Nav>
                  {account ? (
                    <Nav.Link as={Link} to="/profile">
                      <Button variant="outline-light">
                        {account.slice(0, 7) + "..." + account.slice(36, 42)}
                      </Button>
                    </Nav.Link>
                  ) : (
                    <Button onClick={web3Handler} variant="outline-light">
                      Geldbörse verbinden
                    </Button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
        <div style={{ paddingTop: "70px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
              }}
            >
              <Spinner animation="border" style={{ display: "flex" }} />
              <p className="mx-3 my-0">Warten auf Metamask-Verbindung...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home contract={contract} />} />
              <Route
                path="/profile"
                element={<Profile contract={contract} />}
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
