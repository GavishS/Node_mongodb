const express = require('express');
const userRoute = express.Router();

// model
let User = require('../model/User');
let Product = require('../model/Product');
let UserView = require('../model/UserView');

var mongodb = require("mongodb");
var u = require("underscore");

/**
     * Routh Method get-user
     * function name GetProducts
     * This function is used for get the user's products   
    */

userRoute.route('/get-user').get((req, res, next) => {
  var q = {};
  var matchStr = { $match: {} }


  var start = new Date(req.query.StartDate)
  var end = new Date(req.query.EndDate);


  if (start != "" && start != null && end != "" && end != null) {
    matchStr.$match = {
      $and: []
    }

    var obj = new Object();
    obj['userViews.ViewDate'] = { $gte: start };
    matchStr.$match.$and.push(obj);

    var obj = new Object();
    obj['userViews.ViewDate'] = { $lte: end };
    matchStr.$match.$and.push(obj);
  }


  User.aggregate([{
    $facet: {
      "data": [
        {
          "$project": {
            "_id": {
              "$toString": "$_id"
            },
            "UserName": "$UserName",
          }
        },
        {
          "$lookup": {
            "from": "userView",
            "let": { "ut_id": "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ["$UserId", "$$ut_id"] }] } }, },
            ],
            "as": "userViews",
          }
        },
        { $unwind: { path: "$userViews", preserveNullAndEmptyArrays: true } },
        {
          "$lookup": {
            "from": "products",
            "localField": "userViews.ProductId",
            "foreignField": "_id",
            "as": "productsList"
          }
        },
        {
          "$unwind": {
            "path": "$products",
            "preserveNullAndEmptyArrays": true
          }
        },
        matchStr,
        { $skip: parseInt(req.query.start) },
        { $limit: parseInt(req.query.length) },
      ],
      "CountFilter": [
        {
          "$project": {
            "_id": {
              "$toString": "$_id"
            },
            "UserName": "$UserName",
          }
        },
        {
          "$lookup": {
            "from": "userView",
            "let": { "ut_id": "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ["$UserId", "$$ut_id"] }] } }, },
            ],
            "as": "userViews",
          }
        },
        { $unwind: { path: "$userView", preserveNullAndEmptyArrays: true } },
        matchStr,
        { $count: "Total Records" },
      ],
      "Count": [{ $count: "TotalUsers" }]

    }
  }], function (error, data) {
    if (error) {
      return next(error)
    } else {
      var TotalRecords = 0
      var TotalUsers = 0
      if (data[0].Count.length > 0) {
        TotalUsers = data[0].Count[0]["TotalUsers"]
        if (data[0].data.length > 0) {
          TotalRecords = data[0].CountFilter[0]["Total Records"]

          var lstGroupData = [];

          var groups = [];
          groups = u.groupBy(data[0].data, function (o) {
            return o._id;
          });

          lstGroupData = u.map(groups, function (group, username) {
            return {
              _id: group[0]._id,
              UserName: group[0].UserName,
              data: group
            };
          });
          for (var j = 0; j < lstGroupData.length; j++) {
            lstGroupData[j].userViews = [];
            lstGroupData[j].productsList = [];
            for (var k = 0; k < lstGroupData[j].data.length; k++) {
              lstGroupData[j].userViews.push(lstGroupData[j].data[k].userViews)
            }
          }
          GetProducts(lstGroupData, function (data) {
            res.status(200).json({ success: true, data: data, TotalRecords: TotalRecords, TotalUsers: TotalUsers })
          })
        } else {
          res.status(200).json({ success: false, data: [], TotalRecords: TotalRecords, TotalUsers: TotalUsers })
        }
      }
      else {
        res.status(200).json({ success: false, data: [], TotalRecords: 0, TotalUsers: 0 })
      }
    }
  });

})

function GetProducts(data, callback) {
  function GetAllProducts(i) {
    if (data.length > 0) {
      if (i < data.length) {
        if (data[i].userViews.length > 0) {
          function GetAllProductsList(j) {
            var ProductList = []
            if (j < data[i].userViews.length) {
              Product.findById(data[i].userViews[j].ProductId, function (err, Product) {
                if (err) {
                  GetAllProductsList(j + 1)
                }
                else {
                  data[i].productsList.push(Product)
                  GetAllProductsList(j + 1)
                }
              });
            }
            else {

              GetAllProducts(i + 1)
            }
          }
          GetAllProductsList(0)
        } else {
          GetAllProducts(i + 1)
        }
      } else {
        return callback(data)
      }

    } else {
      return callback(data)
    }
  }
  GetAllProducts(0)
}
module.exports = userRoute;