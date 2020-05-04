// Get average user rating for restaurant
const getRatingAverage = (ratingNumber)=>{
    const ratingSum = ratingNumber.reduce((sum, rating) =>{
        return sum + rating
    });
    
    return ratingSum / ratingNumber.length;
};

//Base64 buffer image to extension
//Finds extension by first character in buffer 
const buffertoImage = (buff) => {
    const image = buff.toString("base64");
    let stringImage;
    switch (image.charAt(0)) {
      case "i":
        stringImage = "image/png";
        break;
      case "/":
        stringImage = "image/jpg";
        break;
      case "R":
        stringImage = "gif";
        break;
      case "U":
        stringImage = "webp";
        break;
    }
    return stringImage;
  }

module.exports = {getRatingAverage, buffertoImage};