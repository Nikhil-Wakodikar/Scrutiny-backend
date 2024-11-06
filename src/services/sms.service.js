const config = require("../config/config");
const axios = require("axios");

const sendSMS = async (data) => {
  let message = {
    body: data.message,
    to: data.mobileNumber,
  };
  let url = `https://smsozone.com/api/mt/SendSMS?APIKey=XtnMBLYVG0mj6YUdO8dsqgDEMOAPI&senderid=SMSPXL&channel=Trans&DCS=0&flashsms=0&number=${message.to}&text=Use%20Code%20${message.body}%20to%20verify%20or%20login%20your%20account.%0A${message.body}%0ATeam%20PXLSMS&route=5`;
  try {
    console.log("SMS => ", url);
    let res = await axios.get(url);
    return { result: res };
  } catch (error) {
    console.log("SMS Error => ", error);
    return { error: error };
  }
};

module.exports = {
  sendSMS,
};
