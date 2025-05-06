const jwt = require("jsonwebtoken");
const { APP_KEY, API_KEY } = process.env;
const userModel = require("../models/users");
const Response = require("../helpers/response");

exports.authCheck = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization && authorization.startsWith("Bearer")) {
      const token = authorization.substr(7);
      const data = jwt.verify(token, APP_KEY);
      if (data) {
        req.userData = data;
        return next();
      }
    }
    return Response.responseStatus(res, 401, "Authorization needed");
  } catch (error) {
    return Response.responseStatus(res, 401, "Invalid Authorization");
  }
};

exports.authType = (type) => {
  return async (req, res, next) => {
    const data = req.userData;
    const userRole = await userModel.getUsersByCondition({
      user_id: data.user_id,
    });
    if (userRole[0].user_type === type) {
      return next();
    } else {
      return Response.responseStatus(res, 403, "You don't have permission");
    }
  };
};

exports.authAllowTypes = (types = []) => {
  return async (req, res, next) => {
    const data = req.userData;
    const userRole = await userModel.getUsersByCondition({
      user_id: data.user_id,
    });

    if (userRole.length) {
      if (types.includes(userRole[0].user_type)) {
        return next();
      }
    }
    return Response.responseStatus(res, 403, "You don't have permission");
    // for(let i=0;i<types.length;i++){
    // 	if (!userRole[0].user_type === types[i]){
    // 		return Response.responseStatus(res, 403, "You don't have permission");
    // 	}
    // }
    // return next();
  };
};

exports.validateAPI = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    const token = authorization.substr(7);
    try {
      const data = jwt.verify(token, API_KEY);
      if (data) {
        req.userData = data;
        return next();
      }
    } catch (error) {
      return Response.responseStatus(res, 401, "Invalid token", error);
    }
  }
  return Response.responseStatus(res, 401, "Authorization needed");
};
