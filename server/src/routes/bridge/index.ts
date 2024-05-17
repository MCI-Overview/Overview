import { Router } from "express";
import { User } from "../../types";
import axios from "axios";

const PHP_SECRET_KEY = process.env.PHP_SECRET_KEY as string;

if (!PHP_SECRET_KEY) {
  throw new Error(
    "PHP_SECRET_KEY must be defined in your environment variables",
  );
}

const router: Router = Router();

router.get("/projects", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
    return;
  }

  const user = req.user as User;

  try {
    const data = await axios.post(
      "https://mci.com.sg/eforms/loa/api/get-projects.php",
      {
        email: user.id,
        secret: PHP_SECRET_KEY,
      },
    );

    res.send(data.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response?.status || 500)
        .send(error.response?.data || "Error occurred while fetching projects");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

router.get("/project/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send("Unauthorized");
    return;
  }

  const projectID = req.params.id;
  const user = req.user as User;

  try {
    const data = await axios.post(
      "https://mci.com.sg/eforms/loa/api/get-project-candidates.php",
      {
        email: user.id,
        projectid: projectID,
        secret: PHP_SECRET_KEY,
      },
    );

    res.send(data.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response?.status || 500)
        .send(error.response?.data || "Error occurred while fetching projects");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

export default router;
