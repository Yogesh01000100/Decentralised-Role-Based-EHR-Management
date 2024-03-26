import axios from "axios";
import User from "../models/User.js";

let count = 0;
export async function getHospitalData10(req, res) {
  try {
    const userId = req.query.userId;
	  const keychainrefId=req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-10?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData20(req, res) {
  try {
    const userId = req.query.userId;
	  const keychainrefId=req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-20?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData30(req, res) {
  try {
    const userId = req.query.userId;
	  const keychainrefId=req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-30?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData40(req, res) {
  try {
    const userId = req.query.userId;
	  const keychainrefId=req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-40?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData50(req, res) {
  try {
    const userId = req.query.userId;
	  const keychainrefId=req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-50?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}