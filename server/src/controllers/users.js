const userModel = require("../models/users");
const Response = require("../helpers/response");
const bcrypt = require("bcrypt");
const Type = require("../utils/userTypes");
const { DEFAULT_PASSWORD } = process.env;
const { validationResult } = require("express-validator");
const saltRounds = 10;

const usersController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      if (users.length > 0) {
        return Response.responseStatus(res, 200, "List of all users", users);
      } else {
        return Response.responseStatus(res, 404, "User not exists");
      }
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message.message,
      });
    }
  },
  getUserByUserId: async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const user = await userModel.getUsersByCondition({ user_id });
      if (user.length > 0) {
        return Response.responseStatus(
          res,
          200,
          `Details of User(${user_id})`,
          user
        );
      } else {
        return Response.responseStatus(res, 404, "User not exists");
      }
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error,
      });
    }
  },
  createUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        password = DEFAULT_PASSWORD,
        userType = Type.User,
      } = req.body;
      const user = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        email,
        password,
        user_type: userType,
      };

      const result_email = await userModel.getUsersByCondition({ email });
      if (result_email.length > 0) {
        return Response.responseStatus(res, 409, "Email already exists");
      } else {
        // Hash the password before storing in the database
        const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
        user.password = hashedPassword;
        // console.log(user);
        const createdUser = await userModel.createUser(user);
        // console.log(createdUser);
        if (createdUser.insertId > 0) {
          const newUser = await userModel.getUserById(createdUser.insertId);
          return Response.responseStatus(
            res,
            201,
            "User Created Successfully",
            newUser
          );
        } else {
          return Response.responseStatus(res, 400, "User Creation Failed");
        }
      }
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  updateUserByUserId: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const user_id = req.params.user_id;
      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        password,
        isActive,
        userType,
      } = req.body;
      const user = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        email,
        password,
        user_type: userType,
        is_active: isActive,
      };
      // Hash the password before storing in the database
      const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
      user.password = hashedPassword;
      const result = await userModel.updateUserByCondition({ user_id }, user);
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `User Updated Successfully(${user_id})`
        );
      } else {
        return Response.responseStatus(
          res,
          404,
          `Failed To Update User(${user_id})`
        );
      }
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  deleteUserByUserId: async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const result = await userModel.deleteUserByCondition({ user_id });
      if (result.affectedRows > 0) {
        return Response.responseStatus(
          res,
          200,
          `User Deleted Successfully(${user_id})`
        );
      } else {
        return Response.responseStatus(
          res,
          404,
          `Failed To Delete User(${user_id})`
        );
      }
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = usersController;
