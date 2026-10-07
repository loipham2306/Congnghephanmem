const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { getMyProfileController } = require("../controllers/patient.controller");

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyProfileController,
);
module.exports = router;
