var connection = new require("./kafka/connection");
const messageSQL = require("./services/message_sql");
const jwt_auth = require("./services/jwt_auth");
const community_mongo = require("./services/community_mongo");
const user_mongo = require("./services/user_mongo");
const userAuth_sql = require("./services/userAuth_sql");

require("./dbConnection");
const sqldb = require("./models/sql");
sqldb.sequelize.sync().then(() => {
  console.log("sequelize is running");
});

function handleTopicRequest(topic_name, fname) {
  var consumer = connection.getConsumer(topic_name);
  var producer = connection.getProducer();
  console.log("Kafka Server is running ");
  consumer.on("message", function (message) {
    console.log("Message received for " + topic_name);
    var data = JSON.parse(message.value);

    fname.handle_request(data.data, function (err, res) {
      console.log("HANDLED", err, res);
      var payloads = [
        {
          topic: data.replyTo,
          messages: JSON.stringify({
            correlationId: data.correlationId,
            data: res,
          }),
          partition: 0,
        },
      ];
      producer.send(payloads, function (err, data) {
        console.log("payload sent:", data);
      });
      return;
    });
  });
}

handleTopicRequest("sql_message", messageSQL);
handleTopicRequest("JWT_auth", jwt_auth);
handleTopicRequest("mongo_community", community_mongo);
handleTopicRequest("mongo_user", user_mongo);
handleTopicRequest("sql_user_auth", userAuth_sql);
