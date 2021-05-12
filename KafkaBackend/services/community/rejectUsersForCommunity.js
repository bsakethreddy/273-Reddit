const Community = require("../../models/mongo/Community");
const Promise = require("bluebird");

const rejectUsersForCommunity = async (msg, callback) => {
  let res = {};
  try {
    Promise.mapSeries(msg.body.userList, (item) => {
      return Community.findOneAndUpdate(
        {
          _id: msg.body.communityID,
          "listOfUsers.userID": item,
        },
        { $pull: { listOfUsers: { userID: item } } },
        { useFindAndModify: false }
      );
    }).then(async () => {
      res.status = 200;
      callback(null, res);
    });
  } catch (err) {
    res.status = 400;
    callback(null, res);
  }
};

exports.rejectUsersForCommunity = rejectUsersForCommunity;
