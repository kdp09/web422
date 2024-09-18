/*****************************************************************************
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Assignment: 2247 / 1
* Student Name: Krutarth Patel
* Student Email: kdpatel43@myseneca.ca
* Course/Section: WEB422/ZAA
* Deployment URL: https://www.your.assignment.com
*
*****************************************************************************/


const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ListingsDB = require("./modules/listingsDB.js");

dotenv.config();

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new ListingsDB();

db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
  });
}).catch(err => {
  console.log(err);
});

app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

app.post("/api/listings", (req, res) => {
  const newListing = req.body;
  db.addNewListing(newListing).then(result => {
    res.status(201).json(result);
  }).catch(err => {
    res.status(500).json({ message: "Failed to create listing", error: err.message });
  });
});

app.get("/api/listings", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const name = req.query.name || '';

  db.getAllListing(page, perPage, name).then(listings => {
    res.status(200).json(listings);
  }).catch(err => {
    res.status(500).json({ message: "Failed to get listings", error: err.message });
  });
});

app.get("/api/listings/:id", (req, res) => {
  const id = req.params.id;

  db.getListingById(id).then(listing => {
    if (listing) {
      res.status(200).json(listing);
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  }).catch(err => {
    res.status(500).json({ message: "Failed to get listing", error: err.message });
  });
});

app.put("/api/listings/:id", (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  db.updateListingById(updatedData, id).then(result => {
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Listing updated successfully" });
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  }).catch(err => {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  });
});

app.delete("/api/listings/:id", (req, res) => {
  const id = req.params.id;

  db.deleteListingById(id).then(result => {
    if (result.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  }).catch(err => {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  });
});
